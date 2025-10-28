/**
 * SQLite 聊天功能使用示例
 */

import { 
  initializeDatabase, 
  UserAPI, 
  ChatSessionAPI, 
  ChatMessageAPI, 
  UserSettingsAPI 
} from './models.js'

// 示例：初始化数据库
export async function initDatabaseExample() {
  try {
    console.log('开始初始化聊天数据库...')
    await initializeDatabase()
    console.log('聊天数据库初始化成功！')
    return true
  } catch (error) {
    console.error('聊天数据库初始化失败:', error)
    return false
  }
}

// 示例：用户管理
export async function userManagementExample() {
  try {
    console.log('=== 用户管理示例 ===')
    
    // 创建用户
    const user1 = await UserAPI.create({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      nickname: 'Alice',
      avatar: null,
      bio: 'Hello, I am Alice!',
      location: 'Beijing',
      is_online: 1
    })
    console.log('创建用户1:', user1)
    
    const user2 = await UserAPI.create({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password456',
      nickname: 'Bob',
      avatar: null,
      bio: 'Hi there!',
      location: 'Shanghai',
      is_online: 0
    })
    console.log('创建用户2:', user2)
    
    // 查找用户
    const foundUser = await UserAPI.findByUsername('alice')
    console.log('查找用户:', foundUser)
    
    // 更新用户在线状态
    await UserAPI.updateOnlineStatus(foundUser.id, true)
    console.log('用户在线状态更新成功')
    
    // 搜索用户
    const searchResults = await UserAPI.searchUsers('al')
    console.log('搜索结果:', searchResults)
    
    return { user1, user2, foundUser, searchResults }
  } catch (error) {
    console.error('用户管理示例失败:', error)
    throw error
  }
}

// 示例：聊天会话管理
export async function chatSessionExample() {
  try {
    console.log('=== 聊天会话示例 ===')
    
    // 获取或创建聊天会话
    const session = await ChatSessionAPI.getOrCreateSession(1, 2)
    console.log('聊天会话:', session)
    
    // 获取用户的所有会话
    const userSessions = await ChatSessionAPI.getUserSessions(1)
    console.log('用户会话列表:', userSessions)
    
    return { session, userSessions }
  } catch (error) {
    console.error('聊天会话示例失败:', error)
    throw error
  }
}

// 示例：消息管理
export async function messageExample() {
  try {
    console.log('=== 消息管理示例 ===')
    
    // 发送消息
    const message1 = await ChatMessageAPI.sendMessage(1, 1, 2, '你好，Bob！', 'text')
    console.log('发送消息1:', message1)
    
    const message2 = await ChatMessageAPI.sendMessage(1, 2, 1, '你好，Alice！很高兴认识你', 'text')
    console.log('发送消息2:', message2)
    
    // 获取会话消息
    const messages = await ChatMessageAPI.getSessionMessages(1)
    console.log('会话消息:', messages)
    
    // 标记消息为已读
    await ChatMessageAPI.markAsRead(message1.id)
    console.log('消息标记为已读')
    
    // 搜索消息
    const searchResults = await ChatMessageAPI.searchMessages(1, '你好')
    console.log('消息搜索结果:', searchResults)
    
    return { message1, message2, messages, searchResults }
  } catch (error) {
    console.error('消息管理示例失败:', error)
    throw error
  }
}

// 示例：用户设置管理
export async function userSettingsExample() {
  try {
    console.log('=== 用户设置示例 ===')
    
    // 设置用户配置
    await UserSettingsAPI.set(1, 'chat.sound_enabled', 'true')
    await UserSettingsAPI.set(1, 'chat.notification_enabled', 'true')
    await UserSettingsAPI.set(1, 'chat.theme', 'dark')
    console.log('用户设置已保存')
    
    // 获取用户配置
    const soundEnabled = await UserSettingsAPI.getValue(1, 'chat.sound_enabled', 'false')
    const theme = await UserSettingsAPI.getValue(1, 'chat.theme', 'light')
    console.log('声音设置:', soundEnabled)
    console.log('主题设置:', theme)
    
    // 获取所有设置
    const allSettings = await UserSettingsAPI.getAll(1)
    console.log('所有设置:', allSettings)
    
    // 批量设置
    const batchSettings = {
      'chat.auto_read': 'true',
      'chat.message_preview': 'false'
    }
    await UserSettingsAPI.setBatch(1, batchSettings)
    console.log('批量设置完成')
    
    return { soundEnabled, theme, allSettings }
  } catch (error) {
    console.error('用户设置示例失败:', error)
    throw error
  }
}

// 完整示例：聊天系统演示
export async function fullChatExample() {
  try {
    console.log('=== 完整聊天系统演示 ===')
    
    // 1. 初始化数据库
    await initDatabaseExample()
    
    // 2. 用户管理
    const users = await userManagementExample()
    
    // 3. 聊天会话
    const sessions = await chatSessionExample()
    
    // 4. 消息管理
    const messages = await messageExample()
    
    // 5. 用户设置
    const settings = await userSettingsExample()
    
    console.log('=== 聊天系统演示完成 ===')
    return {
      users,
      sessions,
      messages,
      settings
    }
  } catch (error) {
    console.error('完整聊天系统演示失败:', error)
    throw error
  }
}

// 测试函数
export async function runTests() {
  try {
    console.log('开始运行SQLite聊天功能测试...')
    
    // 运行完整示例
    const results = await fullChatExample()
    
    console.log('所有测试完成！')
    console.log('测试结果:', results)
    
    return results
  } catch (error) {
    console.error('测试运行失败:', error)
    throw error
  }
}

// 默认导出
export default {
  initDatabaseExample,
  userManagementExample,
  chatSessionExample,
  messageExample,
  userSettingsExample,
  fullChatExample,
  runTests
}