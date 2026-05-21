package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"savesphere-api/internal/database"
	"savesphere-api/internal/docs"
	"savesphere-api/internal/handlers"
	customMiddleware "savesphere-api/internal/middleware"
	"savesphere-api/internal/repository"
	"savesphere-api/internal/services"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"os"
	"strings"
)

func main() {
	ctx := context.Background()

	// Database initialization
	pool, err := database.GetPool(ctx)
	if err != nil {
		log.Fatalf("Could not initialize database: %v", err)
	}
	defer database.Close()

	// Services and Repositories initialization
	jwtService := services.NewJWTService()

	// Users
	userRepo := repository.NewUserRepository(pool)
	userService := services.NewUserService(userRepo, jwtService)

	// Password Reset
	resetRepo := repository.NewPasswordResetRepository(pool)
	emailService := services.NewEmailService()
	passwordResetService := services.NewPasswordResetService(userRepo, resetRepo, emailService)

	// Sessions
	sessionRepo := repository.NewSessionRepository(pool)
	sessionService := services.NewSessionService(userRepo, sessionRepo, jwtService)

	// Email Verification
	verificationRepo := repository.NewEmailVerificationRepository(pool)
	emailVerificationService := services.NewEmailVerificationService(verificationRepo, userRepo, emailService)

	// Audit
	auditRepo := repository.NewLoginAuditRepository(pool)
	auditService := services.NewAuditService(auditRepo)

	authHandler := handlers.NewAuthHandler(userService, jwtService, passwordResetService, emailVerificationService, sessionService, auditService)

	// OAuth
	oauthService := services.NewOAuthService(userRepo)
	oauthHandler := handlers.NewOAuthHandler(oauthService, jwtService, sessionService, auditService)

	// Wallets
	walletRepo := repository.NewWalletRepository(pool)
	walletService := services.NewWalletService(walletRepo)
	walletHandler := handlers.NewWalletHandler(walletService)

	// Transactions
	txRepo := repository.NewTransactionRepository(pool)
	txService := services.NewTransactionService(txRepo)
	txHandler := handlers.NewTransactionHandler(txService)

	// Financial Intelligence
	intelService := services.NewFinancialIntelligenceService(walletRepo, txRepo)
	intelHandler := handlers.NewIntelligenceHandler(intelService)

	e := echo.New()

	// Default CORS and Logger middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	// Configurable CORS origins
	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if corsOrigins == "" {
		corsOrigins = "http://localhost:5173"
	}
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     strings.Split(corsOrigins, ","),
		AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	// Public Health check
	e.GET("/api/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
			"app":    "savesphere-api",
		})
	})

	// Auth routes with rate limiting
	auth := e.Group("/api/auth")
	auth.Use(middleware.RateLimiterWithConfig(middleware.RateLimiterConfig{
		Skipper: middleware.DefaultSkipper,
		Store: middleware.NewRateLimiterMemoryStoreWithConfig(
			middleware.RateLimiterMemoryStoreConfig{Rate: 10, Burst: 15, ExpiresIn: 1 * time.Minute},
		),
		IdentifierExtractor: func(ctx echo.Context) (string, error) {
			id := ctx.RealIP()
			return id, nil
		},
		ErrorHandler: func(context echo.Context, err error) error {
			return context.JSON(http.StatusTooManyRequests, map[string]string{
				"message": "Too many requests. Please try again later.",
			})
		},
		DenyHandler: func(context echo.Context, identifier string, err error) error {
			return context.JSON(http.StatusTooManyRequests, map[string]string{
				"message": "Too many requests. Please try again later.",
			})
		},
	}))
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)
	auth.POST("/forgot-password", authHandler.ForgotPassword)
	auth.POST("/reset-password", authHandler.ResetPassword)
	auth.GET("/verify-email", authHandler.VerifyEmail)
	auth.POST("/refresh", authHandler.Refresh)
	auth.POST("/logout", authHandler.Logout)
	auth.GET("/me", authHandler.Me)
	auth.POST("/google", oauthHandler.BeginGoogleAuth)
	auth.POST("/google/callback", oauthHandler.GoogleCallback)

	// API routes (Protected)
	api := e.Group("/api")
	api.Use(customMiddleware.AuthMiddleware(jwtService))
	
	// Wallet routes
	api.POST("/wallets", walletHandler.Create)
	api.GET("/wallets", walletHandler.List)
	api.GET("/wallets/liquidity", walletHandler.GetLiquidity)

	// Transaction routes
	api.POST("/transactions", txHandler.Create)
	api.GET("/wallets/:walletId/transactions", txHandler.List)
	api.DELETE("/transactions/:id", txHandler.Delete)

	// Financial Intelligence routes
	api.GET("/intelligence/safe-to-spend", intelHandler.GetSafeToSpend)
	api.GET("/intelligence/advice", intelHandler.GetAdvice)

	api.GET("/hello", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "Hello from Go!",
		})
	})

	// API Documentation (Scalar)
	docs.RegisterRoutes(e)



	log.Fatal(e.Start(":3000"))
}
