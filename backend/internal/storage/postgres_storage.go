package storage

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/linera-prediction-market/backend/internal/db"
	"github.com/linera-prediction-market/backend/internal/models"
)

// PostgresStorage implements storage using PostgreSQL
type PostgresStorage struct {
	db *db.DB
}

// NewPostgresStorage creates a new PostgreSQL storage instance
func NewPostgresStorage(database *db.DB) *PostgresStorage {
	return &PostgresStorage{db: database}
}

// GetMarkets retrieves all markets from the database
func (s *PostgresStorage) GetMarkets() ([]*models.Market, error) {
	query := `
		SELECT id, question, category, status, end_time, yes_pool, no_pool,
		       total_yes_shares, total_no_shares, winning_outcome, created_at
		FROM markets
		ORDER BY end_time ASC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query markets: %w", err)
	}
	defer rows.Close()

	var markets []*models.Market
	for rows.Next() {
		market := &models.Market{}
		var winningOutcome sql.NullString

		err := rows.Scan(
			&market.ID,
			&market.Question,
			&market.Category,
			&market.Status,
			&market.EndTime,
			&market.YesPool,
			&market.NoPool,
			&market.TotalYesShares,
			&market.TotalNoShares,
			&winningOutcome,
			&market.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan market: %w", err)
		}

		if winningOutcome.Valid {
			outcome := models.Outcome(winningOutcome.String)
			market.WinningOutcome = &outcome
		}

		markets = append(markets, market)
	}

	return markets, nil
}

// GetMarket retrieves a single market by ID
func (s *PostgresStorage) GetMarket(id int) (*models.Market, error) {
	query := `
		SELECT id, question, category, status, end_time, yes_pool, no_pool,
		       total_yes_shares, total_no_shares, winning_outcome, created_at
		FROM markets
		WHERE id = $1
	`

	market := &models.Market{}
	var winningOutcome sql.NullString

	err := s.db.QueryRow(query, id).Scan(
		&market.ID,
		&market.Question,
		&market.Category,
		&market.Status,
		&market.EndTime,
		&market.YesPool,
		&market.NoPool,
		&market.TotalYesShares,
		&market.TotalNoShares,
		&winningOutcome,
		&market.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get market: %w", err)
	}

	if winningOutcome.Valid {
		outcome := models.Outcome(winningOutcome.String)
		market.WinningOutcome = &outcome
	}

	return market, nil
}

// SaveMarket inserts or updates a market
func (s *PostgresStorage) SaveMarket(market *models.Market) error {
	query := `
		INSERT INTO markets (question, category, status, end_time, yes_pool, no_pool,
		                     total_yes_shares, total_no_shares, winning_outcome, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
	`

	var winningOutcome *string
	if market.WinningOutcome != nil {
		s := string(*market.WinningOutcome)
		winningOutcome = &s
	}

	err := s.db.QueryRow(
		query,
		market.Question,
		market.Category,
		market.Status,
		market.EndTime,
		market.YesPool,
		market.NoPool,
		market.TotalYesShares,
		market.TotalNoShares,
		winningOutcome,
		market.CreatedAt,
	).Scan(&market.ID)

	if err != nil {
		return fmt.Errorf("failed to save market: %w", err)
	}

	log.Printf("💾 Saved market #%d to database: %s", market.ID, market.Question)
	return nil
}

// UpdateMarket updates an existing market
func (s *PostgresStorage) UpdateMarket(market *models.Market) error {
	query := `
		UPDATE markets
		SET question = $1, category = $2, status = $3, end_time = $4,
		    yes_pool = $5, no_pool = $6, total_yes_shares = $7, total_no_shares = $8,
		    winning_outcome = $9
		WHERE id = $10
	`

	var winningOutcome *string
	if market.WinningOutcome != nil {
		s := string(*market.WinningOutcome)
		winningOutcome = &s
	}

	_, err := s.db.Exec(
		query,
		market.Question,
		market.Category,
		market.Status,
		market.EndTime,
		market.YesPool,
		market.NoPool,
		market.TotalYesShares,
		market.TotalNoShares,
		winningOutcome,
		market.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update market: %w", err)
	}

	return nil
}

// GetPositions retrieves all user positions
func (s *PostgresStorage) GetPositions() ([]*models.UserPosition, error) {
	query := `
		SELECT id, market_id, yes_shares, no_shares, yes_amount, no_amount, claimed
		FROM user_positions
		ORDER BY created_at DESC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query positions: %w", err)
	}
	defer rows.Close()

	var positions []*models.UserPosition
	for rows.Next() {
		position := &models.UserPosition{}
		var id int

		err := rows.Scan(
			&id,
			&position.MarketID,
			&position.YesShares,
			&position.NoShares,
			&position.YesAmount,
			&position.NoAmount,
			&position.Claimed,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan position: %w", err)
		}

		positions = append(positions, position)
	}

	return positions, nil
}

