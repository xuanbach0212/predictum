package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/linera-prediction-market/backend/internal/handlers"
	"github.com/linera-prediction-market/backend/internal/storage"
	"github.com/rs/cors"
)

func main() {
	// Initialize storage
	store := storage.New()

	// Initialize handlers
	h := handlers.New(store)

	// Setup router
	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/markets", h.GetMarkets).Methods("GET")
	api.HandleFunc("/markets/{id}", h.GetMarket).Methods("GET")
	api.HandleFunc("/markets/{id}/resolve", h.ResolveMarket).Methods("POST")
	api.HandleFunc("/positions", h.GetPositions).Methods("GET")
	api.HandleFunc("/balance", h.GetBalance).Methods("GET")
	api.HandleFunc("/bet", h.PlaceBet).Methods("POST")
	api.HandleFunc("/claim/{marketId}", h.ClaimWinnings).Methods("POST")

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	// Start server
	port := ":3001"
	log.Printf("🚀 Backend API running on http://localhost%s", port)
	log.Printf("📊 Markets: %d", len(store.Markets))
	log.Printf("💰 User balance: %.0f tokens", store.UserBalance)

	if err := http.ListenAndServe(port, handler); err != nil {
		log.Fatal(err)
	}
}

