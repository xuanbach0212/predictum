use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Market status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MarketStatus {
    Active,
    Locked,
    Resolved,
    Cancelled,
}

/// Market category
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MarketCategory {
    Sports {
        event_id: String,
        sport_type: String,
        home_team: String,
        away_team: String,
    },
    Crypto {
        symbol: String,
        threshold: u64,
    },
    Binary {
        metadata: String,
    },
}

/// Bet outcome
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Outcome {
    Yes,
    No,
}

/// Market structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Market {
    pub id: u64,
    pub question: String,
    pub category: MarketCategory,
    pub end_time: u64, // Unix timestamp
    pub yes_pool: u64,
    pub no_pool: u64,
    pub total_yes_shares: u64,
    pub total_no_shares: u64,
    pub status: MarketStatus,
    pub winning_outcome: Option<Outcome>,
    pub creator: Vec<u8>, // Account address
    pub oracle_address: Vec<u8>,
    pub created_at: u64,
    pub resolved_at: Option<u64>,
}

/// User position in a market
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPosition {
    pub market_id: u64,
    pub user: Vec<u8>,
    pub yes_shares: u64,
    pub no_shares: u64,
    pub yes_amount: u64,
    pub no_amount: u64,
    pub claimed: bool,
    pub last_bet_time: u64,
}

/// Application state
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PredictionMarketState {
    pub next_market_id: u64,
    pub markets: BTreeMap<u64, Market>,
    pub positions: BTreeMap<(u64, Vec<u8>), UserPosition>,
    pub default_oracle: Vec<u8>,
    pub owner: Vec<u8>,
}

impl PredictionMarketState {
    pub fn new(owner: Vec<u8>, default_oracle: Vec<u8>) -> Self {
        Self {
            next_market_id: 1,
            markets: BTreeMap::new(),
            positions: BTreeMap::new(),
            default_oracle,
            owner,
        }
    }

    pub fn get_market(&self, market_id: u64) -> Option<&Market> {
        self.markets.get(&market_id)
    }

    pub fn get_market_mut(&mut self, market_id: u64) -> Option<&mut Market> {
        self.markets.get_mut(&market_id)
    }

    pub fn get_position(&self, market_id: u64, user: &[u8]) -> Option<&UserPosition> {
        self.positions.get(&(market_id, user.to_vec()))
    }

    pub fn get_position_mut(&mut self, market_id: u64, user: &[u8]) -> Option<&mut UserPosition> {
        self.positions.get_mut(&(market_id, user.to_vec()))
    }

    pub fn create_position(&mut self, market_id: u64, user: Vec<u8>, current_time: u64) {
        let position = UserPosition {
            market_id,
            user: user.clone(),
            yes_shares: 0,
            no_shares: 0,
            yes_amount: 0,
            no_amount: 0,
            claimed: false,
            last_bet_time: current_time,
        };
        self.positions.insert((market_id, user), position);
    }
}

