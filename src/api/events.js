/**
 * Events API
 * Functions for fetching events from the GraphQL API
 */

import { flameWager } from "@/services/sdk"
import { event as eventModel, eventWithParticipants, bet, liquidityProvision } from "@/graphql/models"

/**
 * Fetch events by status
 * @param {Object} params
 * @param {string} params.status - Event status (NEW, MEASUREMENT_STARTED, CLOSED)
 * @param {number} [params.limit] - Max number of events to return
 * @param {number} [params.offset] - Offset for pagination
 * @returns {Promise<Array>} Array of events
 */
export const fetchEventsByStatus = async ({ status, limit = 100, offset = 0 }) => {
  try {
    if (!status) {
      throw new Error("Status is required")
    }

    // Map frontend status names to backend enum values
    const statusMap = {
      NEW: "NEW",
      STARTED: "MEASUREMENT_STARTED",
      MEASUREMENT_STARTED: "MEASUREMENT_STARTED",
      FINISHED: "CLOSED",
      CLOSED: "CLOSED",
    }

    const mappedStatus = statusMap[status] || status

    const { events } = await flameWager.gql.query({
      events: [
        {
          where: {
            status: { _eq: mappedStatus },
          },
          order_by: { createdTime: "desc" },
          limit,
          offset,
        },
        eventModel,
      ],
    })

    return events || []
  } catch (error) {
    console.error(
      `Error fetching events by status ${status}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch a single event by ID
 * @param {number} id - Event ID
 * @returns {Promise<Object|null>} Event object or null
 */
export const fetchEventById = async (id) => {
  try {
    if (id === undefined || id === null) {
      throw new Error("Event ID is required")
    }

    const { eventsByPk } = await flameWager.gql.query({
      eventsByPk: [
        {
          id,
        },
        eventWithParticipants,
      ],
    })

    return eventsByPk || null
  } catch (error) {
    console.error(
      `Error fetching event ${id}: ${error.name}: ${error.message}`
    )
    return null
  }
}

/**
 * Fetch events by market/currency pair
 * @param {Object} params
 * @param {number} params.id - Currency pair ID
 * @param {string} [params.status] - Optional status filter
 * @param {number} [params.limit] - Max number of events
 * @returns {Promise<Array>} Array of events
 */
export const fetchEventsByMarket = async ({ id, status, limit = 100 }) => {
  try {
    if (!id) {
      throw new Error("Market ID is required")
    }

    const where = {
      currencyPair: { id: { _eq: id } },
    }

    if (status) {
      where.status = { _eq: status }
    }

    const { events } = await flameWager.gql.query({
      events: [
        {
          where,
          order_by: { createdTime: "desc" },
          limit,
        },
        eventModel,
      ],
    })

    return events || []
  } catch (error) {
    console.error(
      `Error fetching events for market ${id}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch top events (by total value locked)
 * @param {Object} [params]
 * @param {number} [params.limit] - Max number of events
 * @returns {Promise<Array>} Array of events
 */
export const fetchTopEvents = async ({ limit = 10 } = {}) => {
  try {
    const { events } = await flameWager.gql.query({
      events: [
        {
          where: {
            status: { _eq: "NEW" },
          },
          order_by: { totalValueLocked: "desc" },
          limit,
        },
        eventModel,
      ],
    })

    return events || []
  } catch (error) {
    console.error(
      `Error fetching top events: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch event participants (bets and liquidity provisions)
 * @param {number} eventId - Event ID
 * @returns {Promise<Object>} Object with bets and liquidityProvisions arrays
 */
export const fetchEventParticipants = async (eventId) => {
  try {
    if (eventId === undefined || eventId === null) {
      throw new Error("Event ID is required")
    }

    const [betsResult, lpsResult] = await Promise.all([
      flameWager.gql.query({
        bets: [
          {
            where: { event: { id: { _eq: eventId } } },
            order_by: { timestamp: "desc" },
          },
          bet,
        ],
      }),
      flameWager.gql.query({
        liquidityProvisions: [
          {
            where: { event: { id: { _eq: eventId } } },
            order_by: { timestamp: "desc" },
          },
          liquidityProvision,
        ],
      }),
    ])

    return {
      bets: betsResult.bets || [],
      liquidityProvisions: lpsResult.liquidityProvisions || [],
    }
  } catch (error) {
    console.error(
      `Error fetching participants for event ${eventId}: ${error.name}: ${error.message}`
    )
    return { bets: [], liquidityProvisions: [] }
  }
}

/**
 * Fetch events for a specific user
 * @param {Object} params
 * @param {string} params.address - User address
 * @param {number} [params.limit] - Max number of events
 * @returns {Promise<Array>} Array of events the user has participated in
 */
export const fetchUserEvents = async ({ address, limit = 100 }) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    // Fetch events where user has bets
    const { bets } = await flameWager.gql.query({
      bets: [
        {
          where: { user: { address: { _eq: address } } },
          order_by: { timestamp: "desc" },
          limit,
        },
        {
          event: eventModel,
        },
      ],
    })

    // Extract unique events
    const eventsMap = new Map()
    for (const b of (bets || [])) {
      if (b.event && !eventsMap.has(b.event.id)) {
        eventsMap.set(b.event.id, b.event)
      }
    }

    return Array.from(eventsMap.values())
  } catch (error) {
    console.error(
      `Error fetching events for user ${address}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Subscribe to event updates
 * @param {number} eventId - Event ID
 * @param {Function} onUpdate - Callback when event updates
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToEvent = (eventId, onUpdate) => {
  try {
    return flameWager.gql
      .subscription({
        eventsByPk: [
          {
            id: eventId,
          },
          eventModel,
        ],
      })
      .subscribe({
        next: (data) => {
          if (data.eventsByPk) {
            onUpdate(data.eventsByPk)
          }
        },
        error: (error) => {
          console.error(`Event subscription error: ${error}`)
        },
      })
  } catch (error) {
    console.error(
      `Error subscribing to event ${eventId}: ${error.name}: ${error.message}`
    )
    return { unsubscribe: () => {} }
  }
}

/**
 * Subscribe to new events
 * @param {Function} onNewEvent - Callback when new event is created
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToNewEvents = (onNewEvent) => {
  try {
    return flameWager.gql
      .subscription({
        events: [
          {
            where: { status: { _eq: "NEW" } },
            order_by: { createdTime: "desc" },
            limit: 10,
          },
          eventModel,
        ],
      })
      .subscribe({
        next: (data) => {
          if (data.events) {
            onNewEvent(data.events)
          }
        },
        error: (error) => {
          console.error(`New events subscription error: ${error}`)
        },
      })
  } catch (error) {
    console.error(
      `Error subscribing to new events: ${error.name}: ${error.message}`
    )
    return { unsubscribe: () => {} }
  }
}
