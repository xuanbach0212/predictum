use actix_web::{web, App, HttpResponse, HttpServer, middleware};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use std::env;

mod linera_client;
use linera_client::LineraClient;

#[derive(Debug, Deserialize)]
struct CreateMarketRequest {
    question: String,
    category: String,
    end_time: u64, // microseconds since epoch
}

#[derive(Debug, Deserialize)]
struct PlaceBetRequest {
    market_id: u64,
    outcome: String, // "Yes" or "No"
    amount: u64,
}

#[derive(Debug, Deserialize)]
struct ResolveMarketRequest {
    market_id: u64,
    outcome: String, // "Yes" or "No"
}

#[derive(Debug, Serialize)]
struct SuccessResponse {
    success: bool,
    message: String,
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
    success: bool,
    error: String,
}

// Health check endpoint
async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "linera-service",
        "version": "0.1.0"
    }))
}

// Create market endpoint
async fn create_market(
    req: web::Json<CreateMarketRequest>,
    client: web::Data<LineraClient>,
) -> HttpResponse {
    log::info!("Creating market: {}", req.question);
    
    match client.create_market(&req.question, &req.category, req.end_time).await {
        Ok(_) => {
            log::info!("✅ Market created successfully on Linera");
            HttpResponse::Ok().json(SuccessResponse {
                success: true,
                message: "Market created on Linera testnet".to_string(),
            })
        }
        Err(e) => {
            log::error!("❌ Failed to create market: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                success: false,
                error: format!("Failed to create market: {}", e),
            })
        }
    }
}

// Place bet endpoint
async fn place_bet(
    req: web::Json<PlaceBetRequest>,
    client: web::Data<LineraClient>,
) -> HttpResponse {
    log::info!("Placing bet: market_id={}, outcome={}, amount={}", 
        req.market_id, req.outcome, req.amount);
    
    match client.place_bet(req.market_id, &req.outcome, req.amount).await {
        Ok(_) => {
            log::info!("✅ Bet placed successfully on Linera");
            HttpResponse::Ok().json(SuccessResponse {
                success: true,
                message: "Bet placed on Linera testnet".to_string(),
            })
        }
        Err(e) => {
            log::error!("❌ Failed to place bet: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                success: false,
                error: format!("Failed to place bet: {}", e),
            })
        }
    }
}

// Resolve market endpoint
async fn resolve_market(
    req: web::Json<ResolveMarketRequest>,
    client: web::Data<LineraClient>,
) -> HttpResponse {
    log::info!("Resolving market: market_id={}, outcome={}", 
        req.market_id, req.outcome);
    
    match client.resolve_market(req.market_id, &req.outcome).await {
        Ok(_) => {
            log::info!("✅ Market resolved successfully on Linera");
            HttpResponse::Ok().json(SuccessResponse {
                success: true,
                message: "Market resolved on Linera testnet".to_string(),
            })
        }
        Err(e) => {
            log::error!("❌ Failed to resolve market: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                success: false,
                error: format!("Failed to resolve market: {}", e),
            })
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    // Get configuration from environment
    let port = env::var("PORT").unwrap_or_else(|_| "8081".to_string());
    let bind_addr = format!("127.0.0.1:{}", port);
    
    log::info!("🚀 Starting Linera microservice on {}", bind_addr);
    
    // Initialize Linera client
    let linera_client = match LineraClient::new().await {
        Ok(client) => {
            log::info!("✅ Linera client initialized successfully");
            web::Data::new(client)
        }
        Err(e) => {
            log::error!("❌ Failed to initialize Linera client: {}", e);
            log::warn!("⚠️  Service will start but operations will fail");
            web::Data::new(LineraClient::mock())
        }
    };
    
    // Start HTTP server
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);
        
        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(linera_client.clone())
            .route("/health", web::get().to(health))
            .route("/linera/create-market", web::post().to(create_market))
            .route("/linera/place-bet", web::post().to(place_bet))
            .route("/linera/resolve-market", web::post().to(resolve_market))
    })
    .bind(&bind_addr)?
    .run()
    .await
}

