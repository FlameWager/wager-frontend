import { http, createConfig } from '@wagmi/vue'
import { injected, metaMask, safe, walletConnect } from '@wagmi/vue/connectors'

// Get network type from environment variable
export const NETWORK_TYPE = import.meta.env.VITE_NETWORK_TYPE || 'testnet';
// const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const chainConfig = {
  devnet: {
    id: 912559,
    name: 'Flame Devnet',
    network: 'devnet',
    nativeCurrency: {
      name: 'nRIA',
      symbol: 'nRIA',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.evm.dusk-11.devnet.astria.org'],
        webSocket: ['wss://rpc.evm.dusk-11.devnet.astria.org'],
      },
      public: {
        http: ['https://rpc.evm.dusk-11.devnet.astria.org'],
        webSocket: ['wss://rpc.evm.dusk-11.devnet.astria.org'],
      },
    },
    blockExplorers: {
      default: { name: 'Flame Devnet Explorer', url: 'https://explorer.evm.dusk-11.devnet.astria.org' },
    },
  },
  testnet: {
    id: 16604737732183,
    name: 'Flame Testnet',
    network: 'testnet',
    nativeCurrency: {
      name: 'TIA',
      symbol: 'TIA',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.flame.dawn-1.astria.org'],
        webSocket: ['wss://rpc.flame.dawn-1.astria.org'],
      },
      public: {
        http: ['https://rpc.flame.dawn-1.astria.org'],
        webSocket: ['wss://rpc.flame.dawn-1.astria.org'],
      },
    },
    blockExplorers: {
      default: { name: 'Flame Testnet Explorer', url: 'https://explorer.flame.dawn-1.astria.org' },
    },
  },
  mainnet: {
    id: 16604737732183,
    name: 'Flame Mainnet',
    network: 'mainnet',
    nativeCurrency: {
      name: 'TIA',
      symbol: 'TIA',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://rpc.flame.astria.org'],
        webSocket: ['wss://rpc.flame.astria.org'],
      },
      public: {
        http: ['https://rpc.flame.astria.org'],
        webSocket: ['wss://rpc.flame.astria.org'],
      },
    },
    blockExplorers: {
      default: { name: 'Flame Mainnet Explorer', url: 'https://explorer.flame.astria.org' },
    },
  }
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
    url: chainConfig.testnet.rpcUrls[0],
    chainId: chainConfig.testnet.id,
    name: chainConfig.testnet.name,
    code: "testnet"
  },
  mainnet: { 
    url: chainConfig.mainnet.rpcUrls[0],
    chainId: chainConfig.mainnet.id,
    name: chainConfig.mainnet.name,
    code: "mainnet"
  }
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

export const dipdup = {
	mainnet: {
		graphq: "https://api.juster.fi/v1/graphql",
		ws: "wss://api.juster.fi/v1/graphql",
	},
	testnet: {
		graphq: `https://api.ithacanet-pool.juster.fi/v1/graphql`,
		ws: "wss://api.ithacanet-pool.juster.fi/v1/graphql",
	},
}

export const supportedMarkets = {
	"ETH-USD": { target: "Ethereum", description: "Ethereum / U.S. Dollar" },
	"TIA-USD": { target: "Celestia", description: "Celestia / U.S. Dollar" },
	"BTC-USD": { target: "Bitcoin", description: "Bitcoin / U.S. Dollar" },
}

export const sanity = {
	id: "2tokh3zd",
}

export const verifiedMakers = {
	testnet: [
		"tz1RVJBJDxohFBHLK2hw6JTrKbz6oLSLERU3",
		"KT1T4zTEZQLbFeKoR8sRihozyS4DAnyicYE3",
		"KT1M6fueToCaYBTeG25XZEFCa7YXcNDMn12x",
		"KT19XF9XW5osWpkQAZnpQkdyJsKfPuskk7JT",
		"KT1Jte8DZvUghZ9RE2Lis87tSA3GsRQqNvMC",
		"KT1AEzrdJvtd2TkLGhrQokhxkVSxUN4dbsot",
		"KT1FkBgjipxkupB9oXjmvKTgzdQAdHsPPfpp",
		"KT1DNt8ZE7HifCA6N7XiJtDBxhkMc3Bpaevm",
		"KT1JcMF3L3FkK3rszRGGxyT4tQt4JeCb7RWC",
		"KT1XELoPAA945ExHXS9mfG1Tx3gDUn7ph9cp",
		"KT1TNE38c5BFc9hXXAGBJ3fmXCPtHKV3Ng81",
		"KT1MRHBX9DoLYsmN58ediuARpzH4QdgMAQz8",
	],
	mainnet: [
		"tz1h5frRwDbJMGyTPntdwMC8i745q2Z1fzyF",
		"KT1Pq4GZ8E5ATLJdAmy7ypwnNzxhjmTQwtzP",
		"KT1KWxEUXmhoSqv8qjzwRQEVmhHGFTSVewAt",
		"KT1WGwGfW2Wx4EMJ2DNLnvoNEYCKA6GggQhb",
		"KT1JKiMQWE8hcSGq8j89mYDEY4DLpTE4vEaD",
		"KT1VWjtgFCM1bs3QRcqHcP31dowjDgdgVtxR",
		"KT1AatPqLrUumRZz4FRC9nG1acTvyizeQ4ni",
	],
}

export const contracts = {
	testnet: "KT1Feq9iRBBhpSBdPF1Y7Sd7iJu7uLqqRf1A",
	mainnet: "KT1D6XTy8oAHkUWdzuQrzySECCDMnANEchQq",
}
