// src/store/wallet.js
import { defineStore } from 'pinia';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { chainConfig } from "@config"

export const useWalletStore = defineStore({
  id: 'wallet',

  state: () => ({
    provider: null,
    signer: null,
    pkh: "", // Using pkh instead of address for consistency
    chainId: null,
    balance: "0",
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

    // Remove web3Modal from state since we'll create a new instance each time
    web3Modal: null
  }),

  getters: {
    isConnected: (state) => !!state.pkh,
    isLoggined: (state) => !!state.pkh,

    networkName: (state) => {
      if (!state.chainId) return 'Not Connected';
      
      switch (state.chainId) {
        case 912559:
          return "Flame Devnet";
        case 16604737732183:
          return "Flame Testnet";
        default:
          return 'Unknown Network';
      }
    },

    wonPositions: (state) => {
      return state.positionsForWithdrawal.filter(position => position.value);
    }
  },

  actions: {
    // Add method to get fresh Web3Modal instance
    getWeb3Modal() {
      // Create new instance each time to force prompt
      return new Web3Modal({
        cacheProvider: false, // Changed to false to prevent caching
        theme: 'dark',
        providerOptions: {}
      });
    },

    async switchToFlameNetwork(instance) {
      const targetNetwork = chainConfig.devnet;

      try {
        await instance.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetNetwork.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await instance.request({
              method: 'wallet_addEthereumChain',
              params: [targetNetwork],
            });
          } catch (addError) {
            throw new Error('Failed to add Flame network to wallet');
          }
        } else {
          throw switchError;
        }
      }
    },

    async connect() {
      try {
        this.isConnecting = true;
        
        // Get fresh Web3Modal instance
        const web3Modal = this.getWeb3Modal();
        const instance = await web3Modal.connect();
        await this.switchToFlameNetwork(instance);
        
        try {
          const web3Provider = new ethers.BrowserProvider(instance, "any");
          this.provider = web3Provider;

          const network = await web3Provider.getNetwork();
          const networkChainId = Number(network.chainId);

          if (networkChainId !== 912559 && networkChainId !== 16604737732183) {
            throw new Error('Please connect to Flame network');
          }
          
          this.chainId = networkChainId;
          
          const web3Signer = await web3Provider.getSigner();
          this.signer = web3Signer;
          this.pkh = await web3Signer.getAddress();
          
          await this.refreshBalance();
          
          instance.on('accountsChanged', this.handleAccountsChanged);
          instance.on('chainChanged', this.handleChainChanged);
          instance.on('disconnect', this.logout);
          
          localStorage.setItem('wallet-autoconnect', 'true');
          
          return true;
        } catch (error) {
          console.error('Provider creation error:', error);
          throw error;
        }
      } catch (error) {
        console.error('Connection error:', error);
        throw error;
      } finally {
        this.isConnecting = false;
      }
    },

    async logout() {
      try {
        // Clear ethereum connection
        if (window.ethereum) {
          try {
            // Remove all listeners
            window.ethereum.removeAllListeners('accountsChanged');
            window.ethereum.removeAllListeners('chainChanged');
            window.ethereum.removeAllListeners('disconnect');
          } catch (e) {
            console.warn('Error removing listeners:', e);
          }
        }
        
        // Reset all state
        this.provider = null;
        this.signer = null;
        this.pkh = "";
        this.chainId = null;
        this.balance = "0";
        this.positionsForWithdrawal = [];
        this.pendingTransaction = {
          awaiting: false,
          when: null,
          hash: null
        };
        
        // Clear local storage
        localStorage.removeItem('wallet-autoconnect');
        localStorage.removeItem('walletconnect'); // Clear WalletConnect cache if used
        
        // Clear all cached providers
        if (window.localStorage) {
          Object.keys(window.localStorage).forEach(key => {
            if (key.startsWith('walletconnect') || key.includes('wallet')) {
              window.localStorage.removeItem(key);
            }
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    async refreshBalance() {
      if (!this.signer) {
        console.error("Signer is not initialized!");
        return;
      }
    
      try {
        const balanceBigInt = await this.signer.getBalance();
        this.balance = ethers.formatEther(balanceBigInt);
      } catch (error) {
        console.error('Error fetching balance:', error);
        this.balance = "0";
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

    async handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        await this.logout();
      } else if (accounts[0] !== this.pkh) {
        this.pkh = accounts[0];
        await this.refreshBalance();
      }
    },

    async handleChainChanged(newChainId) {
      try {
        const chainIdNumber = parseInt(newChainId, 16);
        if (chainIdNumber !== 912559 && chainIdNumber !== 16604737732183) {
          await this.switchToFlameNetwork(this.provider?.provider);
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Chain change error:', error);
        await this.logout();
      }
    },

    async init() {
      // Only try to connect if explicitly requested
      const shouldAutoConnect = localStorage.getItem('wallet-autoconnect') === 'true';
      if (shouldAutoConnect) {
        try {
          await this.connect();
        } catch (error) {
          console.error('Auto-connect failed:', error);
          localStorage.removeItem('wallet-autoconnect');
        }
      }
    }
  }
});