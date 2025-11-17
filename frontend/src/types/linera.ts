// Linera Contract Types
// Matches GraphQL schema from deployed contract

export interface LineraMarket {
  id: number;
  question: string;
  category: string;
  endTime: number; // Timestamp in microseconds
  yesPool: number;
  noPool: number;
  totalYesShares: number;
  totalNoShares: number;
  status: MarketStatus;
  winningOutcome: Outcome | null;
  creator: string; // AccountOwner as string
  createdAt: number; // Timestamp in microseconds
}

export interface LineraUserPosition {
  marketId: number;
  user: string; // AccountOwner as string
  yesShares: number;
  noShares: number;
  yesAmount: number;
  noAmount: number;
  claimed: boolean;
}

export type MarketStatus = "Active" | "Locked" | "Resolved" | "Cancelled";

export type Outcome = "Yes" | "No";

// Helper functions for timestamp conversion
export const timestampToDate = (micros: number): Date => {
  return new Date(micros / 1000);
};

export const dateToTimestamp = (date: Date): number => {
  return date.getTime() * 1000;
};

