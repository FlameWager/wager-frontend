// src/store/account.js
import { defineStore } from 'pinia';
import { ethers } from 'ethers';
import { flameWager, initWithSigner } from "@sdk";
import { getBalance, disconnect } from '@wagmi/core';
import { config, activeRpcNode, activeChainConfig, XTZ_ADDRESS } from "@config";
import { useNotificationsStore } from "./notifications";
import {
  privyState,
  subscribePrivyState,
  isRealPrivyAppIdConfigured,
} from "@/services/privy";

export const useAccountStore = defineStore({
  id: 'account',

  state: () => ({
    provider: null,
    signer: null,
    pkh: "", // Using pkh instead of address for consistency
    chainId: null,
    balance: "0",
    btcBalance: "0",
    isConnecting: false,

    pendingTransaction: {
      awaiting: false,
      when: null,
      hash: null
    },

    isPositionsLoading: false,
    positionsForWithdrawal: [],
    withdrawals: [],
    showOnboarding: false,
  }),

  getters: {
    isConnected: (state) => !!state.pkh,
    isLoggined: (state) => !!state.pkh,

    networkName: (state) => {
      if (!state.chainId) return 'Not Connected';

      switch (state.chainId) {
        case 42793:
          return "Etherlink Mainnet";
        case 127823:
          return "Etherlink Shadownet";
        default:
          return 'Unknown Network';
      }
    },

    wonPositions: (state) => {
      return state.positionsForWithdrawal.filter(position => position.value);
    }
  },

  actions: {
    setPkh(address) {
      this.pkh = address;
    },

    async handlePrivyStateChange(state) {
      const notificationsStore = useNotificationsStore();

      if (state.authenticated && state.wallets && state.wallets.length > 0) {
        // Select active wallet matching user's primary wallet or default to the first wallet
        const activeWallet =
          state.wallets.find(
            (w) => w.address?.toLowerCase() === state.user?.wallet?.address?.toLowerCase()
          ) || state.wallets[0];
        const newAddress = activeWallet.address;

        if (this.pkh.toLowerCase() !== newAddress.toLowerCase() || !this.signer) {
          try {
            this.pkh = newAddress;
            this.chainId = activeChainConfig.id;

            // Ensure wallet is on the configured Etherlink network
            const currentChainId = activeWallet.chainId
              ? parseInt(activeWallet.chainId.replace('eip155:', ''), 10)
              : null;
            if (currentChainId && currentChainId !== activeChainConfig.id && typeof activeWallet.switchChain === 'function') {
              try {
                await activeWallet.switchChain(activeChainConfig.id);
              } catch (switchErr) {
                console.warn('Could not auto-switch wallet chain:', switchErr);
              }
            }

            // Get EIP-1193 provider from connected Privy wallet
            const rawProvider = await activeWallet.getEthereumProvider();
            const provider = new ethers.BrowserProvider(rawProvider);
            const signer = await provider.getSigner();

            this.provider = provider;
            this.signer = signer;

            // Initialize FlameWager SDK with signer
            await initWithSigner(signer, newAddress);

            // Fetch balance
            await this.refreshBalance();

            notificationsStore.create({
              notification: {
                type: "success",
                title: "Wallet Connected",
                description: `Connected to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`,
                autoDestroy: true
              }
            });
          } catch (error) {
            console.error("Error initializing Privy signer/provider:", error);
          }
        }
      } else if (!state.authenticated && this.pkh) {
        this.handleDisconnect();
      }
    },

    async connectWallet() {
      const notificationsStore = useNotificationsStore();
      try {
        this.isConnecting = true;

        if (!isRealPrivyAppIdConfigured()) {
          notificationsStore.create({
            notification: {
              type: "warning",
              title: "Privy App ID Not Configured",
              description: "Please set VITE_PRIVY_APP_ID in your .env file with your Privy App ID from dashboard.privy.io to enable login.",
              autoDestroy: false
            }
          });
        }

        if (privyState.login) {
          await privyState.login();
          return true;
        } else {
          notificationsStore.create({
            notification: {
              type: "warning",
              title: "Privy Initializing",
              description: "Privy authentication is still loading. Please try again in a moment.",
              autoDestroy: true
            }
          });
          return false;
        }
      } catch (error) {
        console.error("Privy login error:", error);
        notificationsStore.create({
          notification: {
            type: "warning",
            title: "Login Error",
            description: error?.message || "Failed to log in with Privy.",
            autoDestroy: true
          }
        });
        return false;
      } finally {
        this.isConnecting = false;
      }
    },

    async logout() {
      try {
        if (privyState.logout) {
          await privyState.logout();
        }
        await disconnect().catch(() => {});
        this.handleDisconnect();
      } catch (error) {
        console.error('Logout error:', error);
        this.handleDisconnect();
      }
    },

    handleDisconnect() {
      this.provider = null;
      this.signer = null;
      this.pkh = "";
      this.chainId = null;
      this.balance = "0";
      this.btcBalance = "0";
      this.positionsForWithdrawal = [];
      this.pendingTransaction = {
        awaiting: false,
        when: null,
        hash: null
      };
      localStorage.removeItem('wallet-autoconnect');
    },

    updateBalance() {
      this.refreshBalance();
    },

    async refreshBalance() {
      if (!this.pkh) return;

      try {
        let bal = "0";
        if (this.provider) {
          const balanceWei = await this.provider.getBalance(this.pkh);
          bal = ethers.formatEther(balanceWei);
        } else {
          const nativeBalanceData = await getBalance(config, {
            address: this.pkh,
            chainId: activeChainConfig.id,
          });
          bal = ethers.formatEther(nativeBalanceData.value);
        }
        this.balance = bal;
        this.btcBalance = bal;
      } catch (error) {
        console.error('Error fetching balances:', error);
        this.balance = "0";
        this.btcBalance = "0";
      }
    },

    removePosition(id) {
      const positionIndex = this.positionsForWithdrawal.findIndex(pos => pos.id === id);
      if (positionIndex === -1) return;
      this.positionsForWithdrawal.splice(positionIndex, 1);
    },

    setPendingTransaction(hash) {
      this.pendingTransaction = {
        awaiting: true,
        when: Date.now(),
        hash
      };
    },

    clearPendingTransaction() {
      this.pendingTransaction = {
        awaiting: false,
        when: null,
        hash: null
      };
    },

    init() {
      // Subscribe to Privy auth and wallet state changes
      subscribePrivyState(async (state) => {
        await this.handlePrivyStateChange(state);
      });
    }
  }
});
