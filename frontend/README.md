# Prediction Market Frontend - MVP

React-based web interface for Linera prediction markets (MVP version with mock data).

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

## 📦 What's Included

- ✅ Home page with market list
- ✅ Market detail page with betting interface
- ✅ My Bets page for tracking positions
- ✅ Mock data (6 markets, 3 user positions)
- ✅ AMM-style odds calculation
- ✅ TailwindCSS styling
- ✅ Responsive design

## 🎯 Pages

### Home (`/`)
Browse all markets, filter by status/category, view odds.

### Market Detail (`/market/:id`)
View detailed market info, place bets, see potential payouts.

### My Bets (`/my-bets`)
Track your positions, claim winnings from resolved markets.

## 🧮 Mock Data

Located in `src/data/mockMarkets.ts`:
- 6 demo markets (Sports & Crypto)
- 3 user positions
- Realistic pool sizes and odds

## 🎨 Styling

- TailwindCSS for utility-first styling
- Custom color scheme for categories
- Responsive breakpoints
- Smooth transitions

## 📝 Notes

This is an MVP with mock data. No blockchain integration yet.
Bets show alerts instead of actual transactions.

See [MVP_README.md](../MVP_README.md) for full demo instructions.

## 🔗 Tech Stack

- React 18 + TypeScript
- Vite (fast build tool)
- React Router v6
- TailwindCSS
- Mock data (no backend)

## 📂 Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── data/           # Mock data
├── types/          # TypeScript types
├── utils/          # Helper functions
└── App.tsx         # Main app
```

---

Built for Linera Buildathon 🚀
