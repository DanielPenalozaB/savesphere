package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type EmailService interface {
	SendPasswordReset(email string, resetURL string) error
	SendEmailVerification(email string, verifyURL string) error
}

type devEmailService struct{}

func (s *devEmailService) SendPasswordReset(email string, resetURL string) error {
	log.Printf("[DEV EMAIL] Password reset for %s: %s", email, resetURL)
	return nil
}

func (s *devEmailService) SendEmailVerification(email string, verifyURL string) error {
	log.Printf("[DEV EMAIL] Email verification for %s: %s", email, verifyURL)
	return nil
}

type resendEmailService struct {
	apiKey      string
	fromAddress string
}

func (s *resendEmailService) SendPasswordReset(email string, resetURL string) error {
	return s.send(email, "Reset your SaveSphere password", passwordResetEmailHTML(resetURL))
}

func (s *resendEmailService) SendEmailVerification(email string, verifyURL string) error {
	return s.send(email, "Verify your SaveSphere email", verificationEmailHTML(verifyURL))
}

func (s *resendEmailService) send(to, subject, html string) error {
	payload := map[string]interface{}{
		"from":    s.fromAddress,
		"to":     []string{to},
		"subject": subject,
		"html":    html,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("resend API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}

func NewEmailService() EmailService {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Println("[EMAIL] No RESEND_API_KEY set, using dev email service (console logging)")
		return &devEmailService{}
	}

	fromAddress := os.Getenv("EMAIL_FROM")
	if fromAddress == "" {
		fromAddress = "SaveSphere <noreply@savesphere.app>"
	}

	log.Println("[EMAIL] Using Resend email service")
	return &resendEmailService{
		apiKey:      apiKey,
		fromAddress: fromAddress,
	}
}
