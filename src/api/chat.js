/**
 * 聊天功能API
 * 基于SQLite的私聊功能实现
 */

import { 
  UserAPI, 
  ChatSessionAPI, 
  ChatMessageAPI, 
  UserSettingsAPI,
  initializeDatabase 
} from './SQLiteAPI/models.js'

// 初始化数据库
let isInitialized = false

const initDatabase = async () => {
  if (!isInitialized) {
    await initializeDatabase()
    isInitialized = true
  }
}

/**
 * 聊天功能API
 */
export const ChatAPI = {
  // 初始化聊天系统
  async init() {
    await initDatabase()
    console.log('Chat system initialized')
  },

  // 用户管理
  user: {
    // 创建用户
    async create(userData) {
      await initDatabase()
      return await UserAPI.create(userData)
    },

    // 根据ID获取用户
    async getById(id) {
      await initDatabase()
      return await UserAPI.findById(id)
    },

    // 根据用户名获取用户
    async getByUsername(username) {
      await initDatabase()
      return await UserAPI.findByUsername(username)
    },

    // 搜索用户
    async search(keyword) {
      await initDatabase()
      return await UserAPI.searchUsers(keyword)
    },

    // 更新用户信息
    async update(id, userData) {
      await initDatabase()
      return await UserAPI.update(id, userData)
    },

    // 更新在线状态
    async updateOnlineStatus(id, isOnline) {
      await initDatabase()
      return await UserAPI.updateOnlineStatus(id, isOnline)
    },

    // 获取所有用户
    async getAll() {
      await initDatabase()
      return await UserAPI.getAll()
    }
  },

  // 聊天会话管理
  session: {
    // 获取或创建聊天会话
    async getOrCreate(user1Id, user2Id) {
      await initDatabase()
      return await ChatSessionAPI.getOrCreateSession(user1Id, user2Id)
    },

    // 获取用户的所有会话
    async getUserSessions(userId) {
      await initDatabase()
      return await ChatSessionAPI.getUserSessions(userId)
    },

    // 获取会话详情
    async getById(sessionId) {
      await initDatabase()
      return await ChatSessionAPI.findById(sessionId)
    },

    // 删除会话
    async delete(sessionId) {
      await initDatabase()
      return await ChatSessionAPI.delete(sessionId)
    }
  },

  // 消息管理
  message: {
    // 发送消息
    async send(sessionId, senderId, receiverId, content, messageType = 'text') {
      await initDatabase()
      return await ChatMessageAPI.sendMessage(sessionId, senderId, receiverId, content, messageType)
    },

    // 获取会话消息
    async getSessionMessages(sessionId, limit = 50, offset = 0) {
      await initDatabase()
      return await ChatMessageAPI.getSessionMessages(sessionId, limit, offset)
    },

    // 获取用户与特定用户的消息
    async getUserMessages(userId, otherUserId, limit = 50, offset = 0) {
      await initDatabase()
      return await ChatMessageAPI.getUserMessages(userId, otherUserId, limit, offset)
    },

    // 标记消息为已读
    async markAsRead(messageId) {
      await initDatabase()
      return await ChatMessageAPI.markAsRead(messageId)
    },

    // 标记会话为已读
    async markSessionAsRead(sessionId, userId) {
      await initDatabase()
      return await ChatMessageAPI.markSessionAsRead(sessionId, userId)
    },

    // 删除消息
    async delete(messageId) {
      await initDatabase()
      return await ChatMessageAPI.delete(messageId)
    },

    // 搜索消息
    async search(userId, keyword) {
      await initDatabase()
      return await ChatMessageAPI.searchMessages(userId, keyword)
    },

    // 获取未读消息数
    async getUnreadCount(userId) {
      await initDatabase()
      return await ChatMessageAPI.getUnreadCount(userId)
    }
  },

  // 用户设置管理
  settings: {
    // 设置用户配置
    async set(userId, key, value) {
      await initDatabase()
      return await UserSettingsAPI.set(userId, key, value)
    },

    // 获取用户配置
    async get(userId, key, defaultValue = null) {
      await initDatabase()
      return await UserSettingsAPI.getValue(userId, key, defaultValue)
    },

    // 获取用户所有配置
    async getAll(userId) {
      await initDatabase()
      return await UserSettingsAPI.getAll(userId)
    },

    // 删除用户配置
    async delete(userId, key) {
      await initDatabase()
      return await UserSettingsAPI.delete(userId, key)
    },

    // 批量设置配置
    async setBatch(userId, settings) {
      await initDatabase()
      return await UserSettingsAPI.setBatch(userId, settings)
    }
  }
}

/**
 * 聊天工具函数
 */
export const ChatUtils = {
  // 格式化消息时间
  formatMessageTime(timestamp) {
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
  },

  // 格式化日记日期
  formatDiaryDate(timestamp) {
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
  },

  // 格式化日记时间
  formatDiaryTime(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  },

  // 格式化当前日期
  formatCurrentDate() {
    const now = new Date()
    return now.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
  },

  // 生成默认用户数据
  createDefaultUser(username, email, password) {
    return {
      username,
      email,
      password,
      nickname: username,
      avatar: null,
      bio: '',
      location: '',
      birthday: null,
      is_online: 0,
      last_seen: null
    }
  },

  // 生成默认聊天设置
  getDefaultChatSettings() {
    return {
      'chat.sound_enabled': 'true',
      'chat.notification_enabled': 'true',
      'chat.auto_read': 'false',
      'chat.message_preview': 'true',
      'chat.theme': 'light'
    }
  }
}

// 默认导出
export default ChatAPI
