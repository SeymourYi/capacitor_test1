<template>
  <div id="app">
    <keep-alive :include="cachedViews">
      <router-view />
    </keep-alive>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
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
