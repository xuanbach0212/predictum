# Predictum Smart Contract

## Overview

Minimal Linera smart contract deployed on Testnet Conway. Currently implements a simple counter as proof-of-concept for state management and WASM deployment.

## Deployment Information

- **Chain ID**: `10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0`
- **Application ID**: `2ef9c30950bd361da5a41d1c5563cb19f99f9dc93673b1260ce0b68203a17d22`
- **Contract Bytecode**: `c04d59466908e45fcb2a8c61a07df6bb44546cadca20763dcc5c3759e466245b`
- **Service Bytecode**: `4763b1408a01cd7e3b307450ffae7c8c871c0db39fc70b24a8463fe660ec77b3`
- **Status**: ✅ Successfully deployed

## Contract Structure

```
contract/
├── src/
│   ├── lib.rs        # ABI definitions (Operation, Query types)
│   ├── state.rs      # Application state (RegisterView<u64>)
│   ├── contract.rs   # Contract trait implementation
│   └── service.rs    # Service trait for GraphQL queries
├── Cargo.toml        # Dependencies (linera-sdk 0.15, async-graphql)
└── README.md         # This file
```

## Current Implementation

### State
- Single `u64` counter stored in `RegisterView`
- Demonstrates persistent state management

### Operations
- `Increment { value: u64 }` - Increments counter by specified value

### Queries
- GraphQL interface via `async-graphql`
- Query current counter value
- Mutation to increment counter

## Build

```bash
# Ensure Rust 1.86.0 is active
rustup default 1.86.0

# Build for WASM
cargo build --release --target wasm32-unknown-unknown
```

Output:
- `target/wasm32-unknown-unknown/release/prediction_market_contract.wasm` (174 KB)
- `target/wasm32-unknown-unknown/release/prediction_market_service.wasm` (1.8 MB)

## Deploy

```bash
# From contract directory
linera project publish-and-create
```

## Test Locally

```bash
# Start GraphQL service
linera service --port 8080

# Open GraphiQL IDE
open http://localhost:8080
```

## Future Enhancements

The minimal contract serves as foundation for full prediction market implementation:

### Planned Features
1. **Market Creation**
   - Store market metadata (question, category, end_time)
   - Initialize YES/NO pools
   - Track market status (Active, Locked, Resolved)

2. **Betting Operations**
   - Place bet on YES or NO outcome
   - Calculate dynamic odds based on pool ratios
   - Track user positions per market

3. **Market Resolution**
   - Oracle integration for automated resolution
   - Distribute winnings to winners
   - Handle claims and payouts

4. **State Management**
   - `MapView` for markets (market_id → Market)
   - `MapView` for positions (user + market_id → Position)
   - Efficient storage using Linera's View system

### Implementation Strategy
- Start with single market creation
- Add betting logic incrementally
- Test each operation before adding next
- Maintain backward compatibility with deployed bytecode

## Technical Notes

### Rust Toolchain
**Critical**: Must use Rust 1.86.0 to match Linera's compilation target. Other versions generate incompatible WASM opcodes.

### Instantiation Argument
Contract uses `type InstantiationArgument = ()` (empty) to match `linera project publish-and-create` expectations.

### Dependencies
- `linera-sdk = "0.15"` - Core SDK for Contract/Service traits
- `async-graphql = "7.0"` - GraphQL interface
- `serde = "1.0"` - Serialization

## Resources

- [Linera Docs](https://linera.dev)
- [SDK Reference](https://docs.rs/linera-sdk/0.15.0)
- [Testnet Faucet](https://faucet.testnet-conway.linera.net)
- [Deployment Details](./DEPLOYMENT_SUCCESS.md)

