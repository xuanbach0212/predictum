package storage

import (
	"sync"
	"time"

	"github.com/linera-prediction-market/backend/internal/models"
)

const InitialShareMultiplier = 1000.0

type Storage struct {
	mu            sync.RWMutex
	Markets       map[int]*models.Market
	Positions     []*models.UserPosition
	UserBalance   float64
	NextMarketID  int
}

func New() *Storage {
	no := models.OutcomeNo

	return &Storage{
		Markets: map[int]*models.Market{
			1: {
				ID:             1,
				Question:       "Will Manchester United beat Arsenal in the Premier League match?",
				Category:       "Sports",
				Status:         models.StatusActive,
				EndTime:        time.Date(2025, 11, 15, 20, 0, 0, 0, time.UTC),
				YesPool:        1250,
				NoPool:         850,
				TotalYesShares: 1250000,
				TotalNoShares:  850000,
				CreatedAt:      time.Date(2025, 10, 20, 10, 0, 0, 0, time.UTC),
			},
			2: {
				ID:             2,
				Question:       "Will Bitcoin reach $100,000 by December 31, 2025?",
				Category:       "Crypto",
				Status:         models.StatusActive,
				EndTime:        time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC),
				YesPool:        3400,
				NoPool:         2100,
				TotalYesShares: 3400000,
				TotalNoShares:  2100000,
				CreatedAt:      time.Date(2025, 10, 15, 8, 0, 0, 0, time.UTC),
			},
			3: {
				ID:             3,
				Question:       "Will Lakers win the NBA Championship 2025?",
				Category:       "Sports",
				Status:         models.StatusActive,
				EndTime:        time.Date(2025, 6, 30, 23, 59, 59, 0, time.UTC),
				YesPool:        890,
				NoPool:         1560,
				TotalYesShares: 890000,
				TotalNoShares:  1560000,
				CreatedAt:      time.Date(2025, 10, 18, 14, 0, 0, 0, time.UTC),
			},
			4: {
				ID:             4,
				Question:       "Will Ethereum price be above $5,000 by end of November?",
				Category:       "Crypto",
				Status:         models.StatusActive,
				EndTime:        time.Date(2025, 11, 30, 23, 59, 59, 0, time.UTC),
				YesPool:        2200,
				NoPool:         1800,
				TotalYesShares: 2200000,
				TotalNoShares:  1800000,
				CreatedAt:      time.Date(2025, 10, 22, 9, 0, 0, 0, time.UTC),
			},
			5: {
				ID:             5,
				Question:       "Will Real Madrid advance to Champions League Final?",
				Category:       "Sports",
				Status:         models.StatusLocked,
				EndTime:        time.Date(2025, 10, 28, 20, 0, 0, 0, time.UTC),
				YesPool:        1800,
				NoPool:         900,
				TotalYesShares: 1800000,
				TotalNoShares:  900000,
				CreatedAt:      time.Date(2025, 10, 10, 11, 0, 0, 0, time.UTC),
			},
			6: {
				ID:              6,
				Question:        "Will Solana reach $200 by end of October?",
				Category:        "Crypto",
				Status:          models.StatusResolved,
				EndTime:         time.Date(2025, 10, 31, 23, 59, 59, 0, time.UTC),
				YesPool:         1500,
				NoPool:          2500,
				TotalYesShares:  1500000,
				TotalNoShares:   2500000,
				WinningOutcome:  &no,
				CreatedAt:       time.Date(2025, 10, 1, 10, 0, 0, 0, time.UTC),
			},
		},
		Positions: []*models.UserPosition{
			{MarketID: 1, YesShares: 50000, YesAmount: 50, Claimed: false},
			{MarketID: 2, YesShares: 100000, YesAmount: 100, Claimed: false},
			{MarketID: 6, NoShares: 80000, NoAmount: 80, Claimed: false},
		},
		UserBalance:  1000,
		NextMarketID: 7,
	}
}

func (s *Storage) GetMarkets() []*models.Market {
	s.mu.RLock()
	defer s.mu.RUnlock()

	markets := make([]*models.Market, 0, len(s.Markets))
	for _, m := range s.Markets {
		markets = append(markets, m)
	}
	return markets
}

func (s *Storage) GetMarket(id int) (*models.Market, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	market, ok := s.Markets[id]
	return market, ok
}

func (s *Storage) GetPositions() []*models.UserPosition {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.Positions
}

func (s *Storage) GetPosition(marketID int) *models.UserPosition {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, p := range s.Positions {
		if p.MarketID == marketID {
			return p
		}
	}
	return nil
}

func (s *Storage) GetBalance() float64 {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.UserBalance
}

func (s *Storage) UpdateBalance(amount float64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.UserBalance += amount
}

func CalculateShares(currentPool, totalShares, betAmount float64) float64 {
	if totalShares == 0 {
		return betAmount * InitialShareMultiplier
	}
	return (betAmount * totalShares) / currentPool
}

