# Predictum

> **⚡ Bet Fast. Settle Instantly. Win Real-Time.**

## What it does

Predictum is a real-time prediction market platform where users can:

- Browse live markets (Sports, Crypto, Binary events) with dynamic odds sorted by end time
- Place YES/NO bets with instant confirmation and real-time payout preview
- Track all active positions with profit/loss calculations in a dedicated dashboard
- Claim winnings automatically after markets resolve
- Connect via email, MetaMask, or Google (Privy wallet integration)

The platform features:
- **Automated Oracle**: Creates new markets every 30 seconds from 35+ realistic templates
- **Auto-Resolution**: Resolves expired markets every 5 minutes with random outcomes (demo)
- **PostgreSQL Persistence**: All bets and markets are stored in a relational database
- **Hybrid Architecture**: PostgreSQL for fast reads, optional Linera sync for on-chain verification
- **AMM Algorithm**: Dynamic odds calculation based on betting pool ratios

## The problem it solves

Traditional prediction markets on Ethereum are too slow for live betting:
- Bets take 12-15 seconds to confirm
- Odds lag behind actual betting activity
- Gas fees spike to $50-100+ during peak events
- Network congestion makes live betting impossible

Linera's microchain architecture solves this:
- **Instant finality** - Bets confirm in milliseconds
- **Real-time odds** - Updates with every transaction
- **No congestion** - Each market can run on its own microchain
- **Consistent fees** - No gas price spikes

This enables new use cases: live in-play betting, micro-markets resolving in minutes, and high-frequency prediction trading.

## Challenges I ran into

