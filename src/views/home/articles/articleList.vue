<template>
  <div class="twitter-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">

    <!-- 下拉刷新指示器 -->
    <div v-if="isPulling" class="pull-refresh-indicator" :style="{ transform: `translateY(${pullDistance}px)` }">
      <div class="refresh-content">
        <div v-if="!isRefreshing" class="refresh-icon" :style="{ transform: `rotate(${pullDistance * 2}deg)` }">
          <svg viewBox="0 0 24 24" class="refresh-svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
          </svg>
        </div>
        <div v-else class="refresh-spinner">
          <div class="spinner"></div>
        </div>
        <span class="refresh-text">{{ isRefreshing ? '正在刷新...' : pullDistance > 60 ? '释放刷新' : '下拉刷新' }}</span>
      </div>
    </div>

    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading && !isRefreshing" class="loading-container">
      <SkeletonLoader type="article" :count="5" :show-images="true" />
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchArticles" class="retry-button">重试</button>
    </div>

    <!-- 推文列表 -->
    <div v-else-if="articles && articles.length > 0" class="tweets-list">
      <div 
        v-for="article in articles" 
        :key="article.id" 
        class="tweet-item"
        @click="goToArticle(article.id)"
      >
        <div class="tweet-avatar" @click.stop="goToUser(article.username)">
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
            <div class="tweet-menu" @click.stop="toggleMenu(article.id)">
              <svg viewBox="0 0 24 24" class="menu-icon">
                <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          
          <!-- 分类标签 -->
          <!-- <div v-if="article.categoryName" class="category-tag">
            #{{ article.categoryName }}
          </div> -->
          
          <div class="tweet-text">
            {{ article.content }}
          </div>
          
          <!-- 自身图片列表（在内容下面） -->
          <div v-if="hasImages(article)" class="tweet-images">
            <div 
              v-for="(img, index) in getImageList(article)" 
              :key="index"
              class="tweet-image"
              :class="{ 'single-image': getImageList(article).length === 1 }"
              @click.stop="openImagePreview(article, index)"
            >
              <img :src="img" alt="文章图片" @error="handleImageError" />
            </div>
          </div>
          
          <!-- 转发内容（在最下面） -->
          <div v-if="article.userShare && article.beShareContent" class="retweet-container">
            <div class="retweet-header">
              <svg viewBox="0 0 24 24" class="retweet-icon">
                <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
              </svg>
              <span class="retweet-text">{{ article.nickname }} 转推了</span>
            </div>
            <div class="retweet-content" @click="goToRetweetedArticle(article)">
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
                  <span class="retweet-author-username">@{{ truncateId(article.beShareCreaterUserName) }}</span>
                  <span class="retweet-time">· {{ article.beShareUptonowTime }}</span>
                </div>
              </div>
              <div class="retweet-text-content">{{ article.beShareContent }}</div>
              <div v-if="article.beShareCategoryName" class="retweet-category">
                #{{ article.beShareCategoryName }}
              </div>
              
              <!-- 被引用文章的图片 -->
              <div v-if="hasRetweetImages(article)" class="retweet-images">
                <div 
                  v-for="(img, index) in getRetweetImageList(article)" 
                  :key="index"
                  class="retweet-image"
                  :class="{ 'single-image': getRetweetImageList(article).length === 1 }"
                  @click.stop="openRetweetImagePreview(article, index)"
                >
                  <img :src="img" alt="被引用文章图片" @error="handleImageError" />
                </div>
              </div>
            </div>
          </div>
          
          <div class="tweet-actions">
            <div class="action-item comment" @click.stop="handleComment(article)">
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
              </svg>
              <span class="action-count">{{ article.commentcount || 0 }}</span>
            </div>
            <div class="action-item retweet" @click.stop="handleRetweet(article)">
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
              </svg>
              <span class="action-count">{{ article.repeatcount || 0 }}</span>
            </div>
            <div 
              class="action-item like" 
              :class="{ 'liked': article.islike }"
              @click.stop="handleLike(article)"
            >
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
              </svg>
              <span class="action-count">{{ article.likecont || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="!articles || articles.length === 0" class="empty-state">
      <p>暂无内容</p>
    </div>
    
    <!-- 右下发布按钮 -->
    <button class="fab" aria-label="发布" @click.stop="goToPost">
      <svg viewBox="0 0 24 24" class="fab-icon">
        <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </button>

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
// 定义组件名称，用于keep-alive缓存
defineOptions({
  name: 'ArticleList'
})
import { ref, computed, onMounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { useArticleStore } from '@/store/article.js'
import PreviewImg from '@/components/PreviewImg.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const router = useRouter()
const userStore = useUserStore()
const articleStore = useArticleStore()

// 使用 store 中的数据
const articles = computed(() => articleStore.articles)
const loading = computed(() => articleStore.loading)
const error = computed(() => articleStore.error)

// 图片预览相关
const previewVisible = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

// 菜单相关
const showMenu = ref(false)
const currentArticleId = ref(null)
const isCurrentUserArticle = ref(false)

// 下拉刷新相关
const isPulling = ref(false)
const isRefreshing = ref(false)
const pullDistance = ref(0)
const startY = ref(0)
const currentY = ref(0)
const maxPullDistance = 80

// 获取文章列表 - 使用 store 方法
const fetchArticles = async (forceRefresh = false) => {
  return await articleStore.fetchArticles(forceRefresh)
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

// 限制ID显示长度
const truncateId = (id, maxLength = 8) => {
  if (!id) return ''
  const idStr = String(id)
  return idStr.length > maxLength ? idStr.substring(0, maxLength) + '...' : idStr
}

// 获取被引用文章的图片列表
const getRetweetImageList = (article) => {
  const images = []
  
  // 如果有beShareCoverImg单张图片
  if (article.beShareCoverImg && article.beShareCoverImg.trim() !== '') {
    images.push(article.beShareCoverImg)
  }
  
  // 如果有beShareCoverImgList多图（备用）
  if (article.beShareCoverImgList && Array.isArray(article.beShareCoverImgList)) {
    const validImages = article.beShareCoverImgList.filter(img => img && img.trim() !== '')
    images.push(...validImages)
  }
  
  return images
}

// 判断被引用文章是否有图片
const hasRetweetImages = (article) => {
  return (article.beShareCoverImg && article.beShareCoverImg.trim() !== '') ||
         (article.beShareCoverImgList && Array.isArray(article.beShareCoverImgList) && 
          article.beShareCoverImgList.some(img => img && img.trim() !== ''))
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

// 跳转到用户主页
const goToUser = (username) => {
  if (!username) return
  router.push({ name: 'UserProfile', params: { id: username } })
}

// 跳转到发布页
const goToPost = () => {
  router.push({ name: 'PostArticle' })
}

// 处理评论点击
const handleComment = (article) => {
  if (!article) return
  router.push({ 
    name: 'PostCommitArticle', 
    query: { 
      articleId: article.id,
      articleContent: article.content,
      articleAuthor: article.nickname,
      articleAuthorPic: article.userPic,
      articleImages: JSON.stringify(getImageList(article))
    }
  })
}

// 处理引用点击
const handleRetweet = (article) => {
  if (!article) return
  router.push({ 
    name: 'PostRepeatArticle', 
    query: { 
      articleId: article.id,
      articleContent: article.content,
      articleAuthor: article.nickname,
      articleAuthorPic: article.userPic,
      articleImages: JSON.stringify(getImageList(article))
    }
  })
}

// 跳转到被引用的文章详情页
const goToRetweetedArticle = (article) => {
  console.log('主页 - 点击被引用内容')
  console.log('文章数据:', article)
  
  if (!article) {
    console.error('文章数据不存在')
    return
  }
  
  // 检查是否有被引用内容
  if (!article.userShare || !article.beShareContent) {
    console.error('当前文章没有被引用内容')
    return
  }
  
  // 检查多个可能的ID字段
  const retweetedArticleId = article.beShareId || 
                            article.beShareArticleId || 
                            article.originalArticleId ||
                            article.beShareCreaterArticleId
  
  console.log('被引用文章ID:', retweetedArticleId)
  
  if (!retweetedArticleId) {
    console.error('被引用文章ID不存在，可用字段:', Object.keys(article).filter(key => key.includes('Share') || key.includes('Article')))
    console.error('被引用内容相关字段:', {
      userShare: article.userShare,
      beShareContent: article.beShareContent,
      beShareNickName: article.beShareNickName,
      beShareCreaterUserName: article.beShareCreaterUserName
    })
    return
  }
  
  console.log('准备跳转到被引用文章:', retweetedArticleId)
  router.push({ 
    name: 'ArticleInfo', 
    params: { id: retweetedArticleId } 
  })
}

// 打开图片预览
const openImagePreview = (article, index) => {
  previewImages.value = getImageList(article)
  previewIndex.value = index
  previewVisible.value = true
}

// 打开被引用文章图片预览
const openRetweetImagePreview = (article, index) => {
  previewImages.value = getRetweetImageList(article)
  previewIndex.value = index
  previewVisible.value = true
}

// 点赞文章 - 使用 store 方法
const handleLike = async (article) => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  await articleStore.likeArticle(userStore.userInfo.username, article.id)
}

// 菜单相关函数
const toggleMenu = (articleId) => {
  currentArticleId.value = articleId
  const article = articles.value.find(a => a.id === articleId)
  isCurrentUserArticle.value = userStore.userInfo && article && article.username === userStore.userInfo.username
  showMenu.value = true
}

const closeMenu = () => {
  showMenu.value = false
  currentArticleId.value = null
}

const deleteArticle = async () => {
  if (!currentArticleId.value) return
  
  if (confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
    const success = await articleStore.deleteArticle(currentArticleId.value)
    if (!success) {
      alert('删除失败，请稍后重试')
    }
    closeMenu()
  }
}

const reportArticle = () => {
  if (!currentArticleId.value) return
  
  // TODO: 实现举报功能
  console.log('举报文章:', currentArticleId.value)
  alert('举报已提交，我们会尽快处理。')
  closeMenu()
}

// 下拉刷新处理函数
const handleTouchStart = (e) => {
  if (window.scrollY === 0) {
    startY.value = e.touches[0].clientY
    isPulling.value = true
  }
}

const handleTouchMove = (e) => {
  if (!isPulling.value || isRefreshing.value) return
  
  currentY.value = e.touches[0].clientY
  const deltaY = currentY.value - startY.value
  
  if (deltaY > 0) {
    e.preventDefault()
    pullDistance.value = Math.min(deltaY * 0.5, maxPullDistance)
  }
}

const handleTouchEnd = async () => {
  if (!isPulling.value || isRefreshing.value) return
  
  if (pullDistance.value > 60) {
    isRefreshing.value = true
    pullDistance.value = 60
    
    try {
      // 强制刷新数据
      await fetchArticles(true)
    } finally {
      isRefreshing.value = false
      pullDistance.value = 0
      isPulling.value = false
    }
  } else {
    pullDistance.value = 0
    isPulling.value = false
  }
}

onMounted(() => {
  console.log('ArticleList onMounted - hasLoaded:', articleStore.hasLoaded, 'articles count:', articles.value?.length || 0)
  // 如果 store 中没有数据或需要刷新，则获取数据
  if (!articleStore.hasLoaded || articleStore.shouldRefresh()) {
    console.log('ArticleList: 首次加载或需要刷新')
    fetchArticles()
  } else {
    console.log('ArticleList: 使用缓存数据，文章数量:', articles.value?.length || 0)
  }
})

// 组件被激活时（从缓存中恢复）
onActivated(() => {
  console.log('ArticleList onActivated - hasLoaded:', articleStore.hasLoaded, 'articles count:', articles.value?.length || 0)
  // 如果 store 中没有数据或需要刷新，则获取数据
  if (!articleStore.hasLoaded || articleStore.shouldRefresh()) {
    console.log('ArticleList: 重新获取数据')
    fetchArticles()
  } else {
    console.log('ArticleList: 使用缓存数据，文章数量:', articles.value?.length || 0)
  }
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('ArticleList component deactivated')
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
  padding: 0;
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
  padding: 16px 20px;
  gap: 16px;
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
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: nowrap;
  position: relative;
  min-width: 0;
}

.tweet-name {
  font-weight: 700;
  font-size: 17px;
  color: #0f1419;
  flex-shrink: 0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tweet-username {
  font-size: 14px;
  color: #536471;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tweet-time {
  font-size: 14px;
  color: #536471;
  flex-shrink: 0;
}

.category-tag {
  font-size: 14px;
  color: #1DA1F2;
  margin-bottom: 4px;
}

/* 转发内容样式 */
.retweet-container {
  margin-top: 12px;
  border: 1px solid #eff3f4;
  border-radius: 12px;
  overflow: hidden;
  background: #f7f9f9;
}

.retweet-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border-bottom: 1px solid #eff3f4;
}

.retweet-icon {
  width: 16px;
  height: 16px;
  fill: #536471;
}

.retweet-text {
  font-size: 13px;
  color: #536471;
  font-weight: 500;
}

.retweet-content {
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retweet-content:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.retweet-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.retweet-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.retweet-avatar-placeholder {
  width: 32px;
  height: 32px;
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
  font-size: 14px;
}

.retweet-author-username {
  color: #536471;
  font-size: 14px;
}

.retweet-time {
  color: #536471;
  font-size: 14px;
}

.retweet-text-content {
  color: #0f1419;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.retweet-category {
  display: inline-block;
  background: #e6f4ff;
  color: #1DA1F2;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

/* 被引用文章图片样式 */
.retweet-images {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 250px;
}

/* 单张图片 */
.retweet-images:has(.retweet-image:nth-child(1):last-child) {
  grid-template-columns: 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(1):last-child) .retweet-image {
  max-height: 200px;
  aspect-ratio: auto;
}

/* 两张图片 */
.retweet-images:has(.retweet-image:nth-child(2):last-child) {
  grid-template-columns: 1fr 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(2):last-child) .retweet-image {
  aspect-ratio: 1;
}

/* 三张图片 - 微信朋友圈样式 */
.retweet-images:has(.retweet-image:nth-child(3):last-child) {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(3):last-child) .retweet-image:nth-child(1) {
  grid-row: 1 / 3;
  aspect-ratio: 1;
}

.retweet-images:has(.retweet-image:nth-child(3):last-child) .retweet-image:nth-child(2),
.retweet-images:has(.retweet-image:nth-child(3):last-child) .retweet-image:nth-child(3) {
  aspect-ratio: 1;
}

/* 四张图片 - 2x2网格 */
.retweet-images:has(.retweet-image:nth-child(4):last-child) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(4):last-child) .retweet-image {
  aspect-ratio: 1;
}

/* 五张及以上图片 - 3列网格 */
.retweet-images:has(.retweet-image:nth-child(5)) {
  grid-template-columns: repeat(3, 1fr);
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(5)) .retweet-image {
  aspect-ratio: 1;
}

.retweet-image {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.retweet-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.retweet-image:hover img {
  transform: scale(1.05);
}

.tweet-text {
  font-size: 16px;
  line-height: 1.4;
  color: #0f1419;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}

/* 图片网格 - 微信朋友圈样式 */
.tweet-images {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 400px;
}

/* 单张图片 */
.tweet-images:has(.tweet-image:nth-child(1):last-child) {
  grid-template-columns: 1fr;
  max-width: 300px;
}

.tweet-images:has(.tweet-image:nth-child(1):last-child) .tweet-image {
  max-height: 400px;
  aspect-ratio: auto;
}

/* 两张图片 */
.tweet-images:has(.tweet-image:nth-child(2):last-child) {
  grid-template-columns: 1fr 1fr;
  max-width: 300px;
}

.tweet-images:has(.tweet-image:nth-child(2):last-child) .tweet-image {
  aspect-ratio: 1;
}

/* 三张图片 - 微信朋友圈样式 */
.tweet-images:has(.tweet-image:nth-child(3):last-child) {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 300px;
}

.tweet-images:has(.tweet-image:nth-child(3):last-child) .tweet-image:nth-child(1) {
  grid-row: 1 / 3;
  aspect-ratio: 1;
}

.tweet-images:has(.tweet-image:nth-child(3):last-child) .tweet-image:nth-child(2),
.tweet-images:has(.tweet-image:nth-child(3):last-child) .tweet-image:nth-child(3) {
  aspect-ratio: 1;
}

/* 四张图片 - 2x2网格 */
.tweet-images:has(.tweet-image:nth-child(4):last-child) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 300px;
}

.tweet-images:has(.tweet-image:nth-child(4):last-child) .tweet-image {
  aspect-ratio: 1;
}

/* 五张及以上图片 - 3列网格 */
.tweet-images:has(.tweet-image:nth-child(5)) {
  grid-template-columns: repeat(3, 1fr);
  max-width: 300px;
}

.tweet-images:has(.tweet-image:nth-child(5)) .tweet-image {
  aspect-ratio: 1;
}

.tweet-image {
  position: relative;
  overflow: hidden;
  background-color: #f7f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.tweet-image:hover {
  opacity: 0.9;
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

.action-item:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.action-item.comment:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.action-item.retweet:hover {
  background-color: rgba(0, 186, 124, 0.1);
}

.action-item.like:hover {
  background-color: rgba(249, 24, 128, 0.1);
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

.action-item.comment:active {
  background-color: rgba(29, 161, 242, 0.1);
}

.action-item.comment:active .action-icon {
  fill: #1DA1F2;
}

.action-item.comment:active .action-count {
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
  bottom: 100px;
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
    padding: 14px 16px;
    gap: 14px;
  }
  
  .avatar-img,
  .avatar-placeholder {
    width: 44px;
    height: 44px;
  }
  
  .tweet-name {
    font-size: 16px;
  }
  
  .tweet-username,
  .tweet-time {
    font-size: 13px;
  }
  
  .tweet-text {
    font-size: 15px;
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

/* 三个点菜单按钮 */
.tweet-menu {
  margin-left: auto;
  padding: 4px;
  flex-shrink: 0;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tweet-menu:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.menu-icon {
  width: 18px;
  height: 18px;
  fill: #536471;
  transition: fill 0.2s;
}

.tweet-menu:hover .menu-icon {
  fill: #1DA1F2;
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

/* 下拉刷新样式 */
.pull-refresh-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #eff3f4;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.refresh-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #536471;
}

.refresh-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.refresh-svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.refresh-spinner {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #eff3f4;
  border-top: 2px solid #1DA1F2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.refresh-text {
  font-size: 14px;
  font-weight: 500;
}

/* 横屏优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .header-content {
    height: 48px;
  }
  
  .compose-tweet,
  .tweet-item {
    padding: 8px 16px;
  }
}
</style>
