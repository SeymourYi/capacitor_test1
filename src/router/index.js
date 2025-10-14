import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/articles'
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/home/articles/articleList.vue')
  },
  {
    path: '/articles/:id',
    name: 'ArticleInfo',
    component: () => import('../views/home/articles/articleInfo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

