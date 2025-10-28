<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="register-card">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon">🐦</div>
        <h1 class="app-title">创建账户</h1>
        <p class="app-subtitle">加入我们，开始您的旅程</p>
      </div>

      <!-- 注册表单 -->
      <div class="register-form">
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
            💡 密码只能为中文，你可以使用一句你喜欢的诗，比如 "多少楼台风雨中"
          </div>
          <div v-if="passwordError" class="error-text">{{ passwordError }}</div>
        </div>

        <div class="input-group">
          <div class="input-wrapper">
            <input 
              class="form-input" 
              placeholder="确认密码" 
              v-model="confirmPassword"
              :class="{ error: confirmPasswordError }"
            />
            <div class="input-icon">🔒</div>
          </div>
          <div v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</div>
        </div>

        <!-- 协议同意 -->
        <div class="agreement-section">
          <label class="agreement-checkbox">
            <input 
              type="checkbox" 
              v-model="agreeTerms"
              :class="{ error: termsError }"
            />
            <span class="checkmark"></span>
            <span class="agreement-text">
              我已阅读并同意
              <button type="button" class="link-btn" @click="showTerms">《用户协议》</button>
              和
              <button type="button" class="link-btn" @click="showPrivacy">《隐私政策》</button>
            </span>
          </label>
          <div v-if="termsError" class="error-text">{{ termsError }}</div>
        </div>

        <button 
          class="register-btn" 
          @click="onRegister" 
          :disabled="loading || !isFormValid"
          :class="{ loading: loading }"
        >
          <div v-if="loading" class="btn-spinner"></div>
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <div class="error-icon">⚠️</div>
        {{ error }}
      </div>

      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        <div class="success-icon">✅</div>
        {{ successMessage }}
      </div>

      <!-- 底部链接 -->
      <div class="footer-links">
        <span class="link-text">已有账户？</span>
        <button class="link-btn" @click="goToLogin">立即登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { registerApi, sendSmsCodeApi } from '@/api/user.js'

const router = useRouter()

// 表单数据
const phone = ref('')
const smsCode = ref('')
const password = ref('多少楼台烟雨中')
const confirmPassword = ref('')
const agreeTerms = ref(false)

// 错误信息
const phoneError = ref('')
const smsCodeError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const termsError = ref('')

// 其他状态
const smsCountdown = ref(0)
const loading = ref(false)
const error = ref('')
const generatedCode = ref('') // 存储生成的验证码
const isCodeSent = ref(false) // 是否已发送验证码
const successMessage = ref('') // 成功提示信息
const sentPhoneNumber = ref('') // 存储发送验证码时的手机号码

// 表单验证
const isValidPhone = computed(() => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone.value)
})

// 手机号码格式校验函数
const validatePhoneFormat = (phoneNumber) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneNumber) {
    return '请输入手机号码'
  }
  if (!phoneRegex.test(phoneNumber)) {
    return '请输入正确的手机号码格式'
  }
  return ''
}

// 检查手机号码是否被修改
const isPhoneChanged = computed(() => {
  return isCodeSent.value && sentPhoneNumber.value && sentPhoneNumber.value !== phone.value
})

const isFormValid = computed(() => {
  return isValidPhone.value && 
         smsCode.value.trim().length === 4 &&
         password.value.trim() && 
         confirmPassword.value.trim() &&
         password.value === confirmPassword.value &&
         isCodeSent.value &&
         !isPhoneChanged.value &&
         smsCode.value.trim() === generatedCode.value &&
         agreeTerms.value
})

// 监听输入变化，清除错误信息
watch([phone, smsCode, password, confirmPassword, agreeTerms], () => {
  phoneError.value = ''
  smsCodeError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  termsError.value = ''
  error.value = ''
  successMessage.value = ''
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

// 监听密码确认，实时验证密码一致性
watch([password, confirmPassword], () => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    confirmPasswordError.value = '两次输入的密码不一致'
  } else {
    confirmPasswordError.value = ''
  }
})

