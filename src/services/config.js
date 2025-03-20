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

export const chainConfig = {
    devnet: {
      chainId: '0xDECAF', // 912559 in hex
      chainName: 'Flame Devnet',
      nativeCurrency: {
        name: 'nRIA',
        symbol: 'nRIA',
        decimals: 18
      },
      rpcUrls: ['https://rpc.evm.dusk-11.devnet.astria.org'],
      blockExplorerUrls: ['https://explorer.evm.dusk-11.devnet.astria.org']
    },
    testnet: {
      chainId: '0xF00000000007', // 16604737732183 in hex
      chainName: 'Flame Testnet',
      nativeCurrency: {
        name: 'TIA',
        symbol: 'TIA',
        decimals: 18
      },
      rpcUrls: ['https://rpc.flame.dawn-1.astria.org'],
      blockExplorerUrls: ['https://explorer.flame.dawn-1.astria.org']
    },
    mainnet: {
        chainId: '0xF00000000007', // 16604737732183 in hex
        chainName: 'Flame Mainnet',
        nativeCurrency: {
          name: 'TIA',
          symbol: 'TIA',
          decimals: 18
        },
        rpcUrls: ['https://rpc.flame.astria.org'],
        blockExplorerUrls: ['https://explorer.flame.astria.org']
    }
};
export const rpcNodes = {
	devnet: [
		{ 
            url: "https://rpc.evm.dusk-11.devnet.astria.org",
            chainId: 912559,
            name: "Flame Devnet",
            code: "devnet" 
        }
	],
	testnet: [
		{ 
            url: "https://rpc.flame.dawn-1.astria.org",
            chainId: 16604737732183,
            name: "Flame Testnet",
            code: "testnet"
        }
	],
	mainnet: [
		{ 
            url: "https://rpc.flame.astria.org", 
            chainId: 16604737732183,
            name: "Flame Mainnet",
            code: "mainnet"
        }
	]
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
