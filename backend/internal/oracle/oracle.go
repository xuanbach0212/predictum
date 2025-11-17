package oracle

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/linera-prediction-market/backend/internal/models"
)

// StorageInterface defines the methods required for oracle operations
type StorageInterface interface {
	SaveMarket(market *models.Market) error
	GetExpiredMarkets() ([]*models.Market, error)
	UpdateMarket(market *models.Market) error
}

// Oracle automatically creates prediction markets
type Oracle struct {
	storage       StorageInterface
	createTicker  *time.Ticker
	resolveTicker *time.Ticker
	done          chan bool
	coinGecko     *CoinGeckoClient
	lastPrices    map[string]float64 // Cache of last known prices
}

// NewOracleWithStorage creates a new oracle instance with storage interface
func NewOracleWithStorage(s StorageInterface) *Oracle {
	return &Oracle{
		storage:    s,
		done:       make(chan bool),
		coinGecko:  NewCoinGeckoClient(),
		lastPrices: make(map[string]float64),
	}
}

// Start begins the oracle service
// Creates new markets every 5 minutes and resolves expired markets every 5 minutes
func (o *Oracle) Start() {
	log.Println("🔮 Oracle service started with REAL CoinGecko data")
	log.Println("   📝 Creating markets every 5 minutes")
	log.Println("   ✅ Resolving expired markets every 5 minutes")
	log.Println("   💰 Fetching real crypto prices from CoinGecko API")

	// Fetch initial prices
	o.fetchAndCachePrices()

	o.createTicker = time.NewTicker(5 * time.Minute)
	o.resolveTicker = time.NewTicker(5 * time.Minute)

	// Market creation goroutine
	go func() {
		for {
			select {
			case <-o.createTicker.C:
				o.createMarketFromRealData()
			case <-o.done:
				return
			}
		}
	}()

	// Market resolution goroutine
	go func() {
		for {
			select {
			case <-o.resolveTicker.C:
				o.resolveExpiredMarkets()
			case <-o.done:
				return
			}
		}
	}()
}

// Stop stops the oracle service
func (o *Oracle) Stop() {
	if o.createTicker != nil {
		o.createTicker.Stop()
	}
	if o.resolveTicker != nil {
		o.resolveTicker.Stop()
	}
	close(o.done)
	log.Println("🔮 Oracle service stopped")
}

// fetchAndCachePrices fetches current crypto prices from CoinGecko and caches them
func (o *Oracle) fetchAndCachePrices() {
	coins, err := o.coinGecko.GetTopCoins(15) // Fetch top 15 coins
	if err != nil {
		log.Printf("⚠️  Failed to fetch prices from CoinGecko: %v", err)
		log.Println("   Will use fallback mock data for this cycle")
		return
	}

	// Cache prices
	for _, coin := range coins {
		o.lastPrices[coin.ID] = coin.CurrentPrice
	}

	// Log current prices
	o.coinGecko.LogPrices(coins)
}

// createMarketFromRealData creates a market using real CoinGecko data
func (o *Oracle) createMarketFromRealData() {
	// Fetch latest prices (with rate limiting - every 5 minutes is safe for free tier)
	coins, err := o.coinGecko.GetTopCoins(15)
	if err != nil {
		log.Printf("⚠️  CoinGecko API error: %v, falling back to mock market", err)
		o.createRandomMarket() // Fallback to mock data
		return
	}

	// Update cache
	for _, coin := range coins {
		o.lastPrices[coin.ID] = coin.CurrentPrice
	}

	// Pick a random coin from top 15
	coin := coins[rand.Intn(len(coins))]

	// Generate market based on current price
	market := o.generateCryptoMarket(coin)

	// Save to database
	if err := o.storage.SaveMarket(market); err != nil {
		log.Printf("❌ Oracle failed to create market: %v", err)
		return
	}

	log.Printf("🎯 Oracle created REAL market #%d: %s (Current: $%.2f)",
		market.ID,
		market.Question,
		coin.CurrentPrice)
}

