package main

import (
	"context"
	"log"
	"net/http"

	"savesphere-api/internal/database"
	"savesphere-api/internal/handlers"
	customMiddleware "savesphere-api/internal/middleware"
	"savesphere-api/internal/repository"
	"savesphere-api/internal/services"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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
	authHandler := handlers.NewAuthHandler(userService, jwtService)

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
	e.Use(middleware.CORS())

	// Public Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
			"app":    "savesphere-api",
		})
	})

	// Auth routes
	auth := e.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)

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

	log.Fatal(e.Start(":3000"))
}
