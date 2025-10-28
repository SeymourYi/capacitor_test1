<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { createBackButtonHandler } from '@/utils/backButtonHandler.js'

const router = useRouter()
const userStore = useUserStore()

// 需要缓存的组件列表
const cachedViews = ref([
  'HomeFeed',
  'Notifications', 
  'Me',
  'ArticleList',
  'UserProfile',
  'AttentionList',
  'SearchArticles',
  'SearchUsers'
])

// 事件监听器清理函数
let cleanupEventListeners = null
// 返回按钮处理器
let backButtonHandler = null

onMounted(() => {
  // 初始化事件监听器
  cleanupEventListeners = userStore.initEventListeners()
  
  // 初始化返回按钮处理器
  backButtonHandler = createBackButtonHandler(router)
  backButtonHandler.startListening()
})

onUnmounted(() => {
  // 清理事件监听器
  if (cleanupEventListeners) {
    cleanupEventListeners()
  }
  
  // 清理返回按钮监听器
  if (backButtonHandler) {
    backButtonHandler.stopListening()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  font-family: Inter, sans-serif !important;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #ffffff;
  color: #0f1419;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  min-height: -webkit-fill-available;
  position: relative;
}

/* 移动端优化 */
@media (max-width: 768px) {
  body {
    font-size: 16px; /* 防止iOS自动缩放 */
  }
}
</style>
