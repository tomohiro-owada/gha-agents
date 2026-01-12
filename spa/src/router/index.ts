import { createRouter, createWebHistory } from 'vue-router'
import AgentRunner from '@/pages/AgentRunner.vue'
import NewsIndex from '@/pages/NewsIndex.vue'
import NewsDetail from '@/pages/NewsDetail.vue'

const router = createRouter({
  history: createWebHistory('/agents/'),
  routes: [
    {
      path: '/',
      name: 'agent-runner',
      component: AgentRunner
    },
    {
      path: '/news',
      name: 'news-index',
      component: NewsIndex
    },
    {
      path: '/news/:date',
      name: 'news-detail',
      component: NewsDetail
    }
  ]
})

export default router
