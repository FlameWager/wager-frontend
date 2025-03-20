import JusterCoreABI from './abis/JusterCore.json'
import JusterPoolABI from './abis/JusterPool.json'
import ChainlinkPriceOracleABI from './abis/ChainlinkPriceOracle.json'

// Contract addresses - these should be updated after deployment
const ADDRESSES = {
  // Development addresses (hardhat)
  development: {
    JusterCore: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    JusterPool: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    ChainlinkPriceOracle: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
  },
  // Testnet addresses
  testnet: {
    JusterCore: '',
    JusterPool: '',
    ChainlinkPriceOracle: ''
  },
  // Mainnet addresses
  mainnet: {
    JusterCore: '',
    JusterPool: '',
    ChainlinkPriceOracle: ''
  }
}

// Get the network environment from the .env file
const NETWORK_ENV = import.meta.env.VITE_NETWORK_ENV || 'development'

// Export contract ABIs
export const ABIs = {
  JusterCore: JusterCoreABI,
  JusterPool: JusterPoolABI,
  ChainlinkPriceOracle: ChainlinkPriceOracleABI
}

// Export contract addresses for the current network
export const CONTRACT_ADDRESSES = ADDRESSES[NETWORK_ENV]

// Export a function to get a contract instance
export const getContractInstance = (contractName, provider) => {
  const ethers = require('ethers')
  const abi = ABIs[contractName]
  const address = CONTRACT_ADDRESSES[contractName]
  
  if (!abi) {
    throw new Error(`ABI for ${contractName} not found`)
  }
  
  if (!address) {
    throw new Error(`Address for ${contractName} not found on ${NETWORK_ENV} network`)
  }
  
  return new ethers.Contract(address, abi, provider)
} 