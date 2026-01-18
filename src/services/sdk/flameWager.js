/**
 * FlameWager SDK
 * Handles wallet connection, contract interactions, and GraphQL client for the MammothBet frontend
 */

/**
 * Vendor
 */
import { computed, reactive } from "vue"
import { ethers } from "ethers"
import { switchChain } from "@wagmi/core"
import { createClient } from "@urql/vue"
import {
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from "@urql/core"
import { createClient as createWSClient } from 'graphql-ws';
import { activeRpcNode, NETWORK_TYPE, activeChainConfig, dipdup, contracts } from "@config"

/**
 * Services.Constants
 */
import { Networks } from "@/services/constants/networks"

/**
 * Contracts and ABIs
 */
import JusterCoreABI from "@/contracts/abis/JusterCore.json"
import JusterPoolABI from "@/contracts/abis/JusterPool.json"

/**
 * Store
 */
const flameWager = reactive({
  provider: null,
  signer: null,
  contracts: {
    core: null,
    pools: {}
  },
  address: null,
  network: NETWORK_TYPE,
  chainId: activeRpcNode.chainId,
  isConnected: false,
  gql: null, // GraphQL client
})

const currentNetwork = computed(() => {
  return activeChainConfig.network
})

// Set default network from environment
if (typeof localStorage !== 'undefined') {
  localStorage.activeNetwork = localStorage.activeNetwork || NETWORK_TYPE;

  // Validate "activeNetwork" (Integrity Repair)
  if (![Networks.MAINNET, Networks.TESTNET, Networks.DEVNET].includes(localStorage.activeNetwork)) {
    localStorage.activeNetwork = NETWORK_TYPE;
  }
}

/**
 * Initialize GraphQL client
 */
const initializeGraphQL = () => {
  const networkKey = currentNetwork.value === 'mainnet' ? 'mainnet' : 'testnet'
  const graphqlConfig = dipdup[networkKey]

  if (!graphqlConfig) {
    console.warn("GraphQL configuration not found for network:", networkKey)
    return
  }

  try {
    const wsClient = createWSClient({
      url: graphqlConfig.ws,
    });

    flameWager.gql = createClient({
      url: graphqlConfig.graphql,
      exchanges: [
        cacheExchange,
        subscriptionExchange({
          forwardSubscription: (request) => {
            const input = { ...request, query: request.query || '' }
            return {
              subscribe: (sink) => {
                const unsubscribe = wsClient.subscribe(input, sink)
                return { unsubscribe }
              },
            }
          },
        }),
        fetchExchange,
      ],
      fetchOptions: {
        method: "POST",
      },
    });

    console.log("✅ GraphQL client initialized:", graphqlConfig.graphql)
  } catch (error) {
    console.error("Failed to initialize GraphQL client:", error)

    // Fallback: Create client without subscriptions
    flameWager.gql = createClient({
      url: graphqlConfig.graphql,
    })
  }
}

/**
 * Get contract addresses for current network
 */
const getContractAddresses = () => {
  const networkKey = currentNetwork.value === 'mainnet' ? 'mainnet' : 'testnet'
  return contracts[networkKey] || contracts.testnet
}

/**
 * Initialize contract instances
 */
const initializeContracts = async () => {
  const addresses = getContractAddresses()

  if (!flameWager.signer) {
    console.warn("Cannot initialize contracts: no signer available")
    return
  }

  try {
    // Initialize core (wager) contract
    if (addresses.wager) {
      flameWager.contracts.core = new ethers.Contract(
        addresses.wager,
        JusterCoreABI,
        flameWager.signer
      )
    }

    // Initialize pool contract
    if (addresses.pool) {
      flameWager.contracts.pools[addresses.pool] = new ethers.Contract(
        addresses.pool,
        JusterPoolABI,
        flameWager.signer
      )
    }

    console.log("✅ Contracts initialized")
  } catch (error) {
    console.error("Failed to initialize contracts:", error)
  }
}

/**
 * Initialize pool contracts
 */
const initPools = (pools) => {
  if (!flameWager.signer) {
    console.warn("Cannot initialize pools: no signer available")
    return
  }

  pools.forEach(pool => {
    flameWager.contracts.pools[pool.address] = new ethers.Contract(
      pool.address,
      JusterPoolABI,
      flameWager.signer
    )
  })
}

/**
 * Setup event listeners for wallet and network changes
 */
const setupEventListeners = () => {
  if (typeof window === 'undefined' || !window.ethereum) return

  // Handle account changes
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect()
    } else {
      // User switched accounts
      flameWager.address = accounts[0]
    }
  })

  // Handle chain changes
  window.ethereum.on('chainChanged', (chainIdHex) => {
    // Need to reload the page on chain change
    window.location.reload()
  })
}

/**
 * Connect wallet
 */
const connect = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error("No wallet found. Please install MetaMask.")
  }

  try {
    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    flameWager.provider = provider
    flameWager.signer = signer
    flameWager.address = accounts[0]
    flameWager.isConnected = true

    // Initialize contracts and GraphQL
    await initializeContracts()
    initializeGraphQL()
    setupEventListeners()

    console.log("✅ Wallet connected:", accounts[0])
    return accounts[0]
  } catch (error) {
    console.error("Failed to connect wallet:", error)
    throw error
  }
}

/**
 * Disconnect wallet
 */
const disconnect = () => {
  flameWager.provider = null
  flameWager.signer = null
  flameWager.address = null
  flameWager.isConnected = false
  flameWager.contracts.core = null
  flameWager.contracts.pools = {}
}

/**
 * Switch to a different network
 */
const switchNetwork = async (network, router) => {
  if (![Networks.MAINNET, Networks.TESTNET, Networks.DEVNET].includes(network)) return

  try {
    // Try to switch to the network
    await switchChain(config, {
      chainId: chainConfig[network].id
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainConfig[network]],
        })
      } catch (addError) {
        console.error(addError)
      }
    }
  }

  localStorage.activeNetwork = network

  // Reinitialize GraphQL for new network
  initializeGraphQL()

  if (router) {
    router.push("/")
  }
}


/**
 * Utility function to destroy subscription
 * Kept for compatibility with old code
 */
const destroySubscription = (sub) => {
  if (sub && typeof sub.unsubscribe === 'function' && !sub.closed) {
    sub.unsubscribe()
  }
}

// Initialize GraphQL client on load
initializeGraphQL()

export {
  flameWager,
  currentNetwork,
  connect,
  disconnect,
  switchNetwork,
  initPools,
  destroySubscription,
  initializeGraphQL,
  getContractAddresses,
}
