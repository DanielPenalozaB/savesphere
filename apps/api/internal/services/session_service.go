package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"time"

	"savesphere-api/internal/repository"

	"github.com/google/uuid"
)

type SessionService interface {
	CreateSession(ctx context.Context, userID uuid.UUID) (accessToken string, refreshToken string, err error)
	RefreshSession(ctx context.Context, refreshToken string) (accessToken string, newRefreshToken string, err error)
	RevokeSession(ctx context.Context, refreshToken string) error
	RevokeAllUserSessions(ctx context.Context, userID uuid.UUID) error
}

type sessionService struct {
	userRepo    repository.UserRepository
	sessionRepo repository.SessionRepository
	jwtService  JWTService
}

func NewSessionService(
	userRepo repository.UserRepository,
	sessionRepo repository.SessionRepository,
	jwtService JWTService,
) SessionService {
	return &sessionService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		jwtService:  jwtService,
	}
}

func generateRefreshToken() (string, string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", err
	}
	token := base64.RawURLEncoding.EncodeToString(bytes)
	h := sha256.Sum256([]byte(token))
	hash := hex.EncodeToString(h[:])
	return token, hash, nil
}

func (s *sessionService) CreateSession(ctx context.Context, userID uuid.UUID) (string, string, error) {
	accessToken, err := s.jwtService.GenerateToken(userID)
	if err != nil {
		return "", "", err
	}

	refreshToken, hash, err := generateRefreshToken()
	if err != nil {
		return "", "", err
	}

	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	_, err = s.sessionRepo.Create(ctx, userID, hash, expiresAt)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *sessionService) RefreshSession(ctx context.Context, refreshToken string) (string, string, error) {
	h := sha256.Sum256([]byte(refreshToken))
	hash := hex.EncodeToString(h[:])

	session, err := s.sessionRepo.GetByRefreshTokenHash(ctx, hash)
	if err != nil {
		return "", "", errors.New("invalid refresh token")
	}

	if session.RevokedAt != nil {
		return "", "", errors.New("session revoked")
	}
	if time.Now().After(session.ExpiresAt) {
		return "", "", errors.New("session expired")
	}

	// Revoke old session
	if err := s.sessionRepo.Revoke(ctx, session.ID); err != nil {
		return "", "", err
	}

	// Create new session (rotation)
	return s.CreateSession(ctx, session.UserID)
}

func (s *sessionService) RevokeSession(ctx context.Context, refreshToken string) error {
	h := sha256.Sum256([]byte(refreshToken))
	hash := hex.EncodeToString(h[:])

	session, err := s.sessionRepo.GetByRefreshTokenHash(ctx, hash)
	if err != nil {
		return errors.New("invalid refresh token")
	}

	return s.sessionRepo.Revoke(ctx, session.ID)
}

func (s *sessionService) RevokeAllUserSessions(ctx context.Context, userID uuid.UUID) error {
	return s.sessionRepo.RevokeAllForUser(ctx, userID)
}
