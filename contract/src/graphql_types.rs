// GraphQL-compatible types for queries

use async_graphql::SimpleObject;
use linera_sdk::linera_base_types::{AccountOwner, Timestamp};
use serde::{Deserialize, Serialize};

use crate::state::{Market as StateMarket, MarketStatus, Outcome, UserPosition as StateUserPosition};

/// GraphQL-compatible Market type
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct Market {
    pub id: u64,
    pub question: String,
    pub category: String,
    pub end_time: u64, // Timestamp as u64 microseconds
    pub yes_pool: u64,
    pub no_pool: u64,
    pub total_yes_shares: u64,
    pub total_no_shares: u64,
    pub status: MarketStatus,
    pub winning_outcome: Option<Outcome>,
    pub creator: String, // AccountOwner as string
    pub created_at: u64, // Timestamp as u64 microseconds
}

impl From<StateMarket> for Market {
    fn from(m: StateMarket) -> Self {
        Market {
            id: m.id,
            question: m.question,
            category: m.category,
            end_time: m.end_time.micros(),
            yes_pool: m.yes_pool,
            no_pool: m.no_pool,
            total_yes_shares: m.total_yes_shares,
            total_no_shares: m.total_no_shares,
            status: m.status,
            winning_outcome: m.winning_outcome,
            creator: format!("{:?}", m.creator),
            created_at: m.created_at.micros(),
        }
    }
}

impl From<&StateMarket> for Market {
    fn from(m: &StateMarket) -> Self {
        Market {
            id: m.id,
            question: m.question.clone(),
            category: m.category.clone(),
            end_time: m.end_time.micros(),
            yes_pool: m.yes_pool,
            no_pool: m.no_pool,
            total_yes_shares: m.total_yes_shares,
            total_no_shares: m.total_no_shares,
            status: m.status,
            winning_outcome: m.winning_outcome,
            creator: format!("{:?}", m.creator),
            created_at: m.created_at.micros(),
        }
    }
}

/// GraphQL-compatible UserPosition type
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct UserPosition {
    pub market_id: u64,
    pub user: String, // AccountOwner as string
    pub yes_shares: u64,
    pub no_shares: u64,
    pub yes_amount: u64,
    pub no_amount: u64,
    pub claimed: bool,
}

impl From<StateUserPosition> for UserPosition {
    fn from(p: StateUserPosition) -> Self {
        UserPosition {
            market_id: p.market_id,
            user: format!("{:?}", p.user),
            yes_shares: p.yes_shares,
            no_shares: p.no_shares,
            yes_amount: p.yes_amount,
            no_amount: p.no_amount,
            claimed: p.claimed,
        }
    }
}

impl From<&StateUserPosition> for UserPosition {
    fn from(p: &StateUserPosition) -> Self {
        UserPosition {
            market_id: p.market_id,
            user: format!("{:?}", p.user),
            yes_shares: p.yes_shares,
            no_shares: p.no_shares,
            yes_amount: p.yes_amount,
            no_amount: p.no_amount,
            claimed: p.claimed,
        }
    }
}

