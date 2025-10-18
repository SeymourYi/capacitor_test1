<template>
  <div class="layout">
    <!-- 顶部栏：左侧头像 + 中间标题 -->
    <div class="topbar">
      <div class="avatar" @click="goToUserProfile">
        <img 
          v-if="userStore.userInfo && userStore.userInfo.userPic" 
          :src="userStore.userInfo.userPic" 
          class="avatar-img" 
          :alt="userStore.userInfo.nickname"
          @error="handleImageError"
        />
        <div v-else class="avatar-placeholder"></div>
      </div>
      <div class="title">{{ currentTitle }}</div>
      <div class="right-placeholder"></div>
    </div>

    <!-- 页面内容区域 -->
    <div class="content">
      <router-view />
    </div>

    <!-- 底部栏：主页 / 我 -->
    <div class="bottombar">
      <button class="tab" :class="{ active: isHome }" @click="goHome">
        <svg viewBox="0 0 24 24" class="tab-icon">
          <path d="M3 10.5l9-7 9 7V20a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9.5z" fill="currentColor"/>
        </svg>
        <span>主页</span>
      </button>
      <button class="tab" :class="{ active: isMessages }" @click="goMessages">
        <svg viewBox="0 0 24 24" class="tab-icon">
          <path d="M21 6h-18v12h4v4l6-4h8z" fill="currentColor"/>
        </svg>
        <span>消息</span>
      </button>
      <button class="tab" :class="{ active: isNotice }" @click="goNotice">
        <svg viewBox="0 0 24 24" class="tab-icon">
          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h18v-1l-2-2z" fill="currentColor"/>
        </svg>
        <span>通知</span>
      </button>
      <button class="tab" :class="{ active: isMe }" @click="goMe">
        <svg viewBox="0 0 24 24" class="tab-icon">
          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" fill="currentColor"/>
        </svg>
        <span>我</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isHome = computed(() => route.name === 'HomeFeed')
const isMessages = computed(() => route.name === 'Messages')
const isNotice = computed(() => route.name === 'Notifications')
const isMe = computed(() => route.name === 'Me')

const currentTitle = computed(() => {
  if (isHome.value) return '主页'
  if (isMessages.value) return '消息'
  if (isNotice.value) return '通知'
  return '我'
})

const goHome = () => {
  if (!isHome.value) router.push({ name: 'HomeFeed' })
}

const goMe = () => {
  if (!isMe.value) router.push({ name: 'Me' })
}

const goNotice = () => {
  if (!isNotice.value) router.push({ name: 'Notifications' })
}

const goMessages = () => {
  if (!isMessages.value) router.push({ name: 'Messages' })
}

const goToUserProfile = () => {
  if (userStore.userInfo && userStore.userInfo.id) {
    router.push({ name: 'UserProfile', params: { id: userStore.userInfo.id } })
  }
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}
</script>

<style scoped>
* { box-sizing: border-box; }

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
}

.topbar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 12px;
  background: #ffffff;
  border-bottom: 1px solid #eff3f4;
  z-index: 1000;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1DA1F2;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #1DA1F2;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1419;
}

.right-placeholder { width: 32px; height: 32px; }

.content {
  flex: 1;
  min-height: 0;
}

.bottombar {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  background: #ffffff;
  border-top: 1px solid #eff3f4;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: #536471;
}

.tab-icon { width: 24px; height: 24px; }
.tab.active { color: #1DA1F2; }

/* 全屏设备优化 */
@media (min-width: 768px) {
  .layout { max-width: 600px; margin: 0 auto; border-left: 1px solid #eff3f4; border-right: 1px solid #eff3f4; }
}
</style>
