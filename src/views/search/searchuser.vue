<template>
  <div class="search-container">
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
        <h1 class="header-title">添加朋友</h1>
        <div class="header-placeholder"></div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-box">
        <div class="search-icon">
          <svg viewBox="0 0 24 24" class="icon">
            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <input 
          class="search-input" 
          placeholder="搜索用户名或昵称..." 
          v-model="searchQuery"
          @keyup.enter="handleSearch"
        />
        <button v-if="searchQuery" class="clear-button" @click="clearSearch">
          <svg viewBox="0 0 24 24" class="icon">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      <button 
        class="search-button" 
        @click="handleSearch"
        :disabled="!searchQuery.trim() || loading"
      >
        <div v-if="loading" class="btn-spinner"></div>
        {{ loading ? '搜索中...' : '搜索' }}
      </button>
    </div>

    <!-- 搜索建议 -->
    <div v-if="showSuggestions && searchQuery" class="suggestions">
      <div class="suggestion-item" @click="searchWithSuggestion('推荐用户')">
        <div class="suggestion-icon">⭐</div>
        <span>推荐用户</span>
      </div>
      <div class="suggestion-item" @click="searchWithSuggestion('附近的人')">
        <div class="suggestion-icon">📍</div>
        <span>附近的人</span>
      </div>
      <div class="suggestion-item" @click="searchWithSuggestion('通讯录好友')">
        <div class="suggestion-icon">📱</div>
        <span>通讯录好友</span>
      </div>
    </div>

    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="loading-container">
      <SkeletonLoader type="search" :count="5" />
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="hasSearched && searchResults.length > 0" class="results-section">
      <div class="results-header">
        <span class="results-count">找到 {{ searchResults.length }} 个用户</span>
      </div>

      <div class="results-list">
        <div 
          v-for="user in searchResults" 
          :key="user.id" 
          class="result-item"
        >
          <div class="result-avatar" @click="goToUserProfile(user)">
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
          <div class="result-content" @click="goToUserProfile(user)">
            <div class="user-info">
              <div class="user-name">{{ user.nickname }}</div>
              <div class="user-username">@{{ user.username }}</div>
            </div>
            <div class="user-bio">{{ user.bio || '这个人很神秘，还没有简介' }}</div>
            <div class="user-stats">
              <span class="stat-item">关注 {{ user.followingCount || 0 }}</span>
              <span class="stat-item">粉丝 {{ user.followersCount || 0 }}</span>
              <span class="stat-item">帖子 {{ user.postsCount || 0 }}</span>
            </div>
          </div>
          <div class="action-button">
            <button 
              class="follow-btn" 
              :class="{ following: user.isFollowing }"
              @click.stop="toggleFollow(user)"
            >
              {{ user.isFollowing ? '已关注' : '关注' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐用户 -->
    <div v-if="!hasSearched" class="recommendations-section">
      <div class="section-title">推荐用户</div>
      <div class="recommendations-list">
        <div 
          v-for="user in recommendedUsers" 
          :key="user.id" 
          class="recommendation-item"
        >
          <div class="user-avatar" @click="goToUserProfile(user)">
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
          <div class="user-info" @click="goToUserProfile(user)">
            <div class="user-name">{{ user.nickname }}</div>
            <div class="user-username">@{{ user.username }}</div>
            <div class="user-bio">{{ user.bio || '这个人很神秘，还没有简介' }}</div>
          </div>
          <div class="action-button">
            <button 
              class="follow-btn" 
              :class="{ following: user.isFollowing }"
              @click.stop="toggleFollow(user)"
            >
              {{ user.isFollowing ? '已关注' : '关注' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 无结果状态 -->
    <div v-else-if="hasSearched && searchResults.length === 0 && !loading" class="no-results">
      <div class="no-results-icon">😔</div>
      <div class="no-results-text">没有找到相关用户</div>
      <div class="no-results-desc">试试其他关键词吧</div>
    </div>
  </div>
</template>

<script setup>
// 定义组件名称
defineOptions({
  name: 'SearchUsers'
})

import { ref, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { searchFriendApi } from '@/api/user.js'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const router = useRouter()

// 搜索相关状态
const searchQuery = ref('')
const showSuggestions = ref(true)
const loading = ref(false)
const hasSearched = ref(false)

// 模拟搜索结果数据
const searchResults = ref([
  {
    id: 1,
    username: 'tech_guru',
    nickname: '科技达人',
    userPic: '',
    bio: '热爱科技，分享最新技术动态',
    followingCount: 128,
    followersCount: 2560,
    postsCount: 89,
    isFollowing: false
  },
  {
    id: 2,
    username: 'life_sharer',
    nickname: '生活分享者',
    userPic: '',
    bio: '记录生活中的美好瞬间',
    followingCount: 89,
    followersCount: 1234,
    postsCount: 156,
    isFollowing: true
  },
  {
    id: 3,
    username: 'news_hunter',
    nickname: '新闻猎手',
    userPic: '',
    bio: '第一时间分享重要新闻',
    followingCount: 45,
    followersCount: 890,
    postsCount: 234,
    isFollowing: false
  }
])

// 模拟推荐用户数据
const recommendedUsers = ref([
  {
    id: 4,
    username: 'designer_pro',
    nickname: '设计师小王',
    userPic: '',
    bio: 'UI/UX设计师，分享设计心得',
    isFollowing: false
  },
  {
    id: 5,
    username: 'food_lover',
    nickname: '美食爱好者',
    userPic: '',
    bio: '探索城市美食，分享味蕾体验',
    isFollowing: false
  },
  {
    id: 6,
    username: 'travel_blogger',
    nickname: '旅行博主',
    userPic: '',
    bio: '环游世界，记录美好旅程',
    isFollowing: false
  }
])

// 搜索处理
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    return
  }
  
  loading.value = true
  hasSearched.value = true
  showSuggestions.value = false
  
  try {
    const response = await searchFriendApi(searchQuery.value.trim())
    
    if (response.code === 0) {
      // 处理返回的数据，使用新的接口格式
      searchResults.value = response.data.map((user, index) => ({
        id: user.id || index + 1,
        username: user.username,
        nickname: user.nickname,
        userPic: user.userPic,
        bio: user.bio || '这个人很神秘，还没有简介',
        followingCount: 0,
        followersCount: 0,
        postsCount: 0,
        isFollowing: user.isFriend || false  // 使用接口返回的isFriend字段
      }))
    } else {
      console.error('搜索失败:', response.msg)
      searchResults.value = []
    }
  } catch (error) {
    console.error('搜索请求失败:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  showSuggestions.value = true
  hasSearched.value = false
  searchResults.value = []
}

// 使用建议搜索
const searchWithSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  handleSearch()
}

// 切换关注状态
const toggleFollow = (user) => {
  user.isFollowing = !user.isFollowing
  console.log(user.isFollowing ? '关注' : '取消关注', user.nickname)
}

// 跳转到用户主页
const goToUserProfile = (user) => {
  router.push({
    name: 'UserProfile',
    params: { id: user.username }
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 图片错误处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 组件被激活时（从缓存中恢复）
onActivated(() => {
  console.log('SearchUsers component activated')
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('SearchUsers component deactivated')
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.search-container {
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

/* 搜索框 */
.search-section {
  padding: 16px;
  border-bottom: 1px solid #eff3f4;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: #f7f9f9;
  border-radius: 24px;
  padding: 0 16px;
  height: 48px;
}

.search-icon {
  margin-right: 12px;
}

.search-icon .icon {
  width: 20px;
  height: 20px;
  color: #536471;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  color: #0f1419;
}

.search-input::placeholder {
  color: #536471;
}

.clear-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.clear-button .icon {
  width: 16px;
  height: 16px;
  color: #536471;
}

/* 搜索按钮 */
.search-button {
  background: #1DA1F2;
  color: #ffffff;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-end;
  min-width: 100px;
}

.search-button:hover:not(:disabled) {
  background: #1991db;
}

.search-button:active:not(:disabled) {
  background: #1a8cd8;
}

.search-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 搜索建议 */
.suggestions {
  padding: 0 16px 16px;
  border-bottom: 1px solid #eff3f4;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
  margin-bottom: 4px;
}

.suggestion-item:hover {
  background-color: #f7f9f9;
}

.suggestion-icon {
  font-size: 20px;
  margin-right: 12px;
}

/* 加载状态 */
.loading-container {
  padding: 0;
}

/* 搜索结果 */
.results-section {
  padding: 16px 0;
}

.results-header {
  padding: 0 16px 16px;
  border-bottom: 1px solid #eff3f4;
}

.results-count {
  font-size: 14px;
  color: #536471;
}

.results-list {
  display: flex;
  flex-direction: column;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.result-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1DA1F2;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.result-avatar:hover {
  opacity: 0.8;
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
  font-size: 20px;
  font-weight: 500;
}

.result-content {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
  padding: 4px;
}

.result-content:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.user-info {
  margin-bottom: 4px;
}

/* 推荐用户信息区域悬停效果 */
.recommendation-item .user-info {
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
  padding: 4px;
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.recommendation-item .user-info:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.user-name {
  font-weight: 700;
  color: #0f1419;
  font-size: 16px;
  margin-bottom: 2px;
}

.user-username {
  color: #536471;
  font-size: 14px;
}

.user-bio {
  color: #536471;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  color: #536471;
  font-size: 13px;
}

.action-button {
  flex-shrink: 0;
}

.follow-btn {
  background: #1DA1F2;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.follow-btn:hover {
  background: #1991db;
}

.follow-btn.following {
  background: #ffffff;
  color: #0f1419;
  border: 1px solid #d1d9dd;
}

.follow-btn.following:hover {
  background: #f7f9f9;
  border-color: #aab8c2;
}

/* 推荐用户 */
.recommendations-section {
  padding: 16px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f1419;
  padding: 0 16px 16px;
  border-bottom: 1px solid #eff3f4;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
}

.recommendation-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
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
  margin-right: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.user-avatar:hover {
  opacity: 0.8;
}

/* 无结果状态 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-results-text {
  font-size: 18px;
  font-weight: 600;
  color: #0f1419;
  margin-bottom: 8px;
}

.no-results-desc {
  font-size: 14px;
  color: #536471;
}

/* 移动端优化 */
@media (max-width: 600px) {
  .search-container {
    border-left: none;
    border-right: none;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .search-section {
    padding: 12px;
  }
  
  .result-item,
  .recommendation-item {
    padding: 12px;
  }
  
  .result-avatar,
  .user-avatar {
    width: 48px;
    height: 48px;
  }
  
  .follow-btn {
    padding: 6px 12px;
    font-size: 13px;
    min-width: 70px;
  }
}
</style>
