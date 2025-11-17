package handlers

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/linera-prediction-market/backend/internal/models"
	"github.com/linera-prediction-market/backend/internal/storage"
)

// StorageInterface defines the methods required for storage operations
type StorageInterface interface {
	GetMarkets() ([]*models.Market, error)
	GetMarket(id int) (*models.Market, error)
	SaveMarket(market *models.Market) error
	UpdateMarket(market *models.Market) error
	GetPositions() ([]*models.UserPosition, error)
	GetPosition(marketID int) (*models.UserPosition, error)
	SavePosition(position *models.UserPosition) error
	GetBalance() (float64, error)
	UpdateBalance(amount float64) error
}

// LineraClient defines the interface for Linera contract operations
type LineraClient interface {
	IsEnabled() bool
	PlaceBet(marketID int, outcome string, amount int) error
	ResolveMarket(marketID int, outcome string) error
	CreateMarket(question string, category string, endTime time.Time) error
}

type Handler struct {
	storage      StorageInterface
	lineraClient LineraClient
}

func New(s StorageInterface, l LineraClient) *Handler {
	return &Handler{
		storage:      s,
		lineraClient: l,
	}
}

func (h *Handler) GetMarkets(w http.ResponseWriter, r *http.Request) {
	// Get pagination parameters
	page := 1
	limit := 20 // Default 20 markets per page
	
	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	
	markets, err := h.storage.GetMarkets()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch markets")
		return
	}
	
	// Update market statuses based on end time
	now := time.Now()
	for _, market := range markets {
		if market.Status == models.StatusActive && market.EndTime.Before(now) {
			market.Status = models.StatusLocked
			// Update in storage
			h.storage.UpdateMarket(market)
		}
	}
	
	// Filter by status if provided
	statusFilter := r.URL.Query().Get("status")
	if statusFilter != "" {
		var filteredMarkets []*models.Market
		for _, market := range markets {
			if string(market.Status) == statusFilter {
				filteredMarkets = append(filteredMarkets, market)
			}
		}
		markets = filteredMarkets
	}
	
	// Filter by category if provided
	categoryFilter := r.URL.Query().Get("category")
	if categoryFilter != "" {
		var filteredMarkets []*models.Market
		for _, market := range markets {
			if string(market.Category) == categoryFilter {
				filteredMarkets = append(filteredMarkets, market)
			}
		}
		markets = filteredMarkets
	}
	
	// Sort markets
	sortBy := r.URL.Query().Get("sortBy")
	if sortBy == "" {
		sortBy = "ending-soon" // Default sort
	}
	
	switch sortBy {
	case "newest":
		// Sort by created_at DESC
		for i := 0; i < len(markets)-1; i++ {
			for j := i + 1; j < len(markets); j++ {
				if markets[i].CreatedAt.Before(markets[j].CreatedAt) {
					markets[i], markets[j] = markets[j], markets[i]
				}
			}
		}
	case "ending-soon":
		// Sort by end_time ASC
		for i := 0; i < len(markets)-1; i++ {
			for j := i + 1; j < len(markets); j++ {
				if markets[i].EndTime.After(markets[j].EndTime) {
					markets[i], markets[j] = markets[j], markets[i]
				}
			}
		}
	case "popular":
		// Sort by total volume DESC
		for i := 0; i < len(markets)-1; i++ {
			for j := i + 1; j < len(markets); j++ {
				volumeI := markets[i].YesPool + markets[i].NoPool
				volumeJ := markets[j].YesPool + markets[j].NoPool
				if volumeI < volumeJ {
					markets[i], markets[j] = markets[j], markets[i]
				}
			}
		}
	case "alphabetical":
		// Sort by question ASC
		for i := 0; i < len(markets)-1; i++ {
			for j := i + 1; j < len(markets); j++ {
				if markets[i].Question > markets[j].Question {
					markets[i], markets[j] = markets[j], markets[i]
				}
			}
		}
	}
	
	// Calculate pagination
	total := len(markets)
	start := (page - 1) * limit
	end := start + limit
	
	if start >= total {
		respondJSON(w, http.StatusOK, map[string]interface{}{
			"markets": []models.Market{},
			"pagination": map[string]interface{}{
				"page":       page,
				"limit":      limit,
				"total":      total,
				"totalPages": (total + limit - 1) / limit,
			},
		})
		return
	}
	
	if end > total {
		end = total
	}
	
	paginatedMarkets := markets[start:end]
	
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"markets": paginatedMarkets,
		"pagination": map[string]interface{}{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + limit - 1) / limit,
		},
	})
}

func (h *Handler) GetMarket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid market ID")
		return
	}

	market, err := h.storage.GetMarket(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch market")
		return
	}
	if market == nil {
		respondError(w, http.StatusNotFound, "Market not found")
		return
	}

	respondJSON(w, http.StatusOK, market)
}

func (h *Handler) GetPositions(w http.ResponseWriter, r *http.Request) {
	positions, err := h.storage.GetPositions()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch positions")
		return
	}
	respondJSON(w, http.StatusOK, positions)
}

func (h *Handler) GetBalance(w http.ResponseWriter, r *http.Request) {
	balance, err := h.storage.GetBalance()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch balance")
		return
	}
	respondJSON(w, http.StatusOK, map[string]float64{"balance": balance})
}

