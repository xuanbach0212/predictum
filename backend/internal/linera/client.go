package linera

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

const (
	CHAIN_ID           = "10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0"
	APP_ID             = "3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76"
	RUST_SERVICE_URL   = "http://localhost:8081"
)

// Client represents a Linera GraphQL client
type Client struct {
	endpoint   string
	httpClient *http.Client
	enabled    bool
}

// GraphQLRequest represents a GraphQL query/mutation request
type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables,omitempty"`
}

// GraphQLResponse represents a GraphQL response
type GraphQLResponse struct {
	Data   map[string]interface{} `json:"data,omitempty"`
	Errors []GraphQLError         `json:"errors,omitempty"`
}

// GraphQLError represents a GraphQL error
type GraphQLError struct {
	Message string `json:"message"`
	Path    []interface{} `json:"path,omitempty"`
}

// NewClient creates a new Linera GraphQL client
func NewClient(endpoint string, enabled bool) *Client {
	fullEndpoint := fmt.Sprintf("%s/chains/%s/applications/%s", endpoint, CHAIN_ID, APP_ID)
	
	return &Client{
		endpoint: fullEndpoint,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		enabled: enabled,
	}
}

// IsEnabled returns whether the Linera client is enabled
func (c *Client) IsEnabled() bool {
	return c.enabled
}

// Query executes a GraphQL query against the Linera contract
func (c *Client) Query(query string, variables map[string]interface{}) (map[string]interface{}, error) {
	if !c.enabled {
		return nil, fmt.Errorf("linera client is disabled")
	}

	req := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", c.endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	var graphQLResp GraphQLResponse
	if err := json.Unmarshal(body, &graphQLResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if len(graphQLResp.Errors) > 0 {
		return nil, fmt.Errorf("graphql error: %s", graphQLResp.Errors[0].Message)
	}

	return graphQLResp.Data, nil
}

// Mutate executes a GraphQL mutation against the Linera contract
func (c *Client) Mutate(mutation string, variables map[string]interface{}) error {
	if !c.enabled {
		log.Println("⚠️  Linera client is disabled, skipping mutation")
		return nil
	}

	_, err := c.Query(mutation, variables)
	return err
}

// GetMarketCount queries the total number of markets on-chain
func (c *Client) GetMarketCount() (int, error) {
	query := `{ marketCount }`
	
	data, err := c.Query(query, nil)
	if err != nil {
		return 0, err
	}

	count, ok := data["marketCount"].(float64)
	if !ok {
		return 0, fmt.Errorf("invalid market count response")
	}

	return int(count), nil
}

// CreateMarket creates a new market on-chain
func (c *Client) CreateMarket(question string, category string, endTime time.Time) error {
	if !c.enabled {
		return nil
	}

	operation := map[string]interface{}{
		"CreateMarket": map[string]interface{}{
			"question": question,
			"category": category,
			"end_time": endTime.UnixMicro(),
		},
	}

	return c.submitOperation(operation)
}

// PlaceBet places a bet on a market on-chain
func (c *Client) PlaceBet(marketID int, outcome string, amount int) error {
	if !c.enabled {
		return nil
	}

	operation := map[string]interface{}{
		"PlaceBet": map[string]interface{}{
			"market_id": marketID,
			"outcome":   outcome,
			"amount":    amount,
		},
	}

	return c.submitOperation(operation)
}

// ResolveMarket resolves a market on-chain
func (c *Client) ResolveMarket(marketID int, outcome string) error {
	if !c.enabled {
		return nil
	}

	operation := map[string]interface{}{
		"ResolveMarket": map[string]interface{}{
			"market_id": marketID,
			"outcome":   outcome,
		},
	}

	return c.submitOperation(operation)
}

// submitOperation submits an operation to the Linera contract via Rust microservice
func (c *Client) submitOperation(operation interface{}) error {
	// Extract operation type and params
	opMap, ok := operation.(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid operation format")
	}

	var endpoint string
	var payload interface{}

	// Determine endpoint and payload based on operation type
	if createMarket, ok := opMap["CreateMarket"]; ok {
		endpoint = RUST_SERVICE_URL + "/linera/create-market"
		payload = createMarket
	} else if placeBet, ok := opMap["PlaceBet"]; ok {
		endpoint = RUST_SERVICE_URL + "/linera/place-bet"
		payload = placeBet
	} else if resolveMarket, ok := opMap["ResolveMarket"]; ok {
		endpoint = RUST_SERVICE_URL + "/linera/resolve-market"
		payload = resolveMarket
	} else {
		return fmt.Errorf("unknown operation type")
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	httpReq, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to call Rust service: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Rust service error (status %d): %s", resp.StatusCode, string(body))
	}

	log.Printf("✅ Linera operation successful via Rust service: %s", string(body))
	return nil
}

// HealthCheck verifies connectivity to the Linera service
func (c *Client) HealthCheck() error {
	if !c.enabled {
		return fmt.Errorf("linera client is disabled")
	}

	_, err := c.GetMarketCount()
	return err
}

