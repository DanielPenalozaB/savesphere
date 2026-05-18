package services

import (
	"fmt"
	"log"
	"os"
)

type EmailService interface {
	SendPasswordReset(email string, resetURL string) error
	SendEmailVerification(email string, verifyURL string) error
}

type devEmailService struct{}

func NewEmailService() EmailService {
	return &devEmailService{}
}

func (s *devEmailService) SendPasswordReset(email string, resetURL string) error {
	if os.Getenv("APP_ENV") == "production" {
		// TODO: Integrate with SendGrid/AWS SES/Mailgun
		return fmt.Errorf("email not configured for production")
	}
	log.Printf("[DEV EMAIL] Password reset for %s: %s", email, resetURL)
	return nil
}

func (s *devEmailService) SendEmailVerification(email string, verifyURL string) error {
	if os.Getenv("APP_ENV") == "production" {
		return fmt.Errorf("email not configured for production")
	}
	log.Printf("[DEV EMAIL] Email verification for %s: %s", email, verifyURL)
	return nil
}
