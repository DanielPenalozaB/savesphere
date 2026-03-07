package middleware

import (
	"context"
	"net/http"
	"strings"

	"savesphere-api/internal/common/response"
	"savesphere-api/internal/services"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func AuthMiddleware(jwtService services.JWTService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return response.Error(c, http.StatusUnauthorized, "Missing authorization header", nil)
			}

			headerParts := strings.Split(authHeader, " ")
			if len(headerParts) != 2 || headerParts[0] != "Bearer" {
				return response.Error(c, http.StatusUnauthorized, "Invalid authorization header format", nil)
			}

			tokenString := headerParts[1]
			token, err := jwtService.ValidateToken(tokenString)

			if err != nil || !token.Valid {
				return response.Error(c, http.StatusUnauthorized, "Invalid or expired token", nil)
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				return response.Error(c, http.StatusUnauthorized, "Invalid token claims", nil)
			}

			userIDStr, ok := claims["user_id"].(string)
			if !ok {
				return response.Error(c, http.StatusUnauthorized, "User ID not found in token", nil)
			}

			userID, err := uuid.Parse(userIDStr)
			if err != nil {
				return response.Error(c, http.StatusUnauthorized, "Invalid User ID in token", nil)
			}

			// Store UserID in context
			ctx := context.WithValue(c.Request().Context(), UserIDKey, userID)
			c.SetRequest(c.Request().WithContext(ctx))
			
			// Also set in Echo context for convenience
			c.Set("user_id", userID)

			return next(c)
		}
	}
}

// GetUserID retrieves the UserID from the Echo context
func GetUserID(c echo.Context) (uuid.UUID, bool) {
	userID, ok := c.Get("user_id").(uuid.UUID)
	return userID, ok
}
