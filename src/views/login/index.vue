<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-card">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon">🐦</div>
        <h1 class="app-title">欢迎回来</h1>
        <p class="app-subtitle">登录到您的账户</p>
      </div>

      <!-- 登录方式切换 -->
      <div class="login-tabs">
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'password' }"
          @click="loginType = 'password'"
        >
          密码登录
        </div>
        <div 
          class="tab-item" 
          :class="{ active: loginType === 'sms' }"
          @click="loginType = 'sms'"
        >
          验证码登录
        </div>
      </div>

      <!-- 密码登录表单 -->
      <div v-if="loginType === 'password'" class="login-form">
        <div class="input-group">
          <div class="input-wrapper">
            <input 
              class="form-input" 
              placeholder="手机号" 
              v-model="username"
              :class="{ error: usernameError }"
            />
            <div class="input-icon">👤</div>
          </div>
          <div v-if="usernameError" class="error-text">{{ usernameError }}</div>
        </div>

        <div class="input-group">
          <div class="input-wrapper">
            <input 
              class="form-input" 
              placeholder="密码" 
              v-model="password"
              :class="{ error: passwordError }"
            />
            <div class="input-icon">🔒</div>
          </div>
          <div class="password-hint">
            💡 还记得那首你喜欢的诗吗？
          </div>
          <div v-if="passwordError" class="error-text">{{ passwordError }}</div>
        </div>

        <button 
          class="login-btn" 
          @click="onLogin" 
          :disabled="loading || !isPasswordFormValid"
          :class="{ loading: loading }"
        >
          <div v-if="loading" class="btn-spinner"></div>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>

      <!-- 验证码登录表单 -->
      <div v-if="loginType === 'sms'" class="login-form">
        <div class="input-group">
          <div class="input-wrapper">
            <input 
              class="form-input" 
              placeholder="手机号" 
              v-model="phone"
              :class="{ error: phoneError }"
              maxlength="11"
            />
            <div class="input-icon">📱</div>
          </div>
          <div v-if="phoneError" class="error-text">{{ phoneError }}</div>
        </div>

        <div class="input-group">
          <div class="input-wrapper">
            <input 
              class="form-input" 
              placeholder="验证码" 
              v-model="smsCode"
              :class="{ error: smsCodeError }"
              maxlength="4"
            />
            <div class="input-icon">🔢</div>
            <button 
              class="sms-btn" 
              @click="sendSmsCode"
              :disabled="smsCountdown > 0 || !isValidPhone"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
            </button>
          </div>
          <div v-if="smsCodeError" class="error-text">{{ smsCodeError }}</div>
        </div>

        <button 
          class="login-btn" 
          @click="onSmsLogin" 
          :disabled="loading || !isSmsFormValid"
          :class="{ loading: loading }"
        >
          <div v-if="loading" class="btn-spinner"></div>
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <!-- 开发环境显示验证码 -->
        <div v-if="generatedCode && isCodeSent" class="debug-info">
          <p>开发模式 - 验证码: {{ generatedCode }}</p>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <div class="error-icon">⚠️</div>
        {{ error }}
      </div>

      <!-- 底部链接 -->
      <div class="footer-links">
        <span class="link-text">还没有账户？</span>
        <button class="link-btn" @click="goToRegister">立即注册</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userLogin, getUserInfo, getNotificationsNumberApi, sendSmsCodeApi, smsLogin } from '@/api/user.js'
import { useUserStore } from '@/store/user.js'

const router = useRouter()
const userStore = useUserStore()

// 登录方式
const loginType = ref('password')

// 密码登录相关
const username = ref('19137056165')
const password = ref('多少楼台烟雨中')
const usernameError = ref('')
const passwordError = ref('')

// 验证码登录相关
const phone = ref('')
const smsCode = ref('')
const phoneError = ref('')
const smsCodeError = ref('')
const smsCountdown = ref(0)
const generatedCode = ref('') // 存储生成的验证码
const isCodeSent = ref(false) // 是否已发送验证码

// 通用状态
const loading = ref(false)
const error = ref('')

// 表单验证
const isValidPhone = computed(() => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone.value)
})

const isPasswordFormValid = computed(() => {
  return username.value.trim() && password.value.trim()
})

const isSmsFormValid = computed(() => {
  return isValidPhone.value && 
         smsCode.value.trim().length === 4 && 
         isCodeSent.value &&
         smsCode.value.trim() === generatedCode.value
})

// 监听输入变化，清除错误信息
watch([username, password], () => {
  usernameError.value = ''
  passwordError.value = ''
  error.value = ''
})

watch([phone, smsCode], () => {
  phoneError.value = ''
  smsCodeError.value = ''
  error.value = ''
})

// 监听验证码输入，实时验证
watch(smsCode, (newCode) => {
  if (newCode.length === 4 && isCodeSent.value) {
    if (newCode === generatedCode.value) {
      smsCodeError.value = ''
      console.log('验证码正确')
    } else {
      smsCodeError.value = '验证码错误'
    }
  } else if (newCode.length < 4) {
    smsCodeError.value = ''
  }
})

// 生成4位随机验证码
const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// 发送验证码
const sendSmsCode = async () => {
  if (!isValidPhone.value) {
    phoneError.value = '请输入正确的手机号'
    return
  }
  
  try {
    // 生成4位随机验证码
    generatedCode.value = generateCode()
    console.log('生成的验证码:', generatedCode.value)
    
    // 调用发送验证码的API
    const res = await sendSmsCodeApi(phone.value, generatedCode.value)
    console.log('发送验证码API响应:', res)
    
    if (res.code === 0) {
      // 发送成功，开始倒计时
      isCodeSent.value = true
      smsCountdown.value = 60
      const timer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      
      // 清除之前的错误信息
      error.value = ''
      smsCodeError.value = ''
    } else {
      error.value = res.msg || '发送验证码失败，请稍后重试'
    }
  } catch (e) {
    console.error('发送验证码失败:', e)
    error.value = '发送验证码失败，请稍后重试'
  }
}

