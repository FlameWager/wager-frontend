<template>
  <div class="home">
    <h1>Juster Finance on Flame</h1>
    <p class="description">
      The most transparent betting system on Flame Network. 
      Bet on price changes of different currency pairs like ETH-USD, BTC-USD & TIA-USD.
    </p>
    
    <div class="cards">
      <div class="card">
        <h2>Create Events</h2>
        <p>Start a new betting event by defining currency pair, target dynamics, and more.</p>
        <router-link to="/events" class="button">Explore Events</router-link>
      </div>
      
      <div class="card">
        <h2>Place Bets</h2>
        <p>Bet on whether prices will go above or below the target.</p>
        <router-link to="/events" class="button">Start Betting</router-link>
      </div>
      
      <div class="card">
        <h2>Provide Liquidity</h2>
        <p>Earn rewards by providing liquidity to betting events.</p>
        <router-link to="/events" class="button">Provide Liquidity</router-link>
      </div>
    </div>

    <div v-if="latestEvents.length > 0" class="latest-events">
      <h2>Latest Events</h2>
      <event-list :events="latestEvents" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import EventList from '@/components/EventList.vue'
// import { useJusterStore } from '@/store/juster'

// const justerStore = useJusterStore()
const latestEvents = ref([])

onMounted(async () => {
  try {
    // await justerStore.loadEvents()
    // latestEvents.value = justerStore.events.slice(0, 3) // Show only 3 latest events
  } catch (error) {
    console.error('Failed to load events:', error)
  }
})
</script>

<style scoped>
.home {
  text-align: center;
}

.description {
  max-width: 800px;
  margin: 0 auto 40px;
  font-size: 1.2rem;
  line-height: 1.6;
  color: #555;
}

.cards {
  display: flex;
  justify-content: space-between;
  margin: 40px 0;
  gap: 20px;
}

.card {
  flex: 1;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.button {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #389e70;
}

.latest-events {
  margin-top: 60px;
}
</style> 