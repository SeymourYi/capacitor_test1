<template>
  <div class="me">
    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="loading-container">
      <SkeletonLoader type="profile" :count="1" />
    </div>

    <!-- 用户信息 -->
    <div v-else class="header">
      <div class="cover" :style="{ backgroundImage: userStore.userInfo && userStore.userInfo.bgImg ? 'url(' + userStore.userInfo.bgImg + ')' : '' }"></div>
      <div class="profile">
        <div class="avatar">
          <img 
            v-if="userStore.userInfo && userStore.userInfo.userPic" 
            :src="userStore.userInfo.userPic" 
            class="avatar-img" 
            :alt="userStore.userInfo.nickname"
            @error="handleImageError"
          />
          <div v-else class="avatar-placeholder"></div>
        </div>
        <div class="name">{{ userStore.userInfo ? userStore.userInfo.nickname : '我的昵称' }}</div>
        <div class="desc">{{ userStore.userInfo ? (userStore.userInfo.bio || '这个人很神秘，还没有简介') : '这个人很神秘，还没有登录' }}</div>
        <div v-if="userStore.userInfo" class="meta">
          <div v-if="userStore.userInfo.location" class="meta-item">
            <svg viewBox="0 0 24 24" class="meta-icon">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            {{ userStore.userInfo.location }}
          </div>
          <div v-if="userStore.userInfo.birthday" class="meta-item">
            <svg viewBox="0 0 24 24" class="meta-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
            </svg>
            {{ userStore.userInfo.birthday }}
          </div>
          <div v-if="userStore.userInfo.profession" class="meta-item">
            <svg viewBox="0 0 24 24" class="meta-icon">
              <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" fill="currentColor"/>
            </svg>
            {{ userStore.userInfo.profession }}
          </div>
          <div v-if="userStore.userInfo.createTime" class="meta-item">
            <svg viewBox="0 0 24 24" class="meta-icon">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
            </svg>
            {{ userStore.userInfo.createTime }}
          </div>
        </div>
        <!-- 未登录时显示登录按钮 -->
        <div v-if="!userStore.userInfo" class="login-section">
          <button class="login-button" @click="goToLogin">
            <svg viewBox="0 0 24 24" class="login-icon">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" fill="currentColor"/>
            </svg>
            登录
          </button>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="cell" @click="goTome">
        <div>我的帖子</div>
        <div class="arrow">›</div>
      </div>
      <div class="cell" @click="goAttentionList">
        <div>关注列表</div>
        <div class="arrow">›</div>
      </div>
      <div class="cell" @click="goSettings">
        <div>设置</div>
        <div class="arrow">›</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义组件名称
defineOptions({
  name: 'Me'
})

import { ref, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import { debugLoading } from '@/utils/debug.js'

const router = useRouter()
const userStore = useUserStore()

// 加载状态
const loading = ref(false)

const goSettings = () => router.push({ name: 'Settings' })
const goAttentionList = () => router.push({ name: 'AttentionList' })
const goToLogin = () => router.push({ name: 'Login' })
const goTome = () => {
  if (!userStore.userInfo.username) return
  router.push({ name: 'UserProfile', params: { id: userStore.userInfo.username } })
}
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 模拟加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    // 这里可以添加实际的用户信息加载逻辑
  } finally {
    loading.value = false
  }
}

// 组件被激活时（从缓存中恢复）
onActivated(() => {
  debugLoading.logActivation('Me')
  debugLoading.logLoadingState('Me', loading, userStore.userInfo)
  
  // 如果用户信息为空，则加载
  if (!userStore.userInfo) {
    loadUserInfo()
  }
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  debugLoading.logDeactivation('Me')
})
</script>

<style scoped>
.me { min-height: 100%; background: #ffffff; }

/* 加载状态 */
.loading-container {
  padding: 0;
}

/* 品牌Logo区域 */
.brand-header {
  background: linear-gradient(135deg, #1DA1F2, #1991db);
  padding: 20px 16px;
  text-align: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
}

.header { position: relative; }
.cover { height: 120px; background: linear-gradient(135deg, #1DA1F2, #74c0fc); background-size: cover; background-position: center; }
.profile { padding: 0 16px 16px; margin-top: -28px; }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: #ffffff; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: #1DA1F2; }
.name { margin-top: 8px; font-size: 18px; font-weight: 700; color: #0f1419; }
.desc { margin-top: 4px; font-size: 14px; color: #536471; }
.meta { 
  margin-top: 8px; 
  display: flex; 
  flex-direction: column;
  gap: 6px; 
  color: #536471; 
  font-size: 14px; 
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}

/* 登录按钮样式 */
.login-section {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(29, 161, 242, 0.3);
}

.login-button:hover {
  background: #1a8cd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 161, 242, 0.4);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(29, 161, 242, 0.3);
}

.login-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.section { margin-top: 8px; border-top: 1px solid #eff3f4; border-bottom: 1px solid #eff3f4; }
.cell { height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #f5f5f5; color: #0f1419; }
.cell:last-child { border-bottom: none; }
.arrow { color: #c4c4c4; }
</style>


