# 🎯 Linera Blockchain Deployment Proof

## ✅ Contract Successfully Deployed

This document provides **verifiable proof** that Predictum's smart contract is deployed and operational on **Linera Testnet Conway**.

---

## 📋 Deployment Information

| Property | Value |
|----------|-------|
| **Network** | Linera Testnet Conway |
| **Chain ID** | `10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0` |
| **Application ID** | `3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76` |
| **Contract Bytecode** | `a090d18202245af7826cceb55aec76b309c557b6b13700473b484f70f0575d60` |
| **Service Bytecode** | `5ace2f7763e4d3af6d2a83d160bebcb7e7309e4c22acc1e5b132fe600c6da1b5` |
| **Deployment Date** | November 17, 2025 |
| **Status** | ✅ **LIVE & OPERATIONAL** |

---

## 🔍 How to Verify Deployment

### Method 1: Run Demo Script (Recommended)

```bash
# From project root
./demo_linera_proof.sh
```

This script will:
1. ✅ Check Linera service status
2. ✅ Query market count from blockchain
3. ✅ Query markets from contract
4. ✅ Query user positions
5. ✅ Show wallet information
6. ✅ Display contract URLs

**Expected Output:**
```
================================================
  🎯 Predictum - Linera Blockchain Proof
================================================

📋 Contract Information:
   Network: Linera Testnet Conway
   Chain ID: 10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0
   App ID: 3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76

🔍 Step 1: Checking Linera service...
   ✅ Linera service is running on port 8080

🔢 Step 2: Querying market count from blockchain...
{
  "data": {
    "marketCount": 0
  }
}
   📊 Markets on-chain: 0

================================================
✅ LINERA DEPLOYMENT PROOF COMPLETE!
================================================
```

---

### Method 2: Manual CLI Commands

#### Step 1: Start Linera Service

```bash
linera service --port 8080
```

#### Step 2: Check Wallet

```bash
linera wallet show
```

**Expected Output:**
```
╭──────────────────────────────────────────────────────────────────┬────────────────────╮
│ Chain ID                                                         ┆ Latest Block       │
╞══════════════════════════════════════════════════════════════════╪════════════════════╡
│ 10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0 ┆ Block Height: 6    │
╰──────────────────────────────────────────────────────────────────┴────────────────────╯
```

#### Step 3: Query Contract via GraphQL

```bash
# Query market count
curl -X POST http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76 \
  -H "Content-Type: application/json" \
  -d '{"query": "{ marketCount }"}' | jq
```

**Expected Response:**
```json
{
  "data": {
    "marketCount": 0
  }
}
```

#### Step 4: Query All Markets

```bash
curl -X POST http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76 \
  -H "Content-Type: application/json" \
  -d '{"query": "{ markets { id question status yesPool noPool } }"}' | jq
```

**Expected Response:**
```json
{
  "data": {
    "markets": []
  }
}
```

#### Step 5: Query User Positions

```bash
curl -X POST http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76 \
  -H "Content-Type: application/json" \
  -d '{"query": "{ allPositions { marketId yesShares noShares } }"}' | jq
```

**Expected Response:**
```json
{
  "data": {
    "allPositions": []
  }
}
```

---

### Method 3: Browser (GraphQL Playground)

Open in browser:
```
http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76
```

Run queries interactively in the GraphQL playground.

---

## 🚀 Contract Features

### Operations (Write)
- ✅ `CreateMarket` - Create new prediction markets
- ✅ `PlaceBet` - Place bets on YES/NO outcomes
- ✅ `ResolveMarket` - Resolve markets with winning outcome
- ✅ `ClaimWinnings` - Claim payouts from resolved markets

### Queries (Read)
- ✅ `marketCount` - Total number of markets
- ✅ `markets` - List all markets
- ✅ `market(id)` - Get single market by ID
- ✅ `allPositions` - Get all user positions

### State Management
- ✅ `MapView<u64, Market>` - Markets storage
- ✅ `MapView<(u64, AccountOwner), UserPosition>` - User positions
- ✅ `RegisterView<u64>` - Market ID counter

---

## 🎬 Demo for Judges

### Quick 1-Minute Demo

1. **Show Contract Info**
   ```bash
   echo "Chain ID: 10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0"
   echo "App ID: 3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76"
   ```

2. **Run Live Query**
   ```bash
   curl -s -X POST http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76 \
     -H "Content-Type: application/json" \
     -d '{"query": "{ marketCount }"}' | jq
   ```

3. **Show Wallet**
   ```bash
   linera wallet show | head -10
   ```

4. **Explain**: "This data comes directly from Linera blockchain, proving our contract is deployed and operational."

---

## 📸 Screenshots for Submission

### 1. Terminal Output
![Linera CLI Output](./docs/screenshots/linera_cli.png)

### 2. GraphQL Query
![GraphQL Query Response](./docs/screenshots/graphql_query.png)

### 3. Wallet Info
![Linera Wallet](./docs/screenshots/wallet.png)

---

## 🔗 Useful Links

- **GraphQL Endpoint**: http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76
- **Contract Source**: [contract/src/](./contract/src/)
- **Deployment Details**: [contract/FULL_CONTRACT_DEPLOYED.md](./contract/FULL_CONTRACT_DEPLOYED.md)
- **Linera Docs**: https://linera.io/docs

---

## ✅ Verification Checklist

- [x] Contract compiled successfully
- [x] Deployed to Linera Testnet Conway
- [x] GraphQL service responds to queries
- [x] Wallet shows chain and application
- [x] All operations implemented (Create, Bet, Resolve, Claim)
- [x] State management working (MapView, RegisterView)
- [x] Documentation complete

---

## 🎯 Why This Matters

### For Judges
- **Verifiable**: Run commands yourself to confirm deployment
- **Transparent**: All contract code is open source
- **Functional**: Full prediction market logic implemented
- **Production-Ready**: Not just a proof-of-concept

### For Users
- **On-Chain Verification**: All bets are recorded on blockchain
- **Trustless**: Smart contract enforces rules
- **Fast**: Linera's microchain architecture = millisecond finality
- **Secure**: Immutable blockchain storage

---

## 📞 Support

If you have issues verifying the deployment:

1. Ensure Linera service is running: `linera service --port 8080`
2. Check wallet is initialized: `linera wallet show`
3. Verify network connectivity to localhost:8080
4. Run demo script: `./demo_linera_proof.sh`

For questions, contact the Predictum team.

---

**Last Updated**: November 17, 2025  
**Status**: ✅ **DEPLOYED & OPERATIONAL**

---

*Built for Linera Buildathon 2025 with ❤️*

