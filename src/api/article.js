import request from "../utils/request.js";
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

// 获取首页文章列表
export const getHomeArticleList = (userid) => {
  // 在移动端环境使用完整URL，在Web环境使用相对路径（axios会自动添加/api前缀）
  const url = isNative
    ? `https://qianxunweimeng.cn:5361/article/homeArticlelist?userid=${userid}`
    : `/article/homeArticlelist?userid=${userid}`;

  return request({
    url: url,
    method: "GET",
  });
};

// 获取文章详情
export const getArticleDetail = (articleId) => {
  const url = isNative
    ? `https://qianxunweimeng.cn:5361/article/getArticle?articleId=${articleId}`
    : `/article/getArticle?articleId=${articleId}`;

  return request({
    url: url,
    method: "GET",
  });
};

//获得文章的评论
export const getArticleCommentApi = (articleId) => {
  const url = isNative
    ? `https://qianxunweimeng.cn:5361/article/getArticleComments?articleId=${articleId}`
    : `/article/getArticleComments?articleId=${articleId}`;

  return request({
    url: url,
    method: "GET",
  });
};
//点赞某个文章
export const likeArticleApi = (username,articleid) => {
  const url = isNative
    ? `https://qianxunweimeng.cn:5361/article/likeSomeArticle?username=${username}&&articleid=${articleid}`
    : `/article/likeSomeArticle?username=${username}&&articleid=${articleid}`;

  return request({
    url: url,
    method: "POST",
  });
};
//发布文章
export const publishArticleApi = (content,categoryId,username,cover_img,createUserId,files = []) => {
  const url = isNative
    ? `https://qianxunweimeng.cn:5361/article`
    : `/article`;

  // 创建 FormData 对象
  const formData = new FormData();
  formData.append('content', content);
  formData.append('categoryId', categoryId);
  formData.append('username', username);
  formData.append('cover_img', cover_img);
  formData.append('createUserId', createUserId);
  
  // 添加图片文件，字段名为 file
  files.forEach((file, index) => {
    formData.append('file', file);
  });

  return request({
    url: url,
    method: "POST",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
//获得某个用户的动态
export const getUserArticleList = (username) => {
  const url = isNative
    ? `https://qianxunweimeng.cn:5361/article?username=${username}`
    : `/article?username=${username}`;

  return request({
    url: url,
    method: "GET",
  });
};
//删除文章
export const deleteArticleApi = (articleId) => {
  const url = isNative
    ? `https://qianxunweimeng.cn:5361/article/deletArticle?articleId=${articleId}`
    : `/article/deletArticle?articleId=${articleId}`;

  return request({
    url: url,
    method: "GET",
  });
};