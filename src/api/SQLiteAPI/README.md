# SQLite API 使用指南

本项目集成了Capacitor的官方SQLite插件，提供了完整的本地数据库解决方案。

## 功能特性

- ✅ 完整的SQLite数据库支持
- ✅ 连接管理和事务处理
- ✅ 基础CRUD操作
- ✅ 批量操作支持
- ✅ 错误处理和日志记录
- ✅ 预定义数据模型
- ✅ 性能优化

## 文件结构

```
src/api/SQLiteAPI/
├── index.js          # SQLite API 核心类
├── models.js         # 数据模型定义和业务API
├── examples.js       # 使用示例和测试代码
└── README.md         # 使用文档
```

## 快速开始

### 1. 初始化数据库

```javascript
import { initializeDatabase } from './api/SQLiteAPI/models.js';

// 初始化数据库和所有表
await initializeDatabase();
```

### 2. 基础操作

```javascript
import { UserAPI, ArticleAPI, NotificationAPI, SettingsAPI } from './api/SQLiteAPI/models.js';

// 创建用户
await UserAPI.create({
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword'
});

// 查找用户
const user = await UserAPI.findByUsername('testuser');

// 更新用户
await UserAPI.update(user.id, { avatar: 'new-avatar.jpg' });

// 删除用户
await UserAPI.delete(user.id);
```

### 3. 高级操作

```javascript
import sqliteAPI from './api/SQLiteAPI/index.js';

// 批量插入
const users = [
  { username: 'user1', email: 'user1@example.com', password: 'pass1' },
  { username: 'user2', email: 'user2@example.com', password: 'pass2' }
];
await sqliteAPI.insertBatch('users', users);

// 复杂查询
const result = await sqliteAPI.select('users', {
  where: 'username LIKE ?',
  orderBy: 'created_at DESC',
  limit: '10'
}, undefined, ['test%']);

// 事务操作
const statements = [
  {
    statement: 'INSERT INTO users (username, email) VALUES (?, ?)',
    values: ['user1', 'user1@example.com']
  },
  {
    statement: 'INSERT INTO articles (title, author_id) VALUES (?, ?)',
    values: ['Article 1', 1]
  }
];
await sqliteAPI.executeTransaction('app_database', statements);
```

## API 参考

### SQLiteUtils 类

核心工具类，提供数据库连接和基础操作。

#### 主要方法

- `initialize()` - 初始化SQLite插件
- `createConnection(dbName, encrypted, mode, version, readonly)` - 创建数据库连接
- `openDatabase(dbName)` - 打开数据库
- `query(dbName, statement, values)` - 执行查询
- `execute(dbName, statement, values)` - 执行SQL语句
- `executeTransaction(dbName, statements)` - 执行事务
- `closeConnection(dbName)` - 关闭连接

### SQLiteAPI 类

高级API类，提供便捷的数据库操作方法。

#### 主要方法

- `initialize(dbName)` - 初始化API
- `createTable(tableName, schema)` - 创建表
- `insert(tableName, data)` - 插入数据
- `select(tableName, options)` - 查询数据
- `update(tableName, data, where, whereValues)` - 更新数据
- `delete(tableName, where, whereValues)` - 删除数据
- `count(tableName, where, whereValues)` - 统计记录数

### 业务API

#### UserAPI

- `create(userData)` - 创建用户
- `findById(id)` - 根据ID查找用户
- `findByUsername(username)` - 根据用户名查找
- `findByEmail(email)` - 根据邮箱查找
- `update(id, userData)` - 更新用户信息
- `delete(id)` - 删除用户
- `getAll(limit, offset)` - 获取所有用户

#### ArticleAPI

- `create(articleData)` - 创建文章
- `findById(id)` - 根据ID查找文章
- `findByAuthor(authorId, limit, offset)` - 根据作者获取文章
- `findByCategory(category, limit, offset)` - 根据分类获取文章
- `search(keyword, limit, offset)` - 搜索文章
- `update(id, articleData)` - 更新文章
- `delete(id)` - 删除文章
- `getAll(limit, offset)` - 获取所有文章

