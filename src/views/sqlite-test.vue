<template>
  <div class="sqlite-test">
    <div class="header">
      <h1>SQLite 功能测试</h1>
      <p>测试Capacitor SQLite插件的各种功能</p>
    </div>

    <div class="controls">
      <button @click="initializeDatabase" :disabled="loading" class="btn btn-primary">
        {{ loading ? '初始化中...' : '初始化数据库' }}
      </button>
      <button @click="runBasicTest" :disabled="loading" class="btn btn-secondary">
        基础功能测试
      </button>
      <button @click="runAdvancedTest" :disabled="loading" class="btn btn-secondary">
        高级功能测试
      </button>
      <button @click="clearLogs" class="btn btn-danger">
        清空日志
      </button>
    </div>

    <div class="test-sections">
      <!-- 用户管理测试 -->
      <div class="test-section">
        <h3>用户管理测试</h3>
        <div class="form-group">
          <input v-model="userForm.username" placeholder="用户名" class="form-input" />
          <input v-model="userForm.email" placeholder="邮箱" class="form-input" />
          <input v-model="userForm.password" placeholder="密码" class="form-input" />
          <button @click="createUser" :disabled="loading" class="btn btn-primary">
            创建用户
          </button>
        </div>
        <button @click="getAllUsers" :disabled="loading" class="btn btn-secondary">
          获取所有用户
        </button>
      </div>

      <!-- 文章管理测试 -->
      <div class="test-section">
        <h3>文章管理测试</h3>
        <div class="form-group">
          <input v-model="articleForm.title" placeholder="文章标题" class="form-input" />
          <textarea v-model="articleForm.content" placeholder="文章内容" class="form-textarea"></textarea>
          <input v-model="articleForm.category" placeholder="分类" class="form-input" />
          <button @click="createArticle" :disabled="loading" class="btn btn-primary">
            创建文章
          </button>
        </div>
        <button @click="getAllArticles" :disabled="loading" class="btn btn-secondary">
          获取所有文章
        </button>
      </div>

      <!-- 通知管理测试 -->
      <div class="test-section">
        <h3>通知管理测试</h3>
        <div class="form-group">
          <input v-model="notificationForm.title" placeholder="通知标题" class="form-input" />
          <textarea v-model="notificationForm.message" placeholder="通知内容" class="form-textarea"></textarea>
          <select v-model="notificationForm.type" class="form-select">
            <option value="info">信息</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
          </select>
          <button @click="createNotification" :disabled="loading" class="btn btn-primary">
            创建通知
          </button>
        </div>
        <button @click="getAllNotifications" :disabled="loading" class="btn btn-secondary">
          获取所有通知
        </button>
      </div>

      <!-- 设置管理测试 -->
      <div class="test-section">
        <h3>设置管理测试</h3>
        <div class="form-group">
          <input v-model="settingForm.key" placeholder="设置键" class="form-input" />
          <input v-model="settingForm.value" placeholder="设置值" class="form-input" />
          <button @click="setSetting" :disabled="loading" class="btn btn-primary">
            设置配置
          </button>
        </div>
        <button @click="getAllSettings" :disabled="loading" class="btn btn-secondary">
          获取所有设置
        </button>
      </div>
    </div>

    <!-- 日志显示区域 -->
    <div class="logs">
      <h3>操作日志</h3>
      <div class="log-content" ref="logContent">
        <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  initializeDatabase, 
  UserAPI, 
  ChatSessionAPI, 
  ChatMessageAPI, 
  UserSettingsAPI 
} from '../api/SQLiteAPI/models.js';

