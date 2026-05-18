package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"time"

	"savesphere-api/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type PasswordResetService interface {
	RequestReset(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, token string, newPassword string) error
}

type passwordResetService struct {
	userRepo    repository.UserRepository
	resetRepo   repository.PasswordResetRepository
	emailService EmailService
}

func NewPasswordResetService(
	userRepo repository.UserRepository,
	resetRepo repository.PasswordResetRepository,
	emailService EmailService,
) PasswordResetService {
	return &passwordResetService{
		userRepo:     userRepo,
		resetRepo:    resetRepo,
		emailService: emailService,
	}
}

func generateSecureToken() (string, string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}
	token := base64.RawURLEncoding.EncodeToString(bytes)
	h := sha256.Sum256([]byte(token))
	hash := hex.EncodeToString(h[:])
	return token, hash, nil
}

func (s *passwordResetService) RequestReset(ctx context.Context, email string) error {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return err
	}
	if user == nil {
		// Don't reveal whether email exists
		return nil
	}

	token, hash, err := generateSecureToken()
	if err != nil {
		return err
	}

	expiresAt := time.Now().Add(time.Hour)
	if err := s.resetRepo.Create(ctx, user.ID, hash, expiresAt); err != nil {
		return err
	}

	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}
	resetURL := fmt.Sprintf("%s/auth/reset-password?token=%s", baseURL, token)

	return s.emailService.SendPasswordReset(user.Email, resetURL)
}

func (s *passwordResetService) ResetPassword(ctx context.Context, token string, newPassword string) error {
	if len(newPassword) < 8 {
		return errors.New("password too short")
	}

	h := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(h[:])

	reset, err := s.resetRepo.GetByTokenHash(ctx, tokenHash)
	if err != nil {
		return errors.New("invalid or expired token")
	}

	if reset.UsedAt != nil {
		return errors.New("token already used")
	}
	if time.Now().After(reset.ExpiresAt) {
		return errors.New("token expired")
	}

	user, err := s.userRepo.GetByID(ctx, reset.UserID)
	if err != nil || user == nil {
		return errors.New("invalid or expired token")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.PasswordHash = string(hashedPassword)
	user.UpdatedAt = time.Now()
	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	return s.resetRepo.MarkUsed(ctx, reset.ID)
}
