const API_BASE = "http://localhost:3001/api";

export const api = {
  // Get all markets
  async getMarkets() {
    const res = await fetch(`${API_BASE}/markets`);
    const data = await res.json();
    return data.map((m: any) => ({
      ...m,
      endTime: new Date(m.endTime),
      createdAt: new Date(m.createdAt),
    }));
  },

  // Get single market
  async getMarket(id: number) {
    const res = await fetch(`${API_BASE}/markets/${id}`);
    const data = await res.json();
    return {
      ...data,
      endTime: new Date(data.endTime),
      createdAt: new Date(data.createdAt),
    };
  },

  // Get user positions
  async getPositions() {
    const res = await fetch(`${API_BASE}/positions`);
    return res.json();
  },

  // Get user balance
  async getBalance() {
    const res = await fetch(`${API_BASE}/balance`);
    const data = await res.json();
    return data.balance;
  },

  // Place bet
  async placeBet(marketId: number, outcome: "Yes" | "No", amount: number) {
    const res = await fetch(`${API_BASE}/bet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketId, outcome, amount }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to place bet");
    }
    return res.json();
  },

  // Claim winnings
  async claimWinnings(marketId: number) {
    const res = await fetch(`${API_BASE}/claim/${marketId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to claim winnings");
    }
    return res.json();
  },

  // Resolve market (admin)
  async resolveMarket(marketId: number, outcome: "Yes" | "No") {
    const res = await fetch(`${API_BASE}/markets/${marketId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    return res.json();
  },

  // Create market
  async createMarket(question: string, category: string, endTime: string) {
    const res = await fetch(`${API_BASE}/markets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, category, endTime }),
    });
    return res.json();
  },
};
