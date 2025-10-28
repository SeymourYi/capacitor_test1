<template>
  <div class="profile">
    <!-- 顶部栏置于最上方，避免下滑出现封面占位空白 -->
    <div class="topbar">
      <button class="back" @click="goBack">
        <svg viewBox="0 0 24 24" class="icon"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="header-logo">
        <div class="logo-icon">🐦</div>
      </div>
      <div class="top-title">{{ displayName }}</div>
      <div class="spacer"></div>
    </div>
    <!-- 顶部封面 -->
    <div 
      class="cover" 
      :style="{ backgroundImage: userInfo && userInfo.bgImg ? 'url(' + userInfo.bgImg + ')' : '' }"
      @click="openCoverPreview"
    ></div>
  
    <!-- 头像与编辑/关注按钮 -->
    <div class="header">
      <div class="avatar" @click="openAvatarPreview">
        <img 
          v-if="userInfo && userInfo.userPic" 
          :src="userInfo.userPic" 
          class="avatar-img" 
          :alt="userInfo.nickname"
          @error="handleImageError"
        />
        <div v-else class="avatar-placeholder"></div>
      </div>
      <button 
        class="follow" 
        :class="{ 'followed': isFriend }"
        :disabled="friendStatusLoading || followLoading"
        @click="handleFollowAction"
      >
        <div v-if="friendStatusLoading || followLoading" class="follow-loading">
          <svg viewBox="0 0 24 24" class="loading-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
        </div>
        <span v-else>{{ isFriend ? '已关注' : '关注' }}</span>
      </button>
    </div>
  
    <!-- 用户信息 -->
    <div class="info">
      <div class="name">{{ userInfo ? userInfo.nickname : '加载中...' }}</div>
      <div class="username">@{{ userInfo ? userInfo.username : 'loading' }}</div>
      
      <div class="bio">{{ userInfo ? (userInfo.bio || '这个人很神秘，还没有简介') : '加载中...' }}</div>
      <div class="meta">
        <div v-if="userInfo && userInfo.location" class="meta-item">
          <svg viewBox="0 0 24 24" class="meta-icon">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
          </svg>
          {{ userInfo.location }}
        </div>
        <div v-if="userInfo && userInfo.birthday" class="meta-item">
          <svg viewBox="0 0 24 24" class="meta-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
          </svg>
          出生{{ userInfo.birthday }}
        </div>
        <div v-if="userInfo && userInfo.createTime" class="meta-item">
          <svg viewBox="0 0 24 24" class="meta-icon">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
          </svg>
          {{ userInfo.createTime }}
        </div>
      </div>
    </div>
  
    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="loading">
      <SkeletonLoader type="user" :count="1" />
    </div>
  
    <!-- 错误状态 -->
    <div v-if="error && !loading" class="error">
      <div class="error-text">{{ error }}</div>
      <button class="retry-btn" @click="fetchUserInfo">重试</button>
    </div>
  
    <!-- Tabs：推文 / 喜欢 -->
    <div class="tabs">
      <div class="tab" :class="{ active: currentTab === 'tweets' }" @click="currentTab = 'tweets'">推文</div>
      <div class="tab" :class="{ active: currentTab === 'likes' }" @click="currentTab = 'likes'">喜欢</div>
    </div>
  
    <!-- 推文列表 -->
    <div v-if="currentTab === 'tweets'" class="tweets">
      <!-- 加载状态 - 骨架屏 -->
      <div v-if="articlesLoading" class="loading">
        <SkeletonLoader type="article" :count="3" :show-images="false" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="articlesError" class="error">
        <div class="error-text">{{ articlesError }}</div>
        <button class="retry-btn" @click="fetchUserArticles">重试</button>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="userArticles.length === 0" class="empty">
        <div class="empty-text">还没有发布任何推文</div>
      </div>
      
      <!-- 推文列表 -->
      <div v-else>
        <div 
          v-for="article in userArticles" 
          :key="article.id" 
          class="tweet-card"
          @click="goToArticle(article.id)"
        >
          <div class="tweet-avatar">
            <img 
              v-if="userInfo && userInfo.userPic" 
              :src="userInfo.userPic" 
              class="tweet-avatar-img" 
              :alt="userInfo.nickname"
              @error="handleImageError"
            />
            <div v-else class="tweet-avatar-placeholder"></div>
          </div>
          <div class="tweet-content">
            <div class="tweet-header">
              <span class="tweet-name">{{ userInfo ? userInfo.nickname : '加载中...' }}</span>
              <span class="tweet-username">@{{ userInfo ? userInfo.username : 'loading' }}</span>
              <span class="tweet-time">· {{ article.uptonowTime || '刚刚' }}</span>
            </div>
            
            <!-- 分类标签 -->
            <!-- <div v-if="article.categoryName" class="category-tag">
              #{{ article.categoryName }}
            </div> -->
            
            <div class="tweet-text">{{ article.content }}</div>
            
            <!-- 自身图片列表（在内容下面） -->
            <div v-if="hasImages(article)" class="tweet-images">
              <div 
                v-for="(img, index) in getImageList(article)" 
                :key="index"
                class="tweet-image"
                :class="{ 'single-image': getImageList(article).length === 1 }"
                @click.stop="openImagePreview(article, index)"
              >
                <img :src="img" :alt="`图片${index + 1}`" @error="handleImageError" />
              </div>
            </div>
            
            <!-- 转发内容（在最下面） -->
            <div v-if="article.userShare && article.beShareContent" class="retweet-content">
              <div class="retweet-header">
                <span class="retweet-name">{{ article.beShareNickName }}</span>
                <span class="retweet-username">@{{ truncateId(article.beShareCreaterUserName) }}</span>
                <span class="retweet-time">· {{ article.beShareUptonowTime }}</span>
              </div>
              <div class="retweet-text">{{ article.beShareContent }}</div>
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
            
            <!-- 互动数据 -->
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
    </div>

    <!-- 喜欢列表占位（显示他点赞过的推文样式） -->
    <div v-else-if="currentTab === 'likes'" class="tweets">
      <div class="tweet-card" v-for="i in 5" :key="'l'+i">
        <div class="tweet-avatar liked"></div>
        <div class="tweet-content">
          <div class="tweet-header">
            <span class="tweet-name">某用户</span>
            <span class="tweet-username">@someone</span>
            <span class="tweet-time">· 1天</span>
          </div>
          <div class="tweet-text">这是 {{ displayName }} 点赞过的内容占位 {{ i }}</div>
        </div>
      </div>
    </div>

    <!-- 图片预览组件 -->
    <PreviewImg 
      v-model:visible="previewVisible"
      :images="previewImages"
      :initial-index="previewIndex"
    />

    <!-- 确认弹窗 -->
    <div v-if="showConfirmDialog" class="confirm-overlay" @click="cancelConfirm">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-header">
          <h3>确认操作</h3>
        </div>
        <div class="confirm-content">
          <p>{{ confirmMessage }}</p>
        </div>
        <div class="confirm-actions">
          <button class="confirm-btn cancel" @click="cancelConfirm">取消</button>
          <button class="confirm-btn confirm" @click="confirmUnfollow" :disabled="followLoading">
            <span v-if="followLoading">处理中...</span>
            <span v-else>确定</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, onActivated, onDeactivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserInfoApi, isFriendApi, followOrUnfollowUserApi } from '@/api/user.js'
