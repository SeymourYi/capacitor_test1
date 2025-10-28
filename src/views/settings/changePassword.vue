<template>
  <div class="change-password">
    <!-- 顶部栏 -->
    <div class="topbar">
      <button class="back" @click="goBack">
        <svg viewBox="0 0 24 24" class="icon"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="title">密码与安全</div>
      <div class="spacer"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 未登录提示 -->
      <div v-if="!userStore.userInfo" class="login-prompt">
        <div class="prompt-icon">
          <svg viewBox="0 0 24 24" class="icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="prompt-title">请先登录</div>
        <div class="prompt-desc">登录后可以修改您的密码</div>
        <button class="prompt-btn" @click="goToLogin">去登录</button>
      </div>

      <!-- 已登录用户的密码修改区域 -->
      <div v-if="userStore.userInfo">
        <!-- 安全提示 -->
        <div class="security-tips">
          <div class="tips-icon">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor"/>
            </svg>
          </div>
          <div class="tips-content">
            <div class="tips-title">密码安全提示</div>
            <div class="tips-desc">为了您的账户安全，请定期更换密码</div>
          </div>
        </div>

        <!-- 修改方式选择 -->
        <div class="method-selector">
          <div class="method-tabs">
            <button 
              class="method-tab"
              :class="{ 'active': changeMethod === 'password' }"
              @click="changeMethod = 'password'"
            >
              当前密码验证
            </button>
            <button 
              class="method-tab"
              :class="{ 'active': changeMethod === 'sms' }"
              @click="changeMethod = 'sms'"
            >
              手机短信验证
            </button>
          </div>
        </div>

        <!-- 修改密码表单 -->
        <div class="password-form">
          <div class="form-section">
            <div class="section-title">修改密码</div>
            
            <!-- 当前密码验证方式 -->
            <div v-if="changeMethod === 'password'" class="password-method">
              <!-- 当前密码 -->
              <div class="form-group">
                <label class="form-label">当前密码</label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="formData.currentPassword" 
                  placeholder="请输入当前密码"
                />
              </div>
            </div>

            <!-- 手机短信验证方式 -->
            <div v-if="changeMethod === 'sms'" class="sms-method">
              <!-- 手机号 -->
              <div class="form-group">
                <label class="form-label">手机号</label>
                <div class="phone-input-wrapper">
                  <input 
                    v-model="formData.phoneNumber"
                    type="tel"
                    class="form-input"
                    placeholder="请输入手机号"
                    maxlength="11"
                  />
                  <button 
                    class="send-code-btn"
                    :disabled="!canSendCode || isSendingCode"
                    @click="sendVerificationCode"
                  >
                    {{ isSendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s` : '发送验证码') }}
                  </button>
                </div>
              </div>

              <!-- 验证码 -->
              <div class="form-group">
                <label class="form-label">验证码</label>
                <input 
                  v-model="formData.verificationCode"
                  type="text"
                  class="form-input"
                  placeholder="请输入验证码"
                  maxlength="6"
                />
              </div>
            </div>

            <!-- 新密码 -->
            <div class="form-group">
              <label class="form-label">请输入新密码（纯中文）</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="formData.newPassword" 
                placeholder="请输入新密码（纯中文）"
              />
            </div>

            <!-- 确认新密码 -->
            <div class="form-group">
              <label class="form-label">确认新密码</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="formData.confirmPassword" 
                placeholder="请再次输入新密码"
              />
            </div>

            <!-- 诗句示例 -->
            <div class="poetry-examples">
              <div class="examples-title">示例：</div>
              <div class="example-item">春风又绿江南岸明月何时照我还</div>
              <div class="example-item">山重水复疑无路柳暗花明又一村</div>
              <div class="example-item">落红不是无情物化作春泥更护花</div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button 
                class="submit-btn" 
                @click="changePassword"
                :disabled="!isFormValid || changing"
                :class="{ loading: changing }"
              >
                <div v-if="changing" class="btn-spinner"></div>
                {{ changing ? '修改中...' : '修改密码' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      {{ error }}
    </div>

    <!-- 成功提示 -->
    <div v-if="success" class="success-message">
      <div class="success-icon">✅</div>
      <div class="success-content">
        <div class="success-title">密码修改成功！</div>
        <div class="success-desc">您的密码已更新</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { changePasswordApi, sendSmsCodeApi } from '@/api/user.js'

const router = useRouter()
const userStore = useUserStore()

// 修改方式
const changeMethod = ref('password') // 'password' 或 'sms'

// 表单数据
const formData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  phoneNumber: '',
  verificationCode: ''
})

// 状态管理
const changing = ref(false)
const error = ref('')
const success = ref(false)

// 短信验证码相关
const isSendingCode = ref(false)
const countdown = ref(0)
const countdownTimer = ref(null)
const generatedCode = ref('')
const isCodeSent = ref(false)

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到登录页面
const goToLogin = () => {
  router.push({ name: 'Login' })
}

// 删除密码显示/隐藏功能，默认可见

// 生成4位随机验证码
const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!formData.phoneNumber.trim()) {
    error.value = '请输入手机号'
    return
  }

  if (!/^1[3-9]\d{9}$/.test(formData.phoneNumber)) {
    error.value = '请输入正确的手机号'
    return
  }

  isSendingCode.value = true
  error.value = ''

  try {
    // 生成4位随机验证码
    generatedCode.value = generateCode()
    console.log('生成的验证码:', generatedCode.value)
    
    // 调用发送验证码的API
    const res = await sendSmsCodeApi(formData.phoneNumber, generatedCode.value)
    console.log('发送验证码API响应:', res)
    
    if (res && res.code === 0) {
      isSendingCode.value = false
      isCodeSent.value = true
      startCountdown()
      success.value = '验证码已发送'
      setTimeout(() => {
        success.value = false
      }, 3000)
    } else {
      isSendingCode.value = false
      error.value = res?.msg || '发送失败，请稍后重试'
    }
  } catch (err) {
    isSendingCode.value = false
    console.error('发送验证码失败:', err)
    error.value = '网络错误，请检查网络连接后重试'
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  countdownTimer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
    }
  }, 1000)
}

// 是否可以发送验证码
const canSendCode = computed(() => {
  return formData.phoneNumber.trim() && 
         /^1[3-9]\d{9}$/.test(formData.phoneNumber) && 
         countdown.value === 0
})

// 删除密码强度计算和检查功能

// 监听验证码输入，实时验证
watch(() => formData.verificationCode, (newCode) => {
  if (newCode.length === 4 && isCodeSent.value) {
    if (newCode === generatedCode.value) {
      error.value = ''
      console.log('验证码正确')
    } else {
      error.value = '验证码错误'
    }
  } else if (newCode.length < 4) {
    error.value = ''
  }
})

// 表单验证 - 只允许纯中文诗句
const isFormValid = computed(() => {
  const isPureChinese = (text) => {
    return /^[\u4e00-\u9fa5]+$/.test(text)
  }
  
  if (changeMethod.value === 'password') {
    return formData.currentPassword.trim() &&
           formData.newPassword.trim() &&
           formData.confirmPassword.trim() &&
           formData.newPassword === formData.confirmPassword &&
           formData.newPassword !== formData.currentPassword &&
           isPureChinese(formData.newPassword)
  } else {
    return formData.phoneNumber.trim() &&
           formData.verificationCode.trim() &&
           formData.newPassword.trim() &&
           formData.confirmPassword.trim() &&
           formData.newPassword === formData.confirmPassword &&
           isPureChinese(formData.newPassword) &&
           formData.verificationCode === generatedCode.value
  }
})

// 修改密码
const changePassword = async () => {
  if (!isFormValid.value) {
    error.value = '请填写完整信息'
    return
  }

  changing.value = true
  error.value = ''

  try {
    // 从store中获取username
    const username = userStore.userInfo?.username
    if (!username) {
      error.value = '用户信息异常，请重新登录'
      changing.value = false
      return
    }

    // 根据验证方式调用修改密码API
    let res
    if (changeMethod.value === 'password') {
      // 密码验证方式
      res = await changePasswordApi(
        username,
        formData.newPassword,
        formData.currentPassword
      )
    } else {
      // 短信验证码方式
      res = await changePasswordApi(
        username,
        formData.newPassword,
        formData.currentPassword,
        formData.phoneNumber
      )
    }

    if (res && res.code === 0) {
      changing.value = false
      success.value = true
      
      // 清空表单
      formData.currentPassword = ''
      formData.newPassword = ''
      formData.confirmPassword = ''
      formData.phoneNumber = ''
      formData.verificationCode = ''
      
      // 3秒后隐藏成功提示
      setTimeout(() => {
        success.value = false
      }, 3000)
    } else {
      changing.value = false
      error.value = res?.msg || '修改失败，请稍后重试'
    }
  } catch (err) {
    changing.value = false
    console.error('修改密码失败:', err)
    error.value = '网络错误，请检查网络连接后重试'
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.change-password {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  min-height: 100vh;
  border-left: 1px solid #eff3f4;
  border-right: 1px solid #eff3f4;
}

/* 顶部栏 */
.topbar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eff3f4;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 60px;
  box-sizing: border-box;
}

.back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back:hover {
  background-color: #f7f9fa;
}

.back .icon {
  width: 20px;
  height: 20px;
  color: #0f1419;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1419;
  margin-left: 16px;
}

.spacer {
  flex: 1;
}

/* 内容区域 */
.content {
  padding: 20px;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

/* 未登录提示 */
.login-prompt {
  text-align: center;
  padding: 60px 20px;
}

.prompt-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  color: #536471;
}

.prompt-icon .icon {
  width: 100%;
  height: 100%;
}

.prompt-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 8px;
}

.prompt-desc {
  font-size: 16px;
  color: #536471;
  margin-bottom: 32px;
}

.prompt-btn {
  background: #1d9bf0;
  color: #ffffff;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.prompt-btn:hover {
  background: #1a8cd8;
}

/* 安全提示 */
.security-tips {
  display: flex;
  align-items: center;
  background: #f7f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.tips-icon {
  width: 24px;
  height: 24px;
  color: #1d9bf0;
  margin-right: 12px;
  flex-shrink: 0;
}

.tips-icon .icon {
  width: 100%;
  height: 100%;
}

.tips-content {
  flex: 1;
}

.tips-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 4px;
}

.tips-desc {
  font-size: 14px;
  color: #536471;
}

/* 修改方式选择 */
.method-selector {
  margin-bottom: 24px;
}

.method-tabs {
  display: flex;
  background: #f7f9fa;
  border-radius: 12px;
  padding: 4px;
}

.method-tab {
  flex: 1;
  background: none;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #536471;
  cursor: pointer;
  transition: all 0.2s;
}

.method-tab.active {
  background: #ffffff;
  color: #1d9bf0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 密码表单 */
.password-form {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

.form-section {
  padding: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #0f1419;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #eff3f4;
  border-radius: 12px;
  font-size: 16px;
  color: #0f1419;
  background: #ffffff;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1d9bf0;
}

.form-input::placeholder {
  color: #8b98a5;
}

/* 删除密码输入容器相关样式 */

/* 手机号输入 */
.phone-input-wrapper {
  display: flex;
  gap: 12px;
}

.phone-input-wrapper .form-input {
  flex: 1;
}

.send-code-btn {
  background: #1d9bf0;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.send-code-btn:hover:not(:disabled) {
  background: #1a8cd8;
}

.send-code-btn:disabled {
  background: #8b98a5;
  cursor: not-allowed;
}

/* 删除密码强度和密码要求相关样式 */

/* 诗句示例 */
.poetry-examples {
  background: #f0f8ff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  border-left: 4px solid #1d9bf0;
}

.examples-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d9bf0;
  margin-bottom: 12px;
}

.example-item {
  font-size: 14px;
  color: #1d9bf0;
  margin-bottom: 8px;
  font-style: italic;
}

.example-item:last-child {
  margin-bottom: 0;
}

/* 提交按钮 */
.form-actions {
  margin-top: 32px;
}

.submit-btn {
  width: 100%;
  background: #1d9bf0;
  color: #ffffff;
  border: none;
  border-radius: 24px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #1a8cd8;
}

.submit-btn:disabled {
  background: #8b98a5;
  cursor: not-allowed;
}

.submit-btn.loading {
  background: #1a8cd8;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #f4212e;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(244, 33, 46, 0.3);
}

.error-icon {
  font-size: 16px;
}

/* 成功提示 */
.success-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #00ba7c;
  color: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 186, 124, 0.3);
}

.success-icon {
  font-size: 20px;
}

.success-content {
  flex: 1;
}

.success-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.success-desc {
  font-size: 14px;
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .change-password {
    border-left: none;
    border-right: none;
  }
  
  .topbar {
    padding: 8px 12px;
    min-height: 56px;
  }
  
  .content {
    padding: 16px;
    min-height: calc(100vh - 56px);
  }
  
  .form-section {
    padding: 20px;
  }
  
  .phone-input-wrapper {
    flex-direction: column;
  }
  
  .send-code-btn {
    width: 100%;
  }
}

/* 确保页面不会溢出 */
.change-password {
  overflow-x: hidden;
}

/* 修复可能的布局问题 */
* {
  box-sizing: border-box;
}
</style>