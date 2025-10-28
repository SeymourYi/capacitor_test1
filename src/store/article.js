import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getHomeArticleList, likeArticleApi, deleteArticleApi } from '@/api/article.js'
import { useUserStore } from '@/store/user.js'
export const useArticleStore = defineStore('article', () => {
  // 状态
  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetchTime = ref(null)
  const hasLoaded = ref(false)
  const userStore = useUserStore()
  // 缓存时间（5分钟）
  const CACHE_DURATION = 5 * 60 * 1000

  // 获取文章列表
  const fetchArticles = async (forceRefresh = false) => {
    // 如果数据存在且未过期，且不是强制刷新，则直接返回
    if (!forceRefresh && articles.value.length > 0 && lastFetchTime.value) {
      const now = Date.now()
      if (now - lastFetchTime.value < CACHE_DURATION) {
        console.log('ArticleStore: 使用缓存数据')
        return articles.value
      }
    }

    loading.value = true
    error.value = null
    
    try {
      // 检查用户是否已登录，如果未登录则使用默认值
      const userId = userStore.userInfo?.id || 2
      console.log('ArticleStore: 获取文章列表，用户ID:', userId)
      
      const response = await getHomeArticleList(userId) 
      if (response.code === 0) {
        articles.value = response.data || []
        lastFetchTime.value = Date.now()
        hasLoaded.value = true
        console.log('ArticleStore: 数据已更新，文章数量:', articles.value.length)
      } else {
        error.value = response.msg || '获取数据失败'
      } 
    } catch (err) {
      console.error('ArticleStore: 获取文章列表失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loading.value = false
    }

    return articles.value
  }

  // 点赞文章
  const likeArticle = async (username, articleId) => {
    // 检查用户是否已登录
    if (!userStore.userInfo || !userStore.userInfo.username) {
      console.error('ArticleStore: 用户未登录，无法点赞')
      return false
    }

    try {
      const res = await likeArticleApi(username, articleId)
      if (res && res.code === 0) {
        // 更新本地状态
        const articleIndex = articles.value.findIndex(a => a.id === articleId)
        if (articleIndex !== -1) {
          articles.value[articleIndex].islike = !articles.value[articleIndex].islike
          if (articles.value[articleIndex].islike) {
            articles.value[articleIndex].likecont = (articles.value[articleIndex].likecont || 0) + 1
          } else {
            articles.value[articleIndex].likecont = Math.max((articles.value[articleIndex].likecont || 1) - 1, 0)
          }
        }
        return true
      } else {
        console.error('ArticleStore: 点赞失败:', res?.msg || '未知错误')
        return false
      }
    } catch (error) {
      console.error('ArticleStore: 点赞请求失败:', error)
      return false
    }
  }

  // 删除文章
  const deleteArticle = async (articleId) => {
    // 检查用户是否已登录
    if (!userStore.userInfo || !userStore.userInfo.username) {
      console.error('ArticleStore: 用户未登录，无法删除文章')
      return false
    }

    try {
      const res = await deleteArticleApi(articleId)
      if (res && res.code === 0) {
        // 删除成功，从列表中移除文章
        const index = articles.value.findIndex(a => a.id === articleId)
        if (index !== -1) {
          articles.value.splice(index, 1)
        }
        console.log('ArticleStore: 文章删除成功')
        return true
      } else {
        console.error('ArticleStore: 删除失败:', res?.msg || '未知错误')
        return false
      }
    } catch (error) {
      console.error('ArticleStore: 删除文章失败:', error)
      return false
    }
  }

  // 清空缓存
  const clearCache = () => {
    articles.value = []
    lastFetchTime.value = null
    hasLoaded.value = false
    error.value = null
    console.log('ArticleStore: 缓存已清空')
  }

  // 检查是否需要刷新
  const shouldRefresh = () => {
    if (!lastFetchTime.value) return true
    const now = Date.now()
    return now - lastFetchTime.value >= CACHE_DURATION
  }

  return {
    // 状态
    articles,
    loading,
    error,
    hasLoaded,
    
    // 方法
    fetchArticles,
    likeArticle,
    deleteArticle,
    clearCache,
    shouldRefresh
  }
})
