# Backend API (Go)

REST API server for Linera Prediction Market built with Go.

## 🚀 Quick Start

```bash
# Install dependencies
go mod download

# Run server
go run cmd/server/main.go

# Or build and run
go build -o server cmd/server/main.go
./server
```

Server runs on **http://localhost:3001**

## 📁 Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Entry point
├── internal/
│   ├── models/
│   │   └── models.go        # Data models
│   ├── storage/
│   │   └── storage.go       # In-memory storage
│   └── handlers/
│       └── handlers.go      # HTTP handlers
└── go.mod
```

## 🔧 API Endpoints

### Markets
- `GET /api/markets` - Get all markets
- `GET /api/markets/:id` - Get single market
- `POST /api/markets/:id/resolve` - Resolve market (admin)

### Betting
- `POST /api/bet` - Place bet
- `POST /api/claim/:marketId` - Claim winnings

### User
- `GET /api/positions` - Get user positions
- `GET /api/balance` - Get user balance

## 🎯 Features

- ✅ RESTful API
- ✅ CORS enabled
- ✅ In-memory storage
- ✅ AMM odds calculation
- ✅ Thread-safe with mutex
- ✅ Clean architecture

## 📝 Tech Stack

- **Go 1.21+**
- **gorilla/mux** - HTTP router
- **rs/cors** - CORS middleware
- **sync.RWMutex** - Thread safety

---

Built with Go for Linera Buildathon 🚀

