mod state;

pub use state::*;

use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Contract errors
#[derive(Debug, Error, Serialize, Deserialize)]
pub enum ContractError {
    #[error("Market not found: {0}")]
    MarketNotFound(u64),

    #[error("Invalid market status. Expected {expected:?}, got {actual:?}")]
    InvalidMarketStatus {
        expected: MarketStatus,
        actual: MarketStatus,
    },

    #[error("Betting period has ended")]
    BettingClosed,

    #[error("Insufficient balance. Required: {required}, Available: {available}")]
    InsufficientBalance { required: u64, available: u64 },

    #[error("Unauthorized operation")]
    Unauthorized,

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Position not found")]
    PositionNotFound,

    #[error("Winnings already claimed")]
    AlreadyClaimed,

    #[error("Arithmetic overflow")]
    ArithmeticOverflow,

    #[error("Market end time must be in the future")]
    EndTimeInPast,

    #[error("Bet amount too small. Minimum: {minimum}, Provided: {provided}")]
    BetTooSmall { minimum: u64, provided: u64 },
}

/// Contract operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operation {
    /// Create a new market
    CreateMarket {
        question: String,
        end_time: u64,
        category: MarketCategory,
        oracle_address: Option<Vec<u8>>,
    },

    /// Place a bet on a market
    PlaceBet {
        market_id: u64,
        outcome: Outcome,
        amount: u64,
    },

    /// Resolve a market (oracle only)
    ResolveMarket {
        market_id: u64,
        outcome: Outcome,
    },

    /// Claim winnings from a resolved market
    ClaimWinnings { market_id: u64 },

    /// Cancel a market (owner/oracle only)
    CancelMarket { market_id: u64 },
}

/// Query operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Query {
    /// Get market details
    GetMarket { market_id: u64 },

    /// Get market odds
    GetMarketOdds { market_id: u64 },

    /// Get user position
    GetUserPosition { market_id: u64, user: Vec<u8> },

    /// Get potential payout
    GetPotentialPayout {
        market_id: u64,
        user: Vec<u8>,
        outcome: Outcome,
    },

    /// List all markets
    ListMarkets {
        status: Option<MarketStatus>,
        limit: u32,
        offset: u32,
    },
}

/// Query response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QueryResponse {
    Market(Market),
    Odds { yes_odds: f64, no_odds: f64 },
    Position(UserPosition),
    PotentialPayout(u64),
    Markets(Vec<Market>),
}

/// Constants
pub const MIN_BET_AMOUNT: u64 = 1_000_000; // 0.01 tokens (assuming 8 decimals)
pub const INITIAL_SHARE_MULTIPLIER: u64 = 1000;
pub const MIN_QUESTION_LENGTH: usize = 10;
pub const MAX_QUESTION_LENGTH: usize = 500;

/// Calculate odds for a market
pub fn calculate_odds(market: &Market) -> (f64, f64) {
    let total_pool = market.yes_pool + market.no_pool;

    if total_pool == 0 {
        return (0.5, 0.5);
    }

    let yes_odds = market.yes_pool as f64 / total_pool as f64;
    let no_odds = market.no_pool as f64 / total_pool as f64;

    (yes_odds, no_odds)
}

/// Calculate shares for a bet
pub fn calculate_shares(current_pool: u64, total_shares: u64, bet_amount: u64) -> u64 {
    if total_shares == 0 {
        // First bet in this pool
        bet_amount * INITIAL_SHARE_MULTIPLIER
    } else {
        // Proportional shares
        (bet_amount * total_shares) / current_pool
    }
}

/// Calculate potential payout
pub fn calculate_payout(
    total_pool: u64,
    user_shares: u64,
    total_winning_shares: u64,
) -> Result<u64, ContractError> {
    if total_winning_shares == 0 {
        return Ok(0);
    }

    total_pool
        .checked_mul(user_shares)
        .and_then(|v| v.checked_div(total_winning_shares))
        .ok_or(ContractError::ArithmeticOverflow)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_odds_empty_pool() {
        let market = Market {
            id: 1,
            question: "Test?".to_string(),
            category: MarketCategory::Binary {
                metadata: "test".to_string(),
            },
            end_time: 1000,
            yes_pool: 0,
            no_pool: 0,
            total_yes_shares: 0,
            total_no_shares: 0,
            status: MarketStatus::Active,
            winning_outcome: None,
            creator: vec![],
            oracle_address: vec![],
            created_at: 0,
            resolved_at: None,
        };

        let (yes_odds, no_odds) = calculate_odds(&market);
        assert_eq!(yes_odds, 0.5);
        assert_eq!(no_odds, 0.5);
    }

    #[test]
    fn test_calculate_odds_with_bets() {
        let market = Market {
            id: 1,
            question: "Test?".to_string(),
            category: MarketCategory::Binary {
                metadata: "test".to_string(),
            },
            end_time: 1000,
            yes_pool: 75,
            no_pool: 25,
            total_yes_shares: 75000,
            total_no_shares: 25000,
            status: MarketStatus::Active,
            winning_outcome: None,
            creator: vec![],
            oracle_address: vec![],
            created_at: 0,
            resolved_at: None,
        };

        let (yes_odds, no_odds) = calculate_odds(&market);
        assert_eq!(yes_odds, 0.75);
        assert_eq!(no_odds, 0.25);
    }

    #[test]
    fn test_calculate_shares_first_bet() {
        let shares = calculate_shares(0, 0, 100);
        assert_eq!(shares, 100 * INITIAL_SHARE_MULTIPLIER);
    }

    #[test]
    fn test_calculate_shares_subsequent_bet() {
        let shares = calculate_shares(1000, 1_000_000, 100);
        assert_eq!(shares, 100_000);
    }

    #[test]
    fn test_calculate_payout() {
        let payout = calculate_payout(1000, 500_000, 1_000_000).unwrap();
        assert_eq!(payout, 500);
    }
}

