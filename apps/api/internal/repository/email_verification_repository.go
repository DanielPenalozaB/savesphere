package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EmailVerificationRepository interface {
	Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error
	GetByTokenHash(ctx context.Context, tokenHash string) (*EmailVerification, error)
	MarkUsed(ctx context.Context, id uuid.UUID) error
}

type EmailVerification struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"userId"`
	TokenHash string     `json:"tokenHash"`
	ExpiresAt time.Time  `json:"expiresAt"`
	UsedAt    *time.Time `json:"usedAt,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
}

type emailVerificationRepository struct {
	pool *pgxpool.Pool
}

func NewEmailVerificationRepository(pool *pgxpool.Pool) EmailVerificationRepository {
	return &emailVerificationRepository{pool: pool}
}

func (r *emailVerificationRepository) Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error {
	query := `
		INSERT INTO email_verifications (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
	`
	_, err := r.pool.Exec(ctx, query, userID, tokenHash, expiresAt)
	return err
}

func (r *emailVerificationRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*EmailVerification, error) {
	query := `
		SELECT id, user_id, token_hash, expires_at, used_at, created_at
		FROM email_verifications
		WHERE token_hash = $1
		ORDER BY created_at DESC
		LIMIT 1
	`
	row := &EmailVerification{}
	err := r.pool.QueryRow(ctx, query, tokenHash).Scan(
		&row.ID, &row.UserID, &row.TokenHash, &row.ExpiresAt, &row.UsedAt, &row.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return row, nil
}

func (r *emailVerificationRepository) MarkUsed(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE email_verifications SET used_at = NOW() WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
