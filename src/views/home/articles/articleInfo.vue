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
        <div class="header-logo">
          <div class="logo-icon">🐦</div>
        </div>
        <h1 class="header-title">推文</h1>
        <div v-if="article" class="header-menu" @click="toggleMenu">
          <svg viewBox="0 0 24 24" class="menu-icon">
            <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
          </svg>
        </div>
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
        <div class="author-avatar" @click="goToUser(article.username)">
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
        <!-- <div v-if="article.categoryName" class="category-tag">
          #{{ article.categoryName }}
        </div> -->
        
        <p class="article-text">{{ article.content }}</p>
        
        <!-- 转发内容 -->
        <div v-if="article.userShare && article.beShareContent" class="retweet-container">
          <div class="retweet-header">
            <svg viewBox="0 0 24 24" class="retweet-icon">
              <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
            </svg>
            <span class="retweet-text">{{ article.nickname }} 转推了</span>
          </div>
          <div class="retweet-content">
            <div class="retweet-author">
              <img 
                v-if="article.beShareUserPic" 
                :src="article.beShareUserPic" 
                class="retweet-avatar" 
                :alt="article.beShareNickName"
                @error="handleImageError"
              />
              <div v-else class="retweet-avatar-placeholder"></div>
              <div class="retweet-author-info">
                <span class="retweet-author-name">{{ article.beShareNickName }}</span>
                <span class="retweet-author-username">@{{ article.beShareCreaterUserName }}</span>
                <span class="retweet-time">· {{ article.beShareUptonowTime }}</span>
              </div>
            </div>
            <div class="retweet-text-content">{{ article.beShareContent }}</div>
            <div v-if="article.beShareCategoryName" class="retweet-category">
              #{{ article.beShareCategoryName }}
            </div>
          </div>
        </div>
        
        <!-- 图片列表 -->
        <div v-if="hasImages(article)" class="article-images">
          <div 
            v-for="(img, index) in getImageList(article)" 
            :key="index"
            class="article-image"
            @click="openImagePreview(article, index)"
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
        <div class="action-button" @click="goToComment">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
          </svg>
        </div>
        <div class="action-button retweet" @click="goToRepeat">
          <svg viewBox="0 0 24 24" class="action-icon">
            <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
          </svg>
        </div>
        <div class="action-button like" :class="{ 'liked': article.islike }" @click="handleLike">
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
    <div v-if="article" class="comments-section">
      <div class="section-header">评论 ({{ comments.length }})</div>
      

      <!-- 评论列表 -->
      <div v-if="comments.length > 0" class="comments-list">
        <div 
          v-for="c in comments" 
          :key="c.id" 
          class="comment-item"
        >
          <div class="comment-avatar">
            <img 
              v-if="c.userPic" 
              :src="c.userPic" 
              class="comment-avatar-img" 
              :alt="c.nickname"
              @error="handleImageError"
            />
            <div v-else class="comment-avatar-placeholder"></div>
          </div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-name">{{ c.nickname }}</span>
              <span class="comment-username">@{{ c.username }}</span>
              <span class="comment-time">· {{ c.uptonowTime || c.createTime }}</span>
            </div>
            <div v-if="c.tonickname || c.tousername" class="comment-replyto">
              回复 {{ c.tonickname ? '@'+c.tonickname : (c.tousername ? '@'+c.tousername : '') }}
            </div>
            <div class="comment-text">{{ c.content }}</div>

            <!-- 评论操作（转推/评论/喜欢）与计数、点赞状态 -->
            <div class="comment-actions">
              <div class="c-action">
                <svg viewBox="0 0 24 24" class="c-icon">
                  <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                </svg>
                <span class="c-count">{{ c.commentcount || 0 }}</span>
              </div>
              <div class="c-action retweet">
                <svg viewBox="0 0 24 24" class="c-icon">
                  <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
                </svg>
                <span class="c-count">{{ c.repeatcount || 0 }}</span>
              </div>
              <div class="c-action like" :class="{ liked: c.islike }">
                <svg viewBox="0 0 24 24" class="c-icon">
                  <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                </svg>
                <span class="c-count">{{ c.likecont || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="comments-placeholder">
        <p>暂无评论</p>
      </div>
    </div>

    <!-- 图片预览组件 -->
    <PreviewImg 
      v-model:visible="previewVisible"
      :images="previewImages"
      :initial-index="previewIndex"
    />

    <!-- 文章菜单 -->
    <div v-if="showMenu" class="menu-overlay" @click="closeMenu">
      <div class="menu-content" @click.stop>
        <div v-if="isCurrentUserArticle" class="menu-item delete" @click="deleteArticle">
          <svg viewBox="0 0 24 24" class="menu-item-icon">
            <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.12 2 8 3.12 8 4.5V6H3v2h1v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h1V6h-5zM10 4.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zM18 18H6V8h12v10z" fill="currentColor"/>
          </svg>
          <span>删除</span>
        </div>
        <div v-else class="menu-item report" @click="reportArticle">
          <svg viewBox="0 0 24 24" class="menu-item-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          <span>举报</span>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticleDetail, getArticleCommentApi, likeArticleApi, deleteArticleApi } from '@/api/article.js'
import { useUserStore } from '@/store/user.js'
import PreviewImg from '@/components/PreviewImg.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const article = ref(null)
const loading = ref(false)
const error = ref(null)
const comments = ref([])

// 图片预览相关
const previewVisible = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

// 菜单相关
const showMenu = ref(false)
const isCurrentUserArticle = ref(false)

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

// 获取评论列表
const fetchComments = async () => {
  try {
    const articleId = route.params.id
    const res = await getArticleCommentApi(articleId)
    console.log('评论列表API返回:', res)
    if (res.code === 0) {
      comments.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (e) {
    console.error('获取评论失败:', e)
  }
}

const goBack = () => {
  router.back()
}

const goToUser = (username) => {
  if (!username) return
  router.push({ name: 'UserProfile', params: { id: username } })
}

// 跳转到评论发布页面
const goToComment = () => {
  if (!article.value) return
  router.push({ 
    name: 'PostCommitArticle', 
    query: { 
      articleId: article.value.id,
      articleContent: article.value.content,
      articleAuthor: article.value.nickname,
      articleAuthorPic: article.value.userPic,
      articleImages: JSON.stringify(getImageList(article.value))
    }
  })
}

// 跳转到引用发布页面
const goToRepeat = () => {
  if (!article.value) return
  router.push({ 
    name: 'PostRepeatArticle', 
    query: { 
      articleId: article.value.id,
      articleContent: article.value.content,
      articleAuthor: article.value.nickname,
      articleAuthorPic: article.value.userPic,
      articleImages: JSON.stringify(getImageList(article.value))
    }
  })
}

// 打开图片预览
const openImagePreview = (article, index) => {
  previewImages.value = getImageList(article)
  previewIndex.value = index
  previewVisible.value = true
}

// 点赞文章
const handleLike = async () => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  if (!article.value) return

  try {
    const res = await likeArticleApi(userStore.userInfo.username, article.value.id)
    if (res && res.code === 0) {
      // 更新本地状态
      article.value.islike = !article.value.islike
      if (article.value.islike) {
        article.value.likecont = (article.value.likecont || 0) + 1
      } else {
        article.value.likecont = Math.max((article.value.likecont || 1) - 1, 0)
      }
    } else {
      console.error('点赞失败:', res?.msg || '未知错误')
    }
  } catch (error) {
    console.error('点赞请求失败:', error)
  }
}

// 菜单相关函数
const toggleMenu = () => {
  if (!article.value) return
  isCurrentUserArticle.value = userStore.userInfo && article.value.username === userStore.userInfo.username
  showMenu.value = true
}

const closeMenu = () => {
  showMenu.value = false
}

const deleteArticle = async () => {
  if (!article.value) return
  
  if (confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
    try {
      const res = await deleteArticleApi(article.value.id)
      if (res && res.code === 0) {
        console.log('文章删除成功')
        // 删除成功后返回上一页
        router.back()
      } else {
        console.error('删除失败:', res?.msg || '未知错误')
        alert('删除失败，请稍后重试')
      }
    } catch (error) {
      console.error('删除文章失败:', error)
      alert('删除失败，请检查网络连接')
    }
    closeMenu()
  }
}

const reportArticle = () => {
  if (!article.value) return
  
  // TODO: 实现举报功能
  console.log('举报文章:', article.value.id)
  alert('举报已提交，我们会尽快处理。')
  closeMenu()
}

onMounted(() => {
  fetchArticle()
  fetchComments()
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

.header-menu {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.header-menu:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.menu-icon {
  width: 20px;
  height: 20px;
  fill: #536471;
  transition: fill 0.2s;
}

.header-menu:hover .menu-icon {
  fill: #1DA1F2;
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

/* 转发内容样式 */
.retweet-container {
  margin-top: 16px;
  border: 1px solid #eff3f4;
  border-radius: 16px;
  overflow: hidden;
  background: #f7f9f9;
}

.retweet-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #eff3f4;
}

.retweet-icon {
  width: 18px;
  height: 18px;
  fill: #536471;
}

.retweet-text {
  font-size: 14px;
  color: #536471;
  font-weight: 500;
}

.retweet-content {
  padding: 16px;
}

.retweet-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.retweet-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.retweet-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1DA1F2;
}

.retweet-author-info {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.retweet-author-name {
  font-weight: 700;
  color: #0f1419;
  font-size: 15px;
}

.retweet-author-username {
  color: #536471;
  font-size: 15px;
}

.retweet-time {
  color: #536471;
  font-size: 15px;
}

.retweet-text-content {
  color: #0f1419;
  font-size: 15px;
  line-height: 1.4;
  margin-bottom: 10px;
}

.retweet-category {
  display: inline-block;
  background: #e6f4ff;
  color: #1DA1F2;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 13px;
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

/* 图片网格 - 微信朋友圈样式 */
  .article-images {
    display: grid;
    gap: 4px;
    margin-top: 12px;
    border-radius: 8px;
    overflow: hidden;
    max-width: 400px;
  }
  
  /* 单张图片 */
  .article-images:has(.article-image:nth-child(1):last-child) {
    grid-template-columns: 1fr;
    max-width: 300px;
  }
  
  .article-images:has(.article-image:nth-child(1):last-child) .article-image {
    max-height: 400px;
    aspect-ratio: auto;
  }
  
  /* 两张图片 */
  .article-images:has(.article-image:nth-child(2):last-child) {
    grid-template-columns: 1fr 1fr;
    max-width: 300px;
  }
  
  .article-images:has(.article-image:nth-child(2):last-child) .article-image {
    aspect-ratio: 1;
  }
  
  /* 三张图片 - 微信朋友圈样式 */
  .article-images:has(.article-image:nth-child(3):last-child) {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    max-width: 300px;
  }
  
  .article-images:has(.article-image:nth-child(3):last-child) .article-image:nth-child(1) {
    grid-row: 1 / 3;
    aspect-ratio: 1;
  }
  
  .article-images:has(.article-image:nth-child(3):last-child) .article-image:nth-child(2),
  .article-images:has(.article-image:nth-child(3):last-child) .article-image:nth-child(3) {
    aspect-ratio: 1;
  }
  
  /* 四张图片 - 2x2网格 */
  .article-images:has(.article-image:nth-child(4):last-child) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    max-width: 300px;
  }
  
  .article-images:has(.article-image:nth-child(4):last-child) .article-image {
    aspect-ratio: 1;
  }
  
  /* 五张及以上图片 - 3列网格 */
  .article-images:has(.article-image:nth-child(5)) {
    grid-template-columns: repeat(3, 1fr);
    max-width: 300px;
  }
  
  .article-images:has(.article-image:nth-child(5)) .article-image {
    aspect-ratio: 1;
  }
  
  .article-image {
    position: relative;
    overflow: hidden;
    background-color: #f7f9f9;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .article-image:hover {
    opacity: 0.9;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 评论列表（推特样式） */
.comments-list { display: flex; flex-direction: column; }
.comment-item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.comment-avatar { 
  flex-shrink: 0; 
  width: 40px; 
  height: 40px; 
  border-radius: 50%; 
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.comment-avatar-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}
.comment-avatar-placeholder { 
  width: 100%; 
  height: 100%; 
  border-radius: 50%; 
  background: #1DA1F2; 
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 500;
}
.comment-body { flex: 1; min-width: 0; }
.comment-header { display: flex; align-items: baseline; gap: 6px; }
.comment-name { font-weight: 700; color: #0f1419; }
.comment-username, .comment-time { color: #536471; font-size: 14px; }
.comment-replyto { color: #536471; font-size: 14px; margin: 2px 0 4px; }
.comment-text { color: #0f1419; white-space: pre-wrap; word-break: break-word; }

/* 评论操作条（与主页动作风格统一） */
.comment-actions { display: flex; justify-content: space-between; max-width: 380px; margin-top: 6px; }
.c-action { display: flex; align-items: center; gap: 4px; padding: 6px; border-radius: 18px; }
.c-icon { width: 18px; height: 18px; fill: #536471; }
.c-count { font-size: 13px; color: #536471; min-width: 20px; }
.c-action.like.liked { background-color: rgba(249, 24, 128, 0.1); }
.c-action.like.liked .c-icon { fill: #f91880; }
.c-action.like.liked .c-count { color: #f91880; }
.c-action.retweet:active { background-color: rgba(0, 186, 124, 0.1); }

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

/* 菜单覆盖层 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-content {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 200px;
  max-width: 300px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f7f9f9;
}

.menu-item.delete:hover {
  background-color: #fef2f2;
}

.menu-item.report:hover {
  background-color: #f0f9ff;
}

.menu-item-icon {
  width: 20px;
  height: 20px;
  fill: #536471;
}

.menu-item.delete .menu-item-icon {
  fill: #ef4444;
}

.menu-item.report .menu-item-icon {
  fill: #1DA1F2;
}

.menu-item span {
  font-size: 16px;
  font-weight: 500;
  color: #0f1419;
}

.menu-item.delete span {
  color: #ef4444;
}

.menu-item.report span {
  color: #1DA1F2;
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
