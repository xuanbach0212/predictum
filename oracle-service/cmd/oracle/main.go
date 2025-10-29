package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "3001"
	}

	router := mux.NewRouter()

	// Health check
	router.HandleFunc("/health", healthHandler).Methods("GET")
	router.HandleFunc("/status", statusHandler).Methods("GET")

	// Market resolution endpoints
	router.HandleFunc("/markets/pending", getPendingMarketsHandler).Methods("GET")
	router.HandleFunc("/markets/{id}/resolve", resolveMarketHandler).Methods("POST")

	log.Printf("Oracle service starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal(err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"healthy","service":"oracle"}`)
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"running","markets_resolved":0,"pending_markets":0}`)
}

func getPendingMarketsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"markets":[]}`)
}

func resolveMarketHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketID := vars["id"]

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"market_id":"%s","status":"resolved"}`, marketID)
}
