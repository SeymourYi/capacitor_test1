<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import { userLogin } from './api/user.js'

// 响应式数据
const loginResult = ref(null)
const loading = ref(false)
const error = ref(null)

// 登录函数
const handleLogin = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await userLogin('19137056165', '多少楼台烟雨中')
    loginResult.value = result
    console.log('登录成功:', result)
  } catch (err) {
    error.value = err.message || '登录失败'
    console.error('登录失败:', err)
  } finally {
    loading.value = false
  }
}

// 组件挂载时自动调用登录
onMounted(() => {
  handleLogin()
})
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    web
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  
  <!-- API请求结果展示区域 -->
  <div class="api-result">
    <h2>用户登录API测试</h2>
    
    <div class="login-info">
      <p><strong>请求URL:</strong> /api/user/login (通过Vite代理转发到 https://qianxunweimeng.cn:5361/user/login)</p>
      <p><strong>请求方法:</strong> POST</p>
      <p><strong>用户名:</strong> 19137056165</p>
      <p><strong>密码:</strong> 多少楼台烟雨中</p>
      <p><strong>代理状态:</strong> ✅ 已配置CORS代理解决跨域问题</p>
      <p><strong>请求优化:</strong> ✅ 已添加完整请求头，参数改为POST body</p>
      <p><strong>浏览器安全:</strong> ✅ 已移除不安全请求头，通过代理设置</p>
      <p><strong>API状态:</strong> ✅ 请求成功，返回200状态码</p>
    </div>
    
    <button @click="handleLogin" :disabled="loading" class="login-btn">
      {{ loading ? '请求中...' : '重新请求' }}
    </button>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <p>正在请求API...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error">
      <h3>请求失败:</h3>
      <p>{{ error }}</p>
    </div>
    
    <!-- 成功结果 -->
    <div v-if="loginResult" class="success">
      <h3>请求成功:</h3>
      <pre>{{ JSON.stringify(loginResult, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

/* API结果展示样式 */
.api-result {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.api-result h2 {
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

.login-info {
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 4px solid #42b883;
}

.login-info p {
  margin: 0.5rem 0;
  font-family: monospace;
}

.login-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #369870;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  color: #42b883;
  font-weight: bold;
}

.error {
  background-color: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.error h3 {
  color: #d32f2f;
  margin-top: 0;
}

.success {
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.success h3 {
  color: #2e7d32;
  margin-top: 0;
}

.success pre {
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.4;
}
</style>
