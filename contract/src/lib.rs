// Copyright (c) Predictum
// Prediction Market Contract for Linera

use async_graphql::{Request, Response};
use linera_sdk::linera_base_types::{ContractAbi, ServiceAbi, Timestamp};
use serde::{Deserialize, Serialize};

pub struct PredictionMarketAbi;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, async_graphql::Enum)]
pub enum Outcome {
    Yes,
    No,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Operation {
    /// Create a new prediction market
    CreateMarket {
        question: String,
        category: String,
        end_time: Timestamp,
    },
    
    /// Place a bet on a market
    PlaceBet {
        market_id: u64,
        outcome: Outcome,
        amount: u64,
    },
    
    /// Resolve a market (admin/oracle only)
    ResolveMarket {
        market_id: u64,
        outcome: Outcome,
    },
    
    /// Claim winnings from a resolved market
    ClaimWinnings {
        market_id: u64,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum OperationResponse {
    MarketCreated(u64),
    BetPlaced,
    MarketResolved,
    WinningsClaimed(u64),
}

impl ContractAbi for PredictionMarketAbi {
    type Operation = Operation;
    type Response = OperationResponse;
}

impl ServiceAbi for PredictionMarketAbi {
    type Query = Request;
    type QueryResponse = Response;
}

