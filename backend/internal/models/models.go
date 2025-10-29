package models

import "time"

type MarketStatus string

const (
	StatusActive   MarketStatus = "Active"
	StatusLocked   MarketStatus = "Locked"
	StatusResolved MarketStatus = "Resolved"
	StatusCancelled MarketStatus = "Cancelled"
)

type Outcome string

const (
	OutcomeYes Outcome = "Yes"
	OutcomeNo  Outcome = "No"
)

type Market struct {
	ID              int          `json:"id"`
	Question        string       `json:"question"`
	Category        string       `json:"category"`
	Status          MarketStatus `json:"status"`
	EndTime         time.Time    `json:"endTime"`
	YesPool         float64      `json:"yesPool"`
	NoPool          float64      `json:"noPool"`
	TotalYesShares  float64      `json:"totalYesShares"`
	TotalNoShares   float64      `json:"totalNoShares"`
	WinningOutcome  *Outcome     `json:"winningOutcome,omitempty"`
	CreatedAt       time.Time    `json:"createdAt"`
}

type UserPosition struct {
	MarketID  int     `json:"marketId"`
	YesShares float64 `json:"yesShares"`
	NoShares  float64 `json:"noShares"`
	YesAmount float64 `json:"yesAmount"`
	NoAmount  float64 `json:"noAmount"`
	Claimed   bool    `json:"claimed"`
}

type BetRequest struct {
	MarketID int     `json:"marketId"`
	Outcome  Outcome `json:"outcome"`
	Amount   float64 `json:"amount"`
}

type BetResponse struct {
	Success bool    `json:"success"`
	Market  *Market `json:"market"`
	Balance float64 `json:"balance"`
}

type ClaimResponse struct {
	Success bool    `json:"success"`
	Payout  float64 `json:"payout"`
	Balance float64 `json:"balance"`
}

type ResolveRequest struct {
	Outcome Outcome `json:"outcome"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

