import { http, createConfig } from '@wagmi/vue'
import { injected, metaMask, safe, walletConnect } from '@wagmi/vue/connectors'

// Get network type from environment variable
export const NETWORK_TYPE = import.meta.env.VITE_NETWORK_TYPE || 'testnet';
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

export const dipdup = {
  mainnet: {
    graphql: "http://localhost:8081/v1/graphql",
    ws: "ws://localhost:8081/v1/graphql",
  },
	testnet: {
		graphql: "http://localhost:8081/v1/graphql", 
		ws: "ws://localhost:8081/v1/graphql",
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
	testnet: {
		oracle: "0xC56684d7B3414880c8A035aeFcE0ca1fC7d2296A",
		wager: "0xAE4CcBD81Ff31B4aE076563518Ddcf0a50671B42",
		pool: "0xb0B468AC891feE379C9B432F74548a6C9773DB19",
	},
}
