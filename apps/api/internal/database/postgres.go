package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	pool *pgxpool.Pool
	once sync.Once
)

// GetPool returns a singleton instance of the pgxpool.Pool
func GetPool(ctx context.Context) (*pgxpool.Pool, error) {
	var err error
	once.Do(func() {
		dsn := os.Getenv("DATABASE_URL")
		if dsn == "" {
			// Fallback for local development if .env is not loaded yet
			dsn = "postgres://postgres:postgres@localhost:5432/savesphere?sslmode=disable"
		}

		config, parseErr := pgxpool.ParseConfig(dsn)
		if parseErr != nil {
			err = fmt.Errorf("unable to parse DATABASE_URL: %v", parseErr)
			return
		}

		// Configure pool settings
		config.MaxConns = 25
		config.MinConns = 5
		config.MaxConnLifetime = 1 * time.Hour
		config.MaxConnIdleTime = 30 * time.Minute

		pool, err = pgxpool.NewWithConfig(ctx, config)
		if err != nil {
			err = fmt.Errorf("unable to create connection pool: %v", err)
			return
		}

		// Test connection
		if pingErr := pool.Ping(ctx); pingErr != nil {
			err = fmt.Errorf("unable to ping database: %v", pingErr)
			return
		}

		log.Println("Connected to PostgreSQL successfully")
	})

	return pool, err
}

// Close closes the database connection pool
func Close() {
	if pool != nil {
		pool.Close()
	}
}
