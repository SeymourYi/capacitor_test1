<template>
  <div class="account-info" lang="zh-CN">
    <!-- 顶部栏 -->
    <div class="topbar">
      <button class="back" @click="goBack">
        <svg viewBox="0 0 24 24" class="icon"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="title">账号信息</div>
      <button 
        class="save-btn" 
        @click="saveInfo"
        :disabled="saving"
        :class="{ loading: saving }"
      >
        <div v-if="saving" class="btn-spinner"></div>
        {{ saving ? '保存中...' : '保存' }}
      </button>
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
        <div class="prompt-desc">登录后可以编辑您的账号信息</div>
        <button class="prompt-btn" @click="goToLogin">去登录</button>
      </div>
      <!-- 已登录用户的信息编辑区域 -->
      <div v-if="userStore.userInfo">
        <!-- 头像和背景图片区域 -->
        <div class="profile-section">
        <!-- 背景图片 -->
        <div class="background-section">
          <div class="bg-image" :style="{ backgroundImage: formData.bgImg ? 'url(' + formData.bgImg + ')' : '' }">
            <div class="bg-overlay">
            <button class="bg-upload-btn" @click="uploadBgImage">
              <svg viewBox="0 0 24 24" class="upload-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="10,9 9,9 8,9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              选择背景图片
            </button>
            </div>
          </div>
        </div>

        <!-- 头像 -->
        <div class="avatar-section">
          <div class="avatar-container">
            <div class="avatar" :style="{ backgroundImage: formData.userPic ? 'url(' + formData.userPic + ')' : '' }">
              <div v-if="!formData.userPic" class="avatar-placeholder">
                <svg viewBox="0 0 24 24" class="avatar-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <button class="avatar-upload-btn" @click="uploadAvatar">
              <svg viewBox="0 0 24 24" class="camera-icon">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 基本信息表单 -->
      <div class="form-section">
        <!-- 昵称 -->
        <div class="form-group">
          <label class="form-label">昵称</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="formData.nickname" 
            placeholder="请输入昵称"
            maxlength="10"
          />
          <div class="char-count">{{ formData.nickname.length }}/10</div>
        </div>

        <!-- 个人签名 -->
        <div class="form-group">
          <label class="form-label">个人签名</label>
          <textarea 
            class="form-textarea" 
            v-model="formData.bio" 
            placeholder="介绍一下自己吧..."
            maxlength="100"
            rows="3"
          ></textarea>
          <div class="char-count">{{ formData.bio.length }}/100</div>
        </div>

        <!-- 位置 -->
        <div class="form-group">
          <label class="form-label">位置</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="formData.location" 
            placeholder="你在哪里？"
            maxlength="30"
          />
          <div class="char-count">{{ formData.location.length }}/30</div>
        </div>

        <!-- 生日 -->
        <!-- <div class="form-group">
          <label class="form-label">生日</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="formData.birthday" 
            placeholder="还记得刚刚到这个世界的日子吗？"
            maxlength="20"
          />
        </div> -->

        <!-- 职业 -->
        <div class="form-group">
          <label class="form-label">职业</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="formData.profession" 
            placeholder="你的职业是什么？"
            maxlength="20"
          />
          <div class="char-count">{{ formData.profession.length }}/20</div>
        </div>
      </div>

      <!-- 其他信息 -->
      <div class="info-section">
        <div class="info-item">
          <div class="info-label">用户名</div>
          <div class="info-value">{{ userStore.userInfo?.username || '未登录' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">生日</div>
          <div class="info-value">{{ userStore.userInfo?.birthday || '未设置' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">注册时间</div>
          <div class="info-value">{{ userStore.userInfo?.createTime || '未知' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">用户ID</div>
          <div class="info-value">{{ userStore.userInfo?.id || '未知' }}</div>
        </div>
      </div>
      </div>

      <!-- 注销账号区域 -->
      <div class="delete-account-section">
        <div class="section-title">危险操作</div>
        <div class="delete-account-card">
          <div class="delete-icon">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M3 6h18l-2 13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L3 6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="delete-content">
            <div class="delete-title">注销账号</div>
            <div class="delete-desc">注销后，您的所有数据将被永久删除，无法恢复</div>
          </div>
          <button class="delete-btn" @click="showDeleteConfirm">
            注销账号
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="saveError" class="error-message">
      <div class="error-icon">⚠️</div>
      {{ saveError }}
    </div>

    <!-- 成功提示 -->
    <div v-if="saveSuccess" class="success-message">
      <div class="success-icon">✅</div>
      <div class="success-content">
        <div class="success-title">保存成功！</div>
        <div class="success-desc">您的个人信息已更新</div>
      </div>
    </div>

    <!-- 图片选择器（隐藏） -->
    <input 
      ref="avatarInput" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="handleAvatarChange"
    />
    <input 
      ref="bgInput" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="handleBgChange"
    />

    <!-- 注销确认弹窗 -->
    <div v-if="showDeleteModal" class="delete-modal">
      <div class="modal-overlay" @click="hideDeleteConfirm"></div>
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" fill="currentColor"/>
            </svg>
          </div>
          <div class="modal-title">确认注销账号</div>
        </div>
        <div class="modal-body">
          <div class="modal-text">
            <p>您确定要注销账号吗？</p>
            <p class="warning-text">此操作将永久删除您的所有数据，包括：</p>
            <ul class="warning-list">
              <li>个人资料和设置</li>
              <li>所有发布的内容</li>
              <li>关注和粉丝关系</li>
              <li>聊天记录和消息</li>
            </ul>
            <p class="warning-text">此操作无法撤销！</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="hideDeleteConfirm">取消</button>
          <button class="confirm-delete-btn" @click="confirmDeleteAccount">确认注销</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { updateUserInfoApi, deleteAccountApi } from '@/api/user.js'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const formData = reactive({
  nickname: '',
  bio: '',
  location: '',
  // birthday: '',
  profession: '',
  userPic: '',
  bgImg: '',
  avatarFile: null,  // 头像文件对象
  bgFile: null      // 背景图片文件对象
})

// 文件输入引用
const avatarInput = ref(null)
const bgInput = ref(null)

// 日期选择器相关（已移除，使用普通文本输入）

// 保存状态
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

// 注销账号相关状态
const showDeleteModal = ref(false)

// 返回上一页
const goBack = () => {
  router.back()
}

const goToLogin = () => {
  router.push({ name: 'Login' })
}

// 格式化日期显示
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 处理日期变化
const onDateChange = (event) => {
  console.log('选择的生日:', event.target.value)
  // 可以在这里添加额外的日期验证逻辑
}

// 日期选择器相关函数已移除

// 保存信息
const saveInfo = async () => {
  // 清除之前的错误和成功状态
  saveError.value = ''
  saveSuccess.value = false
  
  // 表单验证
  if (!formData.nickname.trim()) {
    saveError.value = '请输入昵称'
    return
  }
  
  // 验证昵称长度（限制为10个字符，避免数据库截断）
  if (formData.nickname.trim().length > 10) {
    saveError.value = '昵称不能超过10个字符'
    return
  }
  
  // 验证其他字段长度
  if (formData.bio.trim().length > 100) {
    saveError.value = '个人签名不能超过100个字符'
    return
  }
  
  if (formData.location.trim().length > 30) {
    saveError.value = '位置信息不能超过30个字符'
    return
  }
  
  if (formData.profession.trim().length > 20) {
    saveError.value = '职业信息不能超过20个字符'
    return
  }
  
  if (!userStore.userInfo?.username) {
    saveError.value = '用户信息异常，请重新登录'
    return
  }
  
  saving.value = true
  
  try {
    // 调用更新用户信息接口，包含图片文件
    const res = await updateUserInfoApi(
      userStore.userInfo.username,
      formData.nickname.trim(),
      formData.bio.trim(),
      formData.location.trim(),
      // formData.birthday.trim(),
      formData.profession.trim(),
      formData.avatarFile,  // 头像文件
      formData.bgFile       // 背景图片文件
    )
    
    if (res && res.code === 0) {
      // 更新成功，同步更新本地 store 数据
      const updatedUserInfo = {
        ...userStore.userInfo,
        nickname: formData.nickname.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        // birthday: formData.birthday.trim(),
        profession: formData.profession.trim(),
        // 如果有新的图片，也更新图片URL（这里假设服务器返回了新的图片URL）
        userPic: formData.avatarFile ? formData.userPic : userStore.userInfo.userPic,
        bgImg: formData.bgFile ? formData.bgImg : userStore.userInfo.bgImg
      }
      
      // 更新 store 中的用户信息
      userStore.setUserInfo(updatedUserInfo)
      
      // 同步更新表单数据，确保显示最新的信息
      formData.nickname = updatedUserInfo.nickname
      formData.bio = updatedUserInfo.bio
      formData.location = updatedUserInfo.location
      // formData.birthday = updatedUserInfo.birthday
      formData.profession = updatedUserInfo.profession
      formData.userPic = updatedUserInfo.userPic
      formData.bgImg = updatedUserInfo.bgImg
      
      // 清除文件对象，避免重复上传
      formData.avatarFile = null
      formData.bgFile = null
      saveSuccess.value = true
      
      // 显示成功提示
      console.log('用户信息更新成功')
      
      // 清除成功提示（3秒后自动隐藏）
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = res?.msg || '更新失败，请稍后重试'
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    saveError.value = '网络错误，请检查网络连接后重试'
  } finally {
    saving.value = false
  }
}

// 上传头像
const uploadAvatar = () => {
  avatarInput.value?.click()
}

// 上传背景图片
const uploadBgImage = () => {
  bgInput.value?.click()
}

// 处理头像选择
const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      saveError.value = '请选择图片文件'
      return
    }
    
    // 验证文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      saveError.value = '图片大小不能超过5MB'
      return
    }
    
    console.log('选择头像:', file)
    
    // 显示本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.userPic = e.target.result
      // 存储文件对象，用于后续上传
      formData.avatarFile = file
    }
    reader.readAsDataURL(file)
    
    // 清除错误信息
    saveError.value = ''
  }
}

// 处理背景图片选择
const handleBgChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      saveError.value = '请选择图片文件'
      return
    }
    
    // 验证文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      saveError.value = '图片大小不能超过5MB'
      return
    }
    
    console.log('选择背景图片:', file)
    
    // 显示本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.bgImg = e.target.result
      // 存储文件对象，用于后续上传
      formData.bgFile = file
    }
    reader.readAsDataURL(file)
    
    // 清除错误信息
    saveError.value = ''
  }
}

