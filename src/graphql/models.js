/**
 * GraphQL Models
 * Query fragments for fetching data from the Hasura GraphQL API
 */

// ============================================================================
// Event Models
// ============================================================================

/**
 * Basic event fields
 */
export const event = {
  id: true,
  status: true,
  currencyPair: {
    id: true,
    symbol: true,
  },
  creator: {
    address: true,
  },
  targetDynamics: true,
  betsCloseTime: true,
  measurePeriod: true,
  createdTime: true,
  liquidityPercent: true,
  poolAboveEq: true,
  poolBelow: true,
  totalLiquidityShares: true,
  totalBetsAmount: true,
  totalLiquidityProvided: true,
  totalValueLocked: true,
  startRate: true,
  closedRate: true,
  isBetsAboveEqWin: true,
  measureOracleStartTime: true,
  closedOracleTime: true,
};

/**
 * Extended event with participants
 */
export const eventWithParticipants = {
  ...event,
  bets: {
    id: true,
    user: {
      address: true,
    },
    betType: true,
    amount: true,
    timestamp: true,
  },
  liquidityProvisions: {
    id: true,
    provider: {
      address: true,
    },
    amount: true,
    shares: true,
    timestamp: true,
  },
};

// ============================================================================
// Position Models
// ============================================================================

/**
 * Position (bet/liquidity) fields
 */
export const position = {
  id: true,
  event: {
    id: true,
    status: true,
    currencyPair: {
      symbol: true,
    },
    betsCloseTime: true,
    isBetsAboveEqWin: true,
    closedOracleTime: true,
    poolAboveEq: true,
    poolBelow: true,
  },
  user: {
    address: true,
  },
  betType: true,
  amount: true,
  minimalWinAmount: true,
  payout: true,
  isWinner: true,
  transactionHash: true,
  timestamp: true,
};

/**
 * Bet model (subset of position)
 */
export const bet = {
  id: true,
  event: {
    id: true,
    currencyPair: {
      symbol: true,
    },
    status: true,
  },
  user: {
    address: true,
  },
  betType: true,
  amount: true,
  minimalWinAmount: true,
  payout: true,
  isWinner: true,
  transactionHash: true,
  blockNumber: true,
  timestamp: true,
};

/**
 * Liquidity provision model
 */
export const liquidityProvision = {
  id: true,
  event: {
    id: true,
    currencyPair: {
      symbol: true,
    },
    status: true,
  },
  provider: {
    address: true,
  },
  amount: true,
  shares: true,
  payout: true,
  transactionHash: true,
  timestamp: true,
};

// ============================================================================
// User Models
// ============================================================================

/**
 * User fields
 */
export const user = {
  address: true,
  totalBetsCount: true,
  totalBetsAmount: true,
  totalWinnings: true,
  totalLiquidityProvided: true,
  totalLiquidityWithdrawn: true,
  totalWithdrawn: true,
  totalPoolDeposits: true,
  totalPoolWithdrawals: true,
  totalPoolShares: true,
};

/**
 * User with positions
 */
export const userWithPositions = {
  ...user,
  bets: {
    ...bet,
  },
  liquidityProvisions: {
    ...liquidityProvision,
  },
};

// ============================================================================
// Currency Pair / Market Models
// ============================================================================

/**
 * Currency pair / market fields
 */
export const currencyPair = {
  id: true,
  symbol: true,
  totalEvents: true,
  totalVolume: true,
  totalValueLocked: true,
  currentPrice: true,
  lastPriceUpdate: true,
};

// ============================================================================
// Quote Models
// ============================================================================

/**
 * Quote fields (WMA = Weighted Moving Average)
 */
export const quotesWma = {
  currencyPairId: true,
  price: true,
  timestamp: true,
};

/**
 * Total value locked model
 */
export const totalValueLocked = {
  eventId: true,
  timestamp: true,
  totalValueLocked: true,
};

// ============================================================================
// Withdrawal Models
// ============================================================================

/**
 * Withdrawal fields
 */
export const withdrawal = {
  id: true,
  event: {
    id: true,
    currencyPair: {
      symbol: true,
    },
    closedOracleTime: true,
  },
  user: {
    address: true,
  },
  amount: true,
  transactionHash: true,
  timestamp: true,
};

// ============================================================================
// Pool Models
// ============================================================================

/**
 * Pool fields
 */
export const pool = {
  address: true,
  totalDeposits: true,
  totalRewards: true,
  totalShares: true,
  totalParticipants: true,
  totalEventsParticipated: true,
};

/**
 * Pool deposit fields
 */
export const poolDeposit = {
  id: true,
  pool: {
    address: true,
  },
  user: {
    address: true,
  },
  amount: true,
  shares: true,
  transactionHash: true,
  timestamp: true,
};

/**
 * Pool withdrawal fields
 */
export const poolWithdrawal = {
  id: true,
  pool: {
    address: true,
  },
  user: {
    address: true,
  },
  shares: true,
  amount: true,
  transactionHash: true,
  timestamp: true,
};

/**
 * Pool event participation fields
 */
export const poolEventParticipation = {
  id: true,
  pool: {
    address: true,
  },
  event: {
    id: true,
    currencyPair: {
      symbol: true,
    },
    status: true,
    totalValueLocked: true,
  },
  amount: true,
  transactionHash: true,
  timestamp: true,
};

// ============================================================================
// Price Update Models
// ============================================================================

/**
 * Price update fields
 */
export const priceUpdate = {
  id: true,
  currencyPair: {
    symbol: true,
  },
  price: true,
  oracleTimestamp: true,
  transactionHash: true,
  timestamp: true,
};

// ============================================================================
// Statistics Models
// ============================================================================

/**
 * Event statistics view
 */
export const eventStatistics = {
  eventId: true,
  symbol: true,
  status: true,
  totalBets: true,
  totalLiquidity: true,
  uniqueBettors: true,
  uniqueLps: true,
  averageBetSize: true,
};

/**
 * User statistics view
 */
export const userStatistics = {
  address: true,
  totalBetsCount: true,
  totalBetsAmount: true,
  totalWinnings: true,
  winRate: true,
  profitLoss: true,
};

/**
 * Currency pair statistics view
 */
export const currencyPairStatistics = {
  symbol: true,
  currentPrice: true,
  totalEvents: true,
  totalVolume: true,
  totalValueLocked: true,
  uniqueBettors: true,
  avgEventVolume: true,
};
