# Multi-stage Dockerfile for Predictum
# Based on Linera buildathon template

FROM rust:1.75 as rust-builder

# Install Linera CLI and dependencies
RUN rustup target add wasm32-unknown-unknown
RUN cargo install --locked linera-service@0.15.5

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Node.js stage for frontend
# ============================================
FROM node:20 as node-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend source
COPY frontend/ ./
RUN npm run build

# ============================================
# Go stage for backend
# ============================================
FROM golang:1.21 as go-builder

WORKDIR /app/backend

# Copy backend files
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o server cmd/server/main.go

# ============================================
# Final stage
# ============================================
FROM ubuntu:22.04

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy Linera binaries from rust-builder
COPY --from=rust-builder /usr/local/cargo/bin/linera* /usr/local/bin/

# Copy built frontend
COPY --from=node-builder /app/frontend/dist /app/frontend/dist

# Copy built backend
COPY --from=go-builder /app/backend/server /app/backend/server

# Copy contract source (for potential deployment)
COPY contract /app/contract

# Copy run script
COPY run.bash /app/run.bash
RUN chmod +x /app/run.bash

WORKDIR /app

# Expose ports
# 5173: Frontend
# 8080: Linera faucet/proxy
# 9001: Linera validator proxy
# 3001: Go backend API
EXPOSE 5173 8080 9001 3001

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s \
  CMD curl -f http://localhost:3001/api/balance || exit 1

# Run the application
CMD ["/app/run.bash"]

