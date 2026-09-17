import { dipdup } from "@/services/config"
import { currentNetwork } from "@/services/sdk"

/**
 * Get GraphQL endpoint URL
 */
export const getGraphQLUrl = () => {
    const networkKey = currentNetwork.value === 'mainnet' ? 'mainnet' : 'testnet'
    const graphqlConfig = dipdup[networkKey];
    if (!graphqlConfig || !graphqlConfig.graphql) {
        if (!import.meta.env.VITE_GRAPHQL_URL) {
            console.warn("GraphQL configuration not found for network:", networkKey)
        }
        return import.meta.env.VITE_GRAPHQL_URL || ""
    }
    return graphqlConfig.graphql
}

/**
 * Execute a GraphQL query using native fetch
 */
export const executeQuery = async (query, variables = {}) => {
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
