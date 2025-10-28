import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

/**
 * SQLite工具类
 * 提供数据库连接、操作等基础功能
 */
class SQLiteUtils {
  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.connections = new Map(); // 存储数据库连接
    this.isInitialized = false;
  }

  /**
   * 初始化SQLite插件
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return true;
      }

      // 检查SQLite是否可用
      const ret = await this.sqlite.checkConnectionsConsistency({
        dbNames: []
      });

      if (ret.result) {
        this.isInitialized = true;
        console.log('SQLite initialized successfully');
        return true;
      } else {
        console.error('SQLite initialization failed');
        return false;
      }
    } catch (error) {
      console.error('Error initializing SQLite:', error);
      return false;
    }
  }

  /**
   * 创建或打开数据库连接
   * @param {string} dbName - 数据库名称
   * @param {boolean} encrypted - 是否加密
   * @param {string} mode - 数据库模式 ('no-encryption', 'encryption', 'secret', 'newsecret')
   * @param {string} version - 数据库版本
   * @param {boolean} readonly - 是否只读
   */
  async createConnection(dbName, encrypted = false, mode = 'no-encryption', version = '1', readonly = false) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const connection = await this.sqlite.createConnection(
        dbName,
        encrypted,
        mode,
        version,
        readonly
      );

      this.connections.set(dbName, connection);
      console.log(`Database connection created: ${dbName}`);
      return connection;
    } catch (error) {
      console.error(`Error creating connection for ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 获取数据库连接
   * @param {string} dbName - 数据库名称
   */
  getConnection(dbName) {
    return this.connections.get(dbName);
  }

  /**
   * 打开数据库
   * @param {string} dbName - 数据库名称
   */
  async openDatabase(dbName) {
    try {
      const connection = this.getConnection(dbName);
      if (!connection) {
        throw new Error(`Connection not found for database: ${dbName}`);
      }

      await connection.open();
      console.log(`Database opened: ${dbName}`);
      return true;
    } catch (error) {
      console.error(`Error opening database ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   * @param {string} dbName - 数据库名称
   */
  async closeConnection(dbName) {
    try {
      const connection = this.getConnection(dbName);
      if (connection) {
        await connection.close();
        this.connections.delete(dbName);
        console.log(`Database connection closed: ${dbName}`);
      }
    } catch (error) {
      console.error(`Error closing connection ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 执行SQL查询
   * @param {string} dbName - 数据库名称
   * @param {string} statement - SQL语句
   * @param {Array} values - 参数值
   */
  async query(dbName, statement, values = []) {
    try {
      const connection = this.getConnection(dbName);
      if (!connection) {
        throw new Error(`Connection not found for database: ${dbName}`);
      }

      const result = await connection.query(statement, values);
      return result;
    } catch (error) {
      console.error(`Error executing query on ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 执行SQL语句（INSERT, UPDATE, DELETE）
   * @param {string} dbName - 数据库名称
   * @param {string} statement - SQL语句
   * @param {Array} values - 参数值
   */
  async execute(dbName, statement, values = []) {
    try {
      const connection = this.getConnection(dbName);
      if (!connection) {
        throw new Error(`Connection not found for database: ${dbName}`);
      }

      const result = await connection.execute(statement, values);
      return result;
    } catch (error) {
      console.error(`Error executing statement on ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 执行事务
   * @param {string} dbName - 数据库名称
   * @param {Array} statements - SQL语句数组
   */
  async executeTransaction(dbName, statements) {
    try {
      const connection = this.getConnection(dbName);
      if (!connection) {
        throw new Error(`Connection not found for database: ${dbName}`);
      }

      const result = await connection.executeTransaction(statements);
      return result;
    } catch (error) {
      console.error(`Error executing transaction on ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 检查数据库是否存在
   * @param {string} dbName - 数据库名称
   */
  async isDatabase(dbName) {
    try {
      const result = await this.sqlite.isDatabase(dbName);
      return result.result;
    } catch (error) {
      console.error(`Error checking database ${dbName}:`, error);
      return false;
    }
  }

  /**
   * 删除数据库
   * @param {string} dbName - 数据库名称
   */
  async deleteDatabase(dbName) {
    try {
      await this.closeConnection(dbName);
      const result = await this.sqlite.deleteDatabase(dbName);
      console.log(`Database deleted: ${dbName}`);
      return result;
    } catch (error) {
      console.error(`Error deleting database ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 获取数据库版本
   * @param {string} dbName - 数据库名称
   */
  async getDatabaseVersion(dbName) {
    try {
      const connection = this.getConnection(dbName);
      if (!connection) {
        throw new Error(`Connection not found for database: ${dbName}`);
      }

      const result = await connection.getVersion();
      return result;
    } catch (error) {
      console.error(`Error getting database version for ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 设置数据库版本
   * @param {string} dbName - 数据库名称
   * @param {string} version - 版本号
   */
  async setDatabaseVersion(dbName, version) {
    try {
      const connection = this.getConnection(dbName);
      if (!connection) {
        throw new Error(`Connection not found for database: ${dbName}`);
      }

      const result = await connection.setVersion(version);
      return result;
    } catch (error) {
      console.error(`Error setting database version for ${dbName}:`, error);
      throw error;
    }
  }

  /**
   * 获取所有数据库连接
   */
  getConnections() {
    return Array.from(this.connections.keys());
  }

  /**
   * 关闭所有数据库连接
   */
  async closeAllConnections() {
    try {
      const dbNames = this.getConnections();
      for (const dbName of dbNames) {
        await this.closeConnection(dbName);
      }
      console.log('All database connections closed');
    } catch (error) {
      console.error('Error closing all connections:', error);
      throw error;
    }
  }
}

// 创建单例实例
const sqliteUtils = new SQLiteUtils();

export default sqliteUtils;
