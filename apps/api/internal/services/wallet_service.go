package services

import (
	"context"
	"time"

	"savesphere-api/internal/models"
	"savesphere-api/internal/repository"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type WalletService interface {
	Create(ctx context.Context, userID uuid.UUID, req models.WalletCreateRequest) (*models.Wallet, error)
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]models.Wallet, error)
	GetLiquidity(ctx context.Context, userID uuid.UUID) (decimal.Decimal, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type walletService struct {
	repo repository.WalletRepository
}

func NewWalletService(repo repository.WalletRepository) WalletService {
	return &walletService{repo: repo}
}

func (s *walletService) Create(ctx context.Context, userID uuid.UUID, req models.WalletCreateRequest) (*models.Wallet, error) {
	wallet := &models.Wallet{
		UserID:    userID,
		Name:      req.Name,
		Type:      req.Type,
		Currency:  req.Currency,
		Balance:   decimal.Zero,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.Create(ctx, wallet); err != nil {
		return nil, err
	}

	return wallet, nil
}

func (s *walletService) ListByUserID(ctx context.Context, userID uuid.UUID) ([]models.Wallet, error) {
	return s.repo.ListByUserID(ctx, userID)
}

func (s *walletService) GetLiquidity(ctx context.Context, userID uuid.UUID) (decimal.Decimal, error) {
	wallets, err := s.repo.ListByUserID(ctx, userID)
	if err != nil {
		return decimal.Zero, err
	}

	total := decimal.Zero
	for _, w := range wallets {
		total = total.Add(w.Balance)
	}

	return total, nil
}

func (s *walletService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