// 监听手机号码变化，如果手机号码被修改则重置验证码状态
watch(phone, (newPhone, oldPhone) => {
  if (isCodeSent.value && oldPhone && newPhone !== oldPhone) {
    // 手机号码被修改，重置验证码相关状态
    smsCode.value = ''
    generatedCode.value = ''
    isCodeSent.value = false
    sentPhoneNumber.value = ''
    smsCountdown.value = 0
    smsCodeError.value = '手机号码已修改，请重新获取验证码'
  }
})

// 生成4位随机验证码
const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// 发送验证码
const sendSmsCode = async () => {
  // 先进行手机号码格式校验
  const phoneValidationError = validatePhoneFormat(phone.value)
  if (phoneValidationError) {
    phoneError.value = phoneValidationError
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
      // 发送成功，保存当前手机号码并开始倒计时
      sentPhoneNumber.value = phone.value
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
      phoneError.value = ''
    } else {
      error.value = res.msg || '发送验证码失败，请稍后重试'
    }
  } catch (e) {
    console.error('发送验证码失败:', e)
    error.value = '发送验证码失败，请稍后重试'
  }
}

// 注册
const onRegister = async () => {
  // 表单验证
  const phoneValidationError = validatePhoneFormat(phone.value)
  if (phoneValidationError) {
    phoneError.value = phoneValidationError
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
  if (isPhoneChanged.value) {
    smsCodeError.value = '手机号码已修改，请重新获取验证码'
    return
  }
  if (smsCode.value.trim() !== generatedCode.value) {
    smsCodeError.value = '验证码错误，请重新输入'
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
  if (password.value.length < 2) {
    passwordError.value = '密码至少2个中文字符'
    return
  }
  if (!confirmPassword.value.trim()) {
    confirmPasswordError.value = '请确认密码'
    return
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = '两次输入的密码不一致'
    return
  }
  if (!agreeTerms.value) {
    termsError.value = '请同意用户协议和隐私政策'
    return
  }

  error.value = ''
  successMessage.value = ''
  loading.value = true
  
  try {
    // 调用注册API
    const res = await registerApi(phone.value, password.value)
    console.log('注册API响应:', res)
    
    if (res && res.code === 0) {
      // 注册成功
      successMessage.value = '注册成功！正在跳转到登录页面...'
      
      // 延迟跳转到登录页面
      setTimeout(() => {
        router.push({ name: 'Login' })
      }, 2000)
    } else {
      error.value = (res && res.msg) || '注册失败，请稍后重试'
    }
  } catch (e) {
    console.error('注册失败:', e)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 显示用户协议
const showTerms = () => {
  alert('用户协议内容')
}

// 显示隐私政策
const showPrivacy = () => {
  alert('隐私政策内容')
}

// 跳转到登录页面
const goToLogin = () => {
  router.push({ name: 'Login' })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.register-container {
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

/* 注册卡片 */
.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
  max-height: 90vh;
  overflow-y: auto;
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

/* 表单样式 */
.register-form {
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

/* 协议同意 */
.agreement-section {
  margin-bottom: 24px;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.5;
}

.agreement-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e1e5e9;
  border-radius: 4px;
  margin-right: 12px;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s ease;
}

.agreement-checkbox input[type="checkbox"]:checked + .checkmark {
  background: #1DA1F2;
  border-color: #1DA1F2;
}

.agreement-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.agreement-checkbox input[type="checkbox"].error + .checkmark {
  border-color: #e74c3c;
}

.agreement-text {
  color: #666;
}

/* 注册按钮 */
.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(29, 161, 242, 0.3);
}

.register-btn:active {
  transform: translateY(0);
}

.register-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.register-btn.loading {
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

.error-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 成功提示 */
.success-message {
  background: #efe;
  border: 1px solid #cfc;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  color: #363;
}

.success-icon {
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
  .register-container {
    padding: 16px;
  }
  
  .register-card {
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
  
  .register-btn {
    height: 48px;
    font-size: 15px;
  }
  
  .input-icon {
    font-size: 16px;
  }
}

/* 横屏优化 */
@media (orientation: landscape) and (max-height: 600px) {
  .register-container {
    padding: 10px;
  }
  
  .register-card {
    padding: 20px;
    max-height: 95vh;
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
  
  .register-btn {
    height: 44px;
  }
}
</style>
