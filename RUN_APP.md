# 🚀 How to Run Predictum

## Quick Start (2 Commands)

### Terminal 1 - Backend (Go)
```bash
cd backend
go run cmd/server/main.go
```

**Expected Output:**
```
🚀 Backend API running on http://localhost:3001
📊 Markets: 6
💰 User balance: 1000 tokens
```

### Terminal 2 - Frontend (React)
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
ROLLDOWN-VITE v7.1.14 ready in 145 ms
➜  Local:   http://localhost:5173/
```

---

## Open in Browser

**URL**: http://localhost:5173

---

## Demo Flow

1. **Connect Wallet**
   - Click "Connect Wallet" button in header
   - Choose: Email, MetaMask, or Google
   - You'll get 1000 tokens to start

2. **Browse Markets**
   - See 6 markets on home page
   - Filter by Sports or Crypto
   - Check real-time odds

3. **Place a Bet**
   - Click on any market
   - Choose YES or NO
   - Enter amount (try 100 tokens)
   - See potential payout
   - Click "Place Bet"

4. **Track Your Bets**
   - Go to "My Bets" page
   - See all active positions
   - Check profit/loss

5. **Claim Winnings** (for resolved markets)
   - Find resolved markets (Market #6: Solana)
   - Click "Claim Winnings"
   - Balance updates instantly

---

## Available Markets

1. **Man United vs Arsenal** (Sports) - Active
2. **Bitcoin $100k** (Crypto) - Active
3. **Lakers Championship** (Sports) - Active
4. **Ethereum $5k** (Crypto) - Active
5. **Real Madrid Champions League** (Sports) - Locked
6. **Solana $200** (Crypto) - Resolved ✅ (Can claim!)

---

## Troubleshooting

### Port Already in Use

**Backend (3001):**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Then restart
cd backend && go run cmd/server/main.go
```

**Frontend (5173):**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Then restart
cd frontend && npm run dev
```

### Backend Not Starting

```bash
# Make sure you're in the right directory
cd backend

# Check if Go is installed
go version

# Download dependencies
go mod download

# Run
go run cmd/server/main.go
```

### Frontend Not Starting

```bash
# Make sure you're in the right directory
cd frontend

# Install dependencies
npm install

# Run
npm run dev
```

### Wallet Not Connecting

- Check if you have internet connection (Privy needs online)
- Try different login method (Email vs MetaMask vs Google)
- Clear browser cache and reload

---

## API Endpoints (for testing)

```bash
# Get all markets
curl http://localhost:3001/api/markets

# Get user balance
curl http://localhost:3001/api/balance

# Get user positions
curl http://localhost:3001/api/positions

# Place a bet
curl -X POST http://localhost:3001/api/bet \
  -H "Content-Type: application/json" \
  -d '{"marketId":1,"outcome":"Yes","amount":100}'

# Resolve a market (admin)
curl -X POST http://localhost:3001/api/resolve/1 \
  -H "Content-Type: application/json" \
  -d '{"outcome":"Yes"}'

# Claim winnings
curl -X POST http://localhost:3001/api/claim/6
```

---

## Stop the App

**Stop Backend:**
- Press `Ctrl + C` in Terminal 1

**Stop Frontend:**
- Press `Ctrl + C` in Terminal 2

---

## Development Mode

Both backend and frontend run in development mode with:
- **Hot reload** - Changes reflect automatically
- **Debug logs** - See all requests/responses
- **No build needed** - Just save and refresh

---

## Need Help?

- Check `QUICK_START.md` for detailed setup
- Check `SUBMISSION.md` for full documentation
- Check `MILESTONES.md` for roadmap

