import { lineraClient } from './linera-client';

export interface LineraMarket {
  id: number;
  question: string;
  category: string;
  endTime: number;
  yesPool: number;
  noPool: number;
  totalYesShares: number;
  totalNoShares: number;
  status: string;
  winningOutcome: string | null;
  creator: string;
  createdAt: number;
}

export interface LineraUserPosition {
  marketId: number;
  user: string;
  yesShares: number;
  noShares: number;
  yesAmount: number;
  noAmount: number;
  claimed: boolean;
}

export interface LineraQueryResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Get a single market from Linera contract
 */
export async function getMarketFromLinera(id: number): Promise<LineraQueryResult<LineraMarket>> {
  try {
    const market = await lineraClient.getMarket(id);
    return {
      data: market,
      error: null,
      loading: false,
    };
  } catch (error: any) {
    console.error('Failed to fetch market from Linera:', error);
    return {
      data: null,
      error: error.message || 'Failed to fetch market from Linera',
      loading: false,
    };
  }
}

/**
 * Get total market count from Linera contract
 */
export async function getMarketCountFromLinera(): Promise<LineraQueryResult<number>> {
  try {
    const count = await lineraClient.getMarketCount();
    return {
      data: count,
      error: null,
      loading: false,
    };
  } catch (error: any) {
    console.error('Failed to fetch market count from Linera:', error);
    return {
      data: null,
      error: error.message || 'Failed to fetch market count from Linera',
      loading: false,
    };
  }
}

/**
 * Get all markets from Linera contract
 */
export async function getMarketsFromLinera(): Promise<LineraQueryResult<LineraMarket[]>> {
  try {
    const markets = await lineraClient.getMarkets();
    return {
      data: markets,
      error: null,
      loading: false,
    };
  } catch (error: any) {
    console.error('Failed to fetch markets from Linera:', error);
    return {
      data: null,
      error: error.message || 'Failed to fetch markets from Linera',
      loading: false,
    };
  }
}

/**
 * Get user position for a specific market from Linera contract
 */
export async function getUserPositionFromLinera(
  marketId: number,
  userAddress: string
): Promise<LineraQueryResult<LineraUserPosition>> {
  try {
    const positions = await lineraClient.getAllPositions();
    const position = positions.find(
      (p) => p.marketId === marketId && p.user === userAddress
    );
    return {
      data: position || null,
      error: null,
      loading: false,
    };
  } catch (error: any) {
    console.error('Failed to fetch user position from Linera:', error);
    return {
      data: null,
      error: error.message || 'Failed to fetch user position from Linera',
      loading: false,
    };
  }
}

/**
 * Check if Linera service is available
 */
export async function checkLineraAvailability(): Promise<boolean> {
  try {
    return await lineraClient.isAvailable();
  } catch {
    return false;
  }
}

/**
 * Retry a query with exponential backoff
 */
export async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Query failed after retries');
}

