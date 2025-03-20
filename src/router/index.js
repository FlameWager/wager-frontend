import { createRouter, createWebHistory } from 'vue-router'

// Lazy-load routes
const Home = () => import('../views/Home.vue')
const Events = () => import('../views/EventsPage.vue')
// const MyBets = () => import('../views/MyBets.vue')
// const EventDetail = () => import('../views/EventDetail.vue')

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
  // {
  //   path: '/events/:id',
  //   name: 'EventDetail',
  //   component: EventDetail,
  //   props: true
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