import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '@/views/ChatView.vue'
import SessionsView from '@/views/SessionsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: ChatView,
    },
    {
      // The sessions overview page
      path: '/sessions',
      name: 'sessions',
      component: SessionsView,
    },
  ],
})

export default router