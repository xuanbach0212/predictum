// Copyright (c) Predictum
// Smart Contract Implementation

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    linera_base_types::{Timestamp, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};
use prediction_market::{Operation, OperationResponse, Outcome, PredictionMarketAbi};

use self::state::{Market, MarketStatus, PredictionMarketState, UserPosition};

pub struct PredictionMarketContract {
    state: PredictionMarketState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(PredictionMarketContract);

impl WithContractAbi for PredictionMarketContract {
    type Abi = PredictionMarketAbi;
}

impl Contract for PredictionMarketContract {
    type Message = ();
    type InstantiationArgument = ();
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = PredictionMarketState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        PredictionMarketContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: ()) {
        self.runtime.application_parameters();
        self.state.next_market_id.set(1);
    }

    async fn execute_operation(&mut self, operation: Operation) -> OperationResponse {
        match operation {
            Operation::CreateMarket {
                question,
                category,
                end_time,
            } => {
                let market_id = self.create_market(question, category, end_time).await;
                OperationResponse::MarketCreated(market_id)
            }

            Operation::PlaceBet {
                market_id,
                outcome,
                amount,
            } => {
                self.place_bet(market_id, outcome, amount).await;
                OperationResponse::BetPlaced
            }

            Operation::ResolveMarket {
                market_id,
                outcome,
            } => {
                self.resolve_market(market_id, outcome).await;
                OperationResponse::MarketResolved
            }

            Operation::ClaimWinnings { market_id } => {
                let payout = self.claim_winnings(market_id).await;
                OperationResponse::WinningsClaimed(payout)
            }
        }
    }

    async fn execute_message(&mut self, _message: ()) {
        panic!("Prediction Market application doesn't support cross-chain messages yet");
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl PredictionMarketContract {
    async fn create_market(
        &mut self,
        question: String,
        category: String,
        end_time: Timestamp,
    ) -> u64 {
        let market_id = *self.state.next_market_id.get();
        let creator = self.runtime.authenticated_signer().expect("Missing signer");

        let market = Market {
            id: market_id,
            question,
            category,
            end_time,
            yes_pool: 0,
            no_pool: 0,
            total_yes_shares: 0,
            total_no_shares: 0,
            status: MarketStatus::Active,
            winning_outcome: None,
            creator,
            created_at: self.runtime.system_time(),
        };

        self.state
            .markets
            .insert(&market_id, market)
            .expect("Failed to insert market");
        self.state.next_market_id.set(market_id + 1);

        market_id
    }

    async fn place_bet(&mut self, market_id: u64, outcome: Outcome, amount: u64) {
        let user = self.runtime.authenticated_signer().expect("Missing signer");

        // Get market
        let mut market = self
            .state
            .markets
            .get(&market_id)
            .await
            .expect("Failed to get market")
            .expect("Market not found");

        // Verify market is active
        assert_eq!(market.status, MarketStatus::Active, "Market not active");

        // Update pools
        match outcome {
            Outcome::Yes => {
                market.yes_pool += amount;
                market.total_yes_shares += amount;
            }
            Outcome::No => {
                market.no_pool += amount;
                market.total_no_shares += amount;
            }
        }

        // Save updated market
        self.state
            .markets
            .insert(&market_id, market)
            .expect("Failed to update market");

        // Update user position
        let position_key = (market_id, user);
        let mut position = self
            .state
            .positions
            .get(&position_key)
            .await
            .expect("Failed to get position")
            .unwrap_or(UserPosition {
                market_id,
                user,
                yes_shares: 0,
                no_shares: 0,
                yes_amount: 0,
                no_amount: 0,
                claimed: false,
            });

        match outcome {
            Outcome::Yes => {
                position.yes_shares += amount;
                position.yes_amount += amount;
            }
            Outcome::No => {
                position.no_shares += amount;
                position.no_amount += amount;
            }
        }

        self.state
            .positions
            .insert(&position_key, position)
            .expect("Failed to update position");
    }

    async fn resolve_market(&mut self, market_id: u64, outcome: Outcome) {
        let mut market = self
            .state
            .markets
            .get(&market_id)
            .await
            .expect("Failed to get market")
            .expect("Market not found");

        // Lock market first
        market.status = MarketStatus::Locked;
        market.winning_outcome = Some(outcome);

        // Then resolve
        market.status = MarketStatus::Resolved;

        self.state
            .markets
            .insert(&market_id, market)
            .expect("Failed to update market");
    }

    async fn claim_winnings(&mut self, market_id: u64) -> u64 {
        let user = self.runtime.authenticated_signer().expect("Missing signer");

        let market = self
            .state
            .markets
            .get(&market_id)
            .await
            .expect("Failed to get market")
            .expect("Market not found");

        assert_eq!(market.status, MarketStatus::Resolved, "Market not resolved");

        let position_key = (market_id, user);
        let mut position = self
            .state
            .positions
            .get(&position_key)
            .await
            .expect("Failed to get position")
            .expect("No position found");

        assert!(!position.claimed, "Already claimed");

        // Calculate payout
        let payout = match market.winning_outcome {
            Some(Outcome::Yes) => {
                if position.yes_shares > 0 {
                    let total_pool = market.yes_pool + market.no_pool;
                    (total_pool * position.yes_shares) / market.total_yes_shares
                } else {
                    0
                }
            }
            Some(Outcome::No) => {
                if position.no_shares > 0 {
                    let total_pool = market.yes_pool + market.no_pool;
                    (total_pool * position.no_shares) / market.total_no_shares
                } else {
                    0
                }
            }
            None => 0,
        };

        position.claimed = true;
        self.state
            .positions
            .insert(&position_key, position)
            .expect("Failed to update position");

        payout
    }
}
