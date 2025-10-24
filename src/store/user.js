import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 写死的token
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGFpbXMiOnsiaWQiOjEsInVzZXJuYW1lIjoiMTExMSJ9fQ.-r-9m5-y0HMZnNwIwCwYATpHETDQwPKuELkCmvJ3apc',
    userInfo: null,
    notificationsCount: 0
  }),
  
  getters: {
    // 获取token
    getToken: (state) => state.token
  },
  
  actions: {
    // 设置token
    setToken(token) {
      this.token = token
    },
    
    // 清除token
    clearToken() {
      this.token = ''
    },
    
    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    
    // 设置通知个数
    setNotificationsCount(count) {
      this.notificationsCount = count
    },

    // 初始化事件监听
    initEventListeners() {
      // 监听通知个数更新事件
      const handleNotificationsCountUpdate = (event) => {
        this.setNotificationsCount(event.detail.count)
      }

      // 监听单个通知已读事件
      const handleNotificationRead = () => {
        if (this.notificationsCount > 0) {
          this.setNotificationsCount(this.notificationsCount - 1)
        }
      }

      // 监听所有通知已读事件
      const handleAllNotificationsRead = () => {
        this.setNotificationsCount(0)
      }

      window.addEventListener('notifications-count-updated', handleNotificationsCountUpdate)
      window.addEventListener('notification-read', handleNotificationRead)
      window.addEventListener('all-notifications-read', handleAllNotificationsRead)

      // 返回清理函数
      return () => {
        window.removeEventListener('notifications-count-updated', handleNotificationsCountUpdate)
        window.removeEventListener('notification-read', handleNotificationRead)
        window.removeEventListener('all-notifications-read', handleAllNotificationsRead)
      }
    }
  }
})

