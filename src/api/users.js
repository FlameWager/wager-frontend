/**
 * Users API
 * Functions for fetching user data and statistics from the GraphQL API
 */

import { flameWager } from "@/services/sdk"
import { user as userModel, userWithPositions, withdrawal, userStatistics } from "@/graphql/models"

/**
 * Fetch user by address
 * @param {string} address - User wallet address
 * @returns {Promise<Object|null>} User object or null
 */
export const fetchUser = async (address) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    const { usersByPk } = await flameWager.gql.query({
      usersByPk: [
        {
          address,
        },
        userModel,
      ],
    })

    return usersByPk || null
  } catch (error) {
    console.error(
      `Error fetching user ${address}: ${error.name}: ${error.message}`
    )
    return null
  }
}

/**
 * Fetch user with all positions (bets and liquidity)
 * @param {string} address - User wallet address
 * @returns {Promise<Object|null>} User object with positions or null
 */
export const fetchUserWithPositions = async (address) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    const { usersByPk } = await flameWager.gql.query({
      usersByPk: [
        {
          address,
        },
        userWithPositions,
      ],
    })

    return usersByPk || null
  } catch (error) {
    console.error(
      `Error fetching user positions ${address}: ${error.name}: ${error.message}`
    )
    return null
  }
}

/**
 * Fetch user withdrawals
 * @param {Object} params
 * @param {string} params.address - User wallet address
 * @param {number} [params.limit] - Max number of withdrawals
 * @returns {Promise<Array>} Array of withdrawals
 */
export const fetchUserWithdrawals = async ({ address, limit = 100 }) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    const { withdrawals } = await flameWager.gql.query({
      withdrawals: [
        {
          where: { user: { address: { _eq: address } } },
          order_by: { timestamp: "desc" },
          limit,
        },
        withdrawal,
      ],
    })

    return withdrawals || []
  } catch (error) {
    console.error(
      `Error fetching withdrawals for ${address}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch user statistics
 * @param {string} address - User wallet address
 * @returns {Promise<Object|null>} User statistics or null
 */
export const fetchUserStatistics = async (address) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    const { userStatistics: stats } = await flameWager.gql.query({
      userStatistics: [
        {
          where: { address: { _eq: address } },
          limit: 1,
        },
        userStatistics,
      ],
    })

    return stats?.[0] || null
  } catch (error) {
    console.error(
      `Error fetching statistics for ${address}: ${error.name}: ${error.message}`
    )
    return null
  }
}

/**
 * Fetch leaderboard (top users by winnings)
 * @param {Object} [params]
 * @param {number} [params.limit] - Max number of users
 * @returns {Promise<Array>} Array of users sorted by winnings
 */
export const fetchLeaderboard = async ({ limit = 20 } = {}) => {
  try {
    const { users } = await flameWager.gql.query({
      users: [
        {
          order_by: { totalWinnings: "desc" },
          limit,
          where: { totalBetsCount: { _gt: 0 } },
        },
        {
          address: true,
          totalBetsCount: true,
          totalBetsAmount: true,
          totalWinnings: true,
        },
      ],
    })

    return users || []
  } catch (error) {
    console.error(
      `Error fetching leaderboard: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Subscribe to user updates
 * @param {string} address - User wallet address
 * @param {Function} onUpdate - Callback when user data updates
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToUser = (address, onUpdate) => {
  try {
    return flameWager.gql
      .subscription({
        usersByPk: [
          {
            address,
          },
          userModel,
        ],
      })
      .subscribe({
        next: (data) => {
          if (data.usersByPk) {
            onUpdate(data.usersByPk)
          }
        },
        error: (error) => {
          console.error(`User subscription error: ${error}`)
        },
      })
  } catch (error) {
    console.error(
      `Error subscribing to user ${address}: ${error.name}: ${error.message}`
    )
    return { unsubscribe: () => {} }
  }
}
