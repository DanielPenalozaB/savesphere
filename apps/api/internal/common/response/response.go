package response

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// Response is the standard JSON response wrapper
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

// JSON sends a success response
func JSON(c echo.Context, status int, message string, data interface{}) error {
	return c.JSON(status, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Error sends an error response
func Error(c echo.Context, status int, message string, err interface{}) error {
	return c.JSON(status, Response{
		Success: false,
		Message: message,
		Error:   err,
	})
}

// InternalError sends a 500 error response
func InternalError(c echo.Context, message string, err error) error {
	if message == "" {
		message = "An unexpected error occurred"
	}
	return Error(c, http.StatusInternalServerError, message, err.Error())
}

// BadRequest sends a 400 error response
func BadRequest(c echo.Context, message string, err error) error {
	errMsg := ""
	if err != nil {
		errMsg = err.Error()
	}
	return Error(c, http.StatusBadRequest, message, errMsg)
}
