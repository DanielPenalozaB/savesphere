package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionRepository interface {
	Create(ctx context.Context, userID uuid.UUID, refreshTokenHash string, expiresAt time.Time) (*uuid.UUID, error)
	GetByRefreshTokenHash(ctx context.Context, hash string) (*Session, error)
	Revoke(ctx context.Context, id uuid.UUID) error
	RevokeAllForUser(ctx context.Context, userID uuid.UUID) error
}

type Session struct {
	ID               uuid.UUID  `json:"id"`
	UserID           uuid.UUID  `json:"userId"`
	RefreshTokenHash string     `json:"refreshTokenHash"`
	ExpiresAt        time.Time  `json:"expiresAt"`
	RevokedAt        *time.Time `json:"revokedAt,omitempty"`
	CreatedAt        time.Time  `json:"createdAt"`
}

type sessionRepository struct {
	pool *pgxpool.Pool
}

func NewSessionRepository(pool *pgxpool.Pool) SessionRepository {
	return &sessionRepository{pool: pool}
}

func (r *sessionRepository) Create(ctx context.Context, userID uuid.UUID, refreshTokenHash string, expiresAt time.Time) (*uuid.UUID, error) {
	query := `
		INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id
	`
	var id uuid.UUID
	err := r.pool.QueryRow(ctx, query, userID, refreshTokenHash, expiresAt).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func (r *sessionRepository) GetByRefreshTokenHash(ctx context.Context, hash string) (*Session, error) {
	query := `
		SELECT id, user_id, refresh_token_hash, expires_at, revoked_at, created_at
		FROM user_sessions
		WHERE refresh_token_hash = $1
		ORDER BY created_at DESC
		LIMIT 1
	`
	row := &Session{}
	err := r.pool.QueryRow(ctx, query, hash).Scan(
		&row.ID, &row.UserID, &row.RefreshTokenHash, &row.ExpiresAt, &row.RevokedAt, &row.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return row, nil
}

func (r *sessionRepository) Revoke(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

func (r *sessionRepository) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	query := `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`
	_, err := r.pool.Exec(ctx, query, userID)
	return err
}