import { getUserArticleList, likeArticleApi } from '@/api/article.js'
import { useUserStore } from '@/store/user.js'
import PreviewImg from '@/components/PreviewImg.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userId = computed(() => route.params.id)
const displayName = computed(() => userInfo.value ? userInfo.value.nickname : `用户${userId.value}`)
const username = computed(() => userInfo.value ? userInfo.value.username : `user_${userId.value}`)

const userInfo = ref(null)
const loading = ref(false)
const error = ref('')

// 朋友状态相关
const isFriend = ref(false)
const friendStatusLoading = ref(false)

// 关注操作相关
const followLoading = ref(false)
const showConfirmDialog = ref(false)
const confirmMessage = ref('')

// 文章相关状态
const userArticles = ref([])
const articlesLoading = ref(false)
const articlesError = ref('')

// 图片预览相关
const previewVisible = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

const goBack = () => router.back()

const currentTab = ref('tweets')

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 打开背景图预览
const openCoverPreview = () => {
  if (userInfo.value && userInfo.value.bgImg) {
    previewImages.value = [userInfo.value.bgImg]
    previewIndex.value = 0
    previewVisible.value = true
  }
}

// 打开头像预览
const openAvatarPreview = () => {
  if (userInfo.value && userInfo.value.userPic) {
    previewImages.value = [userInfo.value.userPic]
    previewIndex.value = 0
    previewVisible.value = true
  }
}

