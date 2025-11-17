// Linera GraphQL Client for querying on-chain data
// Application ID: 3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76

const CHAIN_ID = "10c453e40426ef2bdbe6d9ddf0164c04e24fbb9d5695c26f65df24c5d852d9f0";
const APP_ID = "3910a3b9f7f92fb9c47d9d460a26b4d7819c0a7f01a9cefbe5f575c4e74b6a76";
const GRAPHQL_URL = `http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface Market {
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

interface UserPosition {
  marketId: number;
  user: string;
  yesShares: number;
  noShares: number;
  yesAmount: number;
  noAmount: number;
  claimed: boolean;
}

async function queryGraphQL<T>(query: string): Promise<T> {
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
      throw new Error(result.errors.map((e) => e.message).join(", "));
    }

    if (!result.data) {
      throw new Error("No data returned from GraphQL");
    }

    return result.data;
  } catch (error) {
    console.error("GraphQL query failed:", error);
    throw error;
  }
}

export const lineraClient = {
  /**
   * Get total number of markets
   */
  async getMarketCount(): Promise<number> {
    const data = await queryGraphQL<{ marketCount: number }>(
      "{ marketCount }"
    );
    return data.marketCount;
  },

  /**
   * Get all markets from on-chain
   */
  async getMarkets(): Promise<Market[]> {
    const data = await queryGraphQL<{ markets: Market[] }>(`
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
    return data.markets;
  },

  /**
   * Get a single market by ID
   */
  async getMarket(id: number): Promise<Market | null> {
    const data = await queryGraphQL<{ market: Market | null }>(`
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
    return data.market;
  },

  /**
   * Get all user positions
   */
  async getAllPositions(): Promise<UserPosition[]> {
    const data = await queryGraphQL<{ allPositions: UserPosition[] }>(`
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
    return data.allPositions;
  },

  /**
   * Check if Linera service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.getMarketCount();
      return true;
    } catch {
      return false;
    }
  },
};

// Export for testing
export { CHAIN_ID, APP_ID, GRAPHQL_URL };

