<template>
  <div class="message">
    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="loading-container">
      <SkeletonLoader type="message" :count="6" />
    </div>

    <!-- 未登录提示 -->
    <div v-else-if="!userStore.userInfo" class="login-prompt">
      <div class="login-prompt-content">
        <div class="login-icon">
          <svg viewBox="0 0 24 24" class="login-svg">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor"/>
          </svg>
        </div>
        <h3 class="login-title">请先登录</h3>
        <p class="login-desc">登录后即可查看私信消息</p>
        <button class="login-btn" @click="goToLogin">
          <svg viewBox="0 0 24 24" class="login-btn-icon">
            <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" fill="currentColor"/>
          </svg>
          立即登录
        </button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div v-else class="message-list">
      <!-- 搜索框 -->
      <div class="search-section">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索消息..." 
            class="search-input"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- 消息会话列表 -->
      <div v-if="filteredMessages.length > 0" class="conversations">
        <div 
          v-for="conversation in filteredMessages" 
          :key="conversation.id" 
          class="conversation-item"
          :class="{ unread: conversation.unreadCount > 0 }"
          @click="openConversation(conversation)"
        >
          <div class="avatar">
            <img 
              v-if="conversation.otherUser.avatar" 
              :src="conversation.otherUser.avatar" 
              class="avatar-img" 
              :alt="conversation.otherUser.nickname"
              @error="handleImageError"
            />
            <div v-else class="avatar-placeholder">
              {{ conversation.otherUser.nickname?.charAt(0) || '?' }}
            </div>
            <!-- 未读消息数量徽章 -->
            <div v-if="conversation.unreadCount > 0" class="unread-badge">
              {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
            </div>
          </div>
          
          <div class="conversation-content">
            <div class="conversation-header">
              <div class="user-info">
                <span class="nickname" :class="{ 'unread-nickname': conversation.unreadCount > 0 }">
                  {{ conversation.otherUser.nickname }}
                </span>
                <span v-if="conversation.otherUser.username" class="username">
                  @{{ conversation.otherUser.username }}
                </span>
              </div>
              <div class="time">{{ formatTime(conversation.lastMessageTime) }}</div>
            </div>
            
            <div class="last-message">
              <span class="message-preview" :class="{ 'unread-message': conversation.unreadCount > 0 }">
                {{ conversation.lastMessage }}
              </span>
              <div v-if="conversation.lastMessageType === 'image'" class="message-type-icon">
                <svg viewBox="0 0 24 24" class="type-icon">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- 更多操作按钮 -->
          <div class="more-actions" @click.stop="showMoreActions(conversation)">
            <svg viewBox="0 0 24 24" class="more-icon">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" class="empty-svg">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor"/>
          </svg>
        </div>
        <h3 class="empty-title">暂无消息</h3>
        <p class="empty-desc">开始与朋友聊天吧</p>
        <button class="start-chat-btn" @click="startNewChat">
          <svg viewBox="0 0 24 24" class="start-chat-icon">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
          </svg>
          开始聊天
        </button>
      </div>
    </div>

    <!-- 更多操作菜单 -->
    <div v-if="showActionsMenu" class="actions-menu-overlay" @click="closeActionsMenu">
      <div class="actions-menu" @click.stop>
        <div class="menu-arrow"></div>
        <div class="menu-item" @click="markAsRead">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
            </svg>
          </div>
          <span class="menu-text">标记为已读</span>
        </div>
        <div class="menu-item" @click="deleteConversation">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
            </svg>
          </div>
          <span class="menu-text">删除会话</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const router = useRouter()
const userStore = useUserStore()

// 定义组件名称
defineOptions({
  name: 'Message'
})

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const showActionsMenu = ref(false)
const selectedConversation = ref(null)

// 模拟消息数据
const messages = ref([
  {
    id: 1,
    otherUser: {
      id: 2,
      username: 'alice',
      nickname: 'Alice',
      avatar: 'https://via.placeholder.com/40x40/1DA1F2/ffffff?text=A'
    },
    lastMessage: '你好！最近怎么样？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    lastMessageType: 'text',
    unreadCount: 2
  },
  {
    id: 2,
    otherUser: {
      id: 3,
      username: 'bob',
      nickname: 'Bob',
      avatar: 'https://via.placeholder.com/40x40/17bf63/ffffff?text=B'
    },
    lastMessage: '发送了一张图片',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    lastMessageType: 'image',
    unreadCount: 0
  },
  {
    id: 3,
    otherUser: {
      id: 4,
      username: 'charlie',
      nickname: 'Charlie',
      avatar: 'https://via.placeholder.com/40x40/f91880/ffffff?text=C'
    },
    lastMessage: '谢谢你的帮助！',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
    lastMessageType: 'text',
    unreadCount: 1
  },
  {
    id: 4,
    otherUser: {
      id: 5,
      username: 'diana',
      nickname: 'Diana',
      avatar: null
    },
    lastMessage: '明天见！',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3天前
    lastMessageType: 'text',
    unreadCount: 0
  }
])

// 计算属性
const filteredMessages = computed(() => {
  if (!searchQuery.value.trim()) {
    return messages.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return messages.value.filter(conversation => 
    conversation.otherUser.nickname.toLowerCase().includes(query) ||
    conversation.otherUser.username.toLowerCase().includes(query) ||
    conversation.lastMessage.toLowerCase().includes(query)
  )
})

// 方法
const goToLogin = () => {
  router.push({ name: 'Login' })
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  
  if (diff < 1000 * 60) {
    return '刚刚'
  } else if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / (1000 * 60))}分钟前`
  } else if (diff < 1000 * 60 * 60 * 24) {
    return `${Math.floor(diff / (1000 * 60 * 60))}小时前`
  } else if (diff < 1000 * 60 * 60 * 24 * 7) {
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))}天前`
  } else {
    return date.toLocaleDateString()
  }
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const openConversation = (conversation) => {
  // 跳转到聊天详情页面
  router.push({ 
    name: 'ChatDetail', 
    params: { 
      userId: conversation.otherUser.id,
      username: conversation.otherUser.username 
    } 
  })
}

