import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getnoticeApi, readsomeonenotificationApi, readallnotificationApi } from '@/api/notice.js'
import { getNotificationsNumberApi } from '@/api/user.js'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref([])
  const loading = ref(false)
  const error = ref('')
  const lastFetchTime = ref(null)
  const hasLoaded = ref(false)

  // 缓存时间（3分钟）
  const CACHE_DURATION = 3 * 60 * 1000

  // 获取通知列表
  const fetchNotifications = async (username, forceRefresh = false) => {
    if (!username) {
      error.value = '请先登录'
      return []
    }

    // 如果数据存在且未过期，且不是强制刷新，则直接返回
    if (!forceRefresh && notifications.value.length > 0 && lastFetchTime.value) {
      const now = Date.now()
      if (now - lastFetchTime.value < CACHE_DURATION) {
        console.log('NotificationStore: 使用缓存数据')
        return notifications.value
      }
    }

    loading.value = true
    error.value = ''
    
    try {
      const res = await getnoticeApi(username)
      if (res && res.code === 0) {
        notifications.value = Array.isArray(res.data) ? res.data : []
        lastFetchTime.value = Date.now()
        hasLoaded.value = true
        console.log('NotificationStore: 数据已更新，通知数量:', notifications.value.length)
        
        // 同时更新通知个数
        try {
          const countRes = await getNotificationsNumberApi(username)
          if (countRes && countRes.code === 0) {
            // 这里可以触发一个事件来更新用户store中的通知个数
            window.dispatchEvent(new CustomEvent('notifications-count-updated', {
              detail: { count: parseInt(countRes.data) || 0 }
            }))
          }
        } catch (e) {
          console.error('NotificationStore: 获取通知个数失败:', e)
        }
      } else {
        error.value = (res && res.msg) || '获取通知失败'
      }
    } catch (e) {
      console.error('NotificationStore: 获取通知失败:', e)
      error.value = '网络错误，请稍后重试'
    } finally {
      loading.value = false
    }

    return notifications.value
  }

  // 标记通知为已读
  const markAsRead = async (username, noticeId) => {
    if (!username) {
      console.error('NotificationStore: 用户未登录')
      return false
    }

    try {
      const res = await readsomeonenotificationApi(username, noticeId)
      if (res && res.code === 0) {
        // 更新本地状态
        const noticeIndex = notifications.value.findIndex(n => n.id === noticeId)
        if (noticeIndex !== -1) {
          notifications.value[noticeIndex].isRead = true
        }
        
        // 触发通知个数更新事件
        window.dispatchEvent(new CustomEvent('notification-read', {
          detail: { noticeId }
        }))
        
        console.log('NotificationStore: 通知已标记为已读')
        return true
      } else {
        console.error('NotificationStore: 标记已读失败:', res?.msg || '未知错误')
        return false
      }
    } catch (error) {
      console.error('NotificationStore: 标记已读请求失败:', error)
      return false
    }
  }

  // 标记所有通知为已读
  const markAllAsRead = async (username) => {
    if (!username) {
      console.error('NotificationStore: 用户未登录')
      return false
    }

    try {
      const res = await readallnotificationApi(username)
      if (res && res.code === 0) {
        // 更新所有通知状态为已读
        notifications.value.forEach(notice => {
          notice.isRead = true
        })
        
        // 触发通知个数更新事件
        window.dispatchEvent(new CustomEvent('all-notifications-read'))
        
        console.log('NotificationStore: 所有通知已标记为已读')
        return true
      } else {
        console.error('NotificationStore: 全部已读失败:', res?.msg || '未知错误')
        return false
      }
    } catch (error) {
      console.error('NotificationStore: 全部已读请求失败:', error)
      return false
    }
  }

  // 清空缓存
  const clearCache = () => {
    notifications.value = []
    lastFetchTime.value = null
    hasLoaded.value = false
    error.value = ''
    console.log('NotificationStore: 缓存已清空')
  }

  // 检查是否需要刷新
  const shouldRefresh = () => {
    if (!lastFetchTime.value) return true
    const now = Date.now()
    return now - lastFetchTime.value >= CACHE_DURATION
  }

  return {
    // 状态
    notifications,
    loading,
    error,
    hasLoaded,
    
    // 方法
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearCache,
    shouldRefresh
  }
})
