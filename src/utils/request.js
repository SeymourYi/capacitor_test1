import axios from 'axios'
import { Capacitor } from '@capacitor/core'
import { CapacitorHttp } from '@capacitor/core'
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

// 创建axios实例（用于Web环境）
const axiosInstance = axios.create({
  baseURL: 'https://qianxunweimeng.cn:5361', // 统一使用固定域名
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
})

// Web环境的请求拦截器
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
    console.log('发送请求 (Web):', {
      url: config.url,
      method: config.method,
      headers: config.headers
    })
    return config
  },
  error => {
    console.error('请求错误 (Web):', error)
    return Promise.reject(error)
  }
)

// Web环境的响应拦截器
axiosInstance.interceptors.response.use(
  response => {
    console.log('响应数据 (Web):', response)
    return response.data
  },
  error => {
    console.error('响应错误 (Web):', error)
    return Promise.reject(error)
  }
)

// 移动端HTTP请求函数（使用Capacitor原生HTTP插件，绕过CORS）
const nativeRequest = async (config) => {
  try {
    console.log('发送请求 (Native CapacitorHttp):', config)
    
    // 构建完整URL（处理查询参数）
    let url = config.url
    if (config.params) {
      const searchParams = new URLSearchParams(config.params)
      url += (url.includes('?') ? '&' : '?') + searchParams.toString()
    }

    console.log('请求URL:', url)

    // 获取token
    const token = getToken()

    // 使用 Capacitor HTTP 插件（原生请求，无CORS限制）
    const options = {
      url: url,
      method: config.method?.toUpperCase() || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        ...config.headers
      }
    }

    // 添加Authorization token到请求头
    if (token) {
      options.headers['Authorization'] = token
      console.log('✅ 已添加Authorization到移动端请求头:', token.substring(0, 20) + '...')
    } else {
      console.warn('⚠️ 移动端请求没有找到token')
    }

    // 添加请求体（如果有）
    if (config.data) {
      options.data = config.data
    }

    // 发送原生HTTP请求（完全绕过浏览器CORS限制）
    const response = await CapacitorHttp.request(options)
    
    console.log('原生HTTP请求成功:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    })

    // 返回与axios兼容的响应格式
    return {
      data: response.data,
      status: response.status,
      statusText: 'OK',
      headers: response.headers
    }
  } catch (error) {
    console.error('请求错误 (Native):', error)
    
    // 提供更友好的错误信息
    if (error.message) {
      throw new Error(`请求失败: ${error.message}`)
    } else {
      throw new Error('网络连接失败，请检查网络连接或服务器状态')
    }
  }
}

// 统一的请求函数
const request = async (config) => {
  if (isNative) {
    // 移动端环境，使用Capacitor HTTP
    const response = await nativeRequest(config)
    return response.data
  } else {
    // Web环境，使用axios
    return axiosInstance(config)
  }
}

export default request
