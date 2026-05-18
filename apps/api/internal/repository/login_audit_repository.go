package repository

import (
	"context"
	"net"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LoginAuditRepository interface {
	Create(ctx context.Context, userID *uuid.UUID, ipAddress net.IP, userAgent string, authProvider string, success bool, reason string) error
}

type loginAuditRepository struct {
	pool *pgxpool.Pool
}

func NewLoginAuditRepository(pool *pgxpool.Pool) LoginAuditRepository {
	return &loginAuditRepository{pool: pool}
}

func (r *loginAuditRepository) Create(ctx context.Context, userID *uuid.UUID, ipAddress net.IP, userAgent string, authProvider string, success bool, reason string) error {
	query := `
		INSERT INTO login_audits (user_id, ip_address, user_agent, auth_provider, success, reason)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.pool.Exec(ctx, query, userID, ipAddress, userAgent, authProvider, success, reason)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok {
			// Log but don't fail on audit insert errors
			_ = pgErr
		}
	}
	return nil
}

type LoginAudit struct {
	ID           uuid.UUID  `json:"id"`
	UserID       *uuid.UUID `json:"userId,omitempty"`
	IPAddress    net.IP     `json:"ipAddress,omitempty"`
	UserAgent    string     `json:"userAgent,omitempty"`
	AuthProvider string     `json:"authProvider"`
	Success      bool       `json:"success"`
	Reason       string     `json:"reason,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
}
