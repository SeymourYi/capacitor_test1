import sqliteAPI from './index.js';

/**
 * 数据库模型定义和初始化
 */

// 用户表模型
export const UserModel = {
  tableName: 'users',
  schema: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    username: 'TEXT UNIQUE NOT NULL',
    email: 'TEXT UNIQUE NOT NULL',
    password: 'TEXT NOT NULL',
    nickname: 'TEXT',
    avatar: 'TEXT',
    bio: 'TEXT',
    location: 'TEXT',
    birthday: 'TEXT',
    is_online: 'BOOLEAN DEFAULT 0',
    last_seen: 'DATETIME',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
};

// 聊天会话表模型
export const ChatSessionModel = {
  tableName: 'chat_sessions',
  schema: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    user1_id: 'INTEGER NOT NULL',
    user2_id: 'INTEGER NOT NULL',
    last_message_id: 'INTEGER',
    last_message_time: 'DATETIME',
    unread_count_user1: 'INTEGER DEFAULT 0',
    unread_count_user2: 'INTEGER DEFAULT 0',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
};

// 聊天消息表模型
export const ChatMessageModel = {
  tableName: 'chat_messages',
  schema: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    session_id: 'INTEGER NOT NULL',
    sender_id: 'INTEGER NOT NULL',
    receiver_id: 'INTEGER NOT NULL',
    content: 'TEXT NOT NULL',
    message_type: 'TEXT DEFAULT "text"',
    is_read: 'BOOLEAN DEFAULT 0',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
};

// 用户设置表模型
export const UserSettingsModel = {
  tableName: 'user_settings',
  schema: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    user_id: 'INTEGER NOT NULL',
    key: 'TEXT NOT NULL',
    value: 'TEXT',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
};

/**
 * 初始化所有数据库表
 */
export async function initializeDatabase() {
  try {
    // 初始化SQLite API
    await sqliteAPI.initialize();

    // 创建所有表
    await sqliteAPI.createTable(UserModel.tableName, UserModel.schema);
    await sqliteAPI.createTable(ChatSessionModel.tableName, ChatSessionModel.schema);
    await sqliteAPI.createTable(ChatMessageModel.tableName, ChatMessageModel.schema);
    await sqliteAPI.createTable(UserSettingsModel.tableName, UserSettingsModel.schema);

    console.log('Chat database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing chat database:', error);
    throw error;
  }
}

/**
 * 用户相关操作
 */
