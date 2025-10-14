<template>
  <div class="twitter-container">

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchArticles" class="retry-button">重试</button>
    </div>

    <!-- 推文列表 -->
    <div v-else class="tweets-list">
      <div 
        v-for="article in articles" 
        :key="article.id" 
        class="tweet-item"
        @click="goToArticle(article.id)"
      >
        <div class="tweet-avatar" @click.stop="goToUser()">
          <img 
            v-if="article.userPic" 
            :src="article.userPic" 
            class="avatar-img" 
            :alt="article.nickname"
            @error="handleImageError"
          />
          <div v-else class="avatar-placeholder"></div>
        </div>
        <div class="tweet-content">
          <div class="tweet-header">
            <span class="tweet-name">{{ article.nickname }}</span>
            <span class="tweet-username">@{{ article.username }}</span>
            <span class="tweet-time">· {{ article.uptonowTime }}</span>
          </div>
          
          <!-- 分类标签 -->
          <div v-if="article.categoryName" class="category-tag">
            #{{ article.categoryName }}
          </div>
          
          <div class="tweet-text">
            {{ article.content }}
          </div>
          
          <!-- 图片列表 -->
          <div v-if="hasImages(article)" class="tweet-images">
            <div 
              v-for="(img, index) in getImageList(article)" 
              :key="index"
              class="tweet-image"
              :class="{ 'single-image': getImageList(article).length === 1 }"
            >
              <img :src="img" alt="文章图片" @error="handleImageError" />
            </div>
          </div>
          
          <div class="tweet-actions">
            <div class="action-item" @click.stop>
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
              </svg>
              <span class="action-count">{{ article.commentcount || 0 }}</span>
            </div>
            <div class="action-item retweet" @click.stop>
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
              </svg>
              <span class="action-count">{{ article.repeatcount || 0 }}</span>
            </div>
            <div 
              class="action-item like" 
              :class="{ 'liked': article.islike }"
              @click.stop
            >
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
              </svg>
              <span class="action-count">{{ article.likecont || 0 }}</span>
            </div>
            <div class="action-item" @click.stop>
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
              </svg>
              <span class="action-count"></span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="articles.length === 0" class="empty-state">
        <p>暂无内容</p>
      </div>
    </div>
    
    <!-- 右下发布按钮 -->
    <button class="fab" aria-label="发布" @click.stop="goToPost">
      <svg viewBox="0 0 24 24" class="fab-icon">
        <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeArticleList } from '../../../api/article.js'

const router = useRouter()