func (h *Handler) PlaceBet(w http.ResponseWriter, r *http.Request) {
	var req models.BetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	market, err := h.storage.GetMarket(req.MarketID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch market")
		return
	}
	if market == nil {
		respondError(w, http.StatusNotFound, "Market not found")
		return
	}

	if market.Status != models.StatusActive {
		respondError(w, http.StatusBadRequest, "Market is not active")
		return
	}

	balance, err := h.storage.GetBalance()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch balance")
		return
	}
	if req.Amount > balance {
		respondError(w, http.StatusBadRequest, "Insufficient balance")
		return
	}

	// Update market pools and shares
	if req.Outcome == models.OutcomeYes {
		shares := storage.CalculateShares(market.YesPool, market.TotalYesShares, req.Amount)
		market.YesPool += req.Amount
		market.TotalYesShares += shares

		// Update or create position
		position, err := h.storage.GetPosition(req.MarketID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to fetch position")
			return
		}
		if position == nil {
			position = &models.UserPosition{
				MarketID: req.MarketID,
			}
		}
		position.YesShares += shares
		position.YesAmount += req.Amount
		
		if err := h.storage.SavePosition(position); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to save position")
			return
		}
	} else {
		shares := storage.CalculateShares(market.NoPool, market.TotalNoShares, req.Amount)
		market.NoPool += req.Amount
		market.TotalNoShares += shares

		position, err := h.storage.GetPosition(req.MarketID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to fetch position")
			return
		}
		if position == nil {
			position = &models.UserPosition{
				MarketID: req.MarketID,
			}
		}
		position.NoShares += shares
		position.NoAmount += req.Amount
		
		if err := h.storage.SavePosition(position); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to save position")
			return
		}
	}

	if err := h.storage.UpdateMarket(market); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update market")
		return
	}

	if err := h.storage.UpdateBalance(-req.Amount); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update balance")
		return
	}

	// Sync to Linera contract (async, best-effort)
	if h.lineraClient.IsEnabled() {
		go func() {
			outcomeStr := string(req.Outcome)
			if err := h.lineraClient.PlaceBet(req.MarketID, outcomeStr, int(req.Amount)); err != nil {
				log.Printf("⚠️  Failed to sync bet to Linera: %v", err)
			} else {
				log.Printf("✅ Synced bet to Linera: market #%d, %s, %.0f tokens", req.MarketID, outcomeStr, req.Amount)
			}
		}()
	}

	balance, _ = h.storage.GetBalance()
	respondJSON(w, http.StatusOK, models.BetResponse{
		Success: true,
		Market:  market,
		Balance: balance,
	})
}

func (h *Handler) ResolveMarket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid market ID")
		return
	}

	var req models.ResolveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	market, err := h.storage.GetMarket(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch market")
		return
	}
	if market == nil {
		respondError(w, http.StatusNotFound, "Market not found")
		return
	}

	market.Status = models.StatusResolved
	market.WinningOutcome = &req.Outcome

	if err := h.storage.UpdateMarket(market); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update market")
		return
	}

	// Sync to Linera contract (async, best-effort)
	if h.lineraClient.IsEnabled() {
		go func() {
			outcomeStr := string(req.Outcome)
			if err := h.lineraClient.ResolveMarket(id, outcomeStr); err != nil {
				log.Printf("⚠️  Failed to sync market resolution to Linera: %v", err)
			} else {
				log.Printf("✅ Synced market resolution to Linera: market #%d → %s", id, outcomeStr)
			}
		}()
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"market":  market,
	})
}

func (h *Handler) ClaimWinnings(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	marketID, err := strconv.Atoi(vars["marketId"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid market ID")
		return
	}

	market, err := h.storage.GetMarket(marketID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch market")
		return
	}
	if market == nil {
		respondError(w, http.StatusNotFound, "Market not found")
		return
	}

	position, err := h.storage.GetPosition(marketID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch position")
		return
	}
	if position == nil {
		respondError(w, http.StatusNotFound, "Position not found")
		return
	}

	if market.Status != models.StatusResolved {
		respondError(w, http.StatusBadRequest, "Market not resolved yet")
		return
	}

	if position.Claimed {
		respondError(w, http.StatusBadRequest, "Already claimed")
		return
	}

	// Calculate payout
	totalPool := market.YesPool + market.NoPool
	var payout float64

	if *market.WinningOutcome == models.OutcomeYes && position.YesShares > 0 {
		payout = math.Floor((totalPool * position.YesShares) / market.TotalYesShares)
	} else if *market.WinningOutcome == models.OutcomeNo && position.NoShares > 0 {
		payout = math.Floor((totalPool * position.NoShares) / market.TotalNoShares)
	}

	if payout == 0 {
		respondError(w, http.StatusBadRequest, "No winnings to claim")
		return
	}

	position.Claimed = true
	if err := h.storage.SavePosition(position); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to save position")
		return
	}

	if err := h.storage.UpdateBalance(payout); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update balance")
		return
	}

	balance, _ := h.storage.GetBalance()
	respondJSON(w, http.StatusOK, models.ClaimResponse{
		Success: true,
		Payout:  payout,
		Balance: balance,
	})
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, models.ErrorResponse{Error: message})
}

func (h *Handler) CreateMarket(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Question string `json:"question"`
		Category string `json:"category"`
		EndTime  string `json:"endTime"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid end time format")
		return
	}

	market := &models.Market{
		Question:       req.Question,
		Category:       req.Category,
		Status:         models.StatusActive,
		EndTime:        endTime,
		YesPool:        0,
		NoPool:         0,
		TotalYesShares: 0,
		TotalNoShares:  0,
		CreatedAt:      time.Now(),
	}

	if err := h.storage.SaveMarket(market); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create market")
		return
	}

	// Sync to Linera contract (async, best-effort)
	if h.lineraClient.IsEnabled() {
		go func() {
			if err := h.lineraClient.CreateMarket(market.Question, market.Category, market.EndTime); err != nil {
				log.Printf("⚠️  Failed to sync market creation to Linera: %v", err)
			} else {
				log.Printf("✅ Synced market creation to Linera: %s", market.Question)
			}
		}()
	}

	respondJSON(w, http.StatusCreated, market)
}