#### NotificationAPI

- `create(notificationData)` - 创建通知
- `findById(id)` - 根据ID查找通知
- `findByUser(userId, limit, offset)` - 根据用户获取通知
- `getUnread(userId)` - 获取未读通知
- `markAsRead(id)` - 标记为已读
- `markAllAsRead(userId)` - 标记所有为已读
- `delete(id)` - 删除通知
- `getUnreadCount(userId)` - 获取未读数量

#### SettingsAPI

- `set(key, value, description)` - 设置配置
- `get(key)` - 获取配置
- `getAll()` - 获取所有配置
- `delete(key)` - 删除配置

## 数据模型

### 用户表 (users)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 文章表 (articles)

```sql
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  category TEXT,
  tags TEXT,
  status TEXT DEFAULT "draft",
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### 通知表 (notifications)

```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT "info",
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 设置表 (settings)

```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 测试和示例

### 运行测试页面

访问 `/sqlite-test` 路由可以打开测试页面，包含：

- 数据库初始化测试
- 基础功能测试
- 高级功能测试
- 用户管理测试
- 文章管理测试
- 通知管理测试
- 设置管理测试

### 运行示例代码

```javascript
import { runAllExamples } from './api/SQLiteAPI/examples.js';

// 运行所有示例
await runAllExamples();
```

## 配置说明

### Capacitor 配置

在 `capacitor.config.json` 中已配置SQLite插件：

```json
{
  "plugins": {
    "CapacitorSQLite": {
      "iosDatabaseLocation": "Library/CapacitorDatabase",
      "iosIsEncryption": false,
      "androidIsEncryption": false,
      "electronIsEncryption": false
    }
  }
}
```

### 依赖包

确保已安装以下依赖：

```json
{
  "@capacitor-community/sqlite": "^7.0.2",
  "@capacitor/core": "^7.4.3"
}
```

## 最佳实践

### 1. 错误处理

```javascript
try {
  await UserAPI.create(userData);
} catch (error) {
  if (error.message.includes('UNIQUE constraint failed')) {
    console.log('用户名或邮箱已存在');
  } else {
    console.error('创建用户失败:', error);
  }
}
```

### 2. 性能优化

```javascript
// 使用批量插入而不是循环插入
const users = [/* 大量用户数据 */];
await sqliteAPI.insertBatch('users', users);

// 使用事务处理多个相关操作
const statements = [/* 多个SQL语句 */];
await sqliteAPI.executeTransaction('app_database', statements);
```

### 3. 数据验证

```javascript
// 在插入前验证数据
if (!userData.username || !userData.email) {
  throw new Error('用户名和邮箱不能为空');
}
```

## 常见问题

### Q: 数据库文件存储在哪里？

A: 数据库文件存储在应用的私有目录中，具体位置取决于平台：
- iOS: `Library/CapacitorDatabase`
- Android: 应用私有目录
- Web: IndexedDB

### Q: 如何处理数据库升级？

A: 可以通过检查数据库版本并执行相应的迁移脚本来处理：

```javascript
const currentVersion = await sqliteAPI.getDatabaseVersion('app_database');
if (currentVersion < '2.0') {
  // 执行升级脚本
  await sqliteAPI.execute('app_database', 'ALTER TABLE users ADD COLUMN phone TEXT');
  await sqliteAPI.setDatabaseVersion('app_database', '2.0');
}
```

### Q: 如何备份和恢复数据？

A: 可以使用Capacitor的文件系统插件来备份数据库文件，或者导出为JSON格式：

```javascript
// 导出数据
const users = await UserAPI.getAll();
const backup = JSON.stringify(users.values);

// 恢复数据
const restoredUsers = JSON.parse(backup);
await sqliteAPI.insertBatch('users', restoredUsers);
```

## 许可证

本项目使用 MIT 许可证。
