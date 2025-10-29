export type MarketStatus = "Active" | "Locked" | "Resolved" | "Cancelled";

export type MarketCategory = "Sports" | "Crypto" | "Binary";

export type Outcome = "Yes" | "No";

export interface Market {
  id: number;
  question: string;
  category: MarketCategory;
  status: MarketStatus;
  endTime: Date;
  yesPool: number;
  noPool: number;
  totalYesShares: number;
  totalNoShares: number;
  winningOutcome?: Outcome;
  createdAt: Date;
}

export interface UserPosition {
  marketId: number;
  yesShares: number;
  noShares: number;
  yesAmount: number;
  noAmount: number;
  claimed: boolean;
}

export interface Odds {
  yesOdds: number;
  noOdds: number;
}
