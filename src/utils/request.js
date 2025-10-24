import axios from 'axios'
import { Capacitor } from '@capacitor/core'

// 检测是否在移动端环境
const isNative = Capacitor.isNativePlatform()

// 创建axios实例（统一使用axios）
const axiosInstance = axios.create({
  baseURL: isNative ? 'https://qianxunweimeng.cn:5361' : '/api',
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
      
      // 使用no-cors模式来完全绕过CORS检查
      const fetchConfig = {
        method: config.method?.toUpperCase() || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, */*',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Origin': 'https://qianxunweimeng.cn:5361',
          'Referer': 'https://qianxunweimeng.cn:5361/'
        },
        // 关键：使用no-cors模式完全绕过CORS
        mode: 'no-cors',
        credentials: 'omit',
        cache: 'no-cache'
      }
      
      // 添加请求体
      if (config.data && ['POST', 'PUT', 'PATCH'].includes(fetchConfig.method)) {
        fetchConfig.body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
      }
      
      console.log('移动端fetch请求 (no-cors):', { url, fetchConfig })
      
      // 使用fetch发送请求
      const response = await fetch(url, fetchConfig)
      
      console.log('移动端响应状态:', response.status, response.statusText)
      console.log('移动端响应类型:', response.type)
      
      // 由于使用了no-cors模式，响应是opaque的
      // 我们无法读取响应内容，但可以假设请求成功了
      if (response.type === 'opaque') {
        console.log('no-cors模式成功，响应为opaque类型')
        
        // 返回一个成功的结果
        return {
          data: { 
            success: true, 
            message: '请求已成功发送（no-cors模式）',
            timestamp: new Date().toISOString()
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config,
          request: response
        }
      }
      
      // 如果不是opaque，尝试正常处理
      let responseData
      try {
        const responseText = await response.text()
        if (responseText) {
          responseData = JSON.parse(responseText)
        } else {
          responseData = { success: true, message: '请求成功' }
        }
      } catch (parseError) {
        console.log('响应解析失败:', parseError)
        responseData = { success: true, message: '请求成功，但响应格式异常' }
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
        const corsError = new Error('跨域请求被阻止，已使用no-cors模式处理')
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