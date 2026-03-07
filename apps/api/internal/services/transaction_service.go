package services

import (
	"context"
	"time"

	"savesphere-api/internal/models"
	"savesphere-api/internal/repository"

	"github.com/google/uuid"
)

type TransactionService interface {
	Create(ctx context.Context, req models.TransactionCreateRequest) (*models.Transaction, error)
	ListByWalletID(ctx context.Context, walletID uuid.UUID, isFixed *bool) ([]models.Transaction, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type transactionService struct {
	repo repository.TransactionRepository
}

func NewTransactionService(repo repository.TransactionRepository) TransactionService {
	return &transactionService{repo: repo}
}

func (s *transactionService) Create(ctx context.Context, req models.TransactionCreateRequest) (*models.Transaction, error) {
	tx := &models.Transaction{
		WalletID:    req.WalletID,
		CategoryID:  req.CategoryID,
		Amount:      req.Amount,
		Type:        req.Type,
		IsFixed:     req.IsFixed,
		Description: req.Description,
		Date:        req.Date,
		CreatedAt:   time.Now(),
	}

	if err := s.repo.Create(ctx, tx); err != nil {
		return nil, err
	}

	return tx, nil
}

func (s *transactionService) ListByWalletID(ctx context.Context, walletID uuid.UUID, isFixed *bool) ([]models.Transaction, error) {
	txs, err := s.repo.ListByWalletID(ctx, walletID)
	if err != nil {
		return nil, err
	}

	if isFixed == nil {
		return txs, nil
	}

	var filtered []models.Transaction
	for _, t := range txs {
		if t.IsFixed == *isFixed {
			filtered = append(filtered, t)
		}
	}

	return filtered, nil
}

func (s *transactionService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
