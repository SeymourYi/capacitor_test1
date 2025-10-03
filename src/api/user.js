import request from '../utils/request.js'
import { Capacitor } from '@capacitor/core'

// 用户登录API
export const userLogin = (username, password) => {
  // 检测环境并设置正确的URL
  const isNative = Capacitor.isNativePlatform()
  const baseURL = isNative 
    ? 'https://qianxunweimeng.cn:5361'  // 移动端直接使用完整URL
    : '/api'  // Web端使用代理路径

  return request({
    url: isNative ? `${baseURL}/user/login` : '/user/login',
    method: 'post',
    data: {
      username: username,
      password: password
    }
  })
}
