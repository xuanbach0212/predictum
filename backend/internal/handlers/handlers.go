package handlers

import (
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/linera-prediction-market/backend/internal/models"
	"github.com/linera-prediction-market/backend/internal/storage"
)

type Handler struct {
	storage *storage.Storage
}

func New(s *storage.Storage) *Handler {
	return &Handler{storage: s}
}

func (h *Handler) GetMarkets(w http.ResponseWriter, r *http.Request) {
	markets := h.storage.GetMarkets()
	respondJSON(w, http.StatusOK, markets)
}

func (h *Handler) GetMarket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid market ID")
		return
	}

	market, ok := h.storage.GetMarket(id)
	if !ok {
		respondError(w, http.StatusNotFound, "Market not found")
		return
	}

	respondJSON(w, http.StatusOK, market)
}

func (h *Handler) GetPositions(w http.ResponseWriter, r *http.Request) {
	positions := h.storage.GetPositions()
	respondJSON(w, http.StatusOK, positions)
}

func (h *Handler) GetBalance(w http.ResponseWriter, r *http.Request) {
	balance := h.storage.GetBalance()
	respondJSON(w, http.StatusOK, map[string]float64{"balance": balance})
}

func (h *Handler) PlaceBet(w http.ResponseWriter, r *http.Request) {
	var req models.BetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	market, ok := h.storage.GetMarket(req.MarketID)
	if !ok {
		respondError(w, http.StatusNotFound, "Market not found")
		return
	}

	if market.Status != models.StatusActive {
		respondError(w, http.StatusBadRequest, "Market is not active")
		return
	}

	balance := h.storage.GetBalance()
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
		position := h.storage.GetPosition(req.MarketID)
		if position == nil {
			position = &models.UserPosition{
				MarketID: req.MarketID,
			}
			h.storage.Positions = append(h.storage.Positions, position)
		}
		position.YesShares += shares
		position.YesAmount += req.Amount
	} else {
		shares := storage.CalculateShares(market.NoPool, market.TotalNoShares, req.Amount)
		market.NoPool += req.Amount
		market.TotalNoShares += shares

		position := h.storage.GetPosition(req.MarketID)
		if position == nil {
			position = &models.UserPosition{
				MarketID: req.MarketID,
			}
			h.storage.Positions = append(h.storage.Positions, position)
		}
		position.NoShares += shares
		position.NoAmount += req.Amount
	}

	h.storage.UpdateBalance(-req.Amount)

	respondJSON(w, http.StatusOK, models.BetResponse{
		Success: true,
		Market:  market,
		Balance: h.storage.GetBalance(),
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

	market, ok := h.storage.GetMarket(id)
	if !ok {
		respondError(w, http.StatusNotFound, "Market not found")
		return
	}

	market.Status = models.StatusResolved
	market.WinningOutcome = &req.Outcome

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

	market, ok := h.storage.GetMarket(marketID)
	if !ok {
		respondError(w, http.StatusNotFound, "Market not found")
		return
	}

	position := h.storage.GetPosition(marketID)
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
	h.storage.UpdateBalance(payout)

	respondJSON(w, http.StatusOK, models.ClaimResponse{
		Success: true,
		Payout:  payout,
		Balance: h.storage.GetBalance(),
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

