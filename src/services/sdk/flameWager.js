/**
 * Vendor
 */
import { computed, reactive } from "vue"
import { ethers } from "ethers"

import { rpcNodes } from "@config"

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
  network: null,
  chainId: null,
  isConnected: false
})

const currentNetwork = computed(() => {
  if (flameWager.chainId === 912559) return Networks.DEVNET
  if (flameWager.chainId === 16604737732183) return Networks.TESTNET
  return Networks.MAINNET
})

/**
 * Storage "activeNetwork"
 */
if (!localStorage.activeNetwork) {
  localStorage.activeNetwork = Networks.DEVNET
}

/**
 * Validate "activeNetwork" (Integrity Repair)
 */
if (![Networks.MAINNET, Networks.TESTNET, Networks.DEVNET].includes(localStorage.activeNetwork)) {
  localStorage.activeNetwork = Networks.DEVNET
}

/**
 * Connect to wallet and initialize contracts
 */
const connect = async () => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet detected. Please install MetaMask or another wallet.")
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    flameWager.address = accounts[0]

    // Create provider and signer
    flameWager.provider = new ethers.providers.Web3Provider(window.ethereum)
    flameWager.signer = flameWager.provider.getSigner()
    
    // Get network information
    const network = await flameWager.provider.getNetwork()
    flameWager.chainId = network.chainId
    flameWager.network = currentNetwork.value

    // Initialize contracts with appropriate addresses based on network
    await initializeContracts()
    
    flameWager.isConnected = true

    // Set up listeners for network or account changes
    setupEventListeners()
    
    return true
  } catch (error) {
    console.error("Connection error:", error)
    return false
  }
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
  
  const networkConfig = {
    [Networks.DEVNET]: {
      chainId: '0xDEADF', // 912559 in hex
      chainName: 'Flame Devnet',
      nativeCurrency: {
        name: 'nRIA',
        symbol: 'nRIA',
        decimals: 18
      },
      rpcUrls: [rpcNodes[network][0].url],
      blockExplorerUrls: ['https://explorer.evm.dusk-11.devnet.astria.org']
    },
    [Networks.TESTNET]: {
      chainId: '0xF00000000007', // 16604737732183 in hex
      chainName: 'Flame Testnet',
      nativeCurrency: {
        name: 'TIA',
        symbol: 'TIA',
        decimals: 18
      },
      rpcUrls: [rpcNodes[network][0].url],
      blockExplorerUrls: ['https://explorer.flame.dawn-1.astria.org']
    },
    [Networks.MAINNET]: {
      // Replace with actual Flame mainnet information when available
      chainId: '0x0', 
      chainName: 'Flame Mainnet',
      nativeCurrency: {
        name: 'RIA',
        symbol: 'RIA',
        decimals: 18
      },
      rpcUrls: [rpcNodes[network][0].url],
      blockExplorerUrls: ['https://explorer.flame.astria.org']
    }
  }
  
  try {
    if (window.ethereum) {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig[network].chainId }],
      })
    }
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig[network]],
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
 * Get balance
 */
const getBalance = async () => {
  if (!flameWager.provider || !flameWager.address) return "0"
  
  const balance = await flameWager.provider.getBalance(flameWager.address)
  return ethers.utils.formatEther(balance)
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
  connect,
  disconnect,
  switchNetwork, 
  initPools, 
  getBalance,
  destroySubscription 
}
