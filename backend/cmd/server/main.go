package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/linera-prediction-market/backend/internal/db"
	"github.com/linera-prediction-market/backend/internal/handlers"
	"github.com/linera-prediction-market/backend/internal/linera"
	"github.com/linera-prediction-market/backend/internal/oracle"
	"github.com/linera-prediction-market/backend/internal/storage"
	"github.com/rs/cors"
)

func main() {
	// Get database URL from environment or use default
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://root:root@localhost:5432/predictum?sslmode=disable"
	}

	// Connect to PostgreSQL
	database, err := db.Connect(databaseURL)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Initialize PostgreSQL storage
	store := storage.NewPostgresStorage(database)

	// Initialize default markets if database is empty
	if err := store.InitializeDefaultMarkets(); err != nil {
		log.Fatalf("❌ Failed to initialize default markets: %v", err)
	}

	// Initialize Linera client
	lineraEndpoint := os.Getenv("LINERA_ENDPOINT")
	if lineraEndpoint == "" {
		lineraEndpoint = "http://localhost:8080"
	}
	lineraEnabled := os.Getenv("LINERA_ENABLED") == "true"
	
	lineraClient := linera.NewClient(lineraEndpoint, lineraEnabled)
	if lineraEnabled {
		log.Printf("🔗 Linera integration enabled: %s", lineraEndpoint)
		if err := lineraClient.HealthCheck(); err != nil {
			log.Printf("⚠️  Linera health check failed: %v (continuing anyway)", err)
		} else {
			log.Println("✅ Linera service is healthy")
		}
	} else {
		log.Println("ℹ️  Linera integration disabled (set LINERA_ENABLED=true to enable)")
	}

	// Initialize handlers
	h := handlers.New(store, lineraClient)

	// Initialize and start oracle
	oracleService := oracle.NewOracleWithStorage(store)
	oracleService.Start()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigChan
		log.Println("\n🛑 Shutting down gracefully...")
		oracleService.Stop()
		database.Close()
		os.Exit(0)
	}()

	// Setup router
	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/markets", h.GetMarkets).Methods("GET")
	api.HandleFunc("/markets", h.CreateMarket).Methods("POST")
	api.HandleFunc("/markets/{id}", h.GetMarket).Methods("GET")
	api.HandleFunc("/markets/{id}/resolve", h.ResolveMarket).Methods("POST")
	api.HandleFunc("/positions", h.GetPositions).Methods("GET")
	api.HandleFunc("/balance", h.GetBalance).Methods("GET")
	api.HandleFunc("/bet", h.PlaceBet).Methods("POST")
	api.HandleFunc("/claim/{marketId}", h.ClaimWinnings).Methods("POST")

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:5174"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	// Start server
	port := ":3001"
	log.Printf("🚀 Backend API running on http://localhost%s", port)

	// Get initial stats
	markets, _ := store.GetMarkets()
	balance, _ := store.GetBalance()
	log.Printf("📊 Markets: %d", len(markets))
	log.Printf("💰 User balance: %.0f tokens", balance)

	if err := http.ListenAndServe(port, handler); err != nil {
		log.Fatal(err)
	}
}

