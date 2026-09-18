import React, { useEffect } from 'react';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { getPrivyAppId, setPrivyActions, updatePrivyState } from '../services/privy';
import { activeChainConfig } from '../services/config';

export const etherlinkMainnet = {
  id: 42793,
  name: 'Etherlink Mainnet',
  network: 'etherlink-mainnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.node.etherlink.com'],
    },
    public: {
      http: ['https://mainnet.node.etherlink.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Mainnet Explorer',
      url: 'https://explorer.etherlink.com',
    },
  },
};

export const etherlinkTestnet = {
  id: 127823,
  name: 'Etherlink Shadownet',
  network: 'etherlink-shadownet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://node.shadownet.etherlink.com'],
    },
    public: {
      http: ['https://node.shadownet.etherlink.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Shadownet Explorer',
      url: 'https://shadownet.explorer.etherlink.com',
    },
  },
};

function PrivySync() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    setPrivyActions({ login, logout });
  }, [login, logout]);

  useEffect(() => {
    updatePrivyState({
      ready,
      authenticated,
      user,
      wallets,
    });
  }, [ready, authenticated, user, wallets]);

  return null;
}

export default function PrivyBridge() {
  const appId = getPrivyAppId();
  const defaultChain = activeChainConfig?.id === 42793 ? etherlinkMainnet : etherlinkTestnet;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        defaultChain,
        supportedChains: [etherlinkMainnet, etherlinkTestnet],
        appearance: {
          theme: 'dark',
          accentColor: '#276ef1',
          logo: '/favicon.svg',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <PrivySync />
    </PrivyProvider>
  );
}
