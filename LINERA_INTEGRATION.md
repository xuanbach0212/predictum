# Linera Testnet Integration Status

## 🔗 Current Status: **HYBRID MODE**

### ✅ What's Deployed on Linera Testnet Conway:

- **Chain ID**: `10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0`
- **Application ID**: `3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76`
- **Contract Bytecode**: `a090d18202245af7826cceb55aec76b309c557b6b13700473b484f70f0575d60`
- **Service Bytecode**: `5ace2f7763e4d3af6d2a83d160bebcb7e7309e4c22acc1e5b132fe600c6da1b5`

### 🏗️ Smart Contract Capabilities:

The deployed contract supports:
- ✅ `CreateMarket` - Create new prediction markets
- ✅ `PlaceBet` - Place bets on markets
- ✅ `ResolveMarket` - Resolve markets with outcomes
- ✅ `ClaimWinnings` - Claim winnings from resolved markets
- ✅ GraphQL queries for market data

## 📊 Current Architecture:

```
Frontend (React)
    ↓ REST API
Go Backend
    ↓                    ↓
PostgreSQL          Linera Contract
(PRIMARY)           (OPTIONAL SYNC)
```

### How It Works:

1. **Read Operations** (GET /api/markets, /api/balance):
   - ✅ Read from PostgreSQL (fast, no blockchain)
   - ❌ NOT reading from Linera contract

2. **Write Operations** (POST /api/bet, POST /api/claim):
   - ✅ Write to PostgreSQL (immediate)
   - ⚠️ **Optionally** sync to Linera contract (if enabled)

## 🔧 How to Enable Linera Integration:

### Step 1: Start Linera Service

```bash
# In a separate terminal
linera service --port 8080
```

### Step 2: Restart Backend with Linera Enabled

```bash
cd backend
LINERA_ENABLED=true \
LINERA_ENDPOINT=http://localhost:8080 \
DATABASE_URL=postgres://root:root@localhost:5432/predictum \
go run cmd/server/main.go
```

### Step 3: Verify Integration

Backend will log:
```
🔗 Linera integration enabled: http://localhost:8080
✅ Linera service is healthy
```

When you place a bet, you'll see:
```
✅ Synced bet to Linera: market #1, Yes, 100 tokens
```

## 📝 What Happens When Linera is Enabled:

### Place Bet Flow:
1. User places bet via frontend
2. Backend saves to PostgreSQL ✅ (instant)
3. Backend syncs to Linera contract 🔄 (async, background)
4. If Linera sync fails, bet still succeeds (PostgreSQL is source of truth)

### Benefits:
- ✅ Fast response (PostgreSQL)
- ✅ On-chain verification (Linera)
- ✅ Graceful fallback (if Linera unavailable)

## ⚠️ Current Limitations:

1. **Linera Disabled by Default**
   - Reason: Requires `linera service` to be running
   - Impact: Bets are NOT on-chain by default

2. **PostgreSQL is Primary**
   - Linera is optional verification layer
   - All data persists in PostgreSQL

3. **No Real-time Sync from Contract**
   - Frontend reads from PostgreSQL, not Linera
   - Future: Could query Linera GraphQL directly

## 🎯 To Make Bets Interact with Testnet:

### Option A: Enable Backend Sync (Recommended for Demo)

```bash
# Terminal 1: Start Linera service
linera service --port 8080

# Terminal 2: Start backend with Linera enabled
cd backend
LINERA_ENABLED=true go run cmd/server/main.go
```

### Option B: Direct Frontend Integration (Future)

Update frontend to:
1. Query markets from Linera GraphQL
2. Submit bets directly to contract
3. Use Linera SDK for wallet integration

## 📊 Verification:

### Check if Linera Integration is Active:

```bash
# Check backend logs
tail -f backend/backend_new.log | grep Linera

# Should see:
# 🔗 Linera integration enabled: http://localhost:8080
# ✅ Linera service is healthy
```

### Query Contract Directly:

```bash
curl -X POST http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76 \
  -H "Content-Type: application/json" \
  -d '{"query": "{ marketCount }"}'
```

## 🚀 Summary:

| Feature | Current Status | Testnet Interaction |
|---------|---------------|-------------------|
| Smart Contract | ✅ Deployed | On Testnet Conway |
| GraphQL Client | ✅ Implemented | Can query/mutate |
| Backend Sync | ⚠️ Disabled by default | Enable with env var |
| Frontend Reads | ❌ From PostgreSQL | Not from contract |
| Bet Writes | ⚠️ PostgreSQL only | Can sync if enabled |

**To enable full testnet interaction**: Set `LINERA_ENABLED=true` and start `linera service`