const startNewChat = () => {
  // 跳转到搜索用户页面或新建聊天页面
  router.push({ name: 'SearchUsers' })
}

const showMoreActions = (conversation) => {
  selectedConversation.value = conversation
  showActionsMenu.value = true
}

const closeActionsMenu = () => {
  showActionsMenu.value = false
  selectedConversation.value = null
}

const markAsRead = () => {
  if (selectedConversation.value) {
    selectedConversation.value.unreadCount = 0
    closeActionsMenu()
  }
}

const deleteConversation = () => {
  if (selectedConversation.value) {
    const index = messages.value.findIndex(msg => msg.id === selectedConversation.value.id)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
    closeActionsMenu()
  }
}

// 模拟加载数据
const loadMessages = async () => {
  loading.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    // 这里可以添加实际的API调用逻辑
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  if (userStore.userInfo) {
    loadMessages()
  }
})

onActivated(() => {
  if (userStore.userInfo && !loading.value) {
    loadMessages()
  }
})

onDeactivated(() => {
  // 清理工作
})
</script>

<style scoped>
.message {
  min-height: 100%;
  background: #ffffff;
}

/* 加载状态 */
.loading-container {
  padding: 0;
}

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

/* 搜索区域 */
.search-section {
  padding: 12px 16px;
  border-bottom: 1px solid #eff3f4;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #f7f9f9;
  border-radius: 20px;
  padding: 8px 16px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #536471;
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #0f1419;
}

.search-input::placeholder {
  color: #536471;
}

/* 消息列表 */
.conversations {
  display: flex;
  flex-direction: column;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eff3f4;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.conversation-item:hover {
  background: #f7f9f9;
}

.conversation-item.unread {
  background: #f0f8ff;
  border-left: 3px solid #1DA1F2;
  padding-left: 13px;
}

/* 头像 */
.avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
}

/* 未读消息徽章 */
.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #f91880;
  color: #ffffff;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 会话内容 */
.conversation-content {
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

.conversation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.nickname {
  font-weight: 700;
  color: #0f1419;
  font-size: 15px;
  transition: color 0.2s;
}

.nickname.unread-nickname {
  color: #0f1419;
  font-weight: 800;
}

.username {
  color: #536471;
  font-size: 14px;
  flex-shrink: 0;
}

.time {
  color: #536471;
  font-size: 13px;
  flex-shrink: 0;
}

.last-message {
  display: flex;
  align-items: center;
  gap: 6px;
}

.message-preview {
  color: #536471;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  transition: color 0.2s;
}

.message-preview.unread-message {
  color: #0f1419;
  font-weight: 500;
}

.message-type-icon {
  flex-shrink: 0;
}

.type-icon {
  width: 16px;
  height: 16px;
  color: #536471;
}

/* 更多操作按钮 */
.more-actions {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.more-actions:hover {
  background: #f0f8ff;
}

.more-icon {
  width: 20px;
  height: 20px;
  color: #536471;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  background: #f7f9f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-svg {
  width: 40px;
  height: 40px;
  color: #536471;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1419;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 15px;
  color: #536471;
  margin: 0 0 32px 0;
  line-height: 1.4;
}

.start-chat-btn {
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
}

.start-chat-btn:hover {
  background: #1a8cd8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(29, 161, 242, 0.4);
}

.start-chat-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
}

.start-chat-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* 操作菜单 */
.actions-menu-overlay {
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

.actions-menu {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 8px 0;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  position: relative;
}

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
</style>
