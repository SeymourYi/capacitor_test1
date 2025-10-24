import request from '../utils/request.js'

// 用户登录API
export const userLogin = (username, password) => {
  return request({
    url: '/user/login',
    method: 'post',
    data: {
      username: username,
      password: password
    }
  })
}
