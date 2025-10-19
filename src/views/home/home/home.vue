<template>
  <div class="layout">
    <!-- 顶部栏：左侧头像 + 中间标题 + 品牌logo -->
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
      <div class="header-logo">
        <div class="logo-icon">🐦</div>
      </div>
      <div class="title">{{ currentTitle }}</div>
      <div class="add-button" @click="toggleAddMenu">
        <svg viewBox="0 0 24 24" class="add-icon">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- 加号按钮下拉菜单 -->
    <div v-if="showAddMenu" class="add-menu-overlay" @click="closeAddMenu">
      <div class="add-menu" @click.stop>
        <div class="menu-arrow"></div>
        <div class="menu-item" @click="handleAddFriend">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2"/>
              <circle cx="8.5" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
              <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" stroke-width="2"/>
              <line x1="17" y1="11" x2="23" y2="11" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="menu-text">添加朋友</span>
        </div>
        <div class="menu-item" @click="handleSearchPosts">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" class="icon">
              <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <span class="menu-text">搜索帖子</span>
        </div>
      </div>
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
      <button class="tab" :class="{ active: isNotice }" @click="goNotice">
        <div class="tab-icon-wrapper">
          <svg viewBox="0 0 24 24" class="tab-icon">
            <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h18v-1l-2-2z" fill="currentColor"/>
          </svg>
          <!-- 通知个数徽章 -->
          <div v-if="userStore.notificationsCount > 0" class="notification-badge">
            {{ userStore.notificationsCount > 99 ? '99+' : userStore.notificationsCount }}
          </div>
        </div>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 加号菜单状态
const showAddMenu = ref(false)

const isHome = computed(() => route.name === 'HomeFeed')
const isNotice = computed(() => route.name === 'Notifications')
const isMe = computed(() => route.name === 'Me')

const currentTitle = computed(() => {
  if (isHome.value) return '主页'
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


const goToUserProfile = () => {
  if (userStore.userInfo && userStore.userInfo.id) {
    router.push({ name: 'UserProfile', params: { id: userStore.userInfo.id } })
  }
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 加号菜单控制
const toggleAddMenu = () => {
  showAddMenu.value = !showAddMenu.value
}

const closeAddMenu = () => {
  showAddMenu.value = false
}

// 菜单项点击事件
const handleAddFriend = () => {
  router.push({ name: 'SearchUsers' })
  closeAddMenu()
}

const handleSearchPosts = () => {
  router.push({ name: 'SearchArticles' })
  closeAddMenu()
}

const handleCreateGroup = () => {
  console.log('发起群聊')
  closeAddMenu()
}

const handleScan = () => {
  console.log('扫一扫')
  closeAddMenu()
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

.header-logo {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1419;
  flex: 1;
}

/* 加号按钮 */
.add-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.add-button:hover {
  background: #f7f9f9;
  border-color: #1DA1F2;
}

.add-button:active {
  background: #e6ecf0;
}

.add-icon {
  width: 18px;
  height: 18px;
  color: #0f1419;
}

/* 加号菜单覆盖层 */
.add-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 60px 16px 0 0;
}

/* 加号菜单 */
.add-menu {
  background: rgba(0, 0, 0, 0.559);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 8px 0;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  position: relative;
}

/* 菜单箭头 */
.menu-arrow {
  position: absolute;
  top: -6px;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(0, 0, 0, 0.8);
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item:active {
  background: rgba(255, 255, 255, 0.2);
}

.menu-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.menu-icon .icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.menu-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}

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

/* 通知徽章样式 */
.tab-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #f91880;
  color: #ffffff;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 全屏设备优化 */
@media (min-width: 768px) {
  .layout { max-width: 600px; margin: 0 auto; border-left: 1px solid #eff3f4; border-right: 1px solid #eff3f4; }
}
</style>
