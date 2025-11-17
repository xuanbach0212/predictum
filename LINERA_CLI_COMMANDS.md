# 🎯 Linera CLI Commands for Demo

## ✅ Working Commands (While Service is Running)

### 1. **Show Wallet Info**
```bash
linera wallet show
```
**Output**: Shows all chains in your wallet with block heights and timestamps

**Use for demo**: Prove you have access to the chain where contract is deployed

---

### 2. **Start GraphQL Service**
```bash
linera service --port 8080
```
**Output**: Starts GraphQL endpoint for querying contract

**Use for demo**: Required for all GraphQL queries

---

### 3. **Query Contract via curl**
```bash
# Get market count
curl -s -X POST http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76 \
  -H "Content-Type: application/json" \
  -d '{"query": "{ marketCount }"}' | jq
```

**Use for demo**: Show live data from blockchain

---

### 4. **Check Service Process**
```bash
ps aux | grep "linera service"
```
**Output**: Shows Linera service is running

**Use for demo**: Prove service is active

---

## ⚠️ Commands That Require Service to be Stopped

These commands will fail with "Resource temporarily unavailable" if `linera service` is running:

### 1. **Query Balance**
```bash
# Stop service first
pkill -f "linera service"

# Then query
linera query-balance
```

### 2. **Query Validators**
```bash
linera query-validators
```

### 3. **Sync Chain**
```bash
linera sync
```

---

## 🎬 Demo Script Using CLI

### Quick Demo (30 seconds)

```bash
#!/bin/bash

echo "🎯 Predictum - Linera CLI Demo"
echo ""

# 1. Show wallet
echo "1️⃣ Wallet Info:"
linera wallet show | head -10
echo ""

# 2. Check service
echo "2️⃣ Service Status:"
ps aux | grep "linera service" | grep -v grep
echo ""

# 3. Query contract
echo "3️⃣ Query Contract:"
curl -s -X POST http://localhost:8080/chains/10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0/applications/3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76 \
  -H "Content-Type: application/json" \
  -d '{"query": "{ marketCount }"}' | jq

echo ""
echo "✅ Contract is live on Linera!"
```

---

## 📋 All Available Commands

```bash
linera --help
```

**Main commands**:
- `transfer` - Transfer funds
- `open-chain` - Create new chain
- `wallet` - Show wallet contents
- `service` - Start GraphQL service
- `project` - Manage Linera projects
- `publish-and-create` - Deploy application
- `keygen` - Generate keypair
- `sync` - Sync chain state
- `query-balance` - Check balance
- `query-validators` - Show validators

---

## 🎯 Best Commands for Demo

### For Judges/Presentation:

1. **`linera wallet show`**
   - ✅ Shows you own the chain
   - ✅ Displays block height (proof of activity)
   - ✅ Shows timestamp

2. **`curl` GraphQL query**
   - ✅ Shows contract is deployed
   - ✅ Returns live data
   - ✅ Proves blockchain interaction

3. **`ps aux | grep linera`**
   - ✅ Shows service is running
   - ✅ Proves active connection

4. **`./demo_linera_proof.sh`**
   - ✅ All-in-one demo script
   - ✅ Professional output
   - ✅ Shows all proofs

---

## 🚫 What Linera CLI CANNOT Do

- ❌ No blockchain explorer UI
- ❌ No `query-applications` command
- ❌ No `query-contract` command
- ❌ Cannot query specific application data without GraphQL

**Solution**: Use GraphQL queries via `curl` or demo script

---

## 💡 Tips

1. **Always run `linera service` first** before GraphQL queries
2. **Stop service** before running wallet commands if you get lock errors
3. **Use demo script** for consistent, professional demos
4. **Screenshot terminal output** for submission

---

## 🔗 Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `linera wallet show` | Show chains | Prove ownership |
| `linera service --port 8080` | Start GraphQL | Enable queries |
| `curl + GraphQL` | Query contract | Show live data |
| `./demo_linera_proof.sh` | Full demo | Complete proof |

---

**For full demo, use**: `./demo_linera_proof.sh` ✅
