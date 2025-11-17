# Predictum

> **⚡ Bet Fast. Settle Instantly. Win Real-Time.**

[![Linera](https://img.shields.io/badge/Linera-0.15.5-blue)](https://linera.dev)
[![Go](https://img.shields.io/badge/Go-1.21-00ADD8)](https://golang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://reactjs.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 📖 About

Predictum is a next-generation betting platform that leverages Linera's low-latency microchains to enable **instant market updates and real-time settlements**. Unlike traditional prediction markets that suffer from slow block times and delayed finality, our platform processes bets, updates odds, and settles positions in milliseconds.

Built for the Linera Buildathon, this MVP demonstrates how Linera's unique architecture unlocks new possibilities for on-chain markets where **speed defines the game**. Whether betting on live sports, crypto price movements, or binary events, users experience seamless interactions with immediate feedback—no waiting, no lag.

### Why It Matters
- **Instant Finality**: Bets settle in real-time, not minutes
- **Live Odds**: Market prices update with every transaction  
- **Fair & Transparent**: Automated Market Maker (AMM) ensures fair pricing
- **Ready for Scale**: Built on Linera's microchain architecture for unlimited throughput

## 🌟 Overview

A simplified version of platforms like Polymarket, focusing on sports betting and crypto price predictions. Users can create binary prediction markets, place bets, and claim winnings after automated oracle resolution.

### Key Features

- **Real-time Betting**: Instant bet placement with immediate odds updates
- **Multiple Event Types**: Sports matches, crypto prices, and custom binary events
- **Automated Oracle**: Go-based oracle service that fetches results from external APIs
- **AMM-style Odds**: Dynamic odds calculation based on pool ratios
- **Simple UI**: Clean, minimal interface for creating and participating in markets

## 🏗️ Architecture

```
┌───────────────────────────────┐
│           FRONTEND            │
│ React / Vite / TypeScript     │
│ - Browse markets (sorted)     │
│ - Place bets (YES/NO)         │
│ - Track positions             │
│ - Privy wallet integration    │
└──────────────┬────────────────┘
               │ REST API
               ▼
┌────────────────────────────────────┐
│       GO BACKEND API               │
│ - 8 REST endpoints                 │
│ - PostgreSQL storage               │
│ - Automated oracle service         │
│ - Hybrid Linera sync (optional)    │
└──────┬─────────────────────┬───────┘
       │                     │
       ▼                     ▼
┌──────────────┐    ┌─────────────────┐
│  PostgreSQL  │    │ LINERA CONTRACT │
│  Database    │    │ (Rust/WASM)     │
│ - Markets    │    │ - On-chain      │
│ - Positions  │    │   verification  │
│ - Balance    │    │ - GraphQL API   │
└──────────────┘    └─────────────────┘
       ▲
       │
┌──────────────────┐
│  Oracle Service  │
│ - Auto-create    │
│   markets (30s)  │
│ - Auto-resolve   │
│   expired (5m)   │
│ - 35+ templates  │
└──────────────────┘
```

## 📁 Project Structure

```
linera-prediction-market/
├── contract/              # Linera smart contract (Rust)
│   ├── src/
│   │   ├── lib.rs        # Contract entry point
│   │   ├── state.rs      # Market state structures
│   │   └── operations.rs # Core contract operations
│   └── Cargo.toml
│
├── oracle-service/        # Oracle service (Go)
│   ├── cmd/
│   │   └── main.go       # Service entry point
│   ├── internal/
│   │   ├── api/          # External API clients
│   │   ├── linera/       # Linera contract interaction
│   │   └── resolver/     # Market resolution logic
│   └── go.mod
│
├── frontend/              # React UI
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks for Linera
│   │   └── utils/        # Helper functions
│   └── package.json
│
└── docs/                  # Documentation
    ├── ARCHITECTURE.md    # Detailed architecture
    ├── CONTRACT_SPEC.md   # Smart contract specification
    ├── ORACLE_SPEC.md     # Oracle service specification
    └── FRONTEND_SPEC.md   # Frontend specification
```

## 🚀 Quick Start

### Prerequisites

- Rust (latest stable) with `wasm32-unknown-unknown` target
- Linera CLI tool
- Go 1.21+
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/linera-prediction-market.git
cd linera-prediction-market
```

2. **Setup Linera environment** (See [docs/SETUP.md](docs/SETUP.md))
```bash
# Install Linera CLI
cargo install linera-service linera

# Start local Linera network
linera net up

# Create wallet and microchain
linera wallet init
```

3. **Build and deploy smart contract**
```bash
cd contract
linera project build
linera project publish
```

4. **Run oracle service**
```bash
cd oracle-service
go mod download
go run cmd/main.go
```

5. **Start frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🎮 Usage

### Creating a Market

1. Navigate to "Create Market" page
2. Enter market question (e.g., "Will Team A beat Team B?")
3. Set end time for betting
4. Select category (Sports, Crypto, Binary)
5. Submit transaction

### Placing a Bet

1. Browse active markets on home page
2. Click on a market to view details
3. Choose YES or NO outcome
4. Enter bet amount
5. Review potential payout
6. Confirm transaction

### Claiming Winnings

1. Go to "My Bets" page
2. View resolved markets where you won
3. Click "Claim Winnings"
4. Receive payout to your wallet

## 🧮 Market Mechanics

### Odds Calculation

We use an AMM-style (Automated Market Maker) approach:

- **Odds** = `yes_pool / (yes_pool + no_pool)` for YES outcome
- **Shares** = Calculated based on contribution to pool
- **Payout** = `(total_winning_pool / user_shares) * user_contribution`

### Example

```
Market: "Will BTC reach $100k by Dec 31?"
YES pool: 1000 tokens
NO pool: 500 tokens

Current odds:
- YES: 66.7% (1000/1500)
- NO: 33.3% (500/1500)

User bets 100 tokens on YES:
- New YES pool: 1100 tokens
- User gets shares proportional to contribution
- If YES wins, user receives: (1600 / 1100) * 100 = ~145 tokens
```

## 🔮 Supported Event Types

### 1. Sports Events (Priority)
- Match winner predictions
- Over/under score predictions
- Player performance metrics

### 2. Crypto Price Predictions
- Price above/below threshold at specific time
- Percentage change predictions

### 3. Binary Events
- Custom yes/no questions
- Manual resolution by admin

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + Privy
- **Backend**: Go 1.21+ + PostgreSQL 15 + Gorilla Mux
- **Smart Contract**: Rust 1.86.0 on Linera (deployed to Testnet Conway)
- **Oracle Service**: Integrated in Go backend (auto-create & resolve)
- **DevOps**: Docker Compose + Health checks

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Smart Contract Specification](docs/CONTRACT_SPEC.md)
- [Oracle Service Specification](docs/ORACLE_SPEC.md)
- [Frontend Specification](docs/FRONTEND_SPEC.md)
- [Setup Guide](docs/SETUP.md)

## 🎯 Hackathon Goals

This project is built for the Linera Buildathon, focusing on:

1. **Real-time Markets**: Leveraging Linera's low-latency microchains
2. **Instant Updates**: Markets update, clear, and resolve in real time
3. **Multiple Event Types**: Supporting diverse prediction categories
4. **Automated Resolution**: Oracle-driven market resolution

## 🚧 Current Status

- [x] Project planning and architecture
- [x] Documentation and specifications
- [x] Smart contract development and deployment (Testnet Conway)
- [x] Oracle service implementation (auto-create & resolve)
- [x] Frontend development (React + TypeScript)
- [x] PostgreSQL database integration
- [x] Hybrid Linera sync architecture
- [x] Local testing with PostgreSQL
- [x] Backend compilation verified

## 🔮 Future Enhancements

- Multi-outcome markets (not just binary)
- Liquidity provider rewards
- Market creation fees
- Advanced oracle with multiple data sources
- Mobile-responsive design
- Social features (comments, market sharing)
- AI bots for automated trading

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a hackathon project, but contributions and suggestions are welcome!

## 📞 Contact

- GitHub: [yourusername]
- Twitter: [@yourhandle]
- Discord: [your-discord]

## 🙏 Acknowledgments

- Linera team for the amazing blockchain platform
- Buildathon organizers
- Open source community

---

Built with ⚡ on Linera for the Linera Buildathon
