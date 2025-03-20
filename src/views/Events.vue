<template>
  <div class="events-page">
    <div class="page-header">
      <h1>Juster Events</h1>
      <div class="header-actions">
        <button class="btn-reload" @click="loadEvents" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Reload</span>
        </button>
        <button v-if="isConnected" class="btn-create-event" @click="showCreateModal = true">
          Create Event
        </button>
      </div>
    </div>
    
    <div class="events-filters">
      <div class="filter-group">
        <label for="status-filter">Status</label>
        <select id="status-filter" v-model="filters.status">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="ready for measurement">Ready for Measurement</option>
          <option value="measurement">Measurement</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="currency-filter">Currency Pair</label>
        <select id="currency-filter" v-model="filters.currencyPair">
          <option value="all">All Pairs</option>
          <option v-for="pair in availableCurrencyPairs" :key="pair" :value="pair">
            {{ pair }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="sort-by">Sort By</label>
        <select id="sort-by" v-model="sortBy">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="pool-size-desc">Largest Pool</option>
          <option value="closing-soon">Closing Soon</option>
        </select>
      </div>
    </div>
    
    <div v-if="isLoading && !events.length" class="loading-container">
      <div class="spinner large"></div>
      <p>Loading events...</p>
    </div>
    
    <div v-else-if="!filteredEvents.length" class="no-events">
      <p v-if="isLoading">Loading events...</p>
      <p v-else>No events found matching your filters.</p>
    </div>
    
    <div v-else class="events-list">
      <div v-for="event in filteredEvents" :key="event.id" class="event-container">
        <EventCard :event="event">
          <template #actions>
            <button
              v-if="canBet(event)"
              class="btn-action bet"
              @click="openBetModal(event)"
            >
              Place Bet
            </button>
            
            <button
              v-if="canProvideLiquidity(event)"
              class="btn-action liquidity"
              @click="openLiquidityModal(event)"
            >
              Provide Liquidity
            </button>
            
            <button
              v-if="canStartMeasurement(event)"
              class="btn-action measure"
              @click="startMeasurement(event)"
            >
              Start Measurement
            </button>
            
            <button
              v-if="canCloseEvent(event)"
              class="btn-action close"
              @click="closeEvent(event)"
            >
              Close Event
            </button>
            
            <button
              v-if="canWithdraw(event)"
              class="btn-action withdraw"
              @click="withdraw(event)"
            >
              Withdraw
            </button>
          </template>
        </EventCard>
      </div>
    </div>
    
    <!-- Place Bet Modal -->
    <div v-if="showBetModal" class="modal">
      <div class="modal-backdrop" @click="showBetModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Place Bet</h2>
          <button class="btn-close" @click="showBetModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <EventCard :event="selectedEvent" v-if="selectedEvent" />
          <PlaceBetForm 
            v-if="selectedEvent" 
            :event="selectedEvent" 
            @bet-placed="onBetPlaced" 
          />
        </div>
      </div>
    </div>
    
    <!-- Create Event Modal (Placeholder) -->
    <div v-if="showCreateModal" class="modal">
      <div class="modal-backdrop" @click="showCreateModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create Event</h2>
          <button class="btn-close" @click="showCreateModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Create event form will be implemented here.</p>
        </div>
      </div>
    </div>
    
    <!-- Provide Liquidity Modal (Placeholder) -->
    <div v-if="showLiquidityModal" class="modal">
      <div class="modal-backdrop" @click="showLiquidityModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Provide Liquidity</h2>
          <button class="btn-close" @click="showLiquidityModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Provide liquidity form will be implemented here.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import EventCard from '@/components/EventCard.vue';
import PlaceBetForm from '@/components/PlaceBetForm.vue';
import { useWalletStore } from '@/store/wallet';
import { storeToRefs } from 'pinia';
import JusterService from '@/services/juster';

const walletStore = useWalletStore();
const { provider, signer, address, isConnected } = storeToRefs(walletStore);

// State
const events = ref([]);
const userPositions = ref({});
const isLoading = ref(false);
const filters = ref({
  status: 'all',
  currencyPair: 'all',
});
const sortBy = ref('newest');

// Modal state
const showBetModal = ref(false);
const showCreateModal = ref(false);
const showLiquidityModal = ref(false);
const selectedEvent = ref(null);

// Get all available currency pairs from events
const availableCurrencyPairs = computed(() => {
  const pairs = new Set();
  events.value.forEach(event => {
    if (event.currencyPair) {
      pairs.add(event.currencyPair);
    }
  });
  return Array.from(pairs);
});

// Filter and sort events
const filteredEvents = computed(() => {
  let result = [...events.value];
  
  // Apply filters
  if (filters.value.status !== 'all') {
    result = result.filter(event => 
      event.status && event.status.toLowerCase() === filters.value.status.toLowerCase()
    );
  }
  
  if (filters.value.currencyPair !== 'all') {
    result = result.filter(event => 
      event.currencyPair === filters.value.currencyPair
    );
  }
  
  // Apply sorting
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
      break;
      
    case 'oldest':
      result.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
      break;
      
    case 'pool-size-desc':
      result.sort((a, b) => {
        const totalA = parseFloat(a.totalPool) || 0;
        const totalB = parseFloat(b.totalPool) || 0;
        return totalB - totalA;
      });
      break;
      
    case 'closing-soon':
      result = result.filter(event => !event.isClosed && !event.measureOracleStartTime);
      result.sort((a, b) => {
        const timeA = new Date(a.betsCloseTime).getTime();
        const timeB = new Date(b.betsCloseTime).getTime();
        return timeA - timeB;
      });
      break;
  }
  
  return result;
});

