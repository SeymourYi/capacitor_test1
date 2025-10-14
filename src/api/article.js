import request from '../utils/request.js'
import { Capacitor } from '@capacitor/core'

const isNative = Capacitor.isNativePlatform()

// 获取首页文章列表
export const getHomeArticleList = (userid) => {
  // 在移动端环境使用完整URL，在Web环境使用相对路径（axios会自动添加/api前缀）
  const url = isNative 
    ? `https://qianxunweimeng.cn:5361/article/homeArticlelist?userid=${userid}`
    : `/article/homeArticlelist?userid=${userid}`
  
  return request({
    url: url,
    method: 'GET'
  })
}

// 获取文章详情
export const getArticleDetail = (articleId) => {
  const url = isNative
    ? `https://qianxunweimeng.cn:5361/article/getArticle?articleId=${articleId}`
    : `/article/getArticle?articleId=${articleId}`
  
  return request({
    url: url,
    method: 'GET'
  })
}

