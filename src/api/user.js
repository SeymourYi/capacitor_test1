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
    url: isNative ? `${baseURL}/user/login?username=${username}&password=${password}` : `/user/login?username=${username}&password=${password}`,
    method: 'post',
    // data: {}
  })
}

// 验证码登录API（只传username，不传password）
export const smsLogin = (username) => {
  // 检测环境并设置正确的URL
  const isNative = Capacitor.isNativePlatform()
  const baseURL = isNative 
    ? 'https://qianxunweimeng.cn:5361'  // 移动端直接使用完整URL
    : '/api'  // Web端使用代理路径

  return request({
    url: isNative ? `${baseURL}/user/login?username=${username}` : `/user/login?username=${username}`,
    method: 'post',
    // data: {}
  })
}

// 获取用户信息API
export const getUserInfo = () => {
  const isNative = Capacitor.isNativePlatform()
  const baseURL = isNative 
    ? 'https://qianxunweimeng.cn:5361'
    : '/api'

  return request({
    url: isNative ? `${baseURL}/user/userinfo` : `/user/userinfo`,
    method: 'get'
  })
}

//得到某个用户信息
export const getUserInfoApi = (username) => {
  const isNative = Capacitor.isNativePlatform()
  const baseURL = isNative 
    ? 'https://qianxunweimeng.cn:5361'
    : '/api'

  return request({
    url: isNative ? `${baseURL}/user/someoneinfo?username=${username}` : `/user/someoneinfo?username=${username}`,
    method: 'get'
  })
}
//获得自己的通知个数
export const getNotificationsNumberApi = (username) => {
  const isNative = Capacitor.isNativePlatform()
  const baseURL = isNative 
    ? 'https://qianxunweimeng.cn:5361'
    : '/api'
  return request({
    url: isNative ? `${baseURL}/user/getnotificationsNumber?username=${username}` : `/user/getnotificationsNumber?username=${username}`,
    method: 'get'
  })
}
//获取关注列表
export const getAttentionListApi = (username) => {
  const isNative = Capacitor.isNativePlatform()
  const baseURL = isNative 
    ? 'https://qianxunweimeng.cn:5361'
    : '/api'
  return request({
    url: isNative ? `${baseURL}/user/myfriend?username=${username}` : `/user/myfriend?username=${username}`,
    method: 'get'
  })
}
//搜索朋友
export const searchFriendApi = (username) => {
  const isNative = Capacitor.isNativePlatform()
  const baseURL = isNative 
    ? 'https://qianxunweimeng.cn:5361'
    : '/api'
  return request({
    url: isNative ? `${baseURL}/user/searchsomeone?username=${username}` : `/user/searchsomeone?username=${username}`,
    method: 'get'
  })
}

//验证码发送接口
export const sendSmsCodeApi = (phoneNumber, code) => {
  const isNative = Capacitor.isNativePlatform()
  const baseURL = isNative 
    ? 'https://qianxunweimeng.cn:5361'
    : '/api'
  return request({
    url: isNative ? `${baseURL}/user/SmsSender` : `/user/SmsSender`,
    method: 'post',
    data: {
      code: code,
      phoneNumber: phoneNumber
    }
  })
}