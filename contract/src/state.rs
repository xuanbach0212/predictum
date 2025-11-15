// Copyright (c) Predictum
// Application State

use linera_sdk::{
    linera_base_types::{AccountOwner, Timestamp},
    views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext},
};
use serde::{Deserialize, Serialize};

// Re-export Outcome from lib.rs to avoid duplication
pub use prediction_market::Outcome;

/// Market status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, async_graphql::Enum)]
pub enum MarketStatus {
    Active,
    Locked,
    Resolved,
    Cancelled,
}

/// Market structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Market {
    pub id: u64,
    pub question: String,
    pub category: String,
    pub end_time: Timestamp,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub total_yes_shares: u64,
    pub total_no_shares: u64,
    pub status: MarketStatus,
    pub winning_outcome: Option<Outcome>,
    pub creator: AccountOwner,
    pub created_at: Timestamp,
}

/// User position in a market
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPosition {
    pub market_id: u64,
    pub user: AccountOwner,
    pub yes_shares: u64,
    pub no_shares: u64,
    pub yes_amount: u64,
    pub no_amount: u64,
    pub claimed: bool,
}

/// Application state
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct PredictionMarketState {
    pub next_market_id: RegisterView<u64>,
    pub markets: MapView<u64, Market>,
    pub positions: MapView<(u64, AccountOwner), UserPosition>,
}