const articles = ref([])
const loading = ref(false)
const error = ref(null)

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getHomeArticleList(1) // 使用userid=1
    console.log('API返回数据:', response)
    
    if (response.code === 0) {
      articles.value = response.data || []
    } else {
      error.value = response.msg || '获取数据失败'
    }
  } catch (err) {
    console.error('获取文章列表失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 判断是否有图片
const hasImages = (article) => {
  if (!article.coverImgList) return false
  return article.coverImgList.some(img => img && img.trim() !== '')
}

// 获取图片列表
const getImageList = (article) => {
  if (!article.coverImgList) return []
  return article.coverImgList.filter(img => img && img.trim() !== '')
}

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 跳转到文章详情
const goToArticle = (id) => {
  router.push({ 
    name: 'ArticleInfo', 
    params: { id } 
  })
}

// 跳转到用户主页（写死ID）
const goToUser = () => {
  router.push({ name: 'UserProfile', params: { id: '1' } })
}

// 跳转到发布页
const goToPost = () => {
  router.push({ name: 'PostArticle' })
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.twitter-container {
  width: 100%;
  max-width: 600px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #ffffff;
  border-left: 1px solid #eff3f4;
  border-right: 1px solid #eff3f4;
}

/* 头部 */
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
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #0f1419;
}

/* 发推文框 */
.compose-tweet {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #eff3f4;
  gap: 12px;
}

.compose-avatar,
.tweet-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #1DA1F2;
}

.compose-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.compose-input {
  width: 100%;
  min-height: 60px;
  border: none;
  outline: none;
  font-size: 17px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  resize: none;
  color: #0f1419;
}

.compose-input::placeholder {
  color: #536471;
}

.compose-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.compose-icons {
  display: flex;
  gap: 4px;
}

.icon {
  width: 20px;
  height: 20px;
  fill: #1DA1F2;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.icon:active {
  background-color: rgba(29, 161, 242, 0.1);
}

.tweet-button {
  background-color: #1DA1F2;
  color: white;
  border: none;
  border-radius: 18px;
  padding: 8px 16px;
  min-width: 70px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tweet-button:active {
  background-color: #1a8cd8;
}

/* 分隔线 */
.divider {
  height: 12px;
  background-color: #f7f9f9;
  border-top: 1px solid #eff3f4;
  border-bottom: 1px solid #eff3f4;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: #536471;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #eff3f4;
  border-top-color: #1DA1F2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: #f91880;
}

.retry-button {
  margin-top: 16px;
  background-color: #1DA1F2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

/* 推文列表 */
.tweets-list {
  display: flex;
  flex-direction: column;
}

.tweet-item {
  display: flex;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid #eff3f4;
  cursor: pointer;
  transition: background-color 0.2s;
  -webkit-user-select: none;
  user-select: none;
}

.tweet-item:active {
  background-color: #f7f9f9;
}

.tweet-content {
  flex: 1;
  min-width: 0;
}

.tweet-header {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.tweet-name {
  font-weight: 700;
  font-size: 15px;
  color: #0f1419;
}

.tweet-username,
.tweet-time {
  font-size: 15px;
  color: #536471;
}

.category-tag {
  font-size: 14px;
  color: #1DA1F2;
  margin-bottom: 4px;
}

.tweet-text {
  font-size: 15px;
  line-height: 1.5;
  color: #0f1419;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}

/* 图片网格 */
.tweet-images {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
  border-radius: 16px;
  overflow: hidden;
}

.tweet-images:has(.tweet-image:nth-child(1):last-child) {
  grid-template-columns: 1fr;
}

.tweet-images:has(.tweet-image:nth-child(2)) {
  grid-template-columns: 1fr 1fr;
}

.tweet-images:has(.tweet-image:nth-child(3)) {
  grid-template-columns: 1fr 1fr;
}

.tweet-images:has(.tweet-image:nth-child(4)) {
  grid-template-columns: 1fr 1fr;
}

.tweet-image {
  position: relative;
  overflow: hidden;
  background-color: #f7f9f9;
}

.tweet-image.single-image {
  max-height: 400px;
}

.tweet-image:not(.single-image) {
  aspect-ratio: 1;
}

.tweet-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tweet-actions {
  display: flex;
  justify-content: space-between;
  max-width: 425px;
  margin-top: 8px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
  margin: -8px;
  padding: 8px;
  border-radius: 18px;
  transition: background-color 0.2s;
}

.action-icon {
  width: 18px;
  height: 18px;
  fill: #536471;
  transition: fill 0.2s;
}

.action-count {
  font-size: 13px;
  color: #536471;
  min-width: 20px;
  transition: color 0.2s;
}

.action-item:active {
  background-color: rgba(29, 161, 242, 0.1);
}

.action-item:active .action-icon {
  fill: #1DA1F2;
}

.action-item:active .action-count {
  color: #1DA1F2;
}

.action-item.retweet:active {
  background-color: rgba(0, 186, 124, 0.1);
}

.action-item.retweet:active .action-icon {
  fill: #00ba7c;
}

.action-item.retweet:active .action-count {
  color: #00ba7c;
}

.action-item.like:active,
.action-item.liked {
  background-color: rgba(249, 24, 128, 0.1);
}

.action-item.like:active .action-icon,
.action-item.liked .action-icon {
  fill: #f91880;
}

.action-item.like:active .action-count,
.action-item.liked .action-count {
  color: #f91880;
}

/* 空状态 */
.empty-state {
  padding: 40px 16px;
  text-align: center;
  color: #536471;
}

/* 悬浮发布按钮 */
.fab {
  position: fixed;
  right: 16px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  color: #ffffff;
  background-color: #1DA1F2;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.fab:active {
  background-color: #1a8cd8;
}

.fab-icon {
  width: 24px;
  height: 24px;
}

/* 移动端优化 */
@media (max-width: 600px) {
  .twitter-container {
    border-left: none;
    border-right: none;
  }
}

/* 小屏手机优化 */
@media (max-width: 375px) {
  .header-content {
    padding: 0 12px;
  }
  
  .compose-tweet,
  .tweet-item {
    padding: 12px;
  }
  
  .avatar-img,
  .avatar-placeholder {
    width: 40px;
    height: 40px;
  }
  
  .tweet-name,
  .tweet-username,
  .tweet-time,
  .tweet-text {
    font-size: 14px;
  }
  
  .action-item {
    gap: 2px;
  }
  
  .action-count {
    font-size: 12px;
  }
}

/* 大屏手机优化 */
@media (min-width: 768px) {
  .header-content {
    height: 60px;
  }
  
  .header-title {
    font-size: 22px;
  }
}

/* 横屏优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .header-content {
    height: 48px;
  }
  
  .compose-tweet {
    padding: 8px 16px;
  }
  
  .tweet-item {
    padding: 8px 16px;
  }
}
</style>
