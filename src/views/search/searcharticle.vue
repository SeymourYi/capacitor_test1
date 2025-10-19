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
        <h1 class="header-title">搜索帖子</h1>
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
          placeholder="搜索帖子内容..." 
          v-model="searchQuery"
          @input="handleSearch"
        />
        <button v-if="searchQuery" class="clear-button" @click="clearSearch">
          <svg viewBox="0 0 24 24" class="icon">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 搜索建议 -->
    <div v-if="showSuggestions && searchQuery" class="suggestions">
      <div class="suggestion-item" @click="searchWithSuggestion('热门话题')">
        <div class="suggestion-icon">🔥</div>
        <span>热门话题</span>
      </div>
      <div class="suggestion-item" @click="searchWithSuggestion('科技新闻')">
        <div class="suggestion-icon">💻</div>
        <span>科技新闻</span>
      </div>
      <div class="suggestion-item" @click="searchWithSuggestion('生活分享')">
        <div class="suggestion-icon">🌟</div>
        <span>生活分享</span>
      </div>
    </div>

    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="loading-container">
      <SkeletonLoader type="article" :count="4" :show-images="true" />
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="searchResults.length > 0" class="results-section">
      <div class="results-header">
        <span class="results-count">找到 {{ searchResults.length }} 条结果</span>
        <div class="filter-buttons">
          <button class="filter-btn" :class="{ active: sortBy === 'relevance' }" @click="sortBy = 'relevance'">
            相关度
          </button>
          <button class="filter-btn" :class="{ active: sortBy === 'time' }" @click="sortBy = 'time'">
            时间
          </button>
        </div>
      </div>

      <div class="results-list">
        <div 
          v-for="article in searchResults" 
          :key="article.id" 
          class="result-item"
          @click="goToArticle(article.id)"
        >
          <div class="result-avatar">
            <img 
              v-if="article.userPic" 
              :src="article.userPic" 
              class="avatar-img" 
              :alt="article.nickname"
              @error="handleImageError"
            />
            <div v-else class="avatar-placeholder">
              {{ article.nickname ? article.nickname.charAt(0) : '?' }}
            </div>
          </div>
          <div class="result-content">
            <div class="result-header">
              <div class="user-info">
                <span class="user-name">{{ article.nickname }}</span>
                <span class="user-username">@{{ article.username }}</span>
                <span class="post-time">{{ formatTime(article.createTime) }}</span>
              </div>
            </div>
            <div class="result-text">{{ article.content }}</div>
            <div v-if="article.images && article.images.length > 0" class="result-images">
              <img 
                v-for="(image, index) in article.images.slice(0, 3)" 
                :key="index"
                :src="image" 
                class="result-image"
                @error="handleImageError"
              />
            </div>
            <div class="result-stats">
              <span class="stat-item">❤️ {{ article.likeCount || 0 }}</span>
              <span class="stat-item">💬 {{ article.commentCount || 0 }}</span>
              <span class="stat-item">🔄 {{ article.shareCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!searchQuery" class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">搜索你感兴趣的内容</div>
      <div class="empty-desc">输入关键词开始搜索帖子</div>
    </div>

    <!-- 无结果状态 -->
    <div v-else-if="searchQuery && searchResults.length === 0 && !loading" class="no-results">
      <div class="no-results-icon">😔</div>
      <div class="no-results-text">没有找到相关帖子</div>
      <div class="no-results-desc">试试其他关键词吧</div>
    </div>
  </div>
</template>

<script setup>
// 定义组件名称
defineOptions({
  name: 'SearchArticles'
})

import { ref, computed, watch, onMounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const router = useRouter()

// 搜索相关状态
const searchQuery = ref('')
const showSuggestions = ref(true)
const sortBy = ref('relevance')
const loading = ref(false)

// 模拟搜索结果数据
const searchResults = ref([
  {
    id: 1,
    username: 'tech_guru',
    nickname: '科技达人',
    userPic: '',
    content: '今天体验了最新的AI技术，感觉未来真的来了！人工智能正在改变我们的生活方式。',
    createTime: '2024-01-15T10:30:00Z',
    images: [],
    likeCount: 128,
    commentCount: 45,
    shareCount: 23
  },
  {
    id: 2,
    username: 'life_sharer',
    nickname: '生活分享者',
    userPic: '',
    content: '周末去了一个很棒的咖啡店，环境特别舒适，推荐给大家！',
    createTime: '2024-01-14T15:20:00Z',
    images: ['https://via.placeholder.com/300x200'],
    likeCount: 89,
    commentCount: 12,
    shareCount: 8
  },
  {
    id: 3,
    username: 'news_hunter',
    nickname: '新闻猎手',
    userPic: '',
    content: '重大科技突破！科学家在量子计算领域取得新进展，这可能会改变整个计算行业。',
    createTime: '2024-01-13T09:15:00Z',
    images: [],
    likeCount: 256,
    commentCount: 78,
    shareCount: 156
  }
])

// 搜索处理
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = false
    loading.value = true
    
    try {
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟搜索逻辑
      const query = searchQuery.value.toLowerCase()
      searchResults.value = searchResults.value.filter(result => 
        result.content.toLowerCase().includes(query) ||
        result.nickname.toLowerCase().includes(query) ||
        result.username.toLowerCase().includes(query)
      )
    } finally {
      loading.value = false
    }
  } else {
    showSuggestions.value = true
    searchResults.value = []
  }
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  showSuggestions.value = true
}

// 使用建议搜索
const searchWithSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  handleSearch()
}

// 跳转到文章详情
const goToArticle = (articleId) => {
  router.push({ name: 'ArticleInfo', params: { id: articleId } })
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 图片错误处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

// 数据是否已加载过
const hasLoaded = ref(false)

// 组件被激活时（从缓存中恢复）
onActivated(() => {
  console.log('SearchArticles component activated')
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('SearchArticles component deactivated')
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px;
  border-bottom: 1px solid #eff3f4;
}

.results-count {
  font-size: 14px;
  color: #536471;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  background: #ffffff;
  border-radius: 16px;
  font-size: 14px;
  color: #536471;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #1DA1F2;
  color: #ffffff;
  border-color: #1DA1F2;
}

.results-list {
  display: flex;
  flex-direction: column;
}

.result-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #f7f9f9;
}

.result-avatar {
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

.result-content {
  flex: 1;
  min-width: 0;
}

.result-header {
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-name {
  font-weight: 700;
  color: #0f1419;
  font-size: 15px;
}

.user-username {
  color: #536471;
  font-size: 14px;
}

.post-time {
  color: #536471;
  font-size: 14px;
}

.result-text {
  color: #0f1419;
  font-size: 15px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.result-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.result-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.result-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  color: #536471;
  font-size: 14px;
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
  
  .result-item {
    padding: 12px;
  }
  
  .result-avatar {
    width: 40px;
    height: 40px;
  }
  
  .result-image {
    width: 60px;
    height: 60px;
  }
}
</style>