// Copyright (c) Predictum
// Service Implementation for Queries

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;
mod graphql_types;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use linera_sdk::{
    linera_base_types::{AccountOwner, WithServiceAbi},
    views::View,
    Service, ServiceRuntime,
};

use self::graphql_types::{Market, UserPosition};
use self::state::{PredictionMarketState, Market as StateMarket, UserPosition as StateUserPosition};

pub struct PredictionMarketService {
    state: Arc<PredictionMarketState>,
}

linera_sdk::service!(PredictionMarketService);

impl WithServiceAbi for PredictionMarketService {
    type Abi = prediction_market::PredictionMarketAbi;
}

impl Service for PredictionMarketService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = PredictionMarketState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        PredictionMarketService {
            state: Arc::new(state),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot {
                state: self.state.clone(),
            },
            MutationRoot,
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

struct QueryRoot {
    state: Arc<PredictionMarketState>,
}

#[Object]
impl QueryRoot {
    /// Get a single market by ID
    async fn market(&self, id: u64) -> Option<Market> {
        match self.state.markets.get(&id).await {
            Ok(Some(state_market)) => {
                use std::borrow::Borrow;
                let market_ref: &StateMarket = state_market.borrow();
                Some(market_ref.into())
            }
            _ => None,
        }
    }

    /// List all markets
    async fn markets(&self) -> Vec<Market> {
        use std::borrow::Borrow;
        let mut markets = Vec::new();
        self.state
            .markets
            .for_each_index_value(|_key, state_market| {
                let market_ref: &StateMarket = state_market.borrow();
                markets.push(market_ref.into());
                Ok(())
            })
            .await
            .ok();
        markets
    }

    /// Get user position for a specific market (using user string representation)
    async fn position(&self, _market_id: u64, _user_str: String) -> Option<UserPosition> {
        // For now, return None as we need proper AccountOwner parsing
        // This will be enhanced with proper user lookup
        None
    }

    /// Get all positions (simplified - returns all positions)
    async fn all_positions(&self) -> Vec<UserPosition> {
        use std::borrow::Borrow;
        let mut positions = Vec::new();
        self.state
            .positions
            .for_each_index_value(|_key, state_position| {
                let position_ref: &StateUserPosition = state_position.borrow();
                positions.push(position_ref.into());
                Ok(())
            })
            .await
            .ok();
        positions
    }

    /// Get total number of markets
    async fn market_count(&self) -> u64 {
        *self.state.next_market_id.get() - 1
    }
}

struct MutationRoot;

#[Object]
impl MutationRoot {
    /// Placeholder for mutations (operations are handled by contract)
    async fn _placeholder(&self) -> bool {
        true
    }
}
