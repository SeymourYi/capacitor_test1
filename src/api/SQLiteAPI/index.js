import sqliteUtils from '../../utils/SQLite.js';

/**
 * SQLite API 接口类
 * 提供常用的数据库操作方法
 */
class SQLiteAPI {
  constructor() {
    this.defaultDbName = 'app_database';
    this.isInitialized = false;
  }

  /**
   * 初始化API
   * @param {string} dbName - 数据库名称
   */
  async initialize(dbName = this.defaultDbName) {
    try {
      if (this.isInitialized) {
        return true;
      }

      // 初始化SQLite工具
      await sqliteUtils.initialize();
      
      // 创建数据库连接
      await sqliteUtils.createConnection(dbName);
      
      // 打开数据库
      await sqliteUtils.openDatabase(dbName);
      
      this.defaultDbName = dbName;
      this.isInitialized = true;
      
      console.log('SQLite API initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing SQLite API:', error);
      throw error;
    }
  }

  /**
   * 创建表
   * @param {string} tableName - 表名
   * @param {Object} schema - 表结构
   * @param {string} dbName - 数据库名称
   */
  async createTable(tableName, schema, dbName = this.defaultDbName) {
    try {
      const columns = Object.entries(schema)
        .map(([name, type]) => `${name} ${type}`)
        .join(', ');
      
      const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
      
      const result = await sqliteUtils.execute(dbName, createTableSQL);
      console.log(`Table ${tableName} created successfully`);
      return result;
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 删除表
   * @param {string} tableName - 表名
   * @param {string} dbName - 数据库名称
   */
  async dropTable(tableName, dbName = this.defaultDbName) {
    try {
      const dropTableSQL = `DROP TABLE IF EXISTS ${tableName}`;
      const result = await sqliteUtils.execute(dbName, dropTableSQL);
      console.log(`Table ${tableName} dropped successfully`);
      return result;
    } catch (error) {
      console.error(`Error dropping table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 插入数据
   * @param {string} tableName - 表名
   * @param {Object} data - 要插入的数据
   * @param {string} dbName - 数据库名称
   */
  async insert(tableName, data, dbName = this.defaultDbName) {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      const insertSQL = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
      
      const result = await sqliteUtils.execute(dbName, insertSQL, values);
      console.log(`Data inserted into ${tableName}`);
      return result;
    } catch (error) {
      console.error(`Error inserting data into ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 批量插入数据
   * @param {string} tableName - 表名
   * @param {Array} dataArray - 要插入的数据数组
   * @param {string} dbName - 数据库名称
   */
  async insertBatch(tableName, dataArray, dbName = this.defaultDbName) {
    try {
      if (dataArray.length === 0) {
        return { changes: { changes: 0 } };
      }

      const columns = Object.keys(dataArray[0]).join(', ');
      const placeholders = Object.keys(dataArray[0]).map(() => '?').join(', ');
      
      const statements = dataArray.map(data => ({
        statement: `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
        values: Object.values(data)
      }));
      
      const result = await sqliteUtils.executeTransaction(dbName, statements);
      console.log(`Batch inserted ${dataArray.length} records into ${tableName}`);
      return result;
    } catch (error) {
      console.error(`Error batch inserting data into ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 查询数据
   * @param {string} tableName - 表名
   * @param {Object} options - 查询选项
   * @param {string} dbName - 数据库名称
   */
  async select(tableName, options = {}, dbName = this.defaultDbName) {
    try {
      const {
        columns = '*',
        where = '',
        orderBy = '',
        limit = '',
        offset = ''
      } = options;

      let selectSQL = `SELECT ${columns} FROM ${tableName}`;
      
      if (where) {
        selectSQL += ` WHERE ${where}`;
      }
      
      if (orderBy) {
        selectSQL += ` ORDER BY ${orderBy}`;
      }
      
      if (limit) {
        selectSQL += ` LIMIT ${limit}`;
      }
      
      if (offset) {
        selectSQL += ` OFFSET ${offset}`;
      }

      const result = await sqliteUtils.query(dbName, selectSQL);
      return result;
    } catch (error) {
      console.error(`Error selecting data from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 根据ID查询单条记录
   * @param {string} tableName - 表名
   * @param {string|number} id - ID值
   * @param {string} idColumn - ID列名，默认为'id'
   * @param {string} dbName - 数据库名称
   */
  async findById(tableName, id, idColumn = 'id', dbName = this.defaultDbName) {
    try {
      const selectSQL = `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`;
      const result = await sqliteUtils.query(dbName, selectSQL, [id]);
      
      if (result.values && result.values.length > 0) {
        return result.values[0];
      }
      return null;
    } catch (error) {
      console.error(`Error finding record by ID in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 更新数据
   * @param {string} tableName - 表名
   * @param {Object} data - 要更新的数据
   * @param {string} where - WHERE条件
   * @param {Array} whereValues - WHERE条件的参数值
   * @param {string} dbName - 数据库名称
   */
  async update(tableName, data, where, whereValues = [], dbName = this.defaultDbName) {
    try {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), ...whereValues];
      
      const updateSQL = `UPDATE ${tableName} SET ${setClause} WHERE ${where}`;
      
      const result = await sqliteUtils.execute(dbName, updateSQL, values);
      console.log(`Data updated in ${tableName}`);
      return result;
    } catch (error) {
      console.error(`Error updating data in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 根据ID更新数据
   * @param {string} tableName - 表名
   * @param {string|number} id - ID值
   * @param {Object} data - 要更新的数据
   * @param {string} idColumn - ID列名，默认为'id'
   * @param {string} dbName - 数据库名称
   */
  async updateById(tableName, id, data, idColumn = 'id', dbName = this.defaultDbName) {
    try {
      return await this.update(tableName, data, `${idColumn} = ?`, [id], dbName);
    } catch (error) {
      console.error(`Error updating record by ID in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 删除数据
   * @param {string} tableName - 表名
   * @param {string} where - WHERE条件
   * @param {Array} whereValues - WHERE条件的参数值
   * @param {string} dbName - 数据库名称
   */
  async delete(tableName, where, whereValues = [], dbName = this.defaultDbName) {
    try {
      const deleteSQL = `DELETE FROM ${tableName} WHERE ${where}`;
      const result = await sqliteUtils.execute(dbName, deleteSQL, whereValues);
      console.log(`Data deleted from ${tableName}`);
      return result;
    } catch (error) {
      console.error(`Error deleting data from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 根据ID删除数据
   * @param {string} tableName - 表名
   * @param {string|number} id - ID值
   * @param {string} idColumn - ID列名，默认为'id'
   * @param {string} dbName - 数据库名称
   */
  async deleteById(tableName, id, idColumn = 'id', dbName = this.defaultDbName) {
    try {
      return await this.delete(tableName, `${idColumn} = ?`, [id], dbName);
    } catch (error) {
      console.error(`Error deleting record by ID in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 统计记录数
   * @param {string} tableName - 表名
   * @param {string} where - WHERE条件
   * @param {Array} whereValues - WHERE条件的参数值
   * @param {string} dbName - 数据库名称
   */
  async count(tableName, where = '', whereValues = [], dbName = this.defaultDbName) {
    try {
      let countSQL = `SELECT COUNT(*) as count FROM ${tableName}`;
      
      if (where) {
        countSQL += ` WHERE ${where}`;
      }
      
      const result = await sqliteUtils.query(dbName, countSQL, whereValues);
      
      if (result.values && result.values.length > 0) {
        return result.values[0].count;
      }
      return 0;
    } catch (error) {
      console.error(`Error counting records in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 检查表是否存在
   * @param {string} tableName - 表名
   * @param {string} dbName - 数据库名称
   */
  async tableExists(tableName, dbName = this.defaultDbName) {
    try {
      const checkSQL = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
      const result = await sqliteUtils.query(dbName, checkSQL, [tableName]);
      return result.values && result.values.length > 0;
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  /**
   * 获取表结构
   * @param {string} tableName - 表名
   * @param {string} dbName - 数据库名称
   */
  async getTableSchema(tableName, dbName = this.defaultDbName) {
    try {
      const schemaSQL = `PRAGMA table_info(${tableName})`;
      const result = await sqliteUtils.query(dbName, schemaSQL);
      return result.values || [];
    } catch (error) {
      console.error(`Error getting schema for table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * 执行原生SQL查询
   * @param {string} sql - SQL语句
   * @param {Array} values - 参数值
   * @param {string} dbName - 数据库名称
   */
  async rawQuery(sql, values = [], dbName = this.defaultDbName) {
    try {
      const result = await sqliteUtils.query(dbName, sql, values);
      return result;
    } catch (error) {
      console.error('Error executing raw query:', error);
      throw error;
    }
  }

  /**
   * 执行原生SQL语句
   * @param {string} sql - SQL语句
   * @param {Array} values - 参数值
   * @param {string} dbName - 数据库名称
   */
  async rawExecute(sql, values = [], dbName = this.defaultDbName) {
    try {
      const result = await sqliteUtils.execute(dbName, sql, values);
      return result;
    } catch (error) {
      console.error('Error executing raw statement:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   * @param {string} dbName - 数据库名称
   */
  async close(dbName = this.defaultDbName) {
    try {
      await sqliteUtils.closeConnection(dbName);
      this.isInitialized = false;
      console.log('SQLite API closed');
    } catch (error) {
      console.error('Error closing SQLite API:', error);
      throw error;
    }
  }
}

// 创建单例实例
const sqliteAPI = new SQLiteAPI();

export default sqliteAPI;