// 初始化表单数据
const initFormData = () => {
  if (userStore.userInfo) {
    formData.nickname = userStore.userInfo.nickname || ''
    formData.bio = userStore.userInfo.bio || ''
    formData.location = userStore.userInfo.location || ''
    // formData.birthday = userStore.userInfo.birthday || ''
    formData.profession = userStore.userInfo.profession || ''
    formData.userPic = userStore.userInfo.userPic || ''
    formData.bgImg = userStore.userInfo.bgImg || ''
  } else {
    // 如果没有用户信息，显示默认值
    formData.nickname = ''
    formData.bio = ''
    formData.location = ''
    // formData.birthday = ''
    formData.profession = ''
    formData.userPic = ''
    formData.bgImg = ''
  }
}

// 监听用户信息变化，自动更新表单数据
watch(() => userStore.userInfo, (newUserInfo) => {
  if (newUserInfo) {
    initFormData()
  }
}, { deep: true })

onMounted(() => {
  initFormData()
})

// 显示注销确认弹窗
const showDeleteConfirm = () => {
  showDeleteModal.value = true
}

// 隐藏注销确认弹窗
const hideDeleteConfirm = () => {
  showDeleteModal.value = false
}

// 确认注销账号
const confirmDeleteAccount = async () => {
  try {
    // 从store中获取username
    const username = userStore.userInfo?.username
    if (!username) {
      saveError.value = '用户信息异常，请重新登录'
      return
    }

    // 调用注销账号的API
    const res = await deleteAccountApi(username)
    
    if (res && res.code === 0) {
      console.log('账号注销成功')
      
      // 清除用户数据
      userStore.clearUserInfo()
      userStore.clearToken()
      
      // 跳转到登录页面
      router.replace({ name: 'Login' })
      
      // 隐藏弹窗
      showDeleteModal.value = false
    } else {
      console.error('注销账号失败:', res?.msg)
      saveError.value = res?.msg || '注销失败，请稍后重试'
    }
  } catch (error) {
    console.error('注销账号失败:', error)
    saveError.value = '网络错误，请检查网络连接后重试'
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

.account-info {
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
  position: sticky;
  top: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #eff3f4;
  z-index: 10;
}

.back {
  background: transparent;
  border: none;
  color: #0f1419;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back:hover {
  background: rgba(0,0,0,0.05);
}

.icon {
  width: 22px;
  height: 22px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #0f1419;
}

.save-btn {
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background: #1a8cd8;
}

.save-btn:disabled {
  background: #8b98a5;
  cursor: not-allowed;
}

.save-btn.loading {
  background: #1a8cd8;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 内容区域 */
.content {
  padding-bottom: 20px;
}

/* 未登录提示 */
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.prompt-icon {
  width: 80px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #536471;
}

.prompt-icon .icon {
  width: 40px;
  height: 40px;
}

.prompt-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 8px;
}

.prompt-desc {
  font-size: 14px;
  color: #536471;
  margin-bottom: 24px;
  line-height: 1.4;
}

.prompt-btn {
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.prompt-btn:hover {
  background: #1a8cd8;
}

/* 头像和背景区域 */
.profile-section {
  position: relative;
}

.image-tips {
  padding: 12px 16px;
  background: #f0f8ff;
  border: 1px solid #cfe7ff;
  border-radius: 8px;
  margin-bottom: 16px;
}

.image-tips p {
  margin: 0;
  font-size: 14px;
  color: #1DA1F2;
  font-weight: 500;
}

.background-section {
  height: 120px;
  position: relative;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1DA1F2, #74c0fc);
  background-size: cover;
  background-position: center;
  position: relative;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.bg-image:hover .bg-overlay {
  opacity: 1;
}

.bg-upload-btn {
  background: rgba(255,255,255,0.9);
  color: #0f1419;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.bg-upload-btn:hover {
  background: white;
  transform: translateY(-1px);
}

.upload-icon {
  width: 16px;
  height: 16px;
}

.avatar-section {
  padding: 0 16px;
  margin-top: -28px;
  position: relative;
  z-index: 2;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0f0f0;
  border: 3px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1DA1F2;
  color: white;
}

.avatar-icon {
  width: 28px;
  height: 28px;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: #1DA1F2;
  color: white;
  border: 2px solid #ffffff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.avatar-upload-btn:hover {
  background: #1a8cd8;
  transform: scale(1.1);
}

.camera-icon {
  width: 12px;
  height: 12px;
}

/* 表单区域 */
.form-section {
  padding: 20px 16px;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #0f1419;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  background: #ffffff;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1DA1F2;
  box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  background: #ffffff;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #1DA1F2;
  box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.1);
}

.char-count {
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 12px;
  color: #536471;
}

/* 日期输入容器 */
.date-input-container {
  position: relative;
}

.date-input {
  /* 优化日期选择器的显示 */
  color-scheme: light;
  font-family: inherit;
}

/* 针对不同浏览器的日期选择器优化 */
.date-input::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
}

.date-input::-webkit-datetime-edit {
  padding: 0;
}

.date-input::-webkit-datetime-edit-fields-wrapper {
  background: transparent;
}

.date-input::-webkit-datetime-edit-text {
  color: transparent;
  padding: 0 1px;
}

.date-input::-webkit-datetime-edit-month-field,
.date-input::-webkit-datetime-edit-day-field,
.date-input::-webkit-datetime-edit-year-field {
  color: transparent;
}

.date-display {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  font-size: 14px;
  color: #536471;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.date-placeholder {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  font-size: 14px;
  color: #8b98a5;
  pointer-events: none;
  font-style: italic;
}

/* 日期选择器相关样式已移除 */

/* 错误和成功提示 */
.error-message, .success-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1001;
  max-width: 90vw;
  min-width: 280px;
}

.error-message {
  border-left: 4px solid #f91880;
}

.success-message {
  border-left: 4px solid #00ba7c;
}

.error-icon, .success-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.error-message .error-icon {
  color: #f91880;
}

.success-message .success-icon {
  color: #00ba7c;
}

.success-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.success-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f1419;
}

