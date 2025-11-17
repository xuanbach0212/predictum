# Linera Microservice

Rust microservice that handles Linera blockchain operations for the Predictum prediction market.

## Architecture

```
Go Backend (port 3001)
    ↓ HTTP POST
Rust Microservice (port 8081)
    ↓ Linera SDK
Linera Testnet Conway
```

## Endpoints

### Health Check
```bash
GET /health
Response: {"status": "healthy", "service": "linera-service", "version": "0.1.0"}
```

### Create Market
```bash
POST /linera/create-market
Content-Type: application/json

{
  "question": "Will Bitcoin reach $100,000?",
  "category": "Crypto",
  "end_time": 1735689599000000
}
```

### Place Bet
```bash
POST /linera/place-bet
Content-Type: application/json

{
  "market_id": 1,
  "outcome": "Yes",
  "amount": 100
}
```

### Resolve Market
```bash
POST /linera/resolve-market
Content-Type: application/json

{
  "market_id": 1,
  "outcome": "Yes"
}
```

## Environment Variables

- `PORT`: Service port (default: 8081)
- `LINERA_CHAIN_ID`: Linera chain ID (default: testnet chain)
- `LINERA_APP_ID`: Application ID (default: deployed contract)
- `RUST_LOG`: Log level (default: info)

## Build & Run

```bash
# Build
cargo build --release

# Run
RUST_LOG=info cargo run

# Or with custom port
PORT=8082 RUST_LOG=debug cargo run
```

## Development

```bash
# Check code
cargo check

# Run tests
cargo test

# Format code
cargo fmt

# Lint
cargo clippy
```

## TODO: Full Linera SDK Integration

Currently using placeholder implementation. To enable full Linera integration:

1. Add proper Linera SDK dependencies
2. Implement wallet/keychain loading
3. Implement operation signing
4. Implement chain client initialization
5. Handle transaction confirmation

See `src/linera_client.rs` for implementation details.

