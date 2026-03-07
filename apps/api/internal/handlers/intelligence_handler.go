package handlers

import (
	"net/http"

	"savesphere-api/internal/common/response"
	"savesphere-api/internal/services"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type IntelligenceHandler struct {
	service services.FinancialIntelligenceService
}

func NewIntelligenceHandler(service services.FinancialIntelligenceService) *IntelligenceHandler {
	return &IntelligenceHandler{service: service}
}

func (h *IntelligenceHandler) GetSafeToSpend(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	safeToSpend, err := h.service.GetSafeToSpend(c.Request().Context(), userID)
	if err != nil {
		return response.InternalError(c, "Failed to calculate safe to spend", err)
	}

	return response.JSON(c, http.StatusOK, "", map[string]interface{}{
		"safe_to_spend": safeToSpend,
	})
}

func (h *IntelligenceHandler) GetAdvice(c echo.Context) error {
	userID := c.Get("user_id").(uuid.UUID)

	advice, err := h.service.GetFinancialAdvice(c.Request().Context(), userID)
	if err != nil {
		return response.InternalError(c, "Failed to generate financial advice", err)
	}

	return response.JSON(c, http.StatusOK, "", map[string]interface{}{
		"advice": advice,
	})
}
