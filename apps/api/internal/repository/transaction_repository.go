package repository

import (
	"context"
	"errors"
	"time"

	"savesphere-api/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shopspring/decimal"
)

type TransactionRepository interface {
	Create(ctx context.Context, tx *models.Transaction) error
	ListByWalletID(ctx context.Context, walletID uuid.UUID) ([]models.Transaction, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type transactionRepository struct {
	pool *pgxpool.Pool
}

func NewTransactionRepository(pool *pgxpool.Pool) TransactionRepository {
	return &transactionRepository{pool: pool}
}

func (r *transactionRepository) Create(ctx context.Context, tx *models.Transaction) error {
	// Start a database transaction
	dbTx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer dbTx.Rollback(ctx)

	// Insert transaction
	query := `
		INSERT INTO transactions (wallet_id, category_id, amount, type, is_fixed, date, description, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`
	err = dbTx.QueryRow(ctx, query,
		tx.WalletID, tx.CategoryID, tx.Amount, tx.Type, tx.IsFixed, tx.Date, tx.Description, tx.CreatedAt,
	).Scan(&tx.ID)
	if err != nil {
		return err
	}

	// Update wallet balance
	// If Income, add to balance. If Expense, subtract. If Saving, subtract from balance (as it goes to a saving goal).
	amount := tx.Amount
	if tx.Type == models.TransactionTypeExpense || tx.Type == models.TransactionTypeSaving {
		amount = amount.Neg()
	}

	updateQuery := `UPDATE wallets SET balance = balance + $1, updated_at = $2 WHERE id = $3`
	_, err = dbTx.Exec(ctx, updateQuery, amount, time.Now(), tx.WalletID)
	if err != nil {
		return err
	}

	return dbTx.Commit(ctx)
}

func (r *transactionRepository) ListByWalletID(ctx context.Context, walletID uuid.UUID) ([]models.Transaction, error) {
	query := `SELECT id, wallet_id, category_id, amount, type, is_fixed, date, description, created_at FROM transactions WHERE wallet_id = $1 ORDER BY date DESC`
	rows, err := r.pool.Query(ctx, query, walletID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []models.Transaction
	for rows.Next() {
		var t models.Transaction
		if err := rows.Scan(&t.ID, &t.WalletID, &t.CategoryID, &t.Amount, &t.Type, &t.IsFixed, &t.Date, &t.Description, &t.CreatedAt); err != nil {
			return nil, err
		}
		transactions = append(transactions, t)
	}
	return transactions, nil
}

func (r *transactionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// Start a database transaction
	dbTx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer dbTx.Rollback(ctx)

	// Get transaction details first to know how to adjust balance
	var walletID uuid.UUID
	var amount decimal.Decimal
	var txType models.TransactionType
	
	query := `SELECT wallet_id, amount, type FROM transactions WHERE id = $1`
	err = dbTx.QueryRow(ctx, query, id).Scan(&walletID, &amount, &txType)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil // Transaction already deleted
		}
		return err
	}

	// Reverse balance update
	// If it was an Income, we subtract. If Expense/Saving, we add back.
	if txType == models.TransactionTypeIncome {
		amount = amount.Neg()
	}

	updateQuery := `UPDATE wallets SET balance = balance + $1, updated_at = $2 WHERE id = $3`
	_, err = dbTx.Exec(ctx, updateQuery, amount, time.Now(), walletID)
	if err != nil {
		return err
	}

	// Delete transaction
	deleteQuery := `DELETE FROM transactions WHERE id = $1`
	_, err = dbTx.Exec(ctx, deleteQuery, id)
	if err != nil {
		return err
	}

	return dbTx.Commit(ctx)
}
