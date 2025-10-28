import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/home/articles/articleList.vue'),
    meta: { keepAlive: true }
  },
  {
    path: '/home',
    component: () => import('../views/home/home/home.vue'),
    children: [
      {
        path: '',
        name: 'HomeFeed',
        component: () => import('../views/home/articles/articleList.vue'),
        meta: { keepAlive: true }
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('../views/home/notification/notification.vue'),
        meta: { keepAlive: true }
      },
      {
        path: 'message',
        name: 'Message',
        component: () => import('../views/home/message/message.vue'),
        meta: { keepAlive: true }
      },
      {
        path: 'me',
        name: 'Me',
        component: () => import('../views/home/me/me.vue'),
        meta: { keepAlive: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/settings/settings.vue'),
        meta: { keepAlive: true }
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
  },
  {
    path: '/articles/comment',
    name: 'PostCommitArticle',
    component: () => import('../views/home/articles/postcommitarticle.vue')
  },
  {
    path: '/articles/repeat',
    name: 'PostRepeatArticle',
    component: () => import('../views/home/articles/postrepeatarticle.vue')
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('../views/home/user/user.vue'),
    meta: { keepAlive: true }
  },
  {
    path: '/attention-list',
    name: 'AttentionList',
    component: () => import('../views/home/user/attionlist.vue'),
    meta: { keepAlive: true }
  }
  ,
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/login/regient.vue')
  },
  {
    path: '/search/articles',
    name: 'SearchArticles',
    component: () => import('../views/search/searcharticle.vue'),
    meta: { keepAlive: true }
  },
  {
    path: '/search/users',
    name: 'SearchUsers',
    component: () => import('../views/search/searchuser.vue'),
    meta: { keepAlive: true }
  },
  {
    path: '/sqlite-test',
    name: 'SQLiteTest',
    component: () => import('../views/sqlite-test.vue')
  },
  {
    path: '/chat/:userId/:username',
    name: 'ChatDetail',
    component: () => import('../views/home/message/chatDetail.vue')
  },
  {
    path: '/account-info',
    name: 'AccountInfo',
    component: () => import('../views/settings/accountInfo.vue')
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('../views/settings/changePassword.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