// 检测朋友关系
const checkFriendStatus = async () => {
  if (!userId.value || !userStore.userInfo || !userStore.userInfo.username) return

  friendStatusLoading.value = true

  try {
    const res = await isFriendApi(userStore.userInfo.username, userId.value)
    if (res && res.code === 0) {
      // data为"0"表示不是朋友，"1"表示是朋友
      isFriend.value = res.data === "1"
    } else {
      console.error('检测朋友关系失败:', res?.msg || '未知错误')
      isFriend.value = false
    }
  } catch (e) {
    console.error('检测朋友关系失败:', e)
    isFriend.value = false
  } finally {
    friendStatusLoading.value = false
  }
}

// 处理关注/取消关注
const handleFollowAction = () => {
  // 检查用户是否已登录
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录，无法进行关注操作')
    return
  }

  // 如果已关注，显示确认弹窗
  if (isFriend.value) {
    confirmMessage.value = `确定要取消关注 ${userInfo.value?.nickname || '该用户'} 吗？`
    showConfirmDialog.value = true
  } else {
    // 直接关注
    performFollowAction()
  }
}

// 执行关注/取消关注操作
const performFollowAction = async () => {
  if (!userStore.userInfo || !userStore.userInfo.username) return

  followLoading.value = true

  try {
    const res = await followOrUnfollowUserApi(userStore.userInfo.username, userId.value)
    if (res && res.code === 0) {
      // 操作成功，更新朋友状态
      isFriend.value = !isFriend.value
      console.log('关注操作成功:', isFriend.value ? '已关注' : '已取消关注')
    } else {
      console.error('关注操作失败:', res?.msg || '未知错误')
    }
  } catch (e) {
    console.error('关注操作失败:', e)
  } finally {
    followLoading.value = false
    showConfirmDialog.value = false
  }
}

// 确认取消关注
const confirmUnfollow = () => {
  performFollowAction()
}

// 取消确认弹窗
const cancelConfirm = () => {
  showConfirmDialog.value = false
}

