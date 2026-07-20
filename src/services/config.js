import { http, createConfig } from '@wagmi/vue'
import { injected, metaMask, safe, walletConnect } from '@wagmi/vue/connectors'

// Get network type from environment variable
export const NETWORK_TYPE = import.meta.env.VITE_NETWORK_TYPE || 'testnet';
export const XTZ_ADDRESS = import.meta.env.VITE_XTZ_ADDRESS || "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503"
// const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const chainConfig = {
  devnet: {
    id: 912559,
    name: 'Shadownet',
    network: 'devnet',
    nativeCurrency: {
      name: 'XTZ',
      symbol: 'XTZ',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://node.shadownet.etherlink.com'],
        webSocket: ['wss://node.shadownet.etherlink.com'],
      },
      public: {
        http: ['https://node.shadownet.etherlink.com'],
        webSocket: ['wss://node.shadownet.etherlink.com'],
      },
    },
    blockExplorers: {
      default: { name: 'Shadownet Explorer', url: 'https://shadownet.explorer.etherlink.com' },
    },
  },
  testnet: {
    id: 127823,
    name: 'Etherlink Shadownet',
    network: 'testnet',
    nativeCurrency: {
      name: 'Tezos',
      symbol: 'XTZ',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://node.shadownet.etherlink.com'],
        webSocket: [],
      },
      public: {
        http: ['https://node.shadownet.etherlink.com'],
        webSocket: [],
      },
    },
    blockExplorers: {
      default: { name: 'Etherlink Shadownet Explorer', url: 'https://shadownet.explorer.etherlink.com' },
    },
  },
};

// Get the active chain config based on environment
export const activeChainConfig = chainConfig[NETWORK_TYPE];

export const rpcNodes = {
  devnet: {
    url: chainConfig.devnet.rpcUrls.default,
    chainId: chainConfig.devnet.id,
    name: chainConfig.devnet.name,
    code: "devnet"
  },
  testnet: {
    url: chainConfig.testnet.rpcUrls.default,
    chainId: chainConfig.testnet.id,
    name: chainConfig.testnet.name,
    code: "testnet"
  },
};

// Get active RPC node based on environment
export const activeRpcNode = rpcNodes[NETWORK_TYPE];

// Create wagmi config with active chain
export const config = createConfig({
  chains: [activeChainConfig],
  connectors: [
    metaMask(),
    injected(),
    // walletConnect({ projectId }),
    safe(),
  ],
  transports: {
    [activeChainConfig.id]: http(activeChainConfig.rpcUrls.default.http)
  },
});

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:8081/v1/graphql";
const GRAPHQL_WS = GRAPHQL_URL.replace(/^http/, 'ws');

export const dipdup = {
  mainnet: {
    graphql: GRAPHQL_URL,
    ws: GRAPHQL_WS,
  },
  testnet: {
    graphql: GRAPHQL_URL,
    ws: GRAPHQL_WS,
  },
}

export const supportedMarkets = {
  "ETH-USD": { target: "Ethereum", description: "Ethereum / U.S. Dollar" },
  "XTZ-USD": { target: "Tezos", description: "Tezos / U.S. Dollar" },
  "BTC-USD": { target: "Bitcoin", description: "Bitcoin / U.S. Dollar" },
}

export const sanity = {
  id: "2tokh3zd",
}

export const verifiedMakers = {
  testnet: [
    "0x327292fe3a8c8b9c4ae65fd67f742b10c4e61a55",
    "0x96e73a6b2682a0b34af98a288ad46b8bc9b779b2",
  ],
  mainnet: [
    "0x327292fE3A8C8B9C4aE65FD67f742B10C4E61A55",
  ],
}

export const contracts = {
  testnet: {
    oracle: "0x49cff589a45e90ae47d2ba6a5d2515879f347392",
    wager: "0x1d3e6593854835d08855ac8a18faf26bcfc66412",
    pool: "0x96e73a6b2682a0b34af98a288ad46b8bc9b779b2",
  },
}