// GetPosition retrieves a user's position for a specific market
func (s *PostgresStorage) GetPosition(marketID int) (*models.UserPosition, error) {
	query := `
		SELECT market_id, yes_shares, no_shares, yes_amount, no_amount, claimed
		FROM user_positions
		WHERE market_id = $1
	`

	position := &models.UserPosition{}
	err := s.db.QueryRow(query, marketID).Scan(
		&position.MarketID,
		&position.YesShares,
		&position.NoShares,
		&position.YesAmount,
		&position.NoAmount,
		&position.Claimed,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get position: %w", err)
	}

	return position, nil
}

// SavePosition inserts or updates a user position
func (s *PostgresStorage) SavePosition(position *models.UserPosition) error {
	// Check if position exists
	existing, err := s.GetPosition(position.MarketID)
	if err != nil {
		return err
	}

	if existing == nil {
		// Insert new position
		query := `
			INSERT INTO user_positions (market_id, yes_shares, no_shares, yes_amount, no_amount, claimed)
			VALUES ($1, $2, $3, $4, $5, $6)
		`
		_, err = s.db.Exec(query, position.MarketID, position.YesShares, position.NoShares,
			position.YesAmount, position.NoAmount, position.Claimed)
	} else {
		// Update existing position
		query := `
			UPDATE user_positions
			SET yes_shares = $1, no_shares = $2, yes_amount = $3, no_amount = $4, claimed = $5
			WHERE market_id = $6
		`
		_, err = s.db.Exec(query, position.YesShares, position.NoShares,
			position.YesAmount, position.NoAmount, position.Claimed, position.MarketID)
	}

	if err != nil {
		return fmt.Errorf("failed to save position: %w", err)
	}

	return nil
}

// GetBalance retrieves the user's balance
func (s *PostgresStorage) GetBalance() (float64, error) {
	query := `SELECT balance FROM user_balance WHERE id = 1`

	var balance float64
	err := s.db.QueryRow(query).Scan(&balance)
	if err != nil {
		return 0, fmt.Errorf("failed to get balance: %w", err)
	}

	return balance, nil
}

// UpdateBalance updates the user's balance
func (s *PostgresStorage) UpdateBalance(amount float64) error {
	query := `
		UPDATE user_balance
		SET balance = balance + $1
		WHERE id = 1
	`

	_, err := s.db.Exec(query, amount)
	if err != nil {
		return fmt.Errorf("failed to update balance: %w", err)
	}

	return nil
}

// GetExpiredMarkets retrieves markets that have passed their end time but are still active
func (s *PostgresStorage) GetExpiredMarkets() ([]*models.Market, error) {
	query := `
		SELECT id, question, category, status, end_time, yes_pool, no_pool,
		       total_yes_shares, total_no_shares, winning_outcome, created_at
		FROM markets
		WHERE status = 'Active' AND end_time < $1
		ORDER BY end_time ASC
	`

	rows, err := s.db.Query(query, time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to query expired markets: %w", err)
	}
	defer rows.Close()

	var markets []*models.Market
	for rows.Next() {
		market := &models.Market{}
		var winningOutcome sql.NullString

		err := rows.Scan(
			&market.ID,
			&market.Question,
			&market.Category,
			&market.Status,
			&market.EndTime,
			&market.YesPool,
			&market.NoPool,
			&market.TotalYesShares,
			&market.TotalNoShares,
			&winningOutcome,
			&market.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan expired market: %w", err)
		}

		if winningOutcome.Valid {
			outcome := models.Outcome(winningOutcome.String)
			market.WinningOutcome = &outcome
		}

		markets = append(markets, market)
	}

	return markets, nil
}