// Load events from the contract
const loadEvents = async () => {
  if (isLoading.value) return;
  
  try {
    isLoading.value = true;
    
    // Initialize Juster service
    const justerService = new JusterService(provider.value);
    
    // Get all events
    const allEvents = await justerService.getAllEvents();
    events.value = allEvents;
    
    // If wallet is connected, get user positions for all events
    if (isConnected.value) {
      await loadUserPositions(allEvents);
    }
  } catch (error) {
    console.error('Error loading events:', error);
  } finally {
    isLoading.value = false;
  }
};

// Load user positions for all events
const loadUserPositions = async (eventsList) => {
  if (!isConnected.value || !address.value) return;
  
  try {
    const justerService = new JusterService(provider.value);
    const positions = {};
    
    for (const event of eventsList) {
      try {
        const position = await justerService.getPosition(address.value, event.id);
        positions[event.id] = position;
      } catch (error) {
        console.error(`Error loading position for event ${event.id}:`, error);
      }
    }
    
    userPositions.value = positions;
  } catch (error) {
    console.error('Error loading user positions:', error);
  }
};

// Check if user can bet on an event
const canBet = (event) => {
  if (!isConnected.value) return false;
  if (!event) return false;
  if (event.isClosed) return false;
  if (event.measureOracleStartTime) return false;
  
  // Check if bets are still open
  const now = Date.now();
  const betsCloseTime = new Date(event.betsCloseTime).getTime();
  return now < betsCloseTime;
};

// Check if user can provide liquidity
const canProvideLiquidity = (event) => {
  return canBet(event); // Same conditions as betting
};

// Check if user can start measurement
const canStartMeasurement = (event) => {
  if (!isConnected.value) return false;
  if (!event) return false;
  if (event.isClosed) return false;
  if (event.measureOracleStartTime) return false;
  
  // Check if bets close time has passed
  const now = Date.now();
  const betsCloseTime = new Date(event.betsCloseTime).getTime();
  return now >= betsCloseTime;
};

// Check if user can close an event
const canCloseEvent = (event) => {
  if (!isConnected.value) return false;
  if (!event) return false;
  if (event.isClosed) return false;
  if (!event.measureOracleStartTime) return false;
  
  // Check if measure period has passed since measurement start
  const now = Date.now();
  const measureStart = new Date(event.measureOracleStartTime).getTime();
  const measureEnd = measureStart + (event.measurePeriod * 1000);
  return now >= measureEnd;
};

