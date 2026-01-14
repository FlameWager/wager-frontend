/**
 * Markets API
 * Functions for fetching currency pairs and market data from the GraphQL API
 */

import { flameWager } from "@/services/sdk"
import { currencyPair as currencyPairModel, currencyPairStatistics } from "@/graphql/models"

/**
 * Fetch all markets/currency pairs
 * @returns {Promise<Array>} Array of currency pairs
 */
export const fetchMarkets = async () => {
  try {
    const { currencyPairs } = await flameWager.gql.query({
      currencyPairs: [
        {
          order_by: { totalVolume: "desc" },
        },
        currencyPairModel,
      ],
    })

    return currencyPairs || []
  } catch (error) {
    console.error(
      `Error fetching markets: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch a single market by symbol
 * @param {string} symbol - Currency pair symbol (e.g., "ETH-USD")
 * @returns {Promise<Object|null>} Currency pair object or null
 */
export const fetchMarketBySymbol = async (symbol) => {
  try {
    if (!symbol) {
      throw new Error("Symbol is required")
    }

    const { currencyPairs } = await flameWager.gql.query({
      currencyPairs: [
        {
          where: { symbol: { _eq: symbol } },
          limit: 1,
        },
        currencyPairModel,
      ],
    })

    return currencyPairs?.[0] || null
  } catch (error) {
    console.error(
      `Error fetching market ${symbol}: ${error.name}: ${error.message}`
    )
    return null
  }
}

/**
 * Fetch a single market by ID
 * @param {number} id - Currency pair ID
 * @returns {Promise<Object|null>} Currency pair object or null
 */
export const fetchMarketById = async (id) => {
  try {
    if (id === undefined || id === null) {
      throw new Error("Market ID is required")
    }

    const { currencyPairsByPk } = await flameWager.gql.query({
      currencyPairsByPk: [
        {
          id,
        },
        currencyPairModel,
      ],
    })

    return currencyPairsByPk || null
  } catch (error) {
    console.error(
      `Error fetching market ${id}: ${error.name}: ${error.message}`
    )
    return null
  }
}

/**
 * Fetch market statistics
 * @returns {Promise<Array>} Array of market statistics
 */
export const fetchMarketStatistics = async () => {
  try {
    const { currencyPairStatistics: stats } = await flameWager.gql.query({
      currencyPairStatistics: [
        {
          order_by: { totalVolume: "desc" },
        },
        currencyPairStatistics,
      ],
    })

    return stats || []
  } catch (error) {
    console.error(
      `Error fetching market statistics: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Subscribe to market price updates
 * @param {string} symbol - Currency pair symbol
 * @param {Function} onUpdate - Callback when price updates
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToMarketPrice = (symbol, onUpdate) => {
  try {
    return flameWager.gql
      .subscription({
        currencyPairs: [
          {
            where: { symbol: { _eq: symbol } },
          },
          {
            currentPrice: true,
            lastPriceUpdate: true,
          },
        ],
      })
      .subscribe({
        next: (data) => {
          if (data.currencyPairs?.[0]) {
            onUpdate(data.currencyPairs[0])
          }
        },
        error: (error) => {
          console.error(`Market price subscription error: ${error}`)
        },
      })
  } catch (error) {
    console.error(
      `Error subscribing to market price ${symbol}: ${error.name}: ${error.message}`
    )
    return { unsubscribe: () => {} }
  }
}

/**
 * Fetch markets with active events
 * @returns {Promise<Array>} Array of markets that have active (NEW) events
 */
export const fetchMarketsWithActiveEvents = async () => {
  try {
    const { currencyPairs } = await flameWager.gql.query({
      currencyPairs: [
        {
          where: {
            events: { status: { _eq: "NEW" } },
          },
          order_by: { totalVolume: "desc" },
        },
        {
          ...currencyPairModel,
          events_aggregate: [
            {
              where: { status: { _eq: "NEW" } },
            },
            {
              aggregate: {
                count: true,
              },
            },
          ],
        },
      ],
    })

    return currencyPairs || []
  } catch (error) {
    console.error(
      `Error fetching markets with active events: ${error.name}: ${error.message}`
    )
    return []
  }
}
