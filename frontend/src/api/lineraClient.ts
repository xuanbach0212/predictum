// Linera GraphQL Client
// Connects to deployed contract on Testnet Conway

import type { LineraMarket, LineraUserPosition } from "../types/linera";

const CHAIN_ID = "10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0";
const APP_ID = "3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76";
const GRAPHQL_URL = `http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export const lineraClient = {
  /**
   * Execute a GraphQL query against the Linera contract
   */
  async query<T>(query: string): Promise<T> {
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data) {
        throw new Error("No data returned from query");
      }

      return result.data;
    } catch (error) {
      console.error("Linera GraphQL query failed:", error);
      throw error;
    }
  },

  /**
   * Get total number of markets on-chain
   */
  async getMarketCount(): Promise<number> {
    const result = await this.query<{ marketCount: number }>(
      "{ marketCount }"
    );
    return result.marketCount;
  },

  /**
   * Get all markets from on-chain
   */
  async getMarkets(): Promise<LineraMarket[]> {
    const result = await this.query<{ markets: LineraMarket[] }>(`
      {
        markets {
          id
          question
          category
          endTime
          yesPool
          noPool
          totalYesShares
          totalNoShares
          status
          winningOutcome
          creator
          createdAt
        }
      }
    `);
    return result.markets;
  },

  /**
   * Get a single market by ID
   */
  async getMarket(id: number): Promise<LineraMarket | null> {
    const result = await this.query<{ market: LineraMarket | null }>(`
      {
        market(id: ${id}) {
          id
          question
          category
          endTime
          yesPool
          noPool
          totalYesShares
          totalNoShares
          status
          winningOutcome
          creator
          createdAt
        }
      }
    `);
    return result.market;
  },

  /**
   * Get all user positions
   */
  async getAllPositions(): Promise<LineraUserPosition[]> {
    const result = await this.query<{ allPositions: LineraUserPosition[] }>(`
      {
        allPositions {
          marketId
          user
          yesShares
          noShares
          yesAmount
          noAmount
          claimed
        }
      }
    `);
    return result.allPositions;
  },

  /**
   * Check if Linera service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getMarketCount();
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default lineraClient;

