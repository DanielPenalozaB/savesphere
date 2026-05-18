package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PasswordResetRepository interface {
	Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error
	GetByTokenHash(ctx context.Context, tokenHash string) (*PasswordReset, error)
	MarkUsed(ctx context.Context, id uuid.UUID) error
}

type PasswordReset struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"userId"`
	TokenHash string     `json:"tokenHash"`
	ExpiresAt time.Time  `json:"expiresAt"`
	UsedAt    *time.Time `json:"usedAt,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
}

type passwordResetRepository struct {
	pool *pgxpool.Pool
}

func NewPasswordResetRepository(pool *pgxpool.Pool) PasswordResetRepository {
	return &passwordResetRepository{pool: pool}
}

func (r *passwordResetRepository) Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error {
	query := `
		INSERT INTO password_resets (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
	`
	_, err := r.pool.Exec(ctx, query, userID, tokenHash, expiresAt)
	return err
}

func (r *passwordResetRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*PasswordReset, error) {
	query := `
		SELECT id, user_id, token_hash, expires_at, used_at, created_at
		FROM password_resets
		WHERE token_hash = $1
		ORDER BY created_at DESC
		LIMIT 1
	`
	row := &PasswordReset{}
	err := r.pool.QueryRow(ctx, query, tokenHash).Scan(
		&row.ID, &row.UserID, &row.TokenHash, &row.ExpiresAt, &row.UsedAt, &row.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return row, nil
}

func (r *passwordResetRepository) MarkUsed(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE password_resets SET used_at = NOW() WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
