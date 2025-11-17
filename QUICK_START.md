# 🚀 Predictum - Quick Start Guide

> **⚡ Bet Fast. Settle Instantly. Win Real-Time.**

## Run Demo in 2 Minutes

### Step 1: Start Backend
```bash
cd backend
go run cmd/server/main.go
```

Output:
```
🚀 Backend API running on http://localhost:3001
📊 Markets: 6
💰 User balance: 1000 tokens
```

### Step 2: Start Frontend
```bash
# New terminal
cd frontend
npm run dev
```

Output:
```
➜  Local:   http://localhost:5173/
```

### Step 3: Open Browser
Navigate to: **http://localhost:5173**

## 🎮 Demo Flow

### 1. Connect Wallet (30 seconds)
- Click "Connect Wallet" button
- Choose login method:
  - **Email**: Enter email → Check inbox → Click link
  - **Wallet**: Connect MetaMask
  - **Google**: Login with Google

### 2. Browse Markets (30 seconds)
- See 6 markets with live odds
- Filter by Status or Category
- Click any market to view details

### 3. Place Bet (1 minute)
- Click "Place Bet" button
- Choose YES or NO
- Enter amount (e.g., 100 tokens)
- See potential payout preview
- Click "Confirm Bet"
- ✅ Watch odds update & balance decrease!

### 4. Track Positions (30 seconds)
- Click "My Bets" in navigation
- See all your positions
- View total invested

### 5. Claim Winnings (30 seconds)
- Find resolved market (Market #6 - Solana)
- Click "Claim Winnings"
- ✅ Balance increases!

## 🎯 What to Show

### Key Features
1. **Real-time odds** - Change after each bet
2. **Balance tracking** - Updates instantly
3. **Multiple markets** - Sports & Crypto
4. **Wallet integration** - Privy with multiple options
5. **Position tracking** - See all bets
6. **Claim winnings** - Working payout system

### Technical Highlights
1. **Go Backend** - Clean architecture, thread-safe
2. **AMM Algorithm** - Dynamic odds calculation
3. **React Frontend** - TypeScript, responsive
4. **API Design** - RESTful, well-structured

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Kill any process on port 3001
lsof -ti:3001 | xargs kill -9

# Try again
cd backend-go && go run cmd/server/main.go
```

### Frontend errors?
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Can't connect wallet?
- Use email login (easiest)
- Check browser console for errors
- Try different browser

## 📝 Test Scenarios

### Scenario 1: Basic Betting
1. Start with 1000 tokens
2. Bet 100 on Bitcoin YES
3. Check odds changed
4. Balance now 900

### Scenario 2: Multiple Bets
1. Bet on 3 different markets
2. Go to "My Bets"
3. See all 3 positions

### Scenario 3: Claim Winnings
1. Go to "My Bets"
2. Find Solana market (resolved)
3. Claim winnings
4. Balance increases

## 🎬 For Video Demo

### Script (3 minutes)
1. **Intro** (15s): "Linera Prediction Market - Real-time betting"
2. **Connect** (20s): Show Privy wallet options
3. **Browse** (20s): Show markets, filters
4. **Bet** (45s): Place bet, show odds change
5. **Track** (30s): My Bets page
6. **Claim** (30s): Claim winnings
7. **Tech** (20s): Show code, explain AMM

### Key Points to Mention
- Built for Linera Buildathon
- Real-time odds with AMM algorithm
- Go backend for performance
- Privy for easy wallet access
- Ready for Linera blockchain integration

## 📊 Demo Data

### Markets Available
1. Man United vs Arsenal (Active)
2. Bitcoin $100k (Active)
3. Lakers Championship (Active)
4. Ethereum $5k (Active)
5. Real Madrid Final (Locked)
6. Solana $200 (Resolved - can claim!)

### Starting Balance
- 1000 tokens

### Pre-existing Positions
- 50 tokens on Man United YES
- 100 tokens on Bitcoin YES
- 80 tokens on Solana NO (can claim!)

## ✅ Checklist Before Demo

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Browser open to http://localhost:5173
- [ ] Wallet ready to connect
- [ ] Know which market to bet on
- [ ] Understand AMM algorithm basics

## 🎉 Success Criteria

Demo is successful if you can:
- ✅ Connect wallet
- ✅ Place a bet
- ✅ See odds change
- ✅ See balance update
- ✅ View positions in "My Bets"
- ✅ Claim winnings from resolved market

---

**Ready to demo! 🚀**

Total time: ~2 minutes setup, ~3 minutes demo