// 密码登录
const onLogin = async () => {
  // 表单验证
  if (!username.value.trim()) {
    usernameError.value = '请输入手机号'
    return
  }
  if (!password.value.trim()) {
    passwordError.value = '请输入密码'
    return
  }
  // 检查密码是否只包含中文字符
  const chineseRegex = /^[\u4e00-\u9fa5]+$/
  if (!chineseRegex.test(password.value)) {
    passwordError.value = '密码只能包含中文字符'
    return
  }

  error.value = ''
  loading.value = true
  
  try {
    const res = await userLogin(username.value, password.value)
    if (res && res.code === 0) {
      const token = res.data && (res.data.token || res.data)
      if (token) {
        userStore.setToken(token)
        await loadUserData()
        router.replace({ name: 'HomeFeed' })
      } else {
        error.value = '登录成功但未返回token'
      }
    } else {
      error.value = (res && res.msg) || '登录失败'
    }
  } catch (e) {
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 验证码登录
const onSmsLogin = async () => {
  // 表单验证
  if (!isValidPhone.value) {
    phoneError.value = '请输入正确的手机号'
    return
  }
  if (!smsCode.value.trim()) {
    smsCodeError.value = '请输入验证码'
    return
  }
  if (smsCode.value.trim().length !== 4) {
    smsCodeError.value = '验证码应为4位数字'
    return
  }
  if (!isCodeSent.value) {
    smsCodeError.value = '请先获取验证码'
    return
  }
  if (smsCode.value.trim() !== generatedCode.value) {
    smsCodeError.value = '验证码错误，请重新输入'
    return
  }

  error.value = ''
  loading.value = true
  
  try {
    // 验证码正确，使用手机号作为username调用验证码登录接口
    console.log('验证码验证成功，执行登录:', phone.value)
    
    // 调用验证码登录接口，只传入手机号作为username参数，不传password
    const res = await smsLogin(phone.value)
    
    if (res && res.code === 0) {
      const token = res.data && (res.data.token || res.data)
      if (token) {
        userStore.setToken(token)
        await loadUserData()
        router.replace({ name: 'HomeFeed' })
      } else {
        error.value = '登录成功但未返回token'
      }
    } else {
      error.value = (res && res.msg) || '登录失败'
    }
    
    // 重置验证码相关状态
    smsCode.value = ''
    generatedCode.value = ''
    isCodeSent.value = false
    
  } catch (e) {
    console.error('验证码登录失败:', e)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 加载用户数据
const loadUserData = async () => {
  try {
    const userRes = await getUserInfo()
    if (userRes && userRes.code === 0) {
      // 确保用户信息包含职业和生日字段，如果接口没有返回则添加默认值
      const userInfo = {
        ...userRes.data,
        profession: userRes.data.profession || '',
        birthday: userRes.data.birthday || ''
      }
      userStore.setUserInfo(userInfo)
      
      // 获取通知个数
      try {
        const notificationsRes = await getNotificationsNumberApi(userRes.data.username)
        if (notificationsRes && notificationsRes.code === 0) {
          userStore.setNotificationsCount(parseInt(notificationsRes.data) || 0)
        }
      } catch (e) {
        console.error('获取通知个数失败:', e)
      }
    }
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push({ name: 'Register' })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.app-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 登录方式切换 */
.login-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 32px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.tab-item.active {
  background: #ffffff;
  color: #1DA1F2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 表单样式 */
.login-form {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  height: 56px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 0 20px 0 50px;
  font-size: 16px;
  background: #ffffff;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #1DA1F2;
  box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.1);
}

.form-input.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.input-icon {
  position: absolute;
  left: 18px;
  font-size: 18px;
  z-index: 1;
}

.sms-btn {
  position: absolute;
  right: 8px;
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sms-btn:hover:not(:disabled) {
  background: #1991db;
}

.sms-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-text {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
  margin-left: 4px;
}

.password-hint {
  color: #666;
  font-size: 12px;
  margin-top: 6px;
  margin-left: 4px;
  line-height: 1.4;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #1DA1F2;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, #1DA1F2, #1991db);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(29, 161, 242, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-btn.loading {
  color: transparent;
}

.btn-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 错误提示 */
.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  color: #c33;
}

/* 调试信息 */
.debug-info {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0369a1;
  font-size: 12px;
  text-align: center;
}

.error-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 底部链接 */
.footer-links {
  text-align: center;
  margin-top: 24px;
}

.link-text {
  color: #666;
  font-size: 14px;
}

.link-btn {
  background: none;
  border: none;
  color: #1DA1F2;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 4px;
  text-decoration: underline;
}

.link-btn:hover {
  color: #1991db;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-card {
    padding: 24px;
    border-radius: 20px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .form-input {
    height: 48px;
    font-size: 15px;
  }
  
  .login-btn {
    height: 48px;
    font-size: 15px;
  }
  
  .input-icon {
    font-size: 16px;
  }
}

/* 横屏优化 */
@media (orientation: landscape) and (max-height: 600px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 20px;
  }
  
  .logo-section {
    margin-bottom: 20px;
  }
  
  .app-title {
    font-size: 22px;
  }
  
  .form-input {
    height: 44px;
  }
  
  .login-btn {
    height: 44px;
  }
}
</style>


