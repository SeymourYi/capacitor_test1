import request from '../utils/new_request.js'

// 用户登录API
export const userLogin = (username, password) => {
  return request({
    url: `/user/login?username=${username}&password=${password}`,
    method: 'post',
    // data: {}
  })
}

// 验证码登录API（只传username，不传password）
export const smsLogin = (username) => {
  return request({
    url: `/user/login?username=${username}`,
    method: 'post',
    // data: {}
  })
}

// 获取用户信息API
export const getUserInfo = () => {
  return request({
    url: `/user/userinfo`,
    method: 'get'
  })
}

//得到某个用户信息
export const getUserInfoApi = (username) => {
  return request({
    url: `/user/someoneinfo?username=${username}`,
    method: 'get'
  })
}
//获得自己的通知个数
export const getNotificationsNumberApi = (username) => {
  return request({
    url: `/user/getnotificationsNumber?username=${username}`,
    method: 'get'
  })
}
//获取关注列表
export const getAttentionListApi = (username) => {
  return request({
    url: `/user/myfriend?username=${username}`,
    method: 'get'
  })
}
//搜索朋友
export const searchFriendApi = (username) => {
  return request({
    url: `/user/searchsomeone?username=${username}`,
    method: 'get'
  })
}

//验证码发送接口
export const sendSmsCodeApi = (phoneNumber, code) => {
  return request({
    url: `/user/SmsSender`,
    method: 'post',
    data: {
      code: code,
      phoneNumber: phoneNumber
    }
  })
}