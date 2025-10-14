import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/home/articles/articleList.vue')
  },
  {
    path: '/home',
    component: () => import('../views/home/home/home.vue'),
    children: [
      {
        path: '',
        name: 'HomeFeed',
        component: () => import('../views/home/articles/articleList.vue')
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('../views/home/message/message.vue')
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('../views/home/notification/notification.vue')
      },
      {
        path: 'me',
        name: 'Me',
        component: () => import('../views/home/me/me.vue')
      }
    ]
  },
  {
    path: '/articles/:id',
    name: 'ArticleInfo',
    component: () => import('../views/home/articles/articleInfo.vue')
  }
  ,
  {
    path: '/articles/post',
    name: 'PostArticle',
    component: () => import('../views/home/articles/postarticle.vue')
  }
  ,
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('../views/home/user/user.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

