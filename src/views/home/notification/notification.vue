<template>
  <div class="notice" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <!-- 下拉刷新指示器 -->
    <div v-if="isPulling" class="pull-refresh-indicator" :style="{ transform: `translateY(${pullDistance}px)` }">
      <div class="refresh-content">
        <div v-if="!isRefreshing" class="refresh-icon" :style="{ transform: `rotate(${pullDistance * 2}deg)` }">
          <svg viewBox="0 0 24 24" class="refresh-svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
          </svg>
        </div>
        <div v-else class="refresh-spinner">
          <div class="spinner"></div>
        </div>
        <span class="refresh-text">{{ isRefreshing ? '正在刷新...' : pullDistance > 60 ? '释放刷新' : '下拉刷新' }}</span>
      </div>
    </div>

    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading && !isRefreshing" class="loading">
      <SkeletonLoader type="notification" :count="6" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchNotifications" class="retry-btn">重试</button>
    </div>

    <!-- 未登录提示 -->
    <div v-else-if="!userStore.userInfo" class="login-prompt">
      <div class="login-prompt-content">
        <div class="login-icon">
          <svg viewBox="0 0 24 24" class="login-svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
        </div>
        <h3 class="login-title">请先登录</h3>
        <p class="login-desc">登录后即可查看通知消息</p>
        <button class="login-btn" @click="goToLogin">
          <svg viewBox="0 0 24 24" class="login-btn-icon">
            <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" fill="currentColor"/>
          </svg>
          立即登录
        </button>
      </div>
    </div>

    <!-- 通知列表 -->
    <div v-else-if="notifications && notifications.length > 0" class="notifications">
      <div 
        v-for="notice in notifications" 
        :key="notice.id" 
        class="item"
        :class="{ unread: !notice.isRead }"
      >
        <div class="icon" :class="notice.type">
          <img 
            v-if="notice.senderUserPic" 
            :src="notice.senderUserPic" 
            class="sender-avatar" 
            :alt="notice.senderNickName"
            @error="handleImageError"
          />
          <div v-else class="sender-avatar-placeholder"></div>
          <!-- 未读标识点 -->
          <div v-if="!notice.isRead" class="unread-dot"></div>
        </div>
        <div class="content">
          <div class="line">
            <span class="name" :class="{ 'unread-name': !notice.isRead }">{{ notice.senderNickName }}</span>
            <span>{{ getActionText(notice.type) }}</span>
            <span class="time">· {{ notice.uptonow }}</span>
          </div>
          <div v-if="notice.oldArticleContent" class="excerpt" :class="{ 'unread-excerpt': !notice.isRead }">{{ notice.oldArticleContent }}</div>
          <div v-if="notice.newArticleContent" class="reply" :class="{ 'unread-reply': !notice.isRead }">{{ notice.newArticleContent }}</div>
        </div>
        <!-- 未读标识和点击按钮 -->
        <div v-if="!notice.isRead" class="unread-actions">
          <button class="mark-read-btn" title="标记为已读" @click="markAsRead(notice)">
            <svg viewBox="0 0 24 24" class="mark-read-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty">
      <p>暂无通知</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onDeactivated, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { useNotificationStore } from '@/store/notification.js'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 使用 store 中的数据
const notifications = computed(() => notificationStore.notifications)
const loading = computed(() => notificationStore.loading)
const error = computed(() => notificationStore.error)

// 下拉刷新相关
const isPulling = ref(false)
const isRefreshing = ref(false)
const pullDistance = ref(0)
const startY = ref(0)
const currentY = ref(0)
const maxPullDistance = 80

const getActionText = (type) => {
  const actions = {
    'like': '喜欢了你的推文',
    'comment': '评论了你的推文',
    'reArticle': '转推了你的推文',
    'follow': '关注了你'
  }
  return actions[type] || '与你互动了'
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 跳转到登录页面
const goToLogin = () => {
  router.push({ name: 'Login' })
}

// 标记通知为已读 - 使用 store 方法
const markAsRead = async (notice) => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  await notificationStore.markAsRead(userStore.userInfo.username, notice.id)
}

// 标记所有通知为已读 - 使用 store 方法
const markAllAsRead = async () => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  await notificationStore.markAllAsRead(userStore.userInfo.username)
}

// 获取通知列表 - 使用 store 方法
const fetchNotifications = async (forceRefresh = false) => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    return []
  }
  
  return await notificationStore.fetchNotifications(userStore.userInfo.username, forceRefresh)
}

// 定义组件名称
defineOptions({
  name: 'Notifications'
})

onMounted(() => {
  console.log('Notifications onMounted - hasLoaded:', notificationStore.hasLoaded, 'notifications count:', notifications.value?.length || 0)
  // 如果 store 中没有数据或需要刷新，则获取数据
  if (!notificationStore.hasLoaded || notificationStore.shouldRefresh()) {
    console.log('Notifications: 首次加载或需要刷新')
    fetchNotifications()
  } else {
    console.log('Notifications: 使用缓存数据，通知数量:', notifications.value?.length || 0)
  }
})

