/**
 * Positions API
 * Functions for fetching user positions (bets and liquidity provisions) from the GraphQL API
 */

import { flameWager } from "@/services/sdk"
import { position, bet, liquidityProvision } from "@/graphql/models"

/**
 * Fetch user positions for withdrawal (winning positions that haven't been withdrawn)
 * @param {Object} params
 * @param {string} params.address - User wallet address
 * @returns {Promise<Array>} Array of positions ready for withdrawal
 */
export const fetchUserPositionsForWithdraw = async ({ address }) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    // Fetch bets that are winners and not yet withdrawn
    const { bets } = await flameWager.gql.query({
      bets: [
        {
          where: {
            user: { address: { _eq: address } },
            isWinner: { _eq: true },
            event: { status: { _eq: "CLOSED" } },
          },
          order_by: { timestamp: "desc" },
        },
        {
          ...bet,
          payout: true,
        },
      ],
    })

    // Fetch liquidity provisions
    const { liquidityProvisions } = await flameWager.gql.query({
      liquidityProvisions: [
        {
          where: {
            provider: { address: { _eq: address } },
            event: { status: { _eq: "CLOSED" } },
          },
          order_by: { timestamp: "desc" },
        },
        {
          ...liquidityProvision,
          payout: true,
        },
      ],
    })

    // Combine and return
    const positions = [
      ...(bets || []).map(b => ({ ...b, type: "bet" })),
      ...(liquidityProvisions || []).map(lp => ({ ...lp, type: "liquidity" })),
    ]

    return positions
  } catch (error) {
    console.error(
      `Error fetching positions for withdrawal ${address}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch all user positions (active and historical)
 * @param {Object} params
 * @param {string} params.address - User wallet address
 * @param {number} [params.limit] - Max number of positions
 * @returns {Promise<Array>} Array of all positions
 */
export const fetchUserPositions = async ({ address, limit = 100 }) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    // Fetch bets
    const { bets } = await flameWager.gql.query({
      bets: [
        {
          where: { user: { address: { _eq: address } } },
          order_by: { timestamp: "desc" },
          limit,
        },
        bet,
      ],
    })

    // Fetch liquidity provisions
    const { liquidityProvisions } = await flameWager.gql.query({
      liquidityProvisions: [
        {
          where: { provider: { address: { _eq: address } } },
          order_by: { timestamp: "desc" },
          limit,
        },
        liquidityProvision,
      ],
    })

    // Combine and sort by timestamp
    const positions = [
      ...(bets || []).map(b => ({ ...b, type: "bet" })),
      ...(liquidityProvisions || []).map(lp => ({ ...lp, type: "liquidity" })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return positions
  } catch (error) {
    console.error(
      `Error fetching positions for ${address}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch active positions (in events that are not closed)
 * @param {Object} params
 * @param {string} params.address - User wallet address
 * @returns {Promise<Array>} Array of active positions
 */
export const fetchActivePositions = async ({ address }) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    // Fetch active bets
    const { bets } = await flameWager.gql.query({
      bets: [
        {
          where: {
            user: { address: { _eq: address } },
            event: { status: { _in: ["NEW", "MEASUREMENT_STARTED"] } },
          },
          order_by: { timestamp: "desc" },
        },
        bet,
      ],
    })

    // Fetch active liquidity provisions
    const { liquidityProvisions } = await flameWager.gql.query({
      liquidityProvisions: [
        {
          where: {
            provider: { address: { _eq: address } },
            event: { status: { _in: ["NEW", "MEASUREMENT_STARTED"] } },
          },
          order_by: { timestamp: "desc" },
        },
        liquidityProvision,
      ],
    })

    // Combine
    const positions = [
      ...(bets || []).map(b => ({ ...b, type: "bet" })),
      ...(liquidityProvisions || []).map(lp => ({ ...lp, type: "liquidity" })),
    ]

    return positions
  } catch (error) {
    console.error(
      `Error fetching active positions for ${address}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch position for a specific event and user
 * @param {Object} params
 * @param {string} params.address - User wallet address
 * @param {number} params.eventId - Event ID
 * @returns {Promise<Object|null>} Position object or null
 */
export const fetchPositionForEvent = async ({ address, eventId }) => {
  try {
    if (!address || eventId === undefined) {
      throw new Error("Address and eventId are required")
    }

    // Check for bet
    const { bets } = await flameWager.gql.query({
      bets: [
        {
          where: {
            user: { address: { _eq: address } },
            event: { id: { _eq: eventId } },
          },
          limit: 1,
        },
        bet,
      ],
    })

    if (bets?.length > 0) {
      return { ...bets[0], type: "bet" }
    }

    // Check for liquidity provision
    const { liquidityProvisions } = await flameWager.gql.query({
      liquidityProvisions: [
        {
          where: {
            provider: { address: { _eq: address } },
            event: { id: { _eq: eventId } },
          },
          limit: 1,
        },
        liquidityProvision,
      ],
    })

    if (liquidityProvisions?.length > 0) {
      return { ...liquidityProvisions[0], type: "liquidity" }
    }

    return null
  } catch (error) {
    console.error(
      `Error fetching position for event ${eventId}: ${error.name}: ${error.message}`
    )
    return null
  }
}

/**
 * Subscribe to user position updates
 * @param {string} address - User wallet address
 * @param {Function} onUpdate - Callback when positions update
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToUserPositions = (address, onUpdate) => {
  try {
    return flameWager.gql
      .subscription({
        bets: [
          {
            where: { user: { address: { _eq: address } } },
            order_by: { timestamp: "desc" },
            limit: 50,
          },
          bet,
        ],
      })
      .subscribe({
        next: (data) => {
          if (data.bets) {
            onUpdate(data.bets)
          }
        },
        error: (error) => {
          console.error(`Positions subscription error: ${error}`)
        },
      })
  } catch (error) {
    console.error(
      `Error subscribing to positions for ${address}: ${error.name}: ${error.message}`
    )
    return { unsubscribe: () => {} }
  }
}