// 获取用户信息
const fetchUserInfo = async () => {
  if (!userId.value) return

  loading.value = true
  error.value = ''

  try {
    const res = await getUserInfoApi(userId.value)
    if (res && res.code === 0) {
      userInfo.value = res.data
      // 获取用户信息成功后检测朋友关系
      await checkFriendStatus()
    } else {
      error.value = (res && res.msg) || '获取用户信息失败'
    }
  } catch (e) {
    console.error('获取用户信息失败:', e)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 获取用户文章列表
const fetchUserArticles = async () => {
  if (!userId.value) return

  articlesLoading.value = true
  articlesError.value = ''

  try {
    const res = await getUserArticleList(userId.value)
    if (res && res.code === 0) {
      userArticles.value = res.data || []
    } else {
      articlesError.value = (res && res.msg) || '获取文章列表失败'
    }
  } catch (e) {
    console.error('获取文章列表失败:', e)
    articlesError.value = '网络错误，请稍后重试'
  } finally {
    articlesLoading.value = false
  }
}

// 跳转到文章详情
const goToArticle = (articleId) => {
  router.push({
    name: 'ArticleInfo',
    params: { id: articleId }
  })
}

// 点赞功能
const handleLike = async (article) => {
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  try {
    const res = await likeArticleApi(userStore.userInfo.username, article.id)
    if (res && res.code === 0) {
      const articleIndex = userArticles.value.findIndex(a => a.id === article.id)
      if (articleIndex !== -1) {
        userArticles.value[articleIndex].islike = !userArticles.value[articleIndex].islike
        if (userArticles.value[articleIndex].islike) {
          userArticles.value[articleIndex].likecont = (userArticles.value[articleIndex].likecont || 0) + 1
        } else {
          userArticles.value[articleIndex].likecont = Math.max((userArticles.value[articleIndex].likecont || 1) - 1, 0)
        }
      }
    } else {
      console.error('点赞失败:', res?.msg || '未知错误')
    }
  } catch (error) {
    console.error('点赞请求失败:', error)
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

// 截断ID显示
const truncateId = (id, maxLength = 8) => {
  if (!id) return ''
  const idStr = String(id)
  return idStr.length > maxLength ? idStr.substring(0, maxLength) + '...' : idStr
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

// 监听标签切换
watch(currentTab, (newTab) => {
  if (newTab === 'tweets' && userArticles.value.length === 0) {
    fetchUserArticles()
  }
})

// 监听路由参数变化，当用户ID改变时重新获取数据
watch(userId, (newUserId, oldUserId) => {
  if (newUserId && newUserId !== oldUserId) {
    console.log('用户ID变化，重新获取数据:', newUserId)
    // 清空旧数据
    userInfo.value = null
    userArticles.value = []
    isFriend.value = false
    followLoading.value = false
    showConfirmDialog.value = false
    // 重新获取数据
    fetchUserInfo()
    fetchUserArticles()
  }
}, { immediate: false })

// 定义组件名称
defineOptions({
  name: 'UserProfile'
})

// 数据是否已加载过
const hasLoaded = ref(false)

onMounted(() => {
  if (!hasLoaded.value) {
    fetchUserInfo()
    // 默认加载推文
    fetchUserArticles()
    hasLoaded.value = true
  }
})

// 组件被激活时（从缓存中恢复）
onActivated(() => {
  console.log('UserProfile component activated, userId:', userId.value)
  // 每次激活时都重新获取数据，确保数据是最新的
  fetchUserInfo()
  fetchUserArticles()
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  console.log('UserProfile component deactivated')
  // 清空数据，防止下次激活时显示旧数据
  userInfo.value = null
  userArticles.value = []
  isFriend.value = false
  followLoading.value = false
  showConfirmDialog.value = false
})
</script>

<style scoped>
* { box-sizing: border-box; }
.profile { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; min-height: 100vh; border-left: 1px solid #eff3f4; border-right: 1px solid #eff3f4; }
.cover { 
  height: 140px; 
  background: #e6ecf0; 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: opacity 0.2s;
}

.cover:hover {
  opacity: 0.9;
}
.topbar { position: sticky; top: 0; height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #eff3f4; z-index: 100; }
.back { background: transparent; border: none; color: #0f1419; }
.icon { width: 22px; height: 22px; }

.header-logo {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.logo-icon {
  font-size: 20px;
}

.top-title { font-size: 18px; font-weight: 700; color: #0f1419; flex: 1; }
.spacer { width: 22px; height: 22px; }

.header { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 16px; margin-top: -28px; }
.avatar { 
  width: 80px; 
  height: 80px; 
  border-radius: 50%; 
  border: 4px solid #ffffff; 
  background: #1DA1F2; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: opacity 0.2s;
}

.avatar:hover {
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
}
.follow { 
  height: 34px; 
  padding: 0 14px; 
  border-radius: 18px; 
  border: 1px solid #1DA1F2; 
  color: #1DA1F2; 
  background: #fff; 
  font-weight: 700; 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  cursor: pointer;
}

.follow:hover {
  background: #1DA1F2;
  color: #fff;
}

.follow:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.follow.followed {
  background: #1DA1F2;
  color: #fff;
}

.follow.followed:hover {
  background: #0d8bd9;
}

.follow-loading {
  display: flex;
  align-items: center;
}

.loading-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  animation: spin 1s linear infinite;
}

.info { padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.name { font-size: 20px; font-weight: 800; color: #0f1419; }
.username { font-size: 15px; color: #536471; }
.bio { margin-top: 8px; font-size: 15px; color: #0f1419; }
.meta { 
  margin-top: 8px; 
  display: flex; 
  flex-direction: column;
  gap: 6px; 
  color: #536471; 
  font-size: 14px; 
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}


.tabs { display: flex; }
.tab { flex: 1; text-align: center; height: 46px; line-height: 46px; color: #536471; border-bottom: 2px solid transparent; }
.tab.active { color: #0f1419; border-bottom-color: #1DA1F2; font-weight: 700; }

.tweets { display: flex; flex-direction: column; }
.tweet-card { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.tweet-avatar { 
  width: 48px; 
  height: 48px; 
  border-radius: 50%; 
  background: #1DA1F2; 
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}
.tweet-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tweet-avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #1DA1F2;
}
.tweet-avatar.liked { background: #f91880; }
.tweet-content { flex: 1; min-width: 0; }
.tweet-header { 
  display: flex; 
  align-items: baseline; 
  gap: 6px; 
  flex-wrap: nowrap;
  position: relative;
  min-width: 0;
}
.tweet-name { 
  font-weight: 700; 
  color: #0f1419; 
  flex-shrink: 0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tweet-username { 
  color: #536471; 
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tweet-time { 
  color: #536471; 
  flex-shrink: 0;
}
.tweet-text { margin-top: 6px; color: #0f1419; white-space: pre-wrap; word-break: break-word; }

/* 文章列表样式 */
.tweet-card {
  cursor: pointer;
  transition: background-color 0.2s;
}

.tweet-card:hover {
  background-color: #f7f9fa;
}

.category-tag {
  display: inline-block;
  margin: 8px 0 4px 0;
  padding: 2px 8px;
  background: #f0f8ff;
  color: #1DA1F2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* 转发内容样式 */
.retweet-content {
  margin-top: 12px;
  padding: 12px;
  background: #f7f9fa;
  border-radius: 8px;
  border-left: 3px solid #1DA1F2;
}

.retweet-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.retweet-name {
  font-weight: 700;
  color: #0f1419;
}

.retweet-username, .retweet-time {
  color: #536471;
  font-size: 14px;
}

.retweet-text {
  color: #0f1419;
  white-space: pre-wrap;
  word-break: break-word;
}

.retweet-category {
  margin-top: 6px;
  display: inline-block;
  padding: 2px 8px;
  background: #e8f4fd;
  color: #1DA1F2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* 被引用文章图片样式 */
.retweet-images {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
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

/* 三张图片 */
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

/* 五张图片 - 3+2布局 */
.retweet-images:has(.retweet-image:nth-child(5):last-child) {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(5):last-child) .retweet-image:nth-child(1),
.retweet-images:has(.retweet-image:nth-child(5):last-child) .retweet-image:nth-child(2),
.retweet-images:has(.retweet-image:nth-child(5):last-child) .retweet-image:nth-child(3) {
  aspect-ratio: 1;
}

.retweet-images:has(.retweet-image:nth-child(5):last-child) .retweet-image:nth-child(4),
.retweet-images:has(.retweet-image:nth-child(5):last-child) .retweet-image:nth-child(5) {
  aspect-ratio: 1;
}

/* 六张图片 - 3x2网格 */
.retweet-images:has(.retweet-image:nth-child(6):last-child) {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(6):last-child) .retweet-image {
  aspect-ratio: 1;
}

/* 七张图片 - 3+2+2布局 */
.retweet-images:has(.retweet-image:nth-child(7):last-child) {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(7):last-child) .retweet-image:nth-child(1),
.retweet-images:has(.retweet-image:nth-child(7):last-child) .retweet-image:nth-child(2),
.retweet-images:has(.retweet-image:nth-child(7):last-child) .retweet-image:nth-child(3) {
  aspect-ratio: 1;
}

.retweet-images:has(.retweet-image:nth-child(7):last-child) .retweet-image:nth-child(4),
.retweet-images:has(.retweet-image:nth-child(7):last-child) .retweet-image:nth-child(5),
.retweet-images:has(.retweet-image:nth-child(7):last-child) .retweet-image:nth-child(6),
.retweet-images:has(.retweet-image:nth-child(7):last-child) .retweet-image:nth-child(7) {
  aspect-ratio: 1;
}

/* 八张图片 - 3+3+2布局 */
.retweet-images:has(.retweet-image:nth-child(8):last-child) {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(8):last-child) .retweet-image:nth-child(1),
.retweet-images:has(.retweet-image:nth-child(8):last-child) .retweet-image:nth-child(2),
.retweet-images:has(.retweet-image:nth-child(8):last-child) .retweet-image:nth-child(3) {
  aspect-ratio: 1;
}

.retweet-images:has(.retweet-image:nth-child(8):last-child) .retweet-image:nth-child(4),
.retweet-images:has(.retweet-image:nth-child(8):last-child) .retweet-image:nth-child(5),
.retweet-images:has(.retweet-image:nth-child(8):last-child) .retweet-image:nth-child(6) {
  aspect-ratio: 1;
}

.retweet-images:has(.retweet-image:nth-child(8):last-child) .retweet-image:nth-child(7),
.retweet-images:has(.retweet-image:nth-child(8):last-child) .retweet-image:nth-child(8) {
  aspect-ratio: 1;
}

/* 九张图片 - 3x3网格 */
.retweet-images:has(.retweet-image:nth-child(9):last-child) {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  max-width: 200px;
}

.retweet-images:has(.retweet-image:nth-child(9):last-child) .retweet-image {
  aspect-ratio: 1;
}

.retweet-image {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: #f0f0f0;
  border-radius: 4px;
}

.retweet-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.retweet-image:hover img {
  transform: scale(1.05);
}

/* 图片网格 - 微信朋友圈样式 */
.tweet-images {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
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

/* 互动按钮样式 */
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

/* 空状态样式 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #536471;
}

.empty-text {
  font-size: 16px;
  text-align: center;
}

/* 加载状态 */
.loading {
  padding: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #536471;
}

.error-text {
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.retry-btn {
  padding: 8px 16px;
  border: 1px solid #1DA1F2;
  border-radius: 20px;
  background: #fff;
  color: #1DA1F2;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #1DA1F2;
  color: #fff;
}

/* 确认弹窗样式 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 320px;
  width: 90%;
  overflow: hidden;
}

.confirm-header {
  padding: 20px 20px 0 20px;
}

.confirm-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f1419;
  text-align: center;
}

.confirm-content {
  padding: 16px 20px;
}

.confirm-content p {
  margin: 0;
  font-size: 15px;
  color: #536471;
  text-align: center;
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 0 20px 20px 20px;
}

.confirm-btn {
  flex: 1;
  height: 40px;
  border-radius: 20px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn.cancel {
  background: #f7f9fa;
  color: #536471;
  border: 1px solid #e1e8ed;
}

.confirm-btn.cancel:hover {
  background: #e1e8ed;
}

.confirm-btn.confirm {
  background: #1DA1F2;
  color: #ffffff;
}

.confirm-btn.confirm:hover:not(:disabled) {
  background: #0d8bd9;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 600px) { .profile { border-left: none; border-right: none; } }
</style>