// Check if user can withdraw from an event
const canWithdraw = (event) => {
  if (!isConnected.value) return false;
  if (!event) return false;
  if (!event.isClosed) return false;
  
  // Check if user has a position that hasn't been withdrawn
  const position = userPositions.value[event.id];
  if (!position) return false;
  
  // Check if there's something to withdraw and hasn't been withdrawn yet
  const hasDeposits = parseFloat(position.totalDeposited) > 0;
  return hasDeposits && !position.isWithdrawn;
};

// Open bet modal
const openBetModal = (event) => {
  selectedEvent.value = event;
  showBetModal.value = true;
};

// Open liquidity modal
const openLiquidityModal = (event) => {
  selectedEvent.value = event;
  showLiquidityModal.value = true;
};

// Handle bet placed
const onBetPlaced = async (betInfo) => {
  showBetModal.value = false;
  await loadEvents(); // Reload events to get updated data
};

// Start measurement for an event
const startMeasurement = async (event) => {
  if (!canStartMeasurement(event)) return;
  
  try {
    isLoading.value = true;
    
    const justerService = new JusterService(provider.value, signer.value);
    await justerService.startMeasurement(event.id);
    
    // Reload events
    await loadEvents();
  } catch (error) {
    console.error('Error starting measurement:', error);
    alert('Failed to start measurement. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Close an event
const closeEvent = async (event) => {
  if (!canCloseEvent(event)) return;
  
  try {
    isLoading.value = true;
    
    const justerService = new JusterService(provider.value, signer.value);
    await justerService.closeEvent(event.id);
    
    // Reload events
    await loadEvents();
  } catch (error) {
    console.error('Error closing event:', error);
    alert('Failed to close event. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Withdraw from an event
const withdraw = async (event) => {
  if (!canWithdraw(event)) return;
  
  try {
    isLoading.value = true;
    
    const justerService = new JusterService(provider.value, signer.value);
    await justerService.withdraw(event.id);
    
    // Reload events and positions
    await loadEvents();
  } catch (error) {
    console.error('Error withdrawing:', error);
    alert('Failed to withdraw. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

// Watch for wallet connection changes
watch(() => isConnected.value, async (newValue) => {
  if (newValue) {
    // If newly connected, reload user positions
    await loadUserPositions(events.value);
  }
});

// Load events when component is mounted
onMounted(async () => {
  await loadEvents();
  
  // Set up interval to refresh events periodically (every 30 seconds)
  const refreshInterval = setInterval(async () => {
    if (!showBetModal.value && !showCreateModal.value && !showLiquidityModal.value) {
      await loadEvents();
    }
  }, 30000);
  
  // Clean up interval when component is unmounted
  onUnmounted(() => {
    clearInterval(refreshInterval);
  });
});
</script>

<style scoped>
.events-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-reload, .btn-create-event {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-reload {
  background-color: #f6f8fa;
  border: 1px solid #d0d7de;
  color: #24292f;
}

.btn-reload:hover {
  background-color: #f3f4f6;
}

.btn-create-event {
  background-color: #2ea043;
  color: white;
}

.btn-create-event:hover {
  background-color: #2c974b;
}

.events-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-group label {
  font-size: 14px;
  margin-bottom: 4px;
  color: #57606a;
}

.filter-group select {
  padding: 8px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background-color: #ffffff;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #0969da;
  animation: spin 1s linear infinite;
}

.spinner.large {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-events {
  text-align: center;
  padding: 40px;
  background-color: #f6f8fa;
  border-radius: 8px;
  color: #57606a;
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.btn-action {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action.bet {
  background-color: #2ea043;
  color: white;
}

.btn-action.bet:hover {
  background-color: #2c974b;
}

.btn-action.liquidity {
  background-color: #0969da;
  color: white;
}

.btn-action.liquidity:hover {
  background-color: #0860c0;
}

.btn-action.measure, .btn-action.close {
  background-color: #fd8c73;
  color: white;
}

.btn-action.measure:hover, .btn-action.close:hover {
  background-color: #f0775c;
}

.btn-action.withdraw {
  background-color: #6e7781;
  color: white;
}

.btn-action.withdraw:hover {
  background-color: #5e666f;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1002;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #57606a;
}

.modal-body {
  padding: 20px;
}

@media (max-width: 768px) {
  .events-list {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style> 