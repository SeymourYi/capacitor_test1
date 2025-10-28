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

//注册接口API
export const registerApi = (phoneNumber, password) => {
  return request({
    url: `/user/register?phoneNumber=${phoneNumber}&password=${password}`,
    method: 'post',
    // data: {}
  })
}
//更新用户信息接口API
export const updateUserInfoApi = (username, nickname, bio, location, birthday, profession, avatarFile = null, bgFile = null) => {
  // 创建 FormData 对象，以匹配服务器期望的 form-data 格式
  const formData = new FormData()
  formData.append('username', username)
  formData.append('nickname', nickname)
  formData.append('bio', bio)
  formData.append('location', location)
  formData.append('birthday', birthday)
  formData.append('profession', profession)
  
  // 添加头像文件 (file1)
  if (avatarFile) {
    formData.append('file1', avatarFile)
  }
  
  // 添加背景图片文件 (file2)
  if (bgFile) {
    formData.append('file2', bgFile)
  }
  
  return request({
    url: `/user/updateUser`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
//修改密码接口API
export const changePasswordApi = (username, newpwd, oldpassword, phoneNumber) => {
  // 创建 FormData 对象，以匹配服务器期望的 form-data 格式
  const formData = new FormData()
  formData.append('username', username)
  formData.append('oldpassword', oldpassword)
  formData.append('newpwd', newpwd)
  
  // 如果传递了phoneNumber，则添加到FormData中
  if (phoneNumber) {
    formData.append('phoneNumber', phoneNumber)
  }
  
  return request({
    url: `/user/updatepwd`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
//注销账号
export const deleteAccountApi = (username) => {
  return request({
    url: `/user/Deregister?username=${username}`,
    method: 'post'
  })
}

//获取推荐好友列表
export const getRecommendFriendListApi = (username) => {
  return request({
    url: `/user/latestUsers?currentUsername=${username}`,
    method: 'get'
  })
}
//是不是朋友
export const isFriendApi = (currentUsername, targetUsername) => {
  return request({
    url: `/user/whetherfriend?username=${currentUsername}&friendname=${targetUsername}`,
    method: 'post'
  })
}

//关注或者取关用户接口
export const followOrUnfollowUserApi = (currentUsername, targetUsername) => {
  return request({
    url: `/user/addfriend?username=${currentUsername}&friendname=${targetUsername}`,
    method: 'get'
  })
}