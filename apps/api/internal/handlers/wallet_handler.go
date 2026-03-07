package handlers

import (
	"net/http"

	"savesphere-api/internal/common/response"
	"savesphere-api/internal/models"
	"savesphere-api/internal/services"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type WalletHandler struct {
	service   services.WalletService
	validator *validator.Validate
}

func NewWalletHandler(service services.WalletService) *WalletHandler {
	return &WalletHandler{
		service:   service,
		validator: validator.New(),
	}
}

func (h *WalletHandler) Create(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	var req models.WalletCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "Invalid request payload", err)
	}

	if err := h.validator.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed", err)
	}

	wallet, err := h.service.Create(c.Request().Context(), userID, req)
	if err != nil {
		return response.InternalError(c, "Failed to create wallet", err)
	}

	return response.JSON(c, http.StatusCreated, "Wallet created successfully", wallet)
}

func (h *WalletHandler) List(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	wallets, err := h.service.ListByUserID(c.Request().Context(), userID)
	if err != nil {
		return response.InternalError(c, "Failed to fetch wallets", err)
	}

	return response.JSON(c, http.StatusOK, "", wallets)
}

func (h *WalletHandler) GetLiquidity(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	liquidity, err := h.service.GetLiquidity(c.Request().Context(), userID)
	if err != nil {
		return response.InternalError(c, "Failed to calculate liquidity", err)
	}

	return response.JSON(c, http.StatusOK, "", map[string]interface{}{
		"liquidity": liquidity,
	})
}
