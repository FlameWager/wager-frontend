import { createRouter, createWebHistory } from 'vue-router'

// Lazy-load routes
const Home = () => import('../views/Home.vue')
const Events = () => import('../views/EventsPage.vue')
// const MyBets = () => import('../views/MyBets.vue')
const EventPage = () => import('../views/EventPage.vue')
// const PoolsPage = () => import('../views/PoolsPage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/events',
    name: 'Events',
    component: Events
  },
  {
    path: '/events/:id',
    name: 'EventPage',
    component: EventPage,
    props: true
  },
  // {
  //   path: "/pools",
  //   name: "Liquidity Pools",
  //   component: PoolsPage,
  // },
  // {
  //   path: '/my-bets',
  //   name: 'MyBets',
  //   component: MyBets
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 