export default {
  name: 'SQLiteTest',
  data() {
    return {
      loading: false,
      logs: [],
      userForm: {
        username: '',
        email: '',
        password: ''
      },
      articleForm: {
        title: '',
        content: '',
        category: ''
      },
      notificationForm: {
        title: '',
        message: '',
        type: 'info'
      },
      settingForm: {
        key: '',
        value: ''
      }
    };
  },
  methods: {
    addLog(message, type = 'info') {
      const time = new Date().toLocaleTimeString();
      this.logs.unshift({ time, message, type });
      
      // 限制日志数量
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(0, 100);
      }
      
      // 自动滚动到顶部
      this.$nextTick(() => {
        if (this.$refs.logContent) {
          this.$refs.logContent.scrollTop = 0;
        }
      });
    },

    clearLogs() {
      this.logs = [];
    },

    async initializeDatabase() {
      this.loading = true;
      try {
        await initializeDatabase();
        this.addLog('数据库初始化成功', 'success');
      } catch (error) {
        this.addLog(`数据库初始化失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async runBasicTest() {
      this.loading = true;
      try {
        const { basicUsageExample } = await import('../api/SQLiteAPI/examples.js');
        await basicUsageExample();
        this.addLog('基础功能测试完成', 'success');
      } catch (error) {
        this.addLog(`基础功能测试失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async runAdvancedTest() {
      this.loading = true;
      try {
        const { advancedUsageExample } = await import('../api/SQLiteAPI/examples.js');
        await advancedUsageExample();
        this.addLog('高级功能测试完成', 'success');
      } catch (error) {
        this.addLog(`高级功能测试失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async createUser() {
      if (!this.userForm.username || !this.userForm.email || !this.userForm.password) {
        this.addLog('请填写完整的用户信息', 'warning');
        return;
      }

      this.loading = true;
      try {
        const result = await UserAPI.create(this.userForm);
        this.addLog(`用户创建成功: ${this.userForm.username}`, 'success');
        this.userForm = { username: '', email: '', password: '' };
      } catch (error) {
        this.addLog(`用户创建失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async getAllUsers() {
      this.loading = true;
      try {
        const result = await UserAPI.getAll();
        this.addLog(`获取到 ${result.values ? result.values.length : 0} 个用户`, 'info');
        console.log('用户列表:', result);
      } catch (error) {
        this.addLog(`获取用户失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async createArticle() {
      if (!this.articleForm.title || !this.articleForm.content) {
        this.addLog('请填写完整的文章信息', 'warning');
        return;
      }

      this.loading = true;
      try {
        // 注意：ArticleAPI 尚未实现，这里只是示例
        this.addLog(`文章功能暂未实现: ${this.articleForm.title}`, 'warning');
        this.articleForm = { title: '', content: '', category: '' };
      } catch (error) {
        this.addLog(`文章创建失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async getAllArticles() {
      this.loading = true;
      try {
        // 注意：ArticleAPI 尚未实现，这里只是示例
        this.addLog('文章功能暂未实现', 'warning');
      } catch (error) {
        this.addLog(`获取文章失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async createNotification() {
      if (!this.notificationForm.title || !this.notificationForm.message) {
        this.addLog('请填写完整的通知信息', 'warning');
        return;
      }

      this.loading = true;
      try {
        // 注意：NotificationAPI 尚未实现，这里只是示例
        this.addLog(`通知功能暂未实现: ${this.notificationForm.title}`, 'warning');
        this.notificationForm = { title: '', message: '', type: 'info' };
      } catch (error) {
        this.addLog(`通知创建失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async getAllNotifications() {
      this.loading = true;
      try {
        // 注意：NotificationAPI 尚未实现，这里只是示例
        this.addLog('通知功能暂未实现', 'warning');
      } catch (error) {
        this.addLog(`获取通知失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async setSetting() {
      if (!this.settingForm.key || !this.settingForm.value) {
        this.addLog('请填写完整的设置信息', 'warning');
        return;
      }

      this.loading = true;
      try {
        // 使用 UserSettingsAPI 替代 SettingsAPI
        await UserSettingsAPI.set(1, this.settingForm.key, this.settingForm.value);
        this.addLog(`设置保存成功: ${this.settingForm.key} = ${this.settingForm.value}`, 'success');
        this.settingForm = { key: '', value: '' };
      } catch (error) {
        this.addLog(`设置保存失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    },

    async getAllSettings() {
      this.loading = true;
      try {
        // 使用 UserSettingsAPI 替代 SettingsAPI
        const result = await UserSettingsAPI.getAll(1);
        this.addLog(`获取到 ${Object.keys(result).length} 个设置项`, 'info');
        console.log('设置列表:', result);
      } catch (error) {
        this.addLog(`获取设置失败: ${error.message}`, 'error');
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.addLog('SQLite测试页面已加载', 'info');
  }
};
</script>

<style scoped>
.sqlite-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 16px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.test-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.test-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.test-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.form-input,
.form-textarea,
.form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.logs {
  background: #2c3e50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.logs h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #ecf0f1;
}

.log-content {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.log-item {
  margin-bottom: 5px;
  padding: 2px 0;
}

.log-time {
  color: #95a5a6;
  margin-right: 10px;
}

.log-message {
  color: #ecf0f1;
}

.log-item.success .log-message {
  color: #2ecc71;
}

.log-item.error .log-message {
  color: #e74c3c;
}

.log-item.warning .log-message {
  color: #f39c12;
}

.log-item.info .log-message {
  color: #3498db;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
  }
  
  .test-sections {
    grid-template-columns: 1fr;
  }
}
</style>