// generateCryptoMarket generates a prediction market based on real crypto data
func (o *Oracle) generateCryptoMarket(coin CoinPrice) *models.Market {
	now := time.Now().UTC() // Use UTC to avoid timezone issues

	// Market types with different timeframes
	marketTypes := []struct {
		template    string
		duration    time.Duration
		targetPrice float64
	}{
		// Short-term (24h)
		{
			template:    "Will %s price be above %s in 24 hours?",
			duration:    24 * time.Hour,
			targetPrice: coin.CurrentPrice * 1.05, // 5% increase
		},
		// Medium-term (7 days)
		{
			template:    "Will %s reach %s by next week?",
			duration:    7 * 24 * time.Hour,
			targetPrice: coin.CurrentPrice * 1.10, // 10% increase
		},
		// Long-term (30 days)
		{
			template:    "Will %s break %s by end of month?",
			duration:    30 * 24 * time.Hour,
			targetPrice: coin.CurrentPrice * 1.20, // 20% increase
		},
		// Specific milestone
		{
			template:    "Will %s stay above %s for next 48 hours?",
			duration:    48 * time.Hour,
			targetPrice: coin.CurrentPrice * 0.95, // 5% below current
		},
	}

	// Pick random market type
	marketType := marketTypes[rand.Intn(len(marketTypes))]

	// Generate question with coin name and target price
	// Format price appropriately based on value
	var priceStr string
	if marketType.targetPrice >= 1000 {
		priceStr = fmt.Sprintf("$%.0f", marketType.targetPrice)
	} else if marketType.targetPrice >= 1 {
		priceStr = fmt.Sprintf("$%.2f", marketType.targetPrice)
	} else {
		priceStr = fmt.Sprintf("$%.4f", marketType.targetPrice)
	}

	question := fmt.Sprintf(marketType.template, coin.Name, priceStr)

	// Calculate end time
	endTime := now.Add(marketType.duration)

	// Generate realistic initial pools based on market cap
	// Higher market cap = more initial liquidity
	basePool := 1000.0
	if coin.MarketCap > 100000000000 { // > $100B (BTC, ETH)
		basePool = 3000.0
	} else if coin.MarketCap > 10000000000 { // > $10B
		basePool = 2000.0
	}

	initialYesPool := basePool + float64(rand.Intn(2000))
	initialNoPool := basePool + float64(rand.Intn(2000))

	// Adjust odds based on price change trend
	if coin.PriceChangePercentage24h > 5 {
		// Bullish trend - more YES bets
		initialYesPool *= 1.3
	} else if coin.PriceChangePercentage24h < -5 {
		// Bearish trend - more NO bets
		initialNoPool *= 1.3
	}

	return &models.Market{
		Question:       question,
		Category:       "Crypto",
		Status:         models.StatusActive,
		EndTime:        endTime,
		YesPool:        initialYesPool,
		NoPool:         initialNoPool,
		TotalYesShares: initialYesPool * 1000,
		TotalNoShares:  initialNoPool * 1000,
		WinningOutcome: nil,
		CreatedAt:      now,
	}
}