export const UserAPI = {
  // 创建用户
  async create(userData) {
    return await sqliteAPI.insert(UserModel.tableName, userData);
  },

  // 根据ID查找用户
  async findById(id) {
    return await sqliteAPI.findById(UserModel.tableName, id);
  },

  // 根据用户名查找用户
  async findByUsername(username) {
    const result = await sqliteAPI.select(UserModel.tableName, {
      where: 'username = ?',
      limit: '1'
    }, undefined, [username]);
    
    return result.values && result.values.length > 0 ? result.values[0] : null;
  },

  // 根据邮箱查找用户
  async findByEmail(email) {
    const result = await sqliteAPI.select(UserModel.tableName, {
      where: 'email = ?',
      limit: '1'
    }, undefined, [email]);
    
    return result.values && result.values.length > 0 ? result.values[0] : null;
  },

  // 更新用户信息
  async update(id, userData) {
    return await sqliteAPI.updateById(UserModel.tableName, id, userData);
  },

  // 更新用户在线状态
  async updateOnlineStatus(id, isOnline) {
    return await sqliteAPI.updateById(UserModel.tableName, id, {
      is_online: isOnline ? 1 : 0,
      last_seen: new Date().toISOString()
    });
  },

  // 删除用户
  async delete(id) {
    return await sqliteAPI.deleteById(UserModel.tableName, id);
  },

  // 获取所有用户
  async getAll(limit = 100, offset = 0) {
    return await sqliteAPI.select(UserModel.tableName, {
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: 'created_at DESC'
    });
  },

  // 搜索用户
  async searchUsers(keyword, limit = 20) {
    const result = await sqliteAPI.select(UserModel.tableName, {
      where: 'username LIKE ? OR nickname LIKE ? OR email LIKE ?',
      limit: limit.toString(),
      orderBy: 'created_at DESC'
    }, undefined, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
    
    return result.values || [];
  }
};

/**
 * 聊天会话相关操作
 */
export const ChatSessionAPI = {
  // 创建或获取聊天会话
  async getOrCreateSession(user1Id, user2Id) {
    // 先查找是否已存在会话
    const existingSession = await sqliteAPI.select(ChatSessionModel.tableName, {
      where: '(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      limit: '1'
    }, undefined, [user1Id, user2Id, user2Id, user1Id]);
    
    if (existingSession.values && existingSession.values.length > 0) {
      return existingSession.values[0];
    }
    
    // 创建新会话
    const sessionData = {
      user1_id: Math.min(user1Id, user2Id),
      user2_id: Math.max(user1Id, user2Id),
      unread_count_user1: 0,
      unread_count_user2: 0
    };
    
    const result = await sqliteAPI.insert(ChatSessionModel.tableName, sessionData);
    return { id: result.changes.lastId, ...sessionData };
  },

  // 根据ID查找会话
  async findById(id) {
    return await sqliteAPI.findById(ChatSessionModel.tableName, id);
  },

  // 获取用户的所有会话
  async getUserSessions(userId, limit = 50) {
    const result = await sqliteAPI.select(ChatSessionModel.tableName, {
      where: 'user1_id = ? OR user2_id = ?',
      limit: limit.toString(),
      orderBy: 'last_message_time DESC'
    }, undefined, [userId, userId]);
    
    return result.values || [];
  },

  // 更新会话最后消息
  async updateLastMessage(sessionId, messageId, messageTime) {
    return await sqliteAPI.updateById(ChatSessionModel.tableName, sessionId, {
      last_message_id: messageId,
      last_message_time: messageTime,
      updated_at: new Date().toISOString()
    });
  },

  // 更新未读消息数
  async updateUnreadCount(sessionId, userId, count) {
    const session = await this.findById(sessionId);
    if (!session) return null;
    
    const updateData = {};
    if (session.user1_id === userId) {
      updateData.unread_count_user1 = count;
    } else if (session.user2_id === userId) {
      updateData.unread_count_user2 = count;
    }
    
    return await sqliteAPI.updateById(ChatSessionModel.tableName, sessionId, updateData);
  },

  // 删除会话
  async delete(id) {
    return await sqliteAPI.deleteById(ChatSessionModel.tableName, id);
  }
};

/**
 * 聊天消息相关操作
 */
export const ChatMessageAPI = {
  // 发送消息
  async sendMessage(sessionId, senderId, receiverId, content, messageType = 'text') {
    const messageData = {
      session_id: sessionId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
      message_type: messageType,
      is_read: 0
    };
    
    const result = await sqliteAPI.insert(ChatMessageModel.tableName, messageData);
    const messageId = result.changes.lastId;
    
    // 更新会话的最后消息信息
    await ChatSessionAPI.updateLastMessage(sessionId, messageId, new Date().toISOString());
    
    return { id: messageId, ...messageData };
  },

  // 根据ID查找消息
  async findById(id) {
    return await sqliteAPI.findById(ChatMessageModel.tableName, id);
  },

  // 获取会话的消息列表
  async getSessionMessages(sessionId, limit = 50, offset = 0) {
    const result = await sqliteAPI.select(ChatMessageModel.tableName, {
      where: 'session_id = ?',
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: 'created_at DESC'
    }, undefined, [sessionId]);
    
    return result.values || [];
  },

  // 获取用户与特定用户的消息
  async getUserMessages(userId, otherUserId, limit = 50, offset = 0) {
    const result = await sqliteAPI.select(ChatMessageModel.tableName, {
      where: '(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy: 'created_at DESC'
    }, undefined, [userId, otherUserId, otherUserId, userId]);
    
    return result.values || [];
  },

  // 标记消息为已读
  async markAsRead(messageId) {
    return await sqliteAPI.updateById(ChatMessageModel.tableName, messageId, { is_read: 1 });
  },

  // 标记会话的所有消息为已读
  async markSessionAsRead(sessionId, userId) {
    await sqliteAPI.update(ChatMessageModel.tableName, 
      { is_read: 1 }, 
      'session_id = ? AND receiver_id = ? AND is_read = 0', 
      [sessionId, userId]
    );
    
    // 更新会话的未读计数
    await ChatSessionAPI.updateUnreadCount(sessionId, userId, 0);
  },

  // 删除消息
  async delete(id) {
    return await sqliteAPI.deleteById(ChatMessageModel.tableName, id);
  },

  // 获取未读消息数量
  async getUnreadCount(userId) {
    return await sqliteAPI.count(ChatMessageModel.tableName, 'receiver_id = ? AND is_read = 0', [userId]);
  },

  // 搜索消息
  async searchMessages(userId, keyword, limit = 20) {
    const result = await sqliteAPI.select(ChatMessageModel.tableName, {
      where: '(sender_id = ? OR receiver_id = ?) AND content LIKE ?',
      limit: limit.toString(),
      orderBy: 'created_at DESC'
    }, undefined, [userId, userId, `%${keyword}%`]);
    
    return result.values || [];
  }
};

/**
 * 用户设置相关操作
 */
export const UserSettingsAPI = {
  // 设置用户配置
  async set(userId, key, value) {
    const existing = await this.get(userId, key);
    if (existing) {
      return await sqliteAPI.update(UserSettingsModel.tableName, 
        { value, updated_at: new Date().toISOString() }, 
        'user_id = ? AND key = ?', 
        [userId, key]
      );
    } else {
      return await sqliteAPI.insert(UserSettingsModel.tableName, {
        user_id: userId,
        key,
        value
      });
    }
  },

  // 获取用户配置
  async get(userId, key) {
    const result = await sqliteAPI.select(UserSettingsModel.tableName, {
      where: 'user_id = ? AND key = ?',
      limit: '1'
    }, undefined, [userId, key]);
    
    return result.values && result.values.length > 0 ? result.values[0] : null;
  },

  // 获取用户配置值
  async getValue(userId, key, defaultValue = null) {
    const setting = await this.get(userId, key);
    return setting ? setting.value : defaultValue;
  },

  // 获取用户所有配置
  async getAll(userId) {
    const result = await sqliteAPI.select(UserSettingsModel.tableName, {
      where: 'user_id = ?',
      orderBy: 'key ASC'
    }, undefined, [userId]);
    
    const settings = {};
    if (result.values) {
      result.values.forEach(item => {
        settings[item.key] = item.value;
      });
    }
    return settings;
  },

  // 删除用户配置
  async delete(userId, key) {
    return await sqliteAPI.delete(UserSettingsModel.tableName, 'user_id = ? AND key = ?', [userId, key]);
  },

  // 批量设置用户配置
  async setBatch(userId, settings) {
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      results.push(await this.set(userId, key, value));
    }
    return results;
  }
};

// 所有API已经在上面通过export const导出
