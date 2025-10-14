<template>
  <div class="twitter-container">
    <!-- 头部导航栏 -->
    <div class="header">
      <div class="header-content">
        <div class="back-button" @click="goBack">
          <svg viewBox="0 0 24 24" class="back-icon">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
          </svg>
        </div>
        <h1 class="header-title">推文</h1>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchArticle" class="retry-button">重试</button>
    </div>

    <!-- 文章详情 -->
    <div v-else-if="article" class="article-detail">
      <!-- 作者信息 -->
      <div class="author-section">
        <div class="author-avatar">
          <img 
            v-if="article.userPic" 
            :src="article.userPic" 
            class="avatar" 
            :alt="article.nickname"
            @error="handleImageError"
          />
          <div v-else class="avatar-placeholder"></div>
        </div>
        <div class="author-info">
          <div class="author-name">{{ article.nickname }}</div>
          <div class="author-username">@{{ article.username }}</div>
        </div>
        <button class="follow-button">关注</button>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <!-- 分类标签 -->
        <div v-if="article.categoryName" class="category-tag">
          #{{ article.categoryName }}
        </div>
        
        <p class="article-text">{{ article.content }}</p>
        
        <!-- 图片列表 -->
        <div v-if="hasImages(article)" class="article-images">
          <div 
            v-for="(img, index) in getImageList(article)" 
            :key="index"
            class="article-image"
          >
            <img :src="img" alt="文章图片" @error="handleImageError" />
          </div>
        </div>
      </div>

      <!-- 发布时间 -->
      <div class="article-time">
        {{ article.createTime }} · {{ article.uptonowTime }}
      </div>

      <!-- 数据统计 -->
      <div class="article-stats">
        <div class="stat-item">
          <span class="stat-number">{{ article.repeatcount || 0 }}</span>
          <span class="stat-label">转推</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ article.commentcount || 0 }}</span>
          <span class="stat-label">评论</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ article.likecont || 0 }}</span>
          <span class="stat-label">喜欢</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="article-actions">
        <div class="action-button">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
          </svg>
        </div>
        <div class="action-button retweet">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
          </svg>
        </div>
        <div class="action-button like" :class="{ 'liked': article.islike }">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
          </svg>
        </div>
        <div class="action-button">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- 评论区 -->
    <div v-if="article && article.iscomment" class="comments-section">
      <div class="section-header">评论 ({{ article.commentcount || 0 }})</div>
      
      <!-- 评论输入框 -->
      <div class="comment-compose">
        <div class="comment-avatar">
          <div class="avatar-placeholder"></div>
        </div>
        <div class="comment-input-wrapper">
          <textarea placeholder="发布你的回复" class="comment-input"></textarea>
          <button class="reply-button">回复</button>
        </div>
      </div>

      <!-- 评论列表占位 -->
      <div class="comments-placeholder">
        <p>暂无评论</p>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticleDetail } from '../../../api/article.js'

const router = useRouter()
const route = useRoute()

const article = ref(null)
const loading = ref(false)
const error = ref(null)

// 判断是否有图片
const hasImages = (article) => {
  // 检查coverImg单图
  if (article.coverImg && article.coverImg.trim() !== '') {
    return true
  }
  // 检查coverImgList多图
  if (article.coverImgList && Array.isArray(article.coverImgList)) {
    return article.coverImgList.some(img => img && img.trim() !== '')
  }
  return false
}