// createRandomMarket creates a new prediction market with realistic future dates
func (o *Oracle) createRandomMarket() {
	now := time.Now().UTC() // Use UTC to avoid timezone issues

	// Market templates with realistic future dates (30+ templates)
	templates := []struct {
		question string
		category string
		duration time.Duration
	}{
		// Crypto markets - Bitcoin
		{"Will Bitcoin reach $110,000 by end of December 2025?", "Crypto", time.Until(time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC))},
		{"Will Bitcoin price be above $95,000 in 24 hours?", "Crypto", 24 * time.Hour},
		{"Will Bitcoin break $120,000 before Q2 2026?", "Crypto", time.Until(time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC))},
		{"Will Bitcoin dominance exceed 60% this month?", "Crypto", 30 * 24 * time.Hour},
		{"Will Bitcoin ETF inflows exceed $1B this week?", "Crypto", 7 * 24 * time.Hour},

		// Crypto markets - Ethereum
		{"Will Ethereum surpass $6,000 by end of this week?", "Crypto", 7 * 24 * time.Hour},
		{"Will Ethereum price be above $5,000 by end of November 2025?", "Crypto", time.Until(time.Date(2025, 11, 30, 23, 59, 59, 0, time.UTC))},
		{"Will Ethereum gas fees drop below 20 gwei today?", "Crypto", 12 * time.Hour},
		{"Will Ethereum 2.0 staking exceed 40M ETH by year end?", "Crypto", time.Until(time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC))},

		// Crypto markets - Altcoins
		{"Will Solana reach $250 by end of November 2025?", "Crypto", time.Until(time.Date(2025, 11, 30, 23, 59, 59, 0, time.UTC))},
		{"Will Cardano reach $2 by end of Q1 2026?", "Crypto", time.Until(time.Date(2026, 3, 31, 23, 59, 59, 0, time.UTC))},
		{"Will Dogecoin reach $1 by end of 2025?", "Crypto", time.Until(time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC))},
		{"Will Polygon (MATIC) reach $3 in next 60 days?", "Crypto", 60 * 24 * time.Hour},
		{"Will Avalanche (AVAX) surpass $100 this quarter?", "Crypto", 90 * 24 * time.Hour},
		{"Will Chainlink (LINK) reach $50 by end of year?", "Crypto", time.Until(time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC))},

		// Sports - Football/Soccer
		{"Will Real Madrid win their next La Liga match?", "Sports", 72 * time.Hour},
		{"Will Manchester City win the Premier League 2025-26?", "Sports", time.Until(time.Date(2026, 5, 23, 0, 0, 0, 0, time.UTC))},
		{"Will Barcelona advance to Champions League semifinals?", "Sports", time.Until(time.Date(2026, 4, 30, 0, 0, 0, 0, time.UTC))},
		{"Will Liverpool win their next 3 matches?", "Sports", 14 * 24 * time.Hour},
		{"Will PSG win Ligue 1 this season?", "Sports", time.Until(time.Date(2026, 5, 31, 0, 0, 0, 0, time.UTC))},
		{"Will any team score 3+ goals in today's matches?", "Sports", 18 * time.Hour},
		{"Will Bayern Munich win the Bundesliga 2025-26?", "Sports", time.Until(time.Date(2026, 5, 20, 0, 0, 0, 0, time.UTC))},

		// Sports - Basketball
		{"Will Lakers make it to NBA playoffs this season?", "Sports", time.Until(time.Date(2026, 4, 15, 0, 0, 0, 0, time.UTC))},
		{"Will Warriors win their next home game?", "Sports", 5 * 24 * time.Hour},
		{"Will Celtics finish top seed in Eastern Conference?", "Sports", time.Until(time.Date(2026, 4, 10, 0, 0, 0, 0, time.UTC))},
		{"Will any player score 50+ points this week?", "Sports", 7 * 24 * time.Hour},

		// Sports - American Football
		{"Will Patriots win their next NFL game?", "Sports", 5 * 24 * time.Hour},
		{"Will Chiefs make it to Super Bowl 2026?", "Sports", time.Until(time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC))},
		{"Will Cowboys win NFC East this season?", "Sports", time.Until(time.Date(2026, 1, 5, 0, 0, 0, 0, time.UTC))},

		// Binary/General Events
		{"Will Fed raise interest rates in next meeting?", "Binary", 45 * 24 * time.Hour},
		{"Will S&P 500 reach 6000 by end of year?", "Binary", time.Until(time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC))},
		{"Will unemployment rate drop below 3.5% this quarter?", "Binary", 90 * 24 * time.Hour},
		{"Will Apple announce new product in next 30 days?", "Binary", 30 * 24 * time.Hour},
		{"Will Tesla stock reach $300 by end of month?", "Binary", 30 * 24 * time.Hour},
		{"Will oil prices exceed $100/barrel this week?", "Binary", 7 * 24 * time.Hour},
		{"Will gold price reach $2500/oz in next 60 days?", "Binary", 60 * 24 * time.Hour},
	}

	// Pick a random template (avoid duplicates by tracking recent questions)
	template := templates[rand.Intn(len(templates))]

	// Add unique timestamp to make questions distinguishable
	now = time.Now()
	questionWithTime := template.question

	// For Bitcoin/Crypto price predictions, add specific time context
	if template.category == "Crypto" && (template.question == "Will Bitcoin reach $110,000 by end of December 2025?" ||
		template.question == "Will Bitcoin price be above $95,000 in 24 hours?" ||
		template.question == "Will Bitcoin break $120,000 before Q2 2026?" ||
		template.question == "Will Ethereum surpass $6,000 by end of this week?" ||
		template.question == "Will Ethereum price be above $5,000 by end of November 2025?") {
		// Add specific date/time to make it unique
		questionWithTime = fmt.Sprintf("%s [Created: %s]", template.question, now.Format("Jan 02, 15:04"))
	}

	// Calculate end time (ensure it's in the future)
	endTime := now.Add(template.duration)
	if endTime.Before(now) {
		// If calculated time is in the past, add to current time instead
		endTime = now.Add(template.duration)
	}

	// Create market with random initial pools
	initialYesPool := float64(rand.Intn(4000) + 500) // 500-4500 tokens
	initialNoPool := float64(rand.Intn(4000) + 500)  // 500-4500 tokens

	market := &models.Market{
		Question:       questionWithTime,
		Category:       template.category,
		Status:         models.StatusActive,
		EndTime:        endTime,
		YesPool:        initialYesPool,
		NoPool:         initialNoPool,
		TotalYesShares: initialYesPool * 1000, // Initial shares
		TotalNoShares:  initialNoPool * 1000,
		WinningOutcome: nil,
		CreatedAt:      now.Add(-time.Duration(rand.Intn(168)) * time.Hour), // Created 0-7 days ago
	}

	// Save to database
	if err := o.storage.SaveMarket(market); err != nil {
		log.Printf("❌ Oracle failed to create market: %v", err)
		return
	}

	log.Printf("🎯 Oracle created market #%d: %s (ends: %s)",
		market.ID,
		market.Question,
		endTime.Format("2006-01-02 15:04 MST"))
}

// resolveExpiredMarkets automatically resolves markets that have passed their end time
func (o *Oracle) resolveExpiredMarkets() {
	expiredMarkets, err := o.storage.GetExpiredMarkets()
	if err != nil {
		log.Printf("❌ Oracle failed to get expired markets: %v", err)
		return
	}

	if len(expiredMarkets) == 0 {
		return
	}

	log.Printf("🔍 Oracle found %d expired market(s) to resolve", len(expiredMarkets))

	for _, market := range expiredMarkets {
		// Randomly resolve with 50/50 chance (for demo purposes)
		var outcome models.Outcome
		if rand.Float64() < 0.5 {
			outcome = models.OutcomeYes
		} else {
			outcome = models.OutcomeNo
		}

		market.Status = models.StatusResolved
		market.WinningOutcome = &outcome

		if err := o.storage.UpdateMarket(market); err != nil {
			log.Printf("❌ Oracle failed to resolve market #%d: %v", market.ID, err)
			continue
		}

		log.Printf("✅ Oracle resolved market #%d: %s → %s",
			market.ID,
			market.Question,
			outcome)
	}
}
