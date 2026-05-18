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

	"github.com/google/uuid"
)

type EmailVerificationService interface {
	CreateVerification(ctx context.Context, userID uuid.UUID, email string) (string, error)
	VerifyEmail(ctx context.Context, token string) error
}

type emailVerificationService struct {
	verificationRepo repository.EmailVerificationRepository
	userRepo         repository.UserRepository
	emailService     EmailService
}

func NewEmailVerificationService(
	verificationRepo repository.EmailVerificationRepository,
	userRepo repository.UserRepository,
	emailService EmailService,
) EmailVerificationService {
	return &emailVerificationService{
		verificationRepo: verificationRepo,
		userRepo:         userRepo,
		emailService:     emailService,
	}
}

func generateVerificationToken() (string, string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}
	token := base64.RawURLEncoding.EncodeToString(bytes)
	h := sha256.Sum256([]byte(token))
	hash := hex.EncodeToString(h[:])
	return token, hash, nil
}

func (s *emailVerificationService) CreateVerification(ctx context.Context, userID uuid.UUID, email string) (string, error) {
	token, hash, err := generateVerificationToken()
	if err != nil {
		return "", err
	}

	expiresAt := time.Now().Add(24 * time.Hour)
	if err := s.verificationRepo.Create(ctx, userID, hash, expiresAt); err != nil {
		return "", err
	}

	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}
	verifyURL := fmt.Sprintf("%s/auth/verify-email?token=%s", baseURL, token)

	return verifyURL, s.emailService.SendEmailVerification(email, verifyURL)
}

func (s *emailVerificationService) VerifyEmail(ctx context.Context, token string) error {
	h := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(h[:])

	verification, err := s.verificationRepo.GetByTokenHash(ctx, tokenHash)
	if err != nil {
		return errors.New("invalid or expired token")
	}

	if verification.UsedAt != nil {
		return errors.New("token already used")
	}
	if time.Now().After(verification.ExpiresAt) {
		return errors.New("token expired")
	}

	user, err := s.userRepo.GetByID(ctx, verification.UserID)
	if err != nil || user == nil {
		return errors.New("invalid or expired token")
	}

	user.EmailVerified = true
	user.UpdatedAt = time.Now()
	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	return s.verificationRepo.MarkUsed(ctx, verification.ID)
}
