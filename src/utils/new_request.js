import axios from 'axios'
import { Capacitor } from '@capacitor/core'
import { useUserStore } from '../store/user.js'

// 检测是否在移动端环境
const isNative = Capacitor.isNativePlatform()

// 获取token的函数
const getToken = () => {
  try {
    const userStore = useUserStore()
    const token = userStore.token
    console.log('当前token:', token)
    return token
  } catch (error) {
    console.error('获取token失败:', error)
    // 如果store还没初始化，返回写死的token
    return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGFpbXMiOnsiaWQiOjEsInVzZXJuYW1lIjoiMTExMSJ9fQ.-r-9m5-y0HMZnNwIwCwYATpHETDQwPKuELkCmvJ3apc'
  }
}

// 创建axios实例（统一使用axios）
const axiosInstance = axios.create({
  baseURL: 'https://qianxunweimeng.cn:5361',
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
})

// 移动端特殊配置
if (isNative) {
  // 在移动端添加额外的请求头来模拟浏览器
  axiosInstance.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
  axiosInstance.defaults.headers.common['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
  axiosInstance.defaults.headers.common['Accept-Encoding'] = 'gzip, deflate, br'
  axiosInstance.defaults.headers.common['Origin'] = 'https://qianxunweimeng.cn:5361'
  axiosInstance.defaults.headers.common['Referer'] = 'https://qianxunweimeng.cn:5361/'
  axiosInstance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
  
  // 设置axios适配器来处理移动端的特殊需求
  axiosInstance.defaults.adapter = async (config) => {
    try {
      console.log('移动端axios请求配置:', config)
      
      // 构建完整的URL
      const url = config.baseURL ? `${config.baseURL}${config.url}` : config.url
      
      // 获取token
      const token = getToken()
      
      // 使用cors模式来正常读取响应数据
      const fetchConfig = {
        method: config.method?.toUpperCase() || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, */*',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Origin': 'https://qianxunweimeng.cn:5361',
          'Referer': 'https://qianxunweimeng.cn:5361/'
        },
        // 使用cors模式来正常读取响应
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      }
      
      // 添加Authorization token到请求头
      if (token) {
        fetchConfig.headers['Authorization'] = token
        console.log('✅ 已添加Authorization到移动端请求头:', token.substring(0, 20) + '...')
      } else {
        console.warn('⚠️ 移动端请求没有找到token')
      }
      
      // 处理FormData
      if (config.data instanceof FormData) {
        // 对于FormData，不设置Content-Type，让浏览器自动设置
        delete fetchConfig.headers['Content-Type']
        fetchConfig.body = config.data
      } else if (config.data && ['POST', 'PUT', 'PATCH'].includes(fetchConfig.method)) {
        // 对于JSON数据
        fetchConfig.body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
      }
      
      console.log('移动端fetch请求 (cors):', { url, fetchConfig })
      
      // 使用fetch发送请求
      const response = await fetch(url, fetchConfig)
      
      console.log('移动端响应状态:', response.status, response.statusText)
      console.log('移动端响应类型:', response.type)
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // 解析响应数据
      let responseData
      try {
        const responseText = await response.text()
        console.log('移动端响应文本:', responseText)
        
        if (responseText) {
          responseData = JSON.parse(responseText)
        } else {
          responseData = { success: true, message: '请求成功' }
        }
      } catch (parseError) {
        console.error('响应解析失败:', parseError)
        throw new Error('响应数据格式错误，无法解析JSON')
      }
      
      console.log('移动端响应数据:', responseData)
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config: config,
        request: response
      }
      
    } catch (error) {
      console.error('移动端请求错误:', error)
      
      // 提供更详细的错误信息
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        const networkError = new Error('网络连接失败，请检查网络连接和服务器状态')
        networkError.code = 'NETWORK_ERROR'
        throw networkError
      } else if (error.message.includes('403')) {
        const forbiddenError = new Error('服务器拒绝访问，可能是权限问题或请求头不正确')
        forbiddenError.code = 'FORBIDDEN'
        throw forbiddenError
      } else if (error.message.includes('CORS')) {
        const corsError = new Error('跨域请求被阻止')
        corsError.code = 'CORS_ERROR'
        throw corsError
      }
      
      throw error
    }
  }
}

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = token
      console.log('✅ 已添加Authorization到请求头:', token.substring(0, 20) + '...')
    } else {
      console.warn('⚠️ 没有找到token')
    }
    
    console.log('发送请求 (Axios):', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    })
    
    // 在移动端添加时间戳防止缓存
    if (isNative && config.method === 'get') {
      const separator = config.url.includes('?') ? '&' : '?'
      config.url += `${separator}_t=${Date.now()}`
    }
    
    return config
  },
  error => {
    console.error('请求错误 (Axios):', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => {
    console.log('响应数据 (Axios):', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    })
    return response.data
  },
  error => {
    console.error('响应错误 (Axios):', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    
    // 提供更友好的错误信息
    if (error.code === 'NETWORK_ERROR') {
      error.message = '网络连接失败，请检查网络连接和服务器状态'
    } else if (error.code === 'FORBIDDEN') {
      error.message = '服务器拒绝访问，可能是权限问题或请求头不正确'
    } else if (error.code === 'CORS_ERROR') {
      error.message = '跨域请求被阻止，已使用no-cors模式处理'
    } else if (error.response?.status === 403) {
      error.message = '服务器拒绝访问 (403 Forbidden)，可能是权限问题'
    } else if (error.response?.status === 404) {
      error.message = '请求的资源不存在 (404 Not Found)'
    } else if (error.response?.status >= 500) {
      error.message = '服务器内部错误，请稍后重试'
    }
    
    return Promise.reject(error)
  }
)

// 统一的请求函数（纯axios实现）
const request = async (config) => {
  return axiosInstance(config)
}

export default request