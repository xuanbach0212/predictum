import type { Market, Odds } from "../types";

export const calculateOdds = (market: Market): Odds => {
  const totalPool = market.yesPool + market.noPool;

  if (totalPool === 0) {
    return { yesOdds: 0.5, noOdds: 0.5 };
  }

  return {
    yesOdds: market.yesPool / totalPool,
    noOdds: market.noPool / totalPool,
  };
};

export const calculatePotentialPayout = (
  market: Market,
  outcome: "Yes" | "No",
  betAmount: number
): number => {
  const totalPool = market.yesPool + market.noPool + betAmount;
  const currentPool = outcome === "Yes" ? market.yesPool : market.noPool;
  const newPool = currentPool + betAmount;

  const userShare = betAmount / newPool;
  return totalPool * userShare;
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const getTimeRemaining = (endTime: Date): string => {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff < 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};
