package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"savesphere-api/internal/models"
	"savesphere-api/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const (
	ProviderGoogle = "google"
)

// PKCE holds PKCE parameters for an OAuth flow
type PKCE struct {
	CodeChallenge       string `json:"code_challenge"`
	CodeChallengeMethod string `json:"code_challenge_method"`
	CodeVerifier        string `json:"code_verifier"`
}

// GeneratePKCE creates a new PKCE pair (verifier + S256 challenge)
func GeneratePKCE() (*PKCE, error) {
	verifier := make([]byte, 32)
	if _, err := rand.Read(verifier); err != nil {
		return nil, err
	}
	v := base64.RawURLEncoding.EncodeToString(verifier)
	h := sha256.Sum256([]byte(v))
	challenge := base64.RawURLEncoding.EncodeToString(h[:])
	return &PKCE{
		CodeVerifier:        v,
		CodeChallenge:       challenge,
		CodeChallengeMethod: "S256",
	}, nil
}

type OAuthService interface {
	IsConfigured() bool
	GetGoogleAuthURL(state string, pkce *PKCE) string
	ExchangeCode(ctx context.Context, code string, pkce *PKCE) (*models.OAuthUserInfo, error)
	FindOrCreateUser(ctx context.Context, info *models.OAuthUserInfo) (*models.User, error)
}

type oauthService struct {
	userRepo   repository.UserRepository
	oauth2Cfg  *oauth2.Config
	httpClient *http.Client
}

func NewOAuthService(userRepo repository.UserRepository) OAuthService {
	redirectURL := os.Getenv("OAUTH_REDIRECT_URL")
	if redirectURL == "" {
		redirectURL = "http://localhost:5173/auth/callback"
	}

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	cfg := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}

	return &oauthService{
		userRepo:   userRepo,
		oauth2Cfg:  cfg,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *oauthService) IsConfigured() bool {
	return s.oauth2Cfg.ClientID != "" && s.oauth2Cfg.ClientSecret != ""
}

func (s *oauthService) GetGoogleAuthURL(state string, pkce *PKCE) string {
	opts := []oauth2.AuthCodeOption{
		oauth2.SetAuthURLParam("code_challenge", pkce.CodeChallenge),
		oauth2.SetAuthURLParam("code_challenge_method", pkce.CodeChallengeMethod),
	}
	return s.oauth2Cfg.AuthCodeURL(state, opts...)
}

func (s *oauthService) ExchangeCode(ctx context.Context, code string, pkce *PKCE) (*models.OAuthUserInfo, error) {
	opts := []oauth2.AuthCodeOption{
		oauth2.SetAuthURLParam("code_verifier", pkce.CodeVerifier),
	}
	token, err := s.oauth2Cfg.Exchange(ctx, code, opts...)
	if err != nil {
		return nil, fmt.Errorf("token exchange failed: %w", err)
	}

	// Fetch user info from Google
	req, err := http.NewRequestWithContext(ctx, "GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)

	res, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(res.Body)
		return nil, fmt.Errorf("google userinfo failed: %s", string(body))
	}

	var gUser struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
		VerifiedEmail bool   `json:"verified_email"`
	}
	if err := json.NewDecoder(res.Body).Decode(&gUser); err != nil {
		return nil, err
	}

	if !gUser.VerifiedEmail {
		return nil, errors.New("email not verified")
	}

	return &models.OAuthUserInfo{
		ProviderID: gUser.ID,
		Email:      gUser.Email,
		FullName:   gUser.Name,
		Picture:    gUser.Picture,
	}, nil
}

func (s *oauthService) FindOrCreateUser(ctx context.Context, info *models.OAuthUserInfo) (*models.User, error) {
	// 1. Try to find by provider + provider_id
	user, err := s.userRepo.GetByProvider(ctx, ProviderGoogle, info.ProviderID)
	if err != nil {
		return nil, err
	}
	if user != nil {
		return user, nil
	}

	// 2. Try to find by email and link
	user, err = s.userRepo.GetByEmail(ctx, info.Email)
	if err != nil {
		return nil, err
	}
	if user != nil {
		// Link existing local account to Google
		user.AuthProvider = ProviderGoogle
		user.ProviderID = &info.ProviderID
		user.EmailVerified = true
		user.Picture = &info.Picture
		user.UpdatedAt = time.Now()
		if err := s.userRepo.Update(ctx, user); err != nil {
			return nil, err
		}
		return user, nil
	}

	// 3. Create new OAuth user
	now := time.Now()
	newUser := &models.User{
		ID:            uuid.Must(uuid.NewRandom()),
		Email:         info.Email,
		FullName:      info.FullName,
		AuthProvider:  ProviderGoogle,
		ProviderID:    &info.ProviderID,
		EmailVerified: true,
		Picture:       &info.Picture,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	if err := s.userRepo.Create(ctx, newUser); err != nil {
		return nil, err
	}
	return newUser, nil
}