// 获取图片列表
const getImageList = (article) => {
  const images = []
  
  // 如果有coverImg单图，优先使用
  if (article.coverImg && article.coverImg.trim() !== '') {
    images.push(article.coverImg)
  }
  
  // 如果有coverImgList多图，添加到列表
  if (article.coverImgList && Array.isArray(article.coverImgList)) {
    const validImages = article.coverImgList.filter(img => img && img.trim() !== '')
    images.push(...validImages)
  }
  
  return images
}

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 获取文章详情
const fetchArticle = async () => {
  loading.value = true
  error.value = null
  
  try {
    const articleId = route.params.id
    console.log('获取文章详情，ID:', articleId)
    
    const response = await getArticleDetail(articleId)
    console.log('文章详情API返回:', response)
    
    if (response.code === 0) {
      article.value = response.data
      console.log('文章数据:', article.value)
    } else {
      error.value = response.msg || '获取数据失败'
    }
  } catch (err) {
    console.error('获取文章详情失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchArticle()
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
  gap: 32px;
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
  margin-left: -8px;
}

.back-button:active {
  background-color: rgba(15, 20, 25, 0.1);
}

.back-icon {
  width: 20px;
  height: 20px;
  fill: #0f1419;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #0f1419;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
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

.error-container {
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

/* 文章详情 */
.article-detail {
  border-bottom: 1px solid #eff3f4;
}

.author-section {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.author-avatar {
  flex-shrink: 0;
}

.avatar {
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

.author-info {
  flex: 1;
  min-width: 0;
}

.author-name {
  font-size: 17px;
  font-weight: 700;
  color: #0f1419;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-username {
  font-size: 15px;
  color: #536471;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-button {
  background-color: #0f1419;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  min-width: 70px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.follow-button:active {
  background-color: #272c30;
}

.article-content {
  padding: 12px 16px;
}

.category-tag {
  font-size: 15px;
  color: #1DA1F2;
  margin-bottom: 8px;
  font-weight: 500;
}

.article-text {
  font-size: 19px;
  line-height: 1.5;
  color: #0f1419;
  margin: 0 0 12px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}

.article-images {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
}

.article-images:has(.article-image:nth-child(1):last-child) {
  grid-template-columns: 1fr;
}

.article-images:has(.article-image:nth-child(2)) {
  grid-template-columns: 1fr 1fr;
}

.article-image {
  position: relative;
  overflow: hidden;
  background-color: #f7f9f9;
}

.article-images:has(.article-image:nth-child(1):last-child) .article-image {
  max-height: 500px;
}

.article-images:has(.article-image:nth-child(n+2)) .article-image {
  aspect-ratio: 1;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.article-time {
  padding: 12px 16px;
  font-size: 15px;
  color: #536471;
  border-bottom: 1px solid #eff3f4;
}

.article-stats {
  display: flex;
  padding: 12px 16px;
  gap: 20px;
  border-bottom: 1px solid #eff3f4;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  gap: 4px;
  cursor: pointer;
  align-items: baseline;
}

.stat-item:active .stat-number {
  text-decoration: underline;
}

.stat-number {
  font-size: 15px;
  font-weight: 700;
  color: #0f1419;
}

.stat-label {
  font-size: 15px;
  color: #536471;
}

.article-actions {
  display: flex;
  justify-content: space-around;
  padding: 8px 16px;
  border-bottom: 1px solid #eff3f4;
}

.action-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-icon {
  width: 20px;
  height: 20px;
  fill: #536471;
  transition: fill 0.2s;
}

.action-button:active {
  background-color: rgba(29, 161, 242, 0.1);
}

.action-button:active .action-icon {
  fill: #1DA1F2;
}

.action-button.retweet:active {
  background-color: rgba(0, 186, 124, 0.1);
}

.action-button.retweet:active .action-icon {
  fill: #00ba7c;
}

.action-button.like:active,
.action-button.liked {
  background-color: rgba(249, 24, 128, 0.1);
}

.action-button.like:active .action-icon,
.action-button.liked .action-icon {
  fill: #f91880;
}

/* 评论区 */
.comments-section {
  padding-bottom: 20px;
}

.section-header {
  padding: 12px 16px;
  font-size: 17px;
  font-weight: 700;
  color: #0f1419;
  border-bottom: 1px solid #eff3f4;
}

.comment-compose {
  display: flex;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid #eff3f4;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.comment-input {
  width: 100%;
  min-height: 48px;
  border: none;
  outline: none;
  font-size: 17px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  resize: none;
  color: #0f1419;
}

.comment-input::placeholder {
  color: #536471;
}

.reply-button {
  align-self: flex-end;
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

.reply-button:active {
  background-color: #1a8cd8;
}

.comments-placeholder {
  padding: 40px 16px;
  text-align: center;
  color: #536471;
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
    gap: 24px;
  }
  
  .author-section,
  .article-content,
  .comment-compose {
    padding: 12px;
  }
  
  .article-time,
  .section-header {
    padding: 12px;
  }
  
  .avatar,
  .avatar-placeholder {
    width: 40px;
    height: 40px;
  }
  
  .author-name {
    font-size: 16px;
  }
  
  .author-username,
  .article-time,
  .stat-number,
  .stat-label {
    font-size: 14px;
  }
  
  .article-text {
    font-size: 17px;
  }
  
  .article-stats {
    gap: 16px;
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
  
  .article-text {
    font-size: 21px;
  }
}

/* 横屏优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .header-content {
    height: 48px;
  }
  
  .author-section,
  .article-content,
  .comment-compose {
    padding: 8px 16px;
  }
}
</style>
