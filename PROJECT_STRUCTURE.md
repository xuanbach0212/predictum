# Predictum - Project Structure

## Overview

Clean, production-ready structure for Linera prediction market application.

## Directory Layout

```
linera-prediction-market/
├── frontend/              # React + TypeScript UI
│   ├── src/
│   │   ├── api/          # Backend API client
│   │   ├── components/   # React components (Header, MarketCard, Skeleton)
│   │   ├── pages/        # Routes (Home, MarketDetail, MyBets)
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Calculations (AMM, odds, payouts)
│   │   └── main.tsx      # Entry point with Privy provider
│   ├── package.json      # Dependencies (React 19, Vite, TailwindCSS, Privy)
│   └── README.md
│
├── backend/               # Go REST API
│   ├── cmd/
│   │   └── server/
│   │       └── main.go   # Server entry point
│   ├── internal/
│   │   ├── models/       # Data models (Market, Position, etc.)
│   │   ├── storage/      # In-memory storage
│   │   └── handlers/     # HTTP handlers (7 endpoints)
│   ├── go.mod
│   └── README.md
│
├── contract/              # Linera Smart Contract (Rust)
│   ├── src/
│   │   ├── lib.rs        # ABI definitions
│   │   ├── state.rs      # Application state (View-based)
│   │   ├── contract.rs   # Contract trait implementation
│   │   └── service.rs    # Service trait (GraphQL)
│   ├── Cargo.toml        # Dependencies (linera-sdk 0.15)
│   ├── DEPLOYMENT_SUCCESS.md
│   └── README.md
│
├── Dockerfile             # Multi-stage Docker build
├── compose.yaml           # Docker Compose configuration
├── run.bash               # Buildathon template script
│
├── README.md              # Project overview
├── SUBMISSION.md          # Hackathon submission document
├── DEPLOYMENT_COMPLETE.md # Deployment summary
├── MILESTONES.md          # Development roadmap
├── QUICK_START.md         # Quick start guide
├── RUN_APP.md             # How to run the app
└── LICENSE
```

## Key Files

### Frontend (React + TypeScript)
- **Entry**: `frontend/src/main.tsx` - Privy provider setup
- **Routes**: `frontend/src/App.tsx` - React Router configuration
- **API**: `frontend/src/api/client.ts` - Backend integration
- **Components**: Market cards, header, skeleton loaders
- **Pages**: Home (market list), MarketDetail (betting), MyBets (positions)

### Backend (Go)
- **Server**: `backend/cmd/server/main.go` - HTTP server with CORS
- **Storage**: `backend/internal/storage/storage.go` - In-memory data
- **Handlers**: `backend/internal/handlers/handlers.go` - 7 REST endpoints
- **Models**: `backend/internal/models/models.go` - Data structures

### Smart Contract (Rust)
- **ABI**: `contract/src/lib.rs` - Operation and Query types
- **State**: `contract/src/state.rs` - RegisterView for counter
- **Contract**: `contract/src/contract.rs` - Business logic
- **Service**: `contract/src/service.rs` - GraphQL interface

## API Endpoints

### Backend REST API (Port 3001)
```
GET    /api/markets           # List all markets
GET    /api/markets/:id       # Get market details
POST   /api/markets           # Create market (admin)
POST   /api/markets/:id/resolve  # Resolve market (admin)
GET    /api/positions         # Get user positions
GET    /api/balance           # Get user balance
POST   /api/bet               # Place bet
POST   /api/claim/:marketId   # Claim winnings
```

### Linera GraphQL (Port 8080)
```
POST   /chains/{chain_id}     # GraphQL queries/mutations
GET    /                      # GraphiQL IDE
```

## Technologies

### Frontend Stack
- React 19 + TypeScript
- Vite 7 (build tool)
- TailwindCSS 3 (styling)
- React Router 6 (navigation)
- Privy (wallet auth)
- React Hot Toast (notifications)
- Canvas Confetti (animations)

### Backend Stack
- Go 1.21+
- Gorilla Mux (routing)
- CORS middleware
- In-memory storage

### Smart Contract Stack
- Rust 1.86.0 (matching Linera)
- Linera SDK 0.15.6
- async-graphql 7.0
- WASM compilation target

### DevOps
- Docker & Docker Compose
- Multi-stage builds
- Health checks

## Deployment

### Local Development
```bash
# Terminal 1 - Backend
cd backend && go run cmd/server/main.go

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Docker
```bash
# Build and run
docker compose up --build

# Or use buildathon template
./run.bash
```

### Linera Testnet
```bash
# Start GraphQL service
linera service --port 8080
```

## Configuration

### Environment Variables
- `VITE_PRIVY_APP_ID` - Privy application ID (frontend)
- `PORT` - Backend server port (default: 3001)

### Linera Wallet
- Location: `~/.config/linera/wallet.json`
- Default chain: `10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0`

## Documentation

- **README.md** - Project overview and features
- **SUBMISSION.md** - Hackathon submission (what/why/how)
- **DEPLOYMENT_COMPLETE.md** - Deployment summary and lessons learned
- **MILESTONES.md** - Development roadmap (6 waves)
- **QUICK_START.md** - Quick setup guide
- **RUN_APP.md** - Detailed run instructions
- **contract/DEPLOYMENT_SUCCESS.md** - Contract deployment details
- **contract/README.md** - Contract documentation

## Build Artifacts

### Frontend
- `frontend/dist/` - Production build (not committed)
- `frontend/node_modules/` - Dependencies (not committed)

### Backend
- `backend/server` - Compiled binary (not committed)

### Contract
- `contract/target/` - Rust build artifacts (not committed)
- `contract/target/wasm32-unknown-unknown/release/*.wasm` - WASM modules

## Git Ignored
- `node_modules/`
- `target/`
- `dist/`
- `.env`
- `*.log`
- Compiled binaries

## Next Steps

1. **Contract Enhancement**: Implement full prediction market logic
2. **Oracle Integration**: Automated market resolution
3. **Frontend-Contract**: Direct GraphQL integration
4. **Advanced Features**: Multi-outcome markets, liquidity pools
5. **Performance**: Optimize for high-frequency trading

## Support

- GitHub: [linera-prediction-market](https://github.com/yourusername/linera-prediction-market)
- Linera Discord: [community](https://discord.gg/linera)
- Documentation: [linera.dev](https://linera.dev)

