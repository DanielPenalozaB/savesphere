package handlers

import (
	"net/http"

	"savesphere-api/internal/common/response"
	"savesphere-api/internal/models"
	"savesphere-api/internal/services"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	userService services.UserService
	jwtService  services.JWTService
	validator   *validator.Validate
}

func NewAuthHandler(userService services.UserService, jwtService services.JWTService) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		jwtService:  jwtService,
		validator:   validator.New(),
	}
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req models.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "Invalid request payload", err)
	}

	if err := h.validator.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed", err)
	}

	user, err := h.userService.Register(c.Request().Context(), req)
	if err != nil {
		return response.Error(c, http.StatusConflict, err.Error(), nil)
	}

	token, err := h.jwtService.GenerateToken(user.ID)
	if err != nil {
		return response.InternalError(c, "Failed to generate token", err)
	}

	return response.JSON(c, http.StatusCreated, "User registered successfully", models.AuthResponse{
		User:  *user,
		Token: token,
	})
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req models.LoginRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "Invalid request payload", err)
	}

	if err := h.validator.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed", err)
	}

	user, err := h.userService.Login(c.Request().Context(), req)
	if err != nil {
		return response.Error(c, http.StatusUnauthorized, "Invalid email or password", nil)
	}

	token, err := h.jwtService.GenerateToken(user.ID)
	if err != nil {
		return response.InternalError(c, "Failed to generate token", err)
	}

	return response.JSON(c, http.StatusOK, "Login successful", models.AuthResponse{
		User:  *user,
		Token: token,
	})
}
