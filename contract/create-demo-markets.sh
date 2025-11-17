#!/bin/bash

# Create Demo Markets on Linera Testnet Conway via GraphQL
# Application ID: 3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76

CHAIN_ID="10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0"
APP_ID="3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76"
GRAPHQL_URL="http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID"

# End time: 7 days from now (in microseconds)
END_TIME=$(($(date +%s) * 1000000 + 7 * 24 * 60 * 60 * 1000000))

echo "Creating 6 demo markets via GraphQL..."
echo "Chain ID: $CHAIN_ID"
echo "Application ID: $APP_ID"
echo "End time: $END_TIME"
echo "GraphQL URL: $GRAPHQL_URL"
echo ""

# Note: Linera SDK 0.15 uses GraphQL mutations for operations
# Format: mutation { operation(operation: {...}) }

# Market 1: NFL
echo "1. Creating NFL market..."
curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { operation(operation: {CreateMarket: {question: \\\"Will the Kansas City Chiefs win Super Bowl LIX?\\\", category: \\\"Sports\\\", end_time: $END_TIME}}) }\"}" | jq .

# Market 2: NBA
echo "2. Creating NBA market..."
curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { operation(operation: {CreateMarket: {question: \\\"Will LeBron James score 40,000 career points this season?\\\", category: \\\"Sports\\\", end_time: $END_TIME}}) }\"}" | jq .

# Market 3: Premier League
echo "3. Creating Premier League market..."
curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { operation(operation: {CreateMarket: {question: \\\"Will Manchester City win the Premier League 2024-25?\\\", category: \\\"Sports\\\", end_time: $END_TIME}}) }\"}" | jq .

# Market 4: Bitcoin
echo "4. Creating Bitcoin market..."
curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { operation(operation: {CreateMarket: {question: \\\"Will Bitcoin reach $100,000 by end of 2025?\\\", category: \\\"Crypto\\\", end_time: $END_TIME}}) }\"}" | jq .

# Market 5: Ethereum
echo "5. Creating Ethereum market..."
curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { operation(operation: {CreateMarket: {question: \\\"Will Ethereum surpass $5,000 in 2025?\\\", category: \\\"Crypto\\\", end_time: $END_TIME}}) }\"}" | jq .

# Market 6: Linera
echo "6. Creating Linera market..."
curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { operation(operation: {CreateMarket: {question: \\\"Will Linera mainnet launch in Q1 2026?\\\", category: \\\"Crypto\\\", end_time: $END_TIME}}) }\"}" | jq .

echo ""
echo "✅ All 6 markets created!"
echo ""
echo "To query markets, use:"
echo "  curl -X POST $GRAPHQL_URL -H \"Content-Type: application/json\" -d '{\"query\": \"{ markets { id question category } }\"}' | jq ."
