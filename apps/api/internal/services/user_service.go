package services

import (
	"context"
	"errors"
	"time"

	"savesphere-api/internal/models"
	"savesphere-api/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	Register(ctx context.Context, req models.RegisterRequest) (*models.User, error)
	Login(ctx context.Context, req models.LoginRequest) (*models.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	RecordFailedLogin(ctx context.Context, userID uuid.UUID) error
	RecordSuccessfulLogin(ctx context.Context, userID uuid.UUID) error
}

type userService struct {
	repo       repository.UserRepository
	jwtService JWTService
}

func NewUserService(repo repository.UserRepository, jwtService JWTService) UserService {
	return &userService{
		repo:       repo,
		jwtService: jwtService,
	}
}

func (s *userService) Register(ctx context.Context, req models.RegisterRequest) (*models.User, error) {
	// Check if user already exists
	existing, err := s.repo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) Login(ctx context.Context, req models.LoginRequest) (*models.User, error) {
	user, err := s.repo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	// Check if account is locked
	if user.LockedUntil != nil && time.Now().Before(*user.LockedUntil) {
		return nil, errors.New("account locked")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

func (s *userService) RecordFailedLogin(ctx context.Context, userID uuid.UUID) error {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil || user == nil {
		return err
	}

	user.FailedLoginAttempts++
	if user.FailedLoginAttempts >= 5 {
		lockUntil := time.Now().Add(15 * time.Minute)
		user.LockedUntil = &lockUntil
	}
	user.UpdatedAt = time.Now()
	return s.repo.Update(ctx, user)
}

func (s *userService) RecordSuccessfulLogin(ctx context.Context, userID uuid.UUID) error {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil || user == nil {
		return err
	}

	user.FailedLoginAttempts = 0
	user.LockedUntil = nil
	now := time.Now()
	user.LastLoginAt = &now
	user.UpdatedAt = now
	return s.repo.Update(ctx, user)
}

func (s *userService) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *userService) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	return s.repo.GetByEmail(ctx, email)
}
