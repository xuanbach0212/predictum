#!/bin/bash
set -e

echo "🚀 Starting Predictum..."

# Colors for output
GREEN='\033[0.32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Start Go backend
echo -e "${BLUE}📡 Starting Go backend...${NC}"
cd /app/backend
./server &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:3001/api/balance > /dev/null; then
    echo -e "${GREEN}✅ Backend is ready!${NC}"
    break
  fi
  sleep 1
done

# Serve frontend (using a simple HTTP server)
echo -e "${BLUE}🎨 Starting frontend...${NC}"
cd /app/frontend/dist
python3 -m http.server 5173 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo -e "${YELLOW}⏳ Waiting for frontend to be ready...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is ready!${NC}"
    break
  fi
  sleep 1
done

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Predictum is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Frontend:${NC}  http://localhost:5173"
echo -e "${BLUE}🔧 Backend:${NC}   http://localhost:3001"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Keep the script running and handle shutdown
trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for processes
wait

