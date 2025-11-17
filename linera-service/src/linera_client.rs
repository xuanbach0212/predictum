use anyhow::{Context, Result};
use std::env;
use std::path::PathBuf;
use std::process::Command;
use std::fs;

// Real Linera client using CLI for operations
pub struct LineraClient {
    chain_id: String,
    app_id: String,
    mock_mode: bool,
    wallet_path: Option<PathBuf>,
}

impl LineraClient {
    pub async fn new() -> Result<Self> {
        let chain_id = env::var("LINERA_CHAIN_ID")
            .unwrap_or_else(|_| "10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0".to_string());
        
        let app_id = env::var("LINERA_APP_ID")
            .unwrap_or_else(|_| "3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76".to_string());
        
        log::info!("Initializing Linera client for chain: {}", chain_id);
        log::info!("Application ID: {}", app_id);
        
        // Try to find wallet path
        let wallet_path = Self::find_wallet_path();
        if let Some(ref path) = wallet_path {
            log::info!("Found wallet at: {:?}", path);
        } else {
            log::warn!("No wallet found, will use mock mode");
        }
        
        Ok(Self {
            chain_id,
            app_id,
            mock_mode: wallet_path.is_none(),
            wallet_path,
        })
    }
    
    fn find_wallet_path() -> Option<PathBuf> {
        // Try common wallet locations
        let home = dirs::home_dir()?;
        
        let candidates = vec![
            home.join(".config/linera/wallet.json"),
            home.join("Library/Application Support/linera/wallet.json"),
        ];
        
        for path in candidates {
            if path.exists() {
                return Some(path);
            }
        }
        
        None
    }
    
    pub fn mock() -> Self {
        log::warn!("Creating mock Linera client");
        Self {
            chain_id: String::new(),
            app_id: String::new(),
            mock_mode: true,
            wallet_path: None,
        }
    }
    
    pub async fn create_market(
        &self,
        question: &str,
        category: &str,
        end_time: u64,
    ) -> Result<()> {
        if self.mock_mode {
            log::warn!("Mock mode: Simulating market creation");
            return Ok(());
        }
        
        log::info!("Creating market on Linera testnet:");
        log::info!("  Question: {}", question);
        log::info!("  Category: {}", category);
        log::info!("  End time: {}", end_time);
        
        // TODO: Implement actual Linera SDK call
        // For now, this is a placeholder that would need to:
        // 1. Load wallet/keychain
        // 2. Create operation
        // 3. Submit to chain
        // 4. Wait for confirmation
        
        // Placeholder implementation
        self.submit_operation("CreateMarket", &serde_json::json!({
            "question": question,
            "category": category,
            "end_time": end_time,
        })).await?;
        
        Ok(())
    }
    
    pub async fn place_bet(
        &self,
        market_id: u64,
        outcome: &str,
        amount: u64,
    ) -> Result<()> {
        if self.mock_mode {
            log::warn!("Mock mode: Simulating bet placement");
            return Ok(());
        }
        
        log::info!("Placing bet on Linera testnet:");
        log::info!("  Market ID: {}", market_id);
        log::info!("  Outcome: {}", outcome);
        log::info!("  Amount: {}", amount);
        
        // TODO: Implement actual Linera SDK call
        self.submit_operation("PlaceBet", &serde_json::json!({
            "market_id": market_id,
            "outcome": outcome,
            "amount": amount,
        })).await?;
        
        Ok(())
    }
    
    pub async fn resolve_market(
        &self,
        market_id: u64,
        outcome: &str,
    ) -> Result<()> {
        if self.mock_mode {
            log::warn!("Mock mode: Simulating market resolution");
            return Ok(());
        }
        
        log::info!("Resolving market on Linera testnet:");
        log::info!("  Market ID: {}", market_id);
        log::info!("  Outcome: {}", outcome);
        
        // TODO: Implement actual Linera SDK call
        self.submit_operation("ResolveMarket", &serde_json::json!({
            "market_id": market_id,
            "outcome": outcome,
        })).await?;
        
        Ok(())
    }
    
    async fn submit_operation(
        &self,
        operation_type: &str,
        params: &serde_json::Value,
    ) -> Result<()> {
        log::info!("Submitting operation: {} with params: {}", operation_type, params);
        
        if self.mock_mode {
            log::warn!("Mock mode: Would submit to chain: {}", self.chain_id);
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
            return Ok(());
        }
        
        // Create GraphQL mutation to submit operation
        let operation = serde_json::json!({
            operation_type: params
        });
        
        let mutation = format!(
            r#"mutation {{ execute(operation: {}) }}"#,
            serde_json::to_string(&operation)?
        );
        
        log::info!("📝 GraphQL mutation created");
        log::info!("🔗 Submitting to chain: {}", self.chain_id);
        log::info!("📱 Application: {}", self.app_id);
        
        // Submit via GraphQL to Linera service
        let graphql_url = format!(
            "http://localhost:8080/chains/{}/applications/{}",
            self.chain_id, self.app_id
        );
        
        let client = reqwest::Client::new();
        let response = client
            .post(&graphql_url)
            .json(&serde_json::json!({
                "query": mutation
            }))
            .send()
            .await
            .context("Failed to send GraphQL request")?;
        
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            log::error!("❌ GraphQL request failed ({}): {}", status, body);
            return Err(anyhow::anyhow!("Failed to submit operation: HTTP {}", status));
        }
        
        let result: serde_json::Value = response.json().await
            .context("Failed to parse GraphQL response")?;
        
        if let Some(errors) = result.get("errors") {
            log::error!("❌ GraphQL errors: {}", errors);
            return Err(anyhow::anyhow!("GraphQL errors: {}", errors));
        }
        
        log::info!("✅ Operation submitted successfully to blockchain!");
        log::debug!("Response: {}", result);
        
        Ok(())
    }
}

