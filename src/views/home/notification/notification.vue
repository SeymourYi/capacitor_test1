<template>
  <div class="notice">
    <!-- 顶部分段选择（全部/提及），UI-only -->
    <div class="seg">
      <button class="seg-btn active">全部</button>
      <button class="seg-btn">提及</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchNotifications" class="retry-btn">重试</button>
    </div>

    <!-- 通知列表 -->
    <div v-else-if="notifications.length > 0" class="notifications">
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
        </div>
        <div class="content">
          <div class="line">
            <span class="name">{{ notice.senderNickName }}</span>
            <span>{{ getActionText(notice.type) }}</span>
            <span class="time">· {{ notice.uptonow }}</span>
          </div>
          <div v-if="notice.oldArticleContent" class="excerpt">{{ notice.oldArticleContent }}</div>
          <div v-if="notice.newArticleContent" class="reply">{{ notice.newArticleContent }}</div>
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
import { ref, onMounted } from 'vue'
import { getnoticeApi } from '@/api/notice.js'
import { useUserStore } from '@/store/user.js'

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

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
* { box-sizing: border-box; }
.notice { background: #ffffff; min-height: 100%; }

.seg { display: flex; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #eff3f4; }
.seg-btn { flex: 0 0 auto; height: 32px; padding: 0 12px; border-radius: 16px; border: 1px solid #eff3f4; background: #f7f9f9; color: #0f1419; }
.seg-btn.active { background: #1DA1F2; color: #fff; border-color: #1DA1F2; }

/* 加载和错误状态 */
.loading, .error, .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 16px; color: #536471; }
.loading-spinner { width: 40px; height: 40px; border: 3px solid #eff3f4; border-top-color: #1DA1F2; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error { color: #f91880; }
.retry-btn { margin-top: 16px; background: #1DA1F2; color: #fff; border: none; border-radius: 20px; padding: 10px 24px; font-size: 15px; font-weight: 700; }

/* 通知列表 */
.notifications { display: flex; flex-direction: column; }
.item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.item.unread { background: #f7f9f9; }
.icon { width: 36px; height: 36px; border-radius: 50%; background: #dfe7f1; flex-shrink: 0; }
.sender-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.sender-avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: #1DA1F2; }
.content { flex: 1; min-width: 0; }
.line { color: #0f1419; }
.name { font-weight: 700; }
.time { color: #536471; margin-left: 6px; }
.excerpt { margin-top: 4px; color: #536471; font-size: 14px; }
.reply { margin-top: 6px; padding: 8px 12px; background: #f7f9f9; border-radius: 8px; color: #0f1419; font-size: 14px; }
</style>
