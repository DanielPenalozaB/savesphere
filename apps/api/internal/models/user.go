package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                   uuid.UUID  `json:"id"`
	Email                string     `json:"email" validate:"required,email"`
	PasswordHash         string     `json:"-"`
	FullName             string     `json:"fullName" validate:"required"`
	AuthProvider         string     `json:"authProvider"`
	ProviderID           *string    `json:"providerId,omitempty"`
	EmailVerified        bool       `json:"emailVerified"`
	Picture              *string    `json:"picture,omitempty"`
	LastLoginAt          *time.Time `json:"lastLoginAt,omitempty"`
	FailedLoginAttempts  int        `json:"-"`
	LockedUntil          *time.Time `json:"-"`
	CreatedAt            time.Time  `json:"createdAt"`
	UpdatedAt            time.Time  `json:"updatedAt"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,password"`
	FullName string `json:"fullName" validate:"required,fullname"`
}

type AuthResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

type OAuthUserInfo struct {
	ProviderID string `json:"providerId"`
	Email      string `json:"email"`
	FullName   string `json:"fullName"`
	Picture    string `json:"picture,omitempty"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Token    string `json:"token" validate:"required"`
	Password string `json:"password" validate:"required,password"`
}

type SetPasswordRequest struct {
	Password string `json:"password" validate:"required,password"`
}
