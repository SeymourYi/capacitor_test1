<template>
  <div class="chat-detail">
    <!-- 推特风格的头部 -->
    <div class="chat-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
        </button>
        <div class="user-info" @click="showUserInfo">
          <div class="user-avatar">
            <img 
              v-if="otherUser.avatar" 
              :src="otherUser.avatar" 
              :alt="otherUser.nickname"
              @error="handleImageError"
            />
            <div v-else class="avatar-placeholder">
              {{ otherUser.nickname?.charAt(0) || '?' }}
            </div>
          </div>
          <div class="user-details">
            <div class="username">{{ otherUser.nickname || '未知用户' }}</div>
            <div class="user-status">
              <span class="status-dot" :class="{ online: isOnline }"></span>
              {{ isOnline ? '在线' : '离线' }}
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="showMoreOptions">
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 日记风格的消息区域 -->
    <div class="messages-container" ref="messagesContainer">
      <!-- 日记本装饰背景 -->
      <div class="diary-background">
        <div class="diary-margin"></div>
        <div class="diary-lines"></div>
        <div class="diary-holes"></div>
      </div>
      
      <div class="messages-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-messages">
          <div class="loading-text">正在加载消息...</div>
        </div>

        <!-- 消息列表 -->
        <div v-else-if="messages.length > 0" class="messages">
          <div 
            v-for="message in messages" 
            :key="message.id" 
            class="message-item"
            :class="{ 
              'sent': message.senderId === currentUserId, 
              'received': message.senderId !== currentUserId 
            }"
          >
            <!-- 接收的消息 - 日记对话风格 -->
            <div v-if="message.senderId !== currentUserId" class="received-message">
              <div class="diary-entry received-entry">
                <div class="entry-header">
                  <div class="entry-date">{{ formatDiaryDate(message.timestamp) }}</div>
                  <div class="entry-time">{{ formatDiaryTime(message.timestamp) }}</div>
                </div>
                <div class="entry-content">
                  <div class="entry-author">
                    <div class="author-avatar">
                      <img 
                        v-if="otherUser.avatar" 
                        :src="otherUser.avatar" 
                        :alt="otherUser.nickname"
                        @error="handleImageError"
                      />
                      <div v-else class="avatar-placeholder">
                        {{ otherUser.nickname?.charAt(0) || '?' }}
                      </div>
                    </div>
                    <div class="author-info">
                      <div class="author-name">{{ otherUser.nickname }}</div>
                      <div class="author-status">
                        <span class="status-dot" :class="{ online: isOnline }"></span>
                        {{ isOnline ? '在线' : '离线' }}
                      </div>
                    </div>
                  </div>
                  <div class="entry-text">
                    <div class="text-content">{{ message.content }}</div>
                    <div class="text-signature">—— {{ otherUser.nickname }}</div>
                  </div>
                </div>
                <div class="entry-decoration">
                  <div class="diary-stamp">📝</div>
                </div>
              </div>
            </div>

            <!-- 发送的消息 - 日记风格 -->
            <div v-else class="sent-message">
              <div class="diary-entry sent-entry">
                <div class="entry-header">
                  <div class="entry-date">{{ formatDiaryDate(message.timestamp) }}</div>
                  <div class="entry-time">{{ formatDiaryTime(message.timestamp) }}</div>
                </div>
                <div class="entry-content">
                  <div class="entry-author">
                    <div class="author-avatar">
                      <img 
                        v-if="currentUser.avatar" 
                        :src="currentUser.avatar" 
                        :alt="currentUser.nickname"
                        @error="handleImageError"
                      />
                      <div v-else class="avatar-placeholder">
                        {{ currentUser.nickname?.charAt(0) || '我' }}
                      </div>
                    </div>
                    <div class="author-info">
                      <div class="author-name">我</div>
                      <div class="author-status">
                        <span class="status-dot online"></span>
                        在线
                      </div>
                    </div>
                  </div>
                  <div class="entry-text">
                    <div class="text-content">{{ message.content }}</div>
                    <div class="text-signature">—— 我</div>
                  </div>
                </div>
                <div class="entry-decoration">
                  <div class="diary-stamp">✍️</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-messages">
          <div class="empty-icon">📖</div>
          <div class="empty-text">日记本还是空白</div>
          <div class="empty-subtext">开始记录你们的对话吧！</div>
        </div>
      </div>
    </div>

    <!-- 日记风格的输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <div class="diary-page">
          <div class="page-header">
            <div class="page-date">{{ formatCurrentDate() }}</div>
            <div class="page-lines"></div>
          </div>
          <div class="input-wrapper">
            <div class="diary-input-container">
              <div class="input-label">今日记录：</div>
              <textarea 
                v-model="newMessage" 
                placeholder="在这里写下你想说的话..."
                class="diary-input"
                @keydown="handleKeyDown"
                @input="handleInput"
                ref="messageInput"
              ></textarea>
            </div>
            <div class="input-actions">
              <button class="emoji-btn" @click="showEmojiPicker">
                <svg viewBox="0 0 24 24" class="emoji-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
              </button>
              <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
                <svg viewBox="0 0 24 24" class="send-icon">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                </svg>
                <span class="send-text">记录</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户信息弹窗 -->
    <div v-if="showUserInfoModal" class="modal-overlay" @click="closeUserInfo">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>用户信息</h3>
          <button class="close-btn" @click="closeUserInfo">×</button>
        </div>
        <div class="modal-body">
          <div class="user-profile">
            <div class="profile-avatar">
              <img 
                v-if="otherUser.avatar" 
                :src="otherUser.avatar" 
                :alt="otherUser.nickname"
                @error="handleImageError"
              />
              <div v-else class="avatar-placeholder">
                {{ otherUser.nickname?.charAt(0) || '?' }}
              </div>
            </div>
            <div class="profile-info">
              <div class="profile-name">{{ otherUser.nickname || '未知用户' }}</div>
              <div class="profile-username">@{{ otherUser.username || 'unknown' }}</div>
              <div class="profile-status">
                <span class="status-dot" :class="{ online: isOnline }"></span>
                {{ isOnline ? '在线' : '离线' }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn primary" @click="startVideoCall">视频通话</button>
          <button class="modal-btn secondary" @click="blockUser">屏蔽用户</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { ChatAPI, ChatUtils } from '@/api/chat.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 定义组件名称
defineOptions({
  name: 'ChatDetail'
})

// 响应式数据
const loading = ref(false)
const newMessage = ref('')
const showUserInfoModal = ref(false)
const messagesContainer = ref(null)
const messageInput = ref(null)
const currentSession = ref(null)

// 从路由参数获取用户信息
const otherUserId = computed(() => route.params.userId)
const otherUsername = computed(() => route.params.username)

// 当前用户信息
const currentUserId = computed(() => userStore.userInfo?.id || 1)
const currentUser = computed(() => userStore.userInfo || { 
  id: 1, 
  nickname: '我', 
  username: 'me',
  avatar: null 
})

// 对方用户信息
const otherUser = ref({
  id: parseInt(otherUserId.value),
  username: otherUsername.value,
  nickname: otherUsername.value,
  avatar: null
})

// 在线状态（模拟）
const isOnline = ref(Math.random() > 0.5)

// 消息数据
const messages = ref([])

// 方法
const getNicknameFromUsername = (username) => {
  if (!username) return '未知用户'
  return username.charAt(0).toUpperCase() + username.slice(1)
}

// 初始化聊天
const initChat = async () => {
  try {
    loading.value = true
    
    // 初始化聊天系统
    await ChatAPI.init()
    
    // 获取或创建对方用户
    let user = await ChatAPI.user.getById(otherUser.value.id)
    if (!user) {
      // 如果用户不存在，创建一个默认用户
      const defaultUser = ChatUtils.createDefaultUser(
        otherUser.value.username,
        `${otherUser.value.username}@example.com`,
        'password123'
      )
      const createResult = await ChatAPI.user.create(defaultUser)
      user = await ChatAPI.user.getById(createResult.changes.lastId)
    }
    
    if (user) {
      otherUser.value = {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        avatar: user.avatar
      }
      isOnline.value = user.is_online === 1
    }
    
    // 获取或创建聊天会话
    currentSession.value = await ChatAPI.session.getOrCreate(
      currentUserId.value,
      otherUser.value.id
    )
    
    // 加载历史消息
    await loadMessages()
    
    // 更新当前用户在线状态
    await ChatAPI.user.updateOnlineStatus(currentUserId.value, true)
    
  } catch (error) {
    console.error('初始化聊天失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载消息
const loadMessages = async () => {
  try {
    if (!currentSession.value) return
    
    console.log('正在从SQLite加载消息，会话ID:', currentSession.value.id)
    
    const messageList = await ChatAPI.message.getSessionMessages(
      currentSession.value.id,
      100, // 增加加载数量
      0
    )
    
    console.log('从SQLite加载的消息数量:', messageList.length)
    
    // 转换消息格式
    messages.value = messageList.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      type: msg.message_type || 'text'
    })).reverse() // 按时间正序排列
    
    console.log('转换后的消息数量:', messages.value.length)
    
    // 标记消息为已读
    if (currentSession.value) {
      await ChatAPI.message.markSessionAsRead(currentSession.value.id, currentUserId.value)
    }
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const formatMessageTime = (timestamp) => {
  const now = new Date()
  const messageTime = new Date(timestamp)
  const diff = now - messageTime
  
  if (diff < 1000 * 60) {
    return '刚刚'
  } else if (diff < 1000 * 60 * 60) {
    return `${Math.floor(diff / (1000 * 60))}分钟前`
  } else if (diff < 1000 * 60 * 60 * 24) {
    return messageTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else {
    return messageTime.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const formatDiaryDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (messageDate.getTime() === today.getTime()) {
    return '今天'
  } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
  }
}

const formatDiaryTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

const formatCurrentDate = () => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  // 自动调整输入框高度
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentSession.value) return
  
  try {
    const content = newMessage.value.trim()
    newMessage.value = ''
    
    console.log('正在发送消息到SQLite:', content)
    
    // 发送消息到数据库
    const message = await ChatAPI.message.send(
      currentSession.value.id,
      currentUserId.value,
      otherUser.value.id,
      content,
      'text'
    )
    
    console.log('消息已保存到SQLite:', message)
    
    // 添加到本地消息列表
    const newMsg = {
      id: message.id,
      senderId: message.sender_id,
      content: message.content,
      timestamp: new Date(message.created_at),
      type: message.message_type
    }
    
    messages.value.push(newMsg)
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
  } catch (error) {
    console.error('发送消息失败:', error)
    // 恢复输入内容
    newMessage.value = content
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const showEmojiPicker = () => {
  // 简单的表情选择
  const emojis = ['😊', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉']
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
  newMessage.value += randomEmoji
}

const showUserInfo = () => {
  showUserInfoModal.value = true
}

const closeUserInfo = () => {
  showUserInfoModal.value = false
}

const showMoreOptions = () => {
  // 显示更多选项菜单
  console.log('显示更多选项')
}

const startVideoCall = () => {
  alert('视频通话功能暂未实现')
  closeUserInfo()
}

const blockUser = () => {
  if (confirm('确定要屏蔽这个用户吗？')) {
    alert('用户已被屏蔽')
    closeUserInfo()
  }
}

// 生命周期
onMounted(async () => {
  await initChat()
  nextTick(() => {
    scrollToBottom()
  })
})

onUnmounted(async () => {
  // 组件卸载时更新用户离线状态
  try {
    await ChatAPI.user.updateOnlineStatus(currentUserId.value, false)
  } catch (error) {
    console.error('更新离线状态失败:', error)
  }
})

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })
</script>

<style scoped>
/* 推特风格 + 书信感觉的样式 */
.chat-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 推特风格头部 */
.chat-header {
  background: #ffffff;
  border-bottom: 1px solid #eff3f4;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  min-height: 60px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  width: 100%;
  min-height: 60px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #0f1419;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f7f9f9;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background: #f7f9f9;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #1DA1F2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 15px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 2px;
  line-height: 1.2;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #536471;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #536471;
}

.status-dot.online {
  background: #1DA1F2;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #536471;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f7f9f9;
  color: #0f1419;
}

.action-icon {
  width: 20px;
  height: 20px;
}

/* 日记风格的消息区域 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  background: #fefefe;
  position: relative;
}

.diary-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.diary-margin {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: 
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 24px,
      #ff6b6b 24px,
      #ff6b6b 25px,
      transparent 25px,
      transparent 48px
    );
  opacity: 0.1;
}

.diary-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      transparent,
      transparent 23px,
      #e0e0e0 23px,
      #e0e0e0 24px
    );
  background-size: 100% 24px;
  opacity: 0.4;
}

.diary-holes {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: 
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 47px,
      #ccc 47px,
      #ccc 49px,
      transparent 49px,
      transparent 96px
    );
  opacity: 0.3;
}

.messages-list {
  padding: 20px 60px 20px 20px;
  min-height: 100%;
  position: relative;
  z-index: 1;
  background: transparent;
}

.loading-messages {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-text {
  color: #536471;
  font-size: 14px;
  font-style: italic;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message-item {
  display: flex;
  flex-direction: column;
}

/* 日记条目样式 */
.diary-entry {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  margin-bottom: 8px;
  backdrop-filter: blur(2px);
}

.received-entry {
  border-left: 4px solid #ff6b6b;
}

.sent-entry {
  border-left: 4px solid #1DA1F2;
  margin-left: auto;
  max-width: 85%;
}

.entry-header {
  background: #f8f9fa;
  padding: 8px 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.entry-date {
  font-weight: 600;
  color: #333;
}

.entry-time {
  color: #888;
}

.entry-content {
  padding: 16px;
}

.entry-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 2px;
}

.author-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.entry-text {
  position: relative;
}

.text-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  font-family: 'Georgia', serif;
  text-align: justify;
}

.text-signature {
  text-align: right;
  font-size: 13px;
  color: #666;
  font-style: italic;
  margin-top: 8px;
}

.entry-decoration {
  position: absolute;
  top: 16px;
  right: 16px;
  opacity: 0.3;
}

.diary-stamp {
  font-size: 20px;
  transform: rotate(-15deg);
}

/* 空状态 */
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  opacity: 0.8;
}

/* 日记风格的输入区域 */
.input-area {
  background: #ffffff;
  border-top: 1px solid #e8e8e8;
  padding: 16px;
}

.input-container {
  max-width: 100%;
}

.diary-page {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.page-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 16px;
  position: relative;
}

.page-date {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.page-lines {
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    transparent 0px,
    transparent 4px,
    #e8e8e8 4px,
    #e8e8e8 8px
  );
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 16px;
}

.diary-input-container {
  flex: 1;
  position: relative;
}

.input-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
}

