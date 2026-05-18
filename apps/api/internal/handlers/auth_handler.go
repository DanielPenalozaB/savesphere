package handlers

import (
	"net"
	"net/http"
	"os"

	"savesphere-api/internal/common/response"
	"savesphere-api/internal/models"
	"savesphere-api/internal/services"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

func getClientInfo(c echo.Context) (net.IP, string) {
	ip := net.ParseIP(c.RealIP())
	if ip == nil {
		ip = net.ParseIP("127.0.0.1")
	}
	return ip, c.Request().UserAgent()
}

func setAuthCookies(c echo.Context, accessToken string, refreshToken string) {
	isProd := os.Getenv("APP_ENV") == "production"
	c.SetCookie(&http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		MaxAge:   900, // 15 minutes
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   isProd,
	})
	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		MaxAge:   604800, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   isProd,
	})
}

func clearAuthCookies(c echo.Context) {
	c.SetCookie(&http.Cookie{Name: "access_token", Value: "", Path: "/", MaxAge: -1})
	c.SetCookie(&http.Cookie{Name: "refresh_token", Value: "", Path: "/", MaxAge: -1})
}

type AuthHandler struct {
	userService              services.UserService
	jwtService               services.JWTService
	passwordResetService     services.PasswordResetService
	emailVerificationService services.EmailVerificationService
	sessionService           services.SessionService
	auditService             services.AuditService
	validator                *validator.Validate
}

func NewAuthHandler(
	userService services.UserService,
	jwtService services.JWTService,
	passwordResetService services.PasswordResetService,
	emailVerificationService services.EmailVerificationService,
	sessionService services.SessionService,
	auditService services.AuditService,
) *AuthHandler {
	return &AuthHandler{
		userService:              userService,
		jwtService:               jwtService,
		passwordResetService:     passwordResetService,
		emailVerificationService: emailVerificationService,
		sessionService:           sessionService,
		auditService:             auditService,
		validator:                validator.New(),
	}
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req models.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request", nil)
	}

	if err := h.validator.Struct(req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request", nil)
	}

	user, err := h.userService.Register(c.Request().Context(), req)
	if err != nil {
		return response.Error(c, http.StatusConflict, "Account already exists", nil)
	}

	// Create email verification token for local accounts
	_, _ = h.emailVerificationService.CreateVerification(c.Request().Context(), user.ID, user.Email)

	accessToken, refreshToken, err := h.sessionService.CreateSession(c.Request().Context(), user.ID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Something went wrong", nil)
	}

	setAuthCookies(c, accessToken, refreshToken)

	return response.JSON(c, http.StatusCreated, "Account created", models.AuthResponse{
		User:  *user,
		Token: accessToken,
	})
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req models.LoginRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request", nil)
	}

	if err := h.validator.Struct(req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request", nil)
	}

	ip, ua := getClientInfo(c)
	user, err := h.userService.Login(c.Request().Context(), req)
	if err != nil {
		if err.Error() == "account locked" {
			h.auditService.LogLogin(c.Request().Context(), &user.ID, ip, ua, "local", false, "account_locked")
			return response.Error(c, http.StatusTooManyRequests, "Account temporarily locked. Please try again later.", nil)
		}
		// Record failed login if user exists
		if user != nil {
			_ = h.userService.RecordFailedLogin(c.Request().Context(), user.ID)
			h.auditService.LogLogin(c.Request().Context(), &user.ID, ip, ua, "local", false, "invalid_credentials")
		} else {
			h.auditService.LogLogin(c.Request().Context(), nil, ip, ua, "local", false, "user_not_found")
		}
		return response.Error(c, http.StatusUnauthorized, "Invalid email or password", nil)
	}

	if !user.EmailVerified {
		h.auditService.LogLogin(c.Request().Context(), &user.ID, ip, ua, "local", false, "email_not_verified")
		return response.Error(c, http.StatusForbidden, "Please verify your email before signing in", nil)
	}

	// Record successful login
	_ = h.userService.RecordSuccessfulLogin(c.Request().Context(), user.ID)
	h.auditService.LogLogin(c.Request().Context(), &user.ID, ip, ua, "local", true, "")

	accessToken, refreshToken, err := h.sessionService.CreateSession(c.Request().Context(), user.ID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Something went wrong", nil)
	}

	setAuthCookies(c, accessToken, refreshToken)

	return response.JSON(c, http.StatusOK, "Login successful", models.AuthResponse{
		User:  *user,
		Token: accessToken,
	})
}

func (h *AuthHandler) ForgotPassword(c echo.Context) error {
	var req models.ForgotPasswordRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request", nil)
	}

	if err := h.validator.Struct(req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request", nil)
	}

	// Always return success to prevent email enumeration
	_ = h.passwordResetService.RequestReset(c.Request().Context(), req.Email)

	return response.JSON(c, http.StatusOK, "If an account exists, a reset link has been sent", nil)
}

func (h *AuthHandler) ResetPassword(c echo.Context) error {
	var req models.ResetPasswordRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request", nil)
	}

	if err := h.validator.Struct(req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid request", nil)
	}

	if err := h.passwordResetService.ResetPassword(c.Request().Context(), req.Token, req.Password); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid or expired token", nil)
	}

	return response.JSON(c, http.StatusOK, "Password updated successfully", nil)
}

func (h *AuthHandler) VerifyEmail(c echo.Context) error {
	token := c.QueryParam("token")
	if token == "" {
		return response.Error(c, http.StatusBadRequest, "Missing verification token", nil)
	}

	if err := h.emailVerificationService.VerifyEmail(c.Request().Context(), token); err != nil {
		return response.Error(c, http.StatusBadRequest, "Invalid or expired token", nil)
	}

	return response.JSON(c, http.StatusOK, "Email verified successfully", nil)
}

func (h *AuthHandler) Refresh(c echo.Context) error {
	refreshCookie, err := c.Cookie("refresh_token")
	if err != nil {
		return response.Error(c, http.StatusUnauthorized, "Missing refresh token", nil)
	}

	accessToken, newRefreshToken, err := h.sessionService.RefreshSession(c.Request().Context(), refreshCookie.Value)
	if err != nil {
		clearAuthCookies(c)
		return response.Error(c, http.StatusUnauthorized, "Invalid or expired session", nil)
	}

	setAuthCookies(c, accessToken, newRefreshToken)
	return response.JSON(c, http.StatusOK, "Token refreshed", map[string]string{
		"token": accessToken,
	})
}

func (h *AuthHandler) Logout(c echo.Context) error {
	refreshCookie, err := c.Cookie("refresh_token")
	if err == nil && refreshCookie.Value != "" {
		_ = h.sessionService.RevokeSession(c.Request().Context(), refreshCookie.Value)
	}
	clearAuthCookies(c)
	return response.JSON(c, http.StatusOK, "Logged out successfully", nil)
}

func (h *AuthHandler) Me(c echo.Context) error {
	accessCookie, err := c.Cookie("access_token")
	if err != nil {
		return response.Error(c, http.StatusUnauthorized, "Missing access token", nil)
	}

	userID, err := h.jwtService.ExtractUserID(accessCookie.Value)
	if err != nil {
		return response.Error(c, http.StatusUnauthorized, "Invalid or expired token", nil)
	}

	user, err := h.userService.GetByID(c.Request().Context(), userID)
	if err != nil || user == nil {
		return response.Error(c, http.StatusUnauthorized, "User not found", nil)
	}

	return response.JSON(c, http.StatusOK, "User retrieved", user)
}