.success-desc {
  font-size: 14px;
  color: #536471;
}

/* 信息区域 */
.info-section {
  padding: 0 16px;
  border-top: 1px solid #eff3f4;
  padding-top: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #536471;
}

.info-value {
  font-size: 14px;
  color: #0f1419;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .account-info {
    border-left: none;
    border-right: none;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .info-section {
    padding: 0 16px;
  }
}

/* 注销账号区域 */
.delete-account-section {
  margin-top: 40px;
  padding: 0 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 16px;
}

.delete-account-card {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.delete-icon {
  width: 24px;
  height: 24px;
  color: #dc2626;
  flex-shrink: 0;
}

.delete-icon .icon {
  width: 100%;
  height: 100%;
}

.delete-content {
  flex: 1;
}

.delete-title {
  font-size: 16px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 4px;
}

.delete-desc {
  font-size: 14px;
  color: #991b1b;
  line-height: 1.4;
}

.delete-btn {
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.delete-btn:hover {
  background: #b91c1c;
}

/* 注销确认弹窗 */
.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  position: relative;
  z-index: 1001;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 24px 24px 0;
  text-align: center;
}

.modal-icon {
  width: 48px;
  height: 48px;
  color: #f59e0b;
  margin: 0 auto 16px;
}

.modal-icon .icon {
  width: 100%;
  height: 100%;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 16px;
}

.modal-body {
  padding: 0 24px 24px;
}

.modal-text {
  text-align: center;
}

.modal-text p {
  font-size: 16px;
  color: #0f1419;
  margin-bottom: 12px;
  line-height: 1.5;
}

.warning-text {
  font-weight: 600;
  color: #dc2626 !important;
}

.warning-list {
  text-align: left;
  margin: 12px 0;
  padding-left: 20px;
}

.warning-list li {
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.modal-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-delete-btn {
  flex: 1;
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-delete-btn:hover {
  background: #b91c1c;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .delete-account-section {
    padding: 0 16px;
  }
  
  .delete-account-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .delete-btn {
    width: 100%;
  }
  
  .modal-content {
    margin: 0 16px;
  }
}
</style>

