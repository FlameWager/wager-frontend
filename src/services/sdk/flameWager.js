/**
 * Vendor
 */
import { computed, reactive } from "vue"
import { ethers } from "ethers"
import { switchChain } from "@wagmi/core"
import { activeRpcNode, NETWORK_TYPE, activeChainConfig } from "@config"

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
  isConnected: false
})

const currentNetwork = computed(() => {
  return activeChainConfig.network
})

// Set default network from environment
localStorage.activeNetwork = localStorage.activeNetwork || NETWORK_TYPE;

/**
 * Validate "activeNetwork" (Integrity Repair)
 */
if (![Networks.MAINNET, Networks.TESTNET, Networks.DEVNET].includes(localStorage.activeNetwork)) {
  localStorage.activeNetwork = NETWORK_TYPE;
}

/**
 * Initialize contract instances
 */
const initializeContracts = async () => {
  const networkKey = currentNetwork.value
  
  // Contract addresses should be defined in a constants file
  const addresses = {
    [Networks.DEVNET]: {
      core: "0x123...devnet", // Replace with actual contract addresses
      pool: "0x456...devnet",
    },
    [Networks.TESTNET]: {
      core: "0x123...testnet",
      pool: "0x456...testnet",
    },
    [Networks.MAINNET]: {
      core: "0x123...mainnet",
      pool: "0x456...mainnet",
    }
  }
  
  // Initialize core contract
  flameWager.contracts.core = new ethers.Contract(
    addresses[networkKey].core,
    JusterCoreABI,
    flameWager.signer
  )
}

/**
 * Initialize pool contracts
 */
const initPools = (pools) => {
  pools.forEach(pool => {
    juster.contracts.pools[pool.address] = new ethers.Contract(
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
  if (!window.ethereum) return
  
  // Handle account changes
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect()
    } else {
      // User switched accounts
      juster.address = accounts[0]
    }
  })
  
  // Handle chain changes
  window.ethereum.on('chainChanged', (chainIdHex) => {
    // Need to reload the page on chain change
    window.location.reload()
  })
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

export { 
  flameWager, 
  currentNetwork, 
  switchNetwork,
  initPools, 
  destroySubscription 
}
