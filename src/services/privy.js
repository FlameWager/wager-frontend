// src/services/privy.js
import { reactive } from 'vue';

// Default dummy app ID if none is configured in .env (must be exactly 25 characters for Privy to not crash on mount)
export const DUMMY_PRIVY_APP_ID = "cl00000000000000000000000";

export const getPrivyAppId = () => {
  const envAppId = import.meta.env.VITE_PRIVY_APP_ID;
  if (envAppId && envAppId.trim().length > 0 && envAppId.trim() !== DUMMY_PRIVY_APP_ID) {
    return envAppId.trim();
  }
  return DUMMY_PRIVY_APP_ID;
};

export const isRealPrivyAppIdConfigured = () => {
  const envAppId = import.meta.env.VITE_PRIVY_APP_ID;
  return Boolean(envAppId && envAppId.trim().length > 0 && envAppId.trim() !== DUMMY_PRIVY_APP_ID);
};

export const privyState = reactive({
  ready: false,
  authenticated: false,
  user: null,
  wallets: [],
  login: null,
  logout: null,
});

const listeners = new Set();

export const subscribePrivyState = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setPrivyActions = ({ login, logout }) => {
  privyState.login = login;
  privyState.logout = logout;
};

export const updatePrivyState = (newState) => {
  if (newState.ready !== undefined) privyState.ready = newState.ready;
  if (newState.authenticated !== undefined) privyState.authenticated = newState.authenticated;
  if (newState.user !== undefined) privyState.user = newState.user;
  if (newState.wallets !== undefined) privyState.wallets = newState.wallets;

  listeners.forEach((listener) => {
    try {
      listener(privyState);
    } catch (e) {
      console.error("Error in privyState listener:", e);
    }
  });
};
