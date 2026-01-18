import { dipdup } from "@/services/config"
import { currentNetwork, flameWager } from "@/services/sdk"
import { pipe, subscribe } from "wonka"
import { EVENTS_BY_STATUS_QUERY, EVENT_BY_ID_QUERY, EVENTS_BY_MARKET_QUERY, TOP_EVENTS_QUERY, EVENT_BETS_QUERY, EVENT_LIQUIDITY_QUERY, USER_EVENTS_QUERY, NEW_EVENTS_SUBSCRIPTION, EVENT_SUBSCRIPTION } from "@/graphql/events"


/**
 * Get GraphQL endpoint URL
 */
const getGraphQLUrl = () => {
  const networkKey = currentNetwork.value === 'mainnet' ? 'mainnet' : 'testnet'
  const graphqlConfig = dipdup[networkKey];
  if (!graphqlConfig) {
    console.warn("GraphQL configuration not found for network:", networkKey)
    return "http://localhost:8081/v1/graphql"
  }
  return graphqlConfig.graphql
}

/**
 * Execute a GraphQL query using native fetch
 */
const executeQuery = async (query, variables = {}) => {
  const url = getGraphQLUrl()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()

  if (result.errors) {
    console.error("GraphQL errors:", result.errors)
    throw new Error(result.errors[0]?.message || "GraphQL error")
  }

  return result.data
}

/**
 * Transform event data for frontend compatibility
 */
const transformEvent = (event) => {
  if (!event) return null
  return {
    ...event,
    creatorId: event.creator?.address,
    bets: event.bets || [],
    deposits: event.liquidityProvisions || [],
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch events by status
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

    const data = await executeQuery(EVENTS_BY_STATUS_QUERY, {
      status: mappedStatus,
      limit,
      offset,
    })
    console.log("data", data.event)
    return (data?.event || []).map(transformEvent)
  } catch (error) {
    console.error(
      `Error fetching events by status ${status}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch a single event by ID
 */
export const fetchEventById = async (id) => {
  try {
    if (id === undefined || id === null) {
      throw new Error("Event ID is required")
    }

    const data = await executeQuery(EVENT_BY_ID_QUERY, { id })
    return transformEvent(data?.eventByPk)
  } catch (error) {
    console.error(
      `Error fetching event ${id}: ${error.name}: ${error.message}`
    )
    return null
  }
}

/**
 * Fetch events by market/currency pair
 */
export const fetchEventsByMarket = async ({ id, status, limit = 100 }) => {
  try {
    if (!id) {
      throw new Error("Market ID is required")
    }

    const data = await executeQuery(EVENTS_BY_MARKET_QUERY, {
      currencyPairId: id,
      status: status || null,
      limit,
    })

    return (data?.event || []).map(transformEvent)
  } catch (error) {
    console.error(
      `Error fetching events for market ${id}: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch top events (by total value locked)
 */
export const fetchTopEvents = async ({ limit = 10 } = {}) => {
  try {
    const data = await executeQuery(TOP_EVENTS_QUERY, { limit })
    return (data?.event || []).map(transformEvent)
  } catch (error) {
    console.error(
      `Error fetching top events: ${error.name}: ${error.message}`
    )
    return []
  }
}

/**
 * Fetch event participants (bets and liquidity provisions)
 */
export const fetchEventParticipants = async (eventId) => {
  try {
    if (eventId === undefined || eventId === null) {
      throw new Error("Event ID is required")
    }

    const [betsData, lpsData] = await Promise.all([
      executeQuery(EVENT_BETS_QUERY, { eventId }),
      executeQuery(EVENT_LIQUIDITY_QUERY, { eventId }),
    ])

    return {
      bets: betsData?.bet || [],
      liquidityProvisions: lpsData?.liquidityProvision || [],
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
 */
export const fetchUserEvents = async ({ address, limit = 100 }) => {
  try {
    if (!address) {
      throw new Error("Address is required")
    }

    const data = await executeQuery(USER_EVENTS_QUERY, { address, limit })

    // Extract unique events from bets
    const eventsMap = new Map()
    for (const bet of (data?.bet || [])) {
      if (bet.event && !eventsMap.has(bet.event.id)) {
        eventsMap.set(bet.event.id, transformEvent(bet.event))
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
    if (!eventId) {
      throw new Error("Event ID is required")
    }

    if (typeof onUpdate !== 'function') {
      throw new Error("onUpdate callback is required")
    }

    if (!flameWager.gql) {
      console.warn("GraphQL client not initialized")
      return { unsubscribe: () => { } }
    }

    // Use Wonka pipe and subscribe for URQL subscriptions
    const { unsubscribe } = pipe(
      flameWager.gql.subscription(EVENT_SUBSCRIPTION, { id: eventId }),
      subscribe((result) => {
        if (result.error) {
          console.error("Event subscription error:", result.error)
          return
        }

        if (result?.data?.eventByPk) {
          const transformedEvent = transformEvent(result.data.eventByPk)
          if (transformedEvent) {
            onUpdate(transformedEvent)
          }
        }
      })
    )

    return { unsubscribe }
  } catch (error) {
    console.error(`Error subscribing to event ${eventId}: ${error.message}`)
    return { unsubscribe: () => { } }
  }
}

/**
 * Subscribe to new events
 * @param {Function} onNewEvent - Callback when new events are received
 * @param {Object} [options] - Subscription options
 * @param {number} [options.limit] - Maximum number of events per update
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToNewEvents = (onNewEvent, options = {}) => {
  try {
    if (typeof onNewEvent !== 'function') {
      throw new Error("onNewEvent callback is required")
    }

    if (!flameWager.gql) {
      console.warn("GraphQL client not initialized")
      return { unsubscribe: () => { } }
    }

    if (!NEW_EVENTS_SUBSCRIPTION) {
      console.error("NEW_EVENTS_SUBSCRIPTION is undefined")
      return { unsubscribe: () => { } }
    }

    const { limit = 10 } = options || {}

    // Use Wonka pipe and subscribe for URQL subscriptions
    const { unsubscribe } = pipe(
      flameWager.gql.subscription(NEW_EVENTS_SUBSCRIPTION, { limit }),
      subscribe((result) => {
        if (result.error) {
          console.error("New events subscription error:", result.error)
          return
        }

        const events = result?.data?.event || []

        if (!Array.isArray(events)) return

        const transformedEvents = events
          .map(transformEvent)
          .filter(e => e !== null)

        if (transformedEvents.length > 0) {
          onNewEvent(transformedEvents)
        }
      })
    )

    return { unsubscribe }
  } catch (error) {
    console.error(`Error subscribing to new events: ${error.message}`)
    return { unsubscribe: () => { } }
  }
}