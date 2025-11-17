# 🔮 Oracle Service - Auto Market Creation

## Overview

Automated oracle service that creates prediction markets every 30 seconds for demo purposes.

---

## ✅ Features

**Automatic Market Creation**:
- Creates new markets every 30 seconds
- Random selection from 10 market templates
- Covers Sports & Crypto categories
- Realistic end times (24h to 365 days)

**Market Templates**:
1. Bitcoin $110k prediction
2. Ethereum $6k prediction
3. Real Madrid match outcome
4. Lakers NBA playoffs
5. Solana $250 prediction
6. Manchester United vs Chelsea
7. Dogecoin $1 prediction
8. Barcelona La Liga win
9. Cardano $2 prediction
10. Patriots Super Bowl win

---

## 🏗️ Architecture

```
Oracle Service (Go)
    ↓ Every 30 seconds
Random Template Selection
    ↓ Create Market
In-Memory Storage
    ↓ REST API
Frontend Display
```

---

## 📁 Files

**Backend**:
- `backend/internal/oracle/oracle.go` - Oracle service implementation
- `backend/cmd/server/main.go` - Integration with backend

**Key Functions**:
- `NewOracle()` - Initialize oracle
- `Start()` - Begin auto-creation (30s interval)
- `Stop()` - Graceful shutdown
- `createRandomMarket()` - Market creation logic

---

## 🚀 Usage

**Automatic Start**:
```bash
cd backend
go run cmd/server/main.go
```

**Output**:
```
🔮 Oracle service started - Auto-creating markets every 30 seconds
🚀 Backend API running on http://localhost:3001
📊 Markets: 6
💰 User balance: 1000 tokens
🎯 Oracle created new market #7: Will Lakers make it to NBA playoffs?
🎯 Oracle created new market #8: Will Bitcoin reach $110,000 by end of month?
...
```

---

## ⚙️ Configuration

**Interval**: 30 seconds (configurable in `oracle.go`)
```go
o.ticker = time.NewTicker(30 * time.Second)
```

**To Change Interval**:
```go
// 1 minute
o.ticker = time.NewTicker(1 * time.Minute)

// 5 minutes
o.ticker = time.NewTicker(5 * time.Minute)
```

---

## 🎯 Market Properties

**Each Market Has**:
- Unique ID (auto-increment)
- Question from template
- Category (Sports/Crypto)
- Status: "Active"
- End time (24h to 365 days)
- Initial pools: 0
- Created timestamp

**Example Market**:
```json
{
  "id": 7,
  "question": "Will Lakers make it to NBA playoffs?",
  "category": "Sports",
  "status": "Active",
  "endTime": "2026-02-15T12:56:09Z",
  "yesPool": 0,
  "noPool": 0,
  "createdAt": "2025-11-17T12:56:09Z"
}
```

---

## 🔄 Lifecycle

1. **Start**: Oracle initializes with 30s ticker
2. **Tick**: Every 30 seconds, oracle triggers
3. **Create**: Random template selected
4. **Store**: Market added to storage
5. **Log**: Creation logged to console
6. **Repeat**: Process continues until shutdown

**Graceful Shutdown**:
- Ctrl+C triggers shutdown
- Oracle stops ticker
- Clean exit

---

## 📊 Testing

**Check Markets**:
```bash
# Get market count
curl http://localhost:3001/api/markets | jq 'length'

# Get latest market
curl http://localhost:3001/api/markets | jq '.[-1]'
```

**Watch Oracle**:
```bash
# Follow logs
tail -f backend/backend.log | grep Oracle
```

**Expected Output**:
```
🔮 Oracle service started
🎯 Oracle created new market #7: ...
🎯 Oracle created new market #8: ...
```

---

## 🎨 Frontend Integration

**Automatic Updates**:
- Markets appear in UI automatically
- No manual creation needed
- Real-time polling shows new markets
- Users can bet on any market

**User Experience**:
1. Open app
2. See existing + new markets
3. Markets grow over time
4. Always fresh content

---

## 🚀 Production Considerations

**For Production**:
1. **Longer Intervals**: 1 hour instead of 30s
2. **External Data**: Connect to real APIs
3. **Validation**: Check if market already exists
4. **Rate Limiting**: Prevent spam
5. **Database**: Persist to real DB

**Example Production Config**:
```go
// Production oracle
o.ticker = time.NewTicker(1 * time.Hour)

// Check external API
data := fetchSportsData()
if shouldCreateMarket(data) {
    createMarket(data)
}
```

---

## 💡 Future Enhancements

**Phase 2**:
- [ ] Connect to real sports APIs (TheSportsDB)
- [ ] Connect to crypto price APIs (CoinGecko)
- [ ] Automatic market resolution
- [ ] Smart scheduling (before events)

**Phase 3**:
- [ ] AI-powered market suggestions
- [ ] User-requested markets
- [ ] Dynamic pricing based on demand
- [ ] Multi-outcome markets

---

## ✅ Current Status

**Working**:
- ✅ Auto-creation every 30 seconds
- ✅ 10 diverse market templates
- ✅ Random selection
- ✅ Proper market structure
- ✅ Graceful shutdown
- ✅ Logging

**Demo Ready**:
- ✅ Shows continuous growth
- ✅ Realistic market variety
- ✅ No manual intervention needed

---

**Built for Predictum - Linera Buildathon** 🚀

