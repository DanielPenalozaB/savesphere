package services

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTService interface {
	GenerateToken(UserID uuid.UUID) (string, error)
	ValidateToken(tokenString string) (*jwt.Token, error)
	ExtractUserID(tokenString string) (uuid.UUID, error)
	AccessTokenExpiry() time.Duration
}

type jwtService struct {
	secretKey         string
	issuer            string
	accessTokenExpiry time.Duration
}

type authCustomClaims struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}

func NewJWTService() JWTService {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		fmt.Println("FATAL: JWT_SECRET environment variable is required")
		os.Exit(1)
	}
	if len(secret) < 32 {
		fmt.Println("FATAL: JWT_SECRET must be at least 32 characters")
		os.Exit(1)
	}

	expiry := 24 * time.Hour
	if v := os.Getenv("JWT_ACCESS_TOKEN_EXPIRY"); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			expiry = d
		}
	}

	return &jwtService{
		secretKey:         secret,
		issuer:            "savesphere-api",
		accessTokenExpiry: expiry,
	}
}

func (s *jwtService) AccessTokenExpiry() time.Duration {
	return s.accessTokenExpiry
}

func (s *jwtService) GenerateToken(userID uuid.UUID) (string, error) {
	claims := &authCustomClaims{
		userID,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.accessTokenExpiry)),
			Issuer:    s.issuer,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(s.secretKey))
	if err != nil {
		return "", err
	}
	return t, nil
}

func (s *jwtService) ExtractUserID(tokenString string) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.secretKey), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}))
	if err != nil {
		return uuid.Nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return uuid.Nil, errors.New("invalid token claims")
	}

	userIDStr, ok := claims["user_id"].(string)
	if !ok {
		return uuid.Nil, errors.New("user ID not found in token")
	}

	return uuid.Parse(userIDStr)
}

func (s *jwtService) ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.secretKey), nil
	})
}