**WASM Compatibility & Rust Toolchain**
- Encountered "Unknown opcode 252" error when deploying to Linera testnet
- Root cause: Rust version mismatch (1.90.0 vs Linera's 1.86.0)
- Solution: Matched exact toolchain from `rust-toolchain.toml` (1.86.0) and fixed instantiation argument type
- Result: Successful deployment on first try after fixes!

**Cow<T> Type Handling in Linera SDK**
- Spent 40+ build attempts debugging `MapView` return types
- Error: "no method named `into_owned` found for struct `Market`"
- Root cause: Linera's `MapView` returns `Cow<T>` (Copy-on-Write), compiler couldn't infer type
- Solution: Used `std::borrow::Borrow` trait to convert `Cow<T>` to `&T` references
- Learning: Studied Linera official examples (non-fungible, crowd-funding) to find correct pattern
- Result: Full contract compiled and deployed successfully!

**AMM Algorithm Design**
- Traditional constant-product formulas don't work for binary outcomes
- Needed to ensure all winnings go to winners proportionally
- Solution: Pool-ratio system where `odds = pool_size / total_pool` and `payout = total_pool × user_share`

**Real-Time State Synchronization**
- Keeping frontend synced with backend without WebSockets
- Solution: Polling every 2 seconds for balance, refetch after mutations
- Future: Will use GraphQL subscriptions to Linera event stream

## Technologies I used

**Frontend:**
- React 19 + TypeScript
- Vite 7
- TailwindCSS 3
- React Router 6
- Privy (wallet auth: Email, MetaMask, Google)
- React Hot Toast (notifications)
- Canvas Confetti (animations)

**Backend:**
- Go 1.21+
- PostgreSQL 15 (persistent storage)
- Gorilla Mux (REST API)
- CORS middleware
- Automated Oracle Service (market creation & resolution)
- Hybrid sync to Linera contract (optional)

**Linera Integration:**
- Linera Protocol (Testnet Conway)
- Linera SDK 0.15.6
- Linera CLI (wallet initialized)
- Rust 1.86.0 (matching Linera's toolchain)
- Chain ID: `10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0`
- **✅ Full Contract Application ID**: `3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76`
- Rust smart contract with full prediction market logic (compiled to WASM)
- Bytecode deployed to testnet:
  - Contract: `a090d18202245af7826cceb55aec76b309c557b6b13700473b484f70f0575d60`
  - Service: `5ace2f7763e4d3af6d2a83d160bebcb7e7309e4c22acc1e5b132fe600c6da1b5`

**DevOps:**
- Docker & Docker Compose (PostgreSQL + Backend + Frontend)
- Multi-stage builds
- Health checks & monitoring
- Database migrations on startup

## How we built it

**Planning & Architecture**
- Researched Linera's microchain capabilities and designed three-tier architecture
- Created detailed specifications for smart contract, oracle, and frontend

**Frontend Development**
- Built React app with TypeScript and TailwindCSS
- Created 3 main pages: market listing, betting interface, and position tracking
- Implemented AMM algorithm for odds calculation and payout preview
- Added sorting options: newest, ending soon, popular, alphabetical (default: ending soon)

**Backend & Database**
- Developed Go REST API with 8 endpoints
- Implemented PostgreSQL storage layer with 3 tables: markets, positions, balance
- Created database schema with indexes for performance
- Automatic initialization of 6 default markets on first run

**Oracle Service**
- Built automated oracle that creates markets every 30 seconds from 35+ templates
- Implemented auto-resolution service that resolves expired markets every 5 minutes
- Randomized initial pool sizes (500-4500 tokens) for realistic market conditions
- Varied market durations from 1 hour to 6 months

**Linera Integration**
- Created GraphQL client wrapper for Linera contract operations
- Implemented hybrid architecture: PostgreSQL for reads, Linera for on-chain verification
- Async best-effort sync of bets, resolutions, and market creation to Linera
- Graceful fallback when Linera service is unavailable

**Integration & Auth**
- Connected frontend to backend with real-time polling
- Integrated Privy for multi-provider wallet authentication
- Added balance management and transaction flow

**Testing & Documentation**
- End-to-end testing of complete betting flow with PostgreSQL
- Verified backend compilation and database schema
- Created comprehensive documentation and demo guides

## What we learned

**Linera's Unique Value**
- Microchains enable instant finality (milliseconds vs 12+ seconds on Ethereum)
- Each market can run independently = no congestion during peak events
- Perfect architecture for real-time applications

**AMM Design for Binary Markets**
- Simple pool-ratio formula works better than complex bonding curves
- Transparency is key - users need to understand the math
- Test edge cases thoroughly (small bets, large bets, imbalanced pools)

**Go for Blockchain Infrastructure**
- Fast compilation and single binary deployment
- Strong type safety catches bugs early
- Built-in concurrency with goroutines
- Ideal for backend services and oracles

**MVP Development Strategy**
- Start with UI and mock data first
- Add complexity incrementally (mock → API → wallet → contract)
- Document as you build, not after
- Use stable versions for hackathons

## What's next for Predictum

**Smart Contract Integration**
- Deploy Rust contract to Linera testnet with full betting logic
- Connect frontend via GraphQL for real-time on-chain updates
- Build Go oracle service with automated market resolution

**Enhanced Features**
- Multi-outcome markets beyond binary YES/NO
- Liquidity provider mechanics with fee rewards
- Social features: profiles, leaderboards, and market discussions
- Mobile-optimized PWA with push notifications

**Advanced Capabilities**
- AI-powered liquidity bots and automated market creation
- Cross-chain bridges for broader asset support
- DAO governance for community-driven decisions
- Institutional-grade API for high-frequency traders

**Vision:** Build the fastest prediction market protocol in Web3, enabling live sports betting and high-frequency trading impossible on traditional blockchains.

---

## 🚀 Try It

### Option 1: Full UI Demo (Mock Data)

```bash
# Terminal 1 - Backend
cd backend && go run cmd/server/main.go

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev

# Open http://localhost:5173
```

**Demo:** Connect wallet → Browse markets → Bet 100 tokens → Track in "My Bets" → Claim winnings

### Option 2: Query On-Chain Data (Testnet Conway)

```bash
# Start Linera GraphQL service
linera service --port 8080

# Open GraphiQL IDE
open http://localhost:8080

# Query markets from deployed contract
curl -X POST "http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ marketCount }"}'
```

**Status**: ✅ Contract deployed, GraphQL queries working, operations require integration layer (see `CONTRACT_TESTING_STATUS.md`)

---

**Built for:** Linera Buildathon  
**Status:** Functional MVP  
**Time:** 16 hours over 2 days  
**Code:** 3,500+ lines