// InitializeDefaultMarkets inserts the default 6 markets if the database is empty
func (s *PostgresStorage) InitializeDefaultMarkets() error {
	// Check if markets exist
	var count int
	err := s.db.QueryRow("SELECT COUNT(*) FROM markets").Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to count markets: %w", err)
	}

	if count > 0 {
		log.Println("📊 Markets already exist in database, skipping initialization")
		return nil
	}

	log.Println("🌱 Initializing default markets in database...")

	now := time.Now()
	defaultMarkets := []*models.Market{
		{
			Question:       "Will Manchester City win the Premier League 2025-26?",
			Category:       "Sports",
			Status:         models.StatusActive,
			EndTime:        time.Date(2026, 5, 23, 20, 0, 0, 0, time.UTC),
			YesPool:        1250,
			NoPool:         850,
			TotalYesShares: 1250000,
			TotalNoShares:  850000,
			CreatedAt:      now.Add(-24 * time.Hour),
		},
		{
			Question:       "Will Bitcoin reach $100,000 by December 31, 2025?",
			Category:       "Crypto",
			Status:         models.StatusActive,
			EndTime:        time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC),
			YesPool:        3400,
			NoPool:         2100,
			TotalYesShares: 3400000,
			TotalNoShares:  2100000,
			CreatedAt:      now.Add(-48 * time.Hour),
		},
		{
			Question:       "Will Lakers make it to NBA playoffs this season?",
			Category:       "Sports",
			Status:         models.StatusActive,
			EndTime:        time.Date(2026, 4, 15, 23, 59, 59, 0, time.UTC),
			YesPool:        890,
			NoPool:         1560,
			TotalYesShares: 890000,
			TotalNoShares:  1560000,
			CreatedAt:      now.Add(-36 * time.Hour),
		},
		{
			Question:       "Will Ethereum price be above $5,000 by end of November 2025?",
			Category:       "Crypto",
			Status:         models.StatusActive,
			EndTime:        time.Date(2025, 11, 30, 23, 59, 59, 0, time.UTC),
			YesPool:        2200,
			NoPool:         1800,
			TotalYesShares: 2200000,
			TotalNoShares:  1800000,
			CreatedAt:      now.Add(-12 * time.Hour),
		},
		{
			Question:       "Will Real Madrid win their next La Liga match?",
			Category:       "Sports",
			Status:         models.StatusActive,
			EndTime:        now.Add(72 * time.Hour),
			YesPool:        1800,
			NoPool:         900,
			TotalYesShares: 1800000,
			TotalNoShares:  900000,
			CreatedAt:      now.Add(-6 * time.Hour),
		},
		{
			Question:       "Will Bitcoin price be above $95,000 in 48 hours?",
			Category:       "Crypto",
			Status:         models.StatusActive,
			EndTime:        now.Add(48 * time.Hour),
			YesPool:        1500,
			NoPool:         2500,
			TotalYesShares: 1500000,
			TotalNoShares:  2500000,
			CreatedAt:      now.Add(-3 * time.Hour),
		},
	}

	for _, market := range defaultMarkets {
		if err := s.SaveMarket(market); err != nil {
			return fmt.Errorf("failed to save default market: %w", err)
		}
	}

	// Initialize default positions
	defaultPositions := []*models.UserPosition{
		{MarketID: 1, YesShares: 50000, YesAmount: 50, Claimed: false},
		{MarketID: 2, YesShares: 100000, YesAmount: 100, Claimed: false},
		{MarketID: 6, NoShares: 80000, NoAmount: 80, Claimed: false},
	}

	for _, position := range defaultPositions {
		if err := s.SavePosition(position); err != nil {
			return fmt.Errorf("failed to save default position: %w", err)
		}
	}

	log.Printf("✅ Initialized %d default markets and %d positions", len(defaultMarkets), len(defaultPositions))
	return nil
}

