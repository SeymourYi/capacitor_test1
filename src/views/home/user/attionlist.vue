<template>
  <div class="attention-list-container">
    <!-- 头部导航栏 -->
    <div class="header">
      <div class="header-content">
        <div class="back-button" @click="goBack">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
          </svg>
        </div>
        <div class="header-logo">
          <div class="logo-icon">🐦</div>
        </div>
        <h1 class="header-title">关注列表</h1>
        <div class="header-placeholder"></div>
      </div>
    </div>

    <!-- 关注统计 -->
    <div class="stats-section">
      <div class="stats-item">
        <div class="stats-number">{{ attentionList.length }}</div>
        <div class="stats-label">关注中</div>
      </div>
    </div>

    <!-- 关注列表 -->
    <div class="attention-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
      
      <!-- 关注用户列表 -->
      <div 
        v-for="user in attentionList" 
        :key="user.username" 
        class="attention-item"
        @click="goToUser(user.username)"
      >
        <div class="user-avatar">
          <img 
            v-if="user.userPic" 
            :src="user.userPic" 
            class="avatar-img" 
            :alt="user.nickname"
            @error="handleImageError"
          />
          <div v-else class="avatar-placeholder">
            {{ user.nickname ? user.nickname.charAt(0) : '?' }}
          </div>
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.nickname }}</div>
          <div class="user-username">@{{ user.username }}</div>
          <div class="user-bio">{{ user.bio || '这个人很神秘，还没有简介' }}</div>
        </div>
        <div class="action-button">
          <button class="unfollow-btn" @click.stop="handleUnfollow(user)">
            取消关注
          </button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && attentionList.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-text">还没有关注任何人</div>
        <div class="empty-desc">去发现一些有趣的人吧</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { getAttentionListApi } from '@/api/user.js'

const router = useRouter()
const userStore = useUserStore()

// 关注列表数据
const attentionList = ref([])
const loading = ref(false)

// 获取关注列表
const fetchAttentionList = async () => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户信息不存在')
    return
  }
  
  try {
    loading.value = true
    const response = await getAttentionListApi(userStore.userInfo.username)
    
    if (response.code === 0) {
      // 为每个用户添加唯一ID（如果没有的话）
      attentionList.value = response.data.map((user, index) => ({
        ...user,
        id: user.id || index + 1
      }))
    } else {
      console.error('获取关注列表失败:', response.msg)
    }
  } catch (error) {
    console.error('获取关注列表出错:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToUser = (username) => {
  router.push({ name: 'UserProfile', params: { id: username } })
}

const handleUnfollow = (user) => {
  if (confirm(`确定要取消关注 ${user.nickname} 吗？`)) {
    const index = attentionList.value.findIndex(item => item.username === user.username)
    if (index !== -1) {
      attentionList.value.splice(index, 1)
    }
  }
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

onMounted(() => {
  fetchAttentionList()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.attention-list-container {
  width: 100%;
  max-width: 600px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #ffffff;
  border-left: 1px solid #eff3f4;
  border-right: 1px solid #eff3f4;
}

/* 头部导航栏 */
.header {
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #eff3f4;
  z-index: 1000;
}

.header-content {
  padding: 0 16px;
  height: 53px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.back-icon {
  width: 20px;
  height: 20px;
  fill: #0f1419;
}

.header-logo {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #0f1419;
  flex: 1;
}

.header-placeholder {
  width: 36px;
  height: 36px;
}

/* 关注统计 */
.stats-section {
  padding: 20px 16px;
  border-bottom: 1px solid #eff3f4;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-number {
  font-size: 24px;
  font-weight: 700;
  color: #0f1419;
}

.stats-label {
  font-size: 16px;
  color: #536471;
}

/* 关注列表 */
.attention-list {
  display: flex;
  flex-direction: column;
}

.attention-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.attention-item:hover {
  background-color: #f7f9f9;
}

.attention-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1DA1F2;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #1DA1F2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 500;
}

.user-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f1419;
  margin-bottom: 2px;
}

.user-username {
  font-size: 14px;
  color: #536471;
  margin-bottom: 4px;
}

.user-bio {
  font-size: 14px;
  color: #536471;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-button {
  margin-left: 12px;
}

.unfollow-btn {
  background: #ffffff;
  color: #0f1419;
  border: 1px solid #d1d9dd;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.unfollow-btn:hover {
  background: #f7f9f9;
  border-color: #aab8c2;
}

.unfollow-btn:active {
  background: #e6ecf0;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1DA1F2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #536471;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #0f1419;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #536471;
}

/* 移动端优化 */
@media (max-width: 600px) {
  .attention-list-container {
    border-left: none;
    border-right: none;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .attention-item {
    padding: 12px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .user-name {
    font-size: 15px;
  }
  
  .user-username,
  .user-bio {
    font-size: 13px;
  }
  
  .unfollow-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* 横屏优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .header-content {
    height: 48px;
  }
  
  .stats-section {
    padding: 15px 16px;
  }
  
  .attention-item {
    padding: 12px 16px;
  }
}
</style>
