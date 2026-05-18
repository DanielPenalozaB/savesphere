package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"os"

	"savesphere-api/internal/common/response"
	"savesphere-api/internal/models"
	"savesphere-api/internal/services"

	"github.com/labstack/echo/v4"
)

func isSecureCookie() bool {
	return os.Getenv("APP_ENV") == "production"
}

func generateState() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

type OAuthHandler struct {
	oauthService   services.OAuthService
	jwtService     services.JWTService
	sessionService services.SessionService
	auditService   services.AuditService
}

func NewOAuthHandler(oauthService services.OAuthService, jwtService services.JWTService, sessionService services.SessionService, auditService services.AuditService) *OAuthHandler {
	return &OAuthHandler{
		oauthService:   oauthService,
		jwtService:     jwtService,
		sessionService: sessionService,
		auditService:   auditService,
	}
}

// BeginGoogleAuth initiates the Google OAuth flow
func (h *OAuthHandler) BeginGoogleAuth(c echo.Context) error {
	if !h.oauthService.IsConfigured() {
		return response.Error(c, http.StatusServiceUnavailable, "Google Sign-In is not configured", nil)
	}

	pkce, err := services.GeneratePKCE()
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to initialize OAuth", nil)
	}

	// Store PKCE verifier in a short-lived cookie
	c.SetCookie(&http.Cookie{
		Name:     "oauth_verifier",
		Value:    pkce.CodeVerifier,
		Path:     "/",
		MaxAge:   600,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   isSecureCookie(),
	})

	// Store state in cookie for CSRF protection
	state, err := generateState()
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Failed to initialize OAuth", nil)
	}
	c.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		MaxAge:   600,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   isSecureCookie(),
	})

	authURL := h.oauthService.GetGoogleAuthURL(state, pkce)
	return response.JSON(c, http.StatusOK, "Redirect to Google", map[string]string{
		"url": authURL,
	})
}

// GoogleCallback handles the OAuth callback from Google
func (h *OAuthHandler) GoogleCallback(c echo.Context) error {
	// Check for OAuth errors first (e.g., user denied permission)
	if oauthErr := c.QueryParam("error"); oauthErr != "" {
		if oauthErr == "access_denied" {
			return response.Error(c, http.StatusBadRequest, "Access denied", nil)
		}
		return response.Error(c, http.StatusBadRequest, "Authentication failed", nil)
	}

	code := c.QueryParam("code")
	state := c.QueryParam("state")
	if code == "" {
		return response.Error(c, http.StatusBadRequest, "Missing authorization code", nil)
	}

	// Verify state
	stateCookie, err := c.Cookie("oauth_state")
	if err != nil || stateCookie.Value != state {
		return response.Error(c, http.StatusBadRequest, "Invalid state parameter", nil)
	}

	// Retrieve verifier
	verifierCookie, err := c.Cookie("oauth_verifier")
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "Missing verifier", nil)
	}

	pkce := &services.PKCE{
		CodeVerifier:        verifierCookie.Value,
		CodeChallenge:       state,
		CodeChallengeMethod: "S256",
	}

	// Exchange code for user info
	info, err := h.oauthService.ExchangeCode(c.Request().Context(), code, pkce)
	if err != nil {
		c.Logger().Errorf("OAuth exchange failed: %v", err)
		return response.Error(c, http.StatusUnauthorized, "Authentication failed", nil)
	}

	// Find or create user
	user, err := h.oauthService.FindOrCreateUser(c.Request().Context(), info)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Something went wrong", nil)
	}

	ip, ua := getClientInfo(c)
	h.auditService.LogLogin(c.Request().Context(), &user.ID, ip, ua, "google", true, "")

	// Create session
	accessToken, refreshToken, err := h.sessionService.CreateSession(c.Request().Context(), user.ID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Something went wrong", nil)
	}

	// Clear OAuth cookies
	c.SetCookie(&http.Cookie{Name: "oauth_verifier", Value: "", Path: "/", MaxAge: -1})
	c.SetCookie(&http.Cookie{Name: "oauth_state", Value: "", Path: "/", MaxAge: -1})

	// Set auth cookies
	setAuthCookies(c, accessToken, refreshToken)

	return response.JSON(c, http.StatusOK, "Login successful", models.AuthResponse{
		User:  *user,
		Token: accessToken,
	})
}
