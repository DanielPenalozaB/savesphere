package repository

import (
	"context"
	"errors"

	"savesphere-api/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	Update(ctx context.Context, user *models.User) error
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByProvider(ctx context.Context, provider string, providerID string) (*models.User, error)
}

type userRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) UserRepository {
	return &userRepository{pool: pool}
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (email, password_hash, full_name, auth_provider, provider_id, email_verified, picture, last_login_at, failed_login_attempts, locked_until, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`
	err := r.pool.QueryRow(ctx, query,
		user.Email, user.PasswordHash, user.FullName, user.AuthProvider, user.ProviderID, user.EmailVerified,
		user.Picture, user.LastLoginAt, user.FailedLoginAttempts, user.LockedUntil,
		user.CreatedAt, user.UpdatedAt,
	).Scan(&user.ID)
	return err
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users
		SET email = $1, password_hash = $2, full_name = $3, auth_provider = $4, provider_id = $5, email_verified = $6,
		    picture = $7, last_login_at = $8, failed_login_attempts = $9, locked_until = $10, updated_at = $11
		WHERE id = $12
	`
	_, err := r.pool.Exec(ctx, query,
		user.Email, user.PasswordHash, user.FullName, user.AuthProvider, user.ProviderID, user.EmailVerified,
		user.Picture, user.LastLoginAt, user.FailedLoginAttempts, user.LockedUntil,
		user.UpdatedAt, user.ID,
	)
	return err
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `SELECT id, email, password_hash, full_name, auth_provider, provider_id, email_verified, picture, last_login_at, failed_login_attempts, locked_until, created_at, updated_at FROM users WHERE email = $1`
	user := &models.User{}
	err := r.pool.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.AuthProvider, &user.ProviderID, &user.EmailVerified,
		&user.Picture, &user.LastLoginAt, &user.FailedLoginAttempts, &user.LockedUntil, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	query := `SELECT id, email, password_hash, full_name, auth_provider, provider_id, email_verified, picture, last_login_at, failed_login_attempts, locked_until, created_at, updated_at FROM users WHERE id = $1`
	user := &models.User{}
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.AuthProvider, &user.ProviderID, &user.EmailVerified,
		&user.Picture, &user.LastLoginAt, &user.FailedLoginAttempts, &user.LockedUntil, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

func (r *userRepository) GetByProvider(ctx context.Context, provider string, providerID string) (*models.User, error) {
	query := `SELECT id, email, password_hash, full_name, auth_provider, provider_id, email_verified, picture, last_login_at, failed_login_attempts, locked_until, created_at, updated_at FROM users WHERE auth_provider = $1 AND provider_id = $2`
	user := &models.User{}
	err := r.pool.QueryRow(ctx, query, provider, providerID).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.AuthProvider, &user.ProviderID, &user.EmailVerified,
		&user.Picture, &user.LastLoginAt, &user.FailedLoginAttempts, &user.LockedUntil, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}
