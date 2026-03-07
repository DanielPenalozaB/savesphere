package services

import (
	"context"
	"fmt"
	"os"
	"time"

	"savesphere-api/internal/models"
	"savesphere-api/internal/repository"

	"github.com/google/generative-ai-go/genai"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"google.golang.org/api/option"
)

type FinancialIntelligenceService interface {
	GetSafeToSpend(ctx context.Context, userID uuid.UUID) (decimal.Decimal, error)
	GetFinancialAdvice(ctx context.Context, userID uuid.UUID) (string, error)
}

type finIntelService struct {
	walletRepo repository.WalletRepository
	txRepo     repository.TransactionRepository
}

func NewFinancialIntelligenceService(walletRepo repository.WalletRepository, txRepo repository.TransactionRepository) FinancialIntelligenceService {
	return &finIntelService{
		walletRepo: walletRepo,
		txRepo:     txRepo,
	}
}

func (s *finIntelService) GetFinancialAdvice(ctx context.Context, userID uuid.UUID) (string, error) {
	wallets, err := s.walletRepo.ListByUserID(ctx, userID)
	if err != nil {
		return "", err
	}

	var transactionSummary string
	threeMonthsAgo := time.Now().AddDate(0, -3, 0)

	for _, w := range wallets {
		txs, err := s.txRepo.ListByWalletID(ctx, w.ID)
		if err != nil {
			return "", err
		}

		transactionSummary += fmt.Sprintf("\nWallet: %s (%s)\n", w.Name, w.Type)
		for _, t := range txs {
			if t.Date.After(threeMonthsAgo) {
				// Anonymized data: Type, Amount, Fixed/Variable, Date
				transactionSummary += fmt.Sprintf("- %s: %s (Fixed: %v) on %s\n", t.Type, t.Amount.String(), t.IsFixed, t.Date.Format("2006-01-02"))
			}
		}
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "AI advice currently unavailable: Missing API Key", nil
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	
	prompt := fmt.Sprintf(`
		You are a personal financial advisor. Analyze the following user transaction history from the last 3 months and provide 3 actionable pieces of advice for their financial health. 
		Keep it concise and encouraging. 
		Data: %s`, transactionSummary)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "No advice could be generated at this time.", nil
	}

	return fmt.Sprint(resp.Candidates[0].Content.Parts[0]), nil
}

func (s *finIntelService) GetSafeToSpend(ctx context.Context, userID uuid.UUID) (decimal.Decimal, error) {
	wallets, err := s.walletRepo.ListByUserID(ctx, userID)
	if err != nil {
		return decimal.Zero, err
	}

	var totalFixedIncome decimal.Decimal
	var totalFixedExpenses decimal.Decimal

	for _, w := range wallets {
		txs, err := s.txRepo.ListByWalletID(ctx, w.ID)
		if err != nil {
			return decimal.Zero, err
		}

		now := time.Now()
		for _, t := range txs {
			// Only consider fixed transactions from the current month
			if t.IsFixed && t.Date.Month() == now.Month() && t.Date.Year() == now.Year() {
				if t.Type == models.TransactionTypeIncome {
					totalFixedIncome = totalFixedIncome.Add(t.Amount)
				} else if t.Type == models.TransactionTypeExpense {
					totalFixedExpenses = totalFixedExpenses.Add(t.Amount)
				}
			}
		}
	}

	return totalFixedIncome.Sub(totalFixedExpenses), nil
}
