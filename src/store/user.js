import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 写死的token
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGFpbXMiOnsiaWQiOjEsInVzZXJuYW1lIjoiMTExMSJ9fQ.-r-9m5-y0HMZnNwIwCwYATpHETDQwPKuELkCmvJ3apc',
    userInfo: null
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
    }
  }
})

