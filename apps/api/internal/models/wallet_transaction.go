package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type WalletType string

const (
	WalletTypeCash   WalletType = "Cash"
	WalletTypeBank   WalletType = "Bank"
	WalletTypeCredit WalletType = "Credit"
)

type Wallet struct {
	ID        uuid.UUID       `json:"id"`
	UserID    uuid.UUID       `json:"user_id"`
	Name      string          `json:"name" validate:"required"`
	Type      WalletType      `json:"type" validate:"required,oneof=Cash Bank Credit"`
	Currency  string          `json:"currency" validate:"required,len=3"`
	Balance   decimal.Decimal `json:"balance"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

type WalletCreateRequest struct {
	Name     string     `json:"name" validate:"required"`
	Type     WalletType `json:"type" validate:"required,oneof=Cash Bank Credit"`
	Currency string     `json:"currency" validate:"required,len=3"`
}

type TransactionType string

const (
	TransactionTypeIncome  TransactionType = "Income"
	TransactionTypeExpense TransactionType = "Expense"
	TransactionTypeSaving  TransactionType = "Saving"
)

type Transaction struct {
	ID          uuid.UUID       `json:"id"`
	WalletID    uuid.UUID       `json:"wallet_id"`
	CategoryID  *uuid.UUID      `json:"category_id"`
	Amount      decimal.Decimal `json:"amount" validate:"required"`
	Type        TransactionType `json:"type" validate:"required,oneof=Income Expense Saving"`
	IsFixed     bool            `json:"is_fixed"`
	Description string          `json:"description"`
	Date        time.Time       `json:"date" validate:"required"`
	CreatedAt   time.Time       `json:"created_at"`
}

type TransactionCreateRequest struct {
	WalletID    uuid.UUID       `json:"wallet_id" validate:"required"`
	CategoryID  *uuid.UUID      `json:"category_id"`
	Amount      decimal.Decimal `json:"amount" validate:"required"`
	Type        TransactionType `json:"type" validate:"required,oneof=Income Expense Saving"`
	IsFixed     bool            `json:"is_fixed"`
	Description string          `json:"description"`
	Date        time.Time       `json:"date" validate:"required"`
}

type Category struct {
	ID        uuid.UUID  `json:"id"`
	UserID    *uuid.UUID `json:"user_id"` // Nullable for system defaults
	Name      string     `json:"name" validate:"required"`
	Color     string     `json:"color"`
	Icon      string     `json:"icon"`
	CreatedAt time.Time  `json:"created_at"`
}
