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

type TransactionHandler struct {
	service   services.TransactionService
	validator *validator.Validate
}

func NewTransactionHandler(service services.TransactionService) *TransactionHandler {
	return &TransactionHandler{
		service:   service,
		validator: validator.New(),
	}
}

func (h *TransactionHandler) Create(c echo.Context) error {
	var req models.TransactionCreateRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "Invalid request payload", err)
	}

	if err := h.validator.Struct(req); err != nil {
		return response.BadRequest(c, "Validation failed", err)
	}

	tx, err := h.service.Create(c.Request().Context(), req)
	if err != nil {
		return response.InternalError(c, "Failed to create transaction", err)
	}

	return response.JSON(c, http.StatusCreated, "Transaction created successfully", tx)
}

func (h *TransactionHandler) List(c echo.Context) error {
	walletIDStr := c.Param("walletId")
	walletID, err := uuid.Parse(walletIDStr)
	if err != nil {
		return response.BadRequest(c, "Invalid wallet ID", err)
	}

	var isFixed *bool
	fixedStr := c.QueryParam("is_fixed")
	if fixedStr == "true" {
		val := true
		isFixed = &val
	} else if fixedStr == "false" {
		val := false
		isFixed = &val
	}

	txs, err := h.service.ListByWalletID(c.Request().Context(), walletID, isFixed)
	if err != nil {
		return response.InternalError(c, "Failed to fetch transactions", err)
	}

	return response.JSON(c, http.StatusOK, "", txs)
}

func (h *TransactionHandler) Delete(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return response.BadRequest(c, "Invalid transaction ID", err)
	}

	if err := h.service.Delete(c.Request().Context(), id); err != nil {
		return response.InternalError(c, "Failed to delete transaction", err)
	}

	return response.JSON(c, http.StatusOK, "Transaction deleted successfully", nil)
}
