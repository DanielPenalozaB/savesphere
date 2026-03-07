package repository

import (
	"context"
	"errors"

	"savesphere-api/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WalletRepository interface {
	Create(ctx context.Context, wallet *models.Wallet) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Wallet, error)
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]models.Wallet, error)
	Update(ctx context.Context, wallet *models.Wallet) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type walletRepository struct {
	pool *pgxpool.Pool
}

func NewWalletRepository(pool *pgxpool.Pool) WalletRepository {
	return &walletRepository{pool: pool}
}

func (r *walletRepository) Create(ctx context.Context, wallet *models.Wallet) error {
	query := `
		INSERT INTO wallets (user_id, name, type, currency, balance, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`
	return r.pool.QueryRow(ctx, query, 
		wallet.UserID, wallet.Name, wallet.Type, wallet.Currency, wallet.Balance, wallet.CreatedAt, wallet.UpdatedAt,
	).Scan(&wallet.ID)
}

func (r *walletRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Wallet, error) {
	query := `SELECT id, user_id, name, type, currency, balance, created_at, updated_at FROM wallets WHERE id = $1`
	w := &models.Wallet{}
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&w.ID, &w.UserID, &w.Name, &w.Type, &w.Currency, &w.Balance, &w.CreatedAt, &w.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return w, nil
}

func (r *walletRepository) ListByUserID(ctx context.Context, userID uuid.UUID) ([]models.Wallet, error) {
	query := `SELECT id, user_id, name, type, currency, balance, created_at, updated_at FROM wallets WHERE user_id = $1`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wallets []models.Wallet
	for rows.Next() {
		var w models.Wallet
		if err := rows.Scan(&w.ID, &w.UserID, &w.Name, &w.Type, &w.Currency, &w.Balance, &w.CreatedAt, &w.UpdatedAt); err != nil {
			return nil, err
		}
		wallets = append(wallets, w)
	}
	return wallets, nil
}

func (r *walletRepository) Update(ctx context.Context, wallet *models.Wallet) error {
	query := `
		UPDATE wallets SET name = $1, type = $2, currency = $3, balance = $4, updated_at = $5
		WHERE id = $6
	`
	_, err := r.pool.Exec(ctx, query, wallet.Name, wallet.Type, wallet.Currency, wallet.Balance, wallet.UpdatedAt, wallet.ID)
	return err
}

func (r *walletRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM wallets WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