// 组件被激活时（从缓存中恢复）
onActivated(() => {
  console.log('Notifications onActivated - hasLoaded:', notificationStore.hasLoaded, 'notifications count:', notifications.value?.length || 0)
  // 如果 store 中没有数据或需要刷新，则获取数据
  if (!notificationStore.hasLoaded || notificationStore.shouldRefresh()) {
    console.log('Notifications: 重新获取数据')
    fetchNotifications()
  } else {
    console.log('Notifications: 使用缓存数据，通知数量:', notifications.value?.length || 0)
  }
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('Notifications component deactivated')
})

// 监听全部已读事件
const handleNotificationsRefresh = () => {
  fetchNotifications(true) // 强制刷新
}

onMounted(() => {
  window.addEventListener('notifications-refresh', handleNotificationsRefresh)
})

onUnmounted(() => {
  window.removeEventListener('notifications-refresh', handleNotificationsRefresh)
})

// 下拉刷新处理函数
const handleTouchStart = (e) => {
  if (window.scrollY === 0) {
    startY.value = e.touches[0].clientY
    isPulling.value = true
  }
}

const handleTouchMove = (e) => {
  if (!isPulling.value || isRefreshing.value) return
  
  currentY.value = e.touches[0].clientY
  const deltaY = currentY.value - startY.value
  
  if (deltaY > 0) {
    e.preventDefault()
    pullDistance.value = Math.min(deltaY * 0.5, maxPullDistance)
  }
}

const handleTouchEnd = async () => {
  if (!isPulling.value || isRefreshing.value) return
  
  if (pullDistance.value > 60) {
    isRefreshing.value = true
    pullDistance.value = 60
    
    try {
      // 强制刷新数据
      await fetchNotifications(true)
    } finally {
      isRefreshing.value = false
      pullDistance.value = 0
      isPulling.value = false
    }
  } else {
    pullDistance.value = 0
    isPulling.value = false
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }
.notice { background: #ffffff; min-height: 100%; }

.seg { display: flex; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #eff3f4; }
.seg-btn { flex: 0 0 auto; height: 32px; padding: 0 12px; border-radius: 16px; border: 1px solid #eff3f4; background: #f7f9f9; color: #0f1419; }
.seg-btn.active { background: #1DA1F2; color: #fff; border-color: #1DA1F2; }

/* 加载和错误状态 */
.loading { padding: 0; }
.error, .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 16px; color: #536471; }
.error { color: #f91880; }
.retry-btn { margin-top: 16px; background: #1DA1F2; color: #fff; border: none; border-radius: 20px; padding: 10px 24px; font-size: 15px; font-weight: 700; }

/* 登录提示样式 */
.login-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.login-prompt-content {
  text-align: center;
  max-width: 300px;
  width: 100%;
}

.login-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #1DA1F2, #74c0fc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(29, 161, 242, 0.3);
}

.login-svg {
  width: 40px;
  height: 40px;
  fill: #ffffff;
}

.login-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1419;
  margin: 0 0 8px 0;
}

.login-desc {
  font-size: 15px;
  color: #536471;
  margin: 0 0 32px 0;
  line-height: 1.4;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
}

.login-btn:hover {
  background: #1a8cd8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(29, 161, 242, 0.4);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
}

.login-btn-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* 通知列表 */
.notifications { display: flex; flex-direction: column; }

.item { 
  display: flex; 
  gap: 12px; 
  padding: 12px 16px; 
  border-bottom: 1px solid #eff3f4; 
  transition: background-color 0.2s;
}
.item.unread { 
  background: #f7f9f9; 
  border-left: 3px solid #1DA1F2;
  padding-left: 13px;
}
.icon { 
  width: 36px; 
  height: 36px; 
  border-radius: 50%; 
  background: #dfe7f1; 
  flex-shrink: 0; 
  position: relative;
}
.sender-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.sender-avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: #1DA1F2; }

/* 未读标识点 */
.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #f91880;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.content { flex: 1; min-width: 0; }
.line { color: #0f1419; }
.name { 
  font-weight: 700; 
  transition: color 0.2s;
}
.name.unread-name {
  color: #0f1419;
  font-weight: 800;
}
.time { color: #536471; margin-left: 6px; }
.excerpt { 
  margin-top: 4px; 
  color: #536471; 
  font-size: 14px; 
  transition: color 0.2s;
}
.excerpt.unread-excerpt {
  color: #0f1419;
  font-weight: 500;
}
.reply { 
  margin-top: 6px; 
  padding: 8px 12px; 
  background: #f7f9f9; 
  border-radius: 8px; 
  color: #0f1419; 
  font-size: 14px;
  transition: background-color 0.2s;
}
.reply.unread-reply {
  background: #e8f4fd;
  border: 1px solid #1DA1F2;
}

/* 未读操作区域 */
.unread-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8px;
}

.mark-read-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f0f8ff;
  color: #1DA1F2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
}

.mark-read-btn:hover {
  background: #1DA1F2;
  color: #ffffff;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(29, 161, 242, 0.3);
}

.mark-read-btn:active {
  transform: scale(0.95);
}

.mark-read-icon {
  width: 16px;
  height: 16px;
  transition: all 0.2s;
}

/* 添加脉冲动画效果 */
.mark-read-btn::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #1DA1F2;
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

/* 下拉刷新样式 */
.pull-refresh-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #eff3f4;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.refresh-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #536471;
}

.refresh-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.refresh-svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.refresh-spinner {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #eff3f4;
  border-top: 2px solid #1DA1F2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.refresh-text {
  font-size: 14px;
  font-weight: 500;
}
</style>
