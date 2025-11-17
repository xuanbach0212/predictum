package oracle

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// CoinGeckoClient fetches real-time crypto prices from CoinGecko API
type CoinGeckoClient struct {
	baseURL    string
	httpClient *http.Client
}

// CoinPrice represents a cryptocurrency price data
type CoinPrice struct {
	ID              string  `json:"id"`
	Symbol          string  `json:"symbol"`
	Name            string  `json:"name"`
	CurrentPrice    float64 `json:"current_price"`
	PriceChange24h  float64 `json:"price_change_24h"`
	PriceChangePercentage24h float64 `json:"price_change_percentage_24h"`
	MarketCap       float64 `json:"market_cap"`
	TotalVolume     float64 `json:"total_volume"`
	High24h         float64 `json:"high_24h"`
	Low24h          float64 `json:"low_24h"`
}

// NewCoinGeckoClient creates a new CoinGecko API client
func NewCoinGeckoClient() *CoinGeckoClient {
	return &CoinGeckoClient{
		baseURL: "https://api.coingecko.com/api/v3",
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetTopCoins fetches top N cryptocurrencies by market cap
func (c *CoinGeckoClient) GetTopCoins(limit int) ([]CoinPrice, error) {
	url := fmt.Sprintf("%s/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=%d&page=1&sparkline=false", 
		c.baseURL, limit)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Accept", "application/json")
	
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}
	
	var coins []CoinPrice
	if err := json.NewDecoder(resp.Body).Decode(&coins); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	return coins, nil
}

// GetCoinPrice fetches price for a specific coin by ID
func (c *CoinGeckoClient) GetCoinPrice(coinID string) (*CoinPrice, error) {
	url := fmt.Sprintf("%s/coins/markets?vs_currency=usd&ids=%s", c.baseURL, coinID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	req.Header.Set("Accept", "application/json")
	
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}
	
	var coins []CoinPrice
	if err := json.NewDecoder(resp.Body).Decode(&coins); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	if len(coins) == 0 {
		return nil, fmt.Errorf("coin not found: %s", coinID)
	}
	
	return &coins[0], nil
}

// LogPrices logs current prices for debugging
func (c *CoinGeckoClient) LogPrices(coins []CoinPrice) {
	log.Println("📊 Current Crypto Prices from CoinGecko:")
	for _, coin := range coins {
		changeSymbol := "📈"
		if coin.PriceChange24h < 0 {
			changeSymbol = "📉"
		}
		log.Printf("   %s %s (%s): $%.2f (%s%.2f%% 24h)",
			changeSymbol,
			coin.Name,
			coin.Symbol,
			coin.CurrentPrice,
			getChangeSign(coin.PriceChangePercentage24h),
			coin.PriceChangePercentage24h,
		)
	}
}

func getChangeSign(change float64) string {
	if change >= 0 {
		return "+"
	}
	return ""
}