.diary-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.6;
  min-height: 60px;
  max-height: 120px;
  padding: 8px 0;
  color: #333;
  font-family: 'Georgia', serif;
}

.diary-input::placeholder {
  color: #999;
  font-style: italic;
}

.input-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}

.emoji-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.emoji-icon {
  width: 20px;
  height: 20px;
}

.send-btn {
  background: #1DA1F2;
  border: none;
  border-radius: 20px;
  color: white;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.send-btn:hover:not(:disabled) {
  background: #1a8cd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-icon {
  width: 16px;
  height: 16px;
}

.send-text {
  font-size: 14px;
}

/* 推特风格模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eff3f4;
  background: #ffffff;
}

.modal-header h3 {
  margin: 0;
  color: #0f1419;
  font-weight: 700;
  font-size: 18px;
}

.close-btn {
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #536471;
  width: 32px;
  height: 32px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f7f9f9;
  color: #0f1419;
}

.modal-body {
  padding: 20px;
}

.user-profile {
  display: flex;
  gap: 16px;
  align-items: center;
}

.profile-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 4px;
}

.profile-username {
  font-size: 14px;
  color: #536471;
  margin-bottom: 8px;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #536471;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eff3f4;
  background: #ffffff;
}

.modal-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.primary {
  background: #1DA1F2;
  color: white;
}

.modal-btn.primary:hover {
  background: #1a8cd8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
}

.modal-btn.secondary {
  background: #f7f9f9;
  color: #0f1419;
  border: 1px solid #e1e8ed;
}

.modal-btn.secondary:hover {
  background: #e1e8ed;
  transform: translateY(-1px);
}

/* 推特风格滚动条 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #e1e8ed;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #1DA1F2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 10px 12px;
  }
  
  .back-text {
    display: none;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .input-area {
    padding: 12px;
  }
  
  .modal-content {
    margin: 10px;
  }
}
</style>
