<template>
  <div class="notice">
    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="loading">
      <SkeletonLoader type="notification" :count="6" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchNotifications" class="retry-btn">重试</button>
    </div>

    <!-- 通知列表 -->
    <div v-else-if="notifications.length > 0" class="notifications">
      <!-- 顶部操作栏 -->
      <div class="notifications-header">
        <div class="header-logo">
          <div class="logo-icon">🐦</div>
        </div>
        <div class="header-title">通知</div>
        <button class="mark-all-read-btn" @click="markAllAsRead">全部已读</button>
      </div>
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
import { ref, onMounted, onActivated, onDeactivated } from 'vue'
import { getnoticeApi, readsomeonenotificationApi, readallnotificationApi } from '@/api/notice.js'
import { getNotificationsNumberApi } from '@/api/user.js'
import { useUserStore } from '@/store/user.js'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const userStore = useUserStore()
const notifications = ref([])
const loading = ref(false)
const error = ref('')

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

// 标记通知为已读
const markAsRead = async (notice) => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  try {
    const res = await readsomeonenotificationApi(userStore.userInfo.username, notice.id)
    if (res && res.code === 0) {
      // 更新本地状态
      const noticeIndex = notifications.value.findIndex(n => n.id === notice.id)
      if (noticeIndex !== -1) {
        notifications.value[noticeIndex].isRead = true
      }
      
      // 更新通知个数
      const currentCount = userStore.notificationsCount
      if (currentCount > 0) {
        userStore.setNotificationsCount(currentCount - 1)
      }
      
      console.log('通知已标记为已读')
    } else {
      console.error('标记已读失败:', res?.msg || '未知错误')
    }
  } catch (error) {
    console.error('标记已读请求失败:', error)
  }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  try {
    const res = await readallnotificationApi(userStore.userInfo.username)
    if (res && res.code === 0) {
      // 更新所有通知状态为已读
      notifications.value.forEach(notice => {
        notice.isRead = true
      })
      
      // 清空通知个数
      userStore.setNotificationsCount(0)
      
      console.log('所有通知已标记为已读')
    } else {
      console.error('全部已读失败:', res?.msg || '未知错误')
    }
  } catch (error) {
    console.error('全部已读请求失败:', error)
  }
}

const fetchNotifications = async () => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    error.value = '请先登录'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const res = await getnoticeApi(userStore.userInfo.username)
    if (res && res.code === 0) {
      notifications.value = Array.isArray(res.data) ? res.data : []
      
      // 同时更新通知个数
      try {
        const countRes = await getNotificationsNumberApi(userStore.userInfo.username)
        if (countRes && countRes.code === 0) {
          userStore.setNotificationsCount(parseInt(countRes.data) || 0)
        }
      } catch (e) {
        console.error('获取通知个数失败:', e)
      }
    } else {
      error.value = (res && res.msg) || '获取通知失败'
    }
  } catch (e) {
    console.error('获取通知失败:', e)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 定义组件名称
defineOptions({
  name: 'Notifications'
})

// 数据是否已加载过
const hasLoaded = ref(false)

onMounted(() => {
  if (!hasLoaded.value) {
    fetchNotifications()
    hasLoaded.value = true
  }
})

// 组件被激活时（从缓存中恢复）
onActivated(() => {
  if (notifications.value.length === 0 || !hasLoaded.value) {
    fetchNotifications()
    hasLoaded.value = true
  }
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('Notifications component deactivated')
})
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

/* 通知列表 */
.notifications { display: flex; flex-direction: column; }

/* 通知头部 */
.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eff3f4;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
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

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f1419;
  flex: 1;
}

.mark-all-read-btn {
  padding: 6px 12px;
  background: #1DA1F2;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-all-read-btn:hover {
  background: #1991db;
  transform: translateY(-1px);
}

.mark-all-read-btn:active {
  background: #0d8bd9;
  transform: translateY(0);
}
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
</style>
