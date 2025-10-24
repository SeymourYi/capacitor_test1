import request from "../utils/new_request.js";

// 获取首页文章列表
export const getHomeArticleList = (userid) => {
  return request({
    url: `/article/homeArticlelist?userid=${userid}`,
    method: "GET",
  });
};

// 获取文章详情
export const getArticleDetail = (articleId) => {
  return request({
    url: `/article/getArticle?articleId=${articleId}`,
    method: "GET",
  });
};

//获得文章的评论
export const getArticleCommentApi = (articleId) => {
  return request({
    url: `/article/getArticleComments?articleId=${articleId}`,
    method: "GET",
  });
};
//点赞某个文章
export const likeArticleApi = (username,articleid) => {
  return request({
    url: `/article/likeSomeArticle?username=${username}&&articleid=${articleid}`,
    method: "POST",
  });
};
//发布文章
export const publishArticleApi = (content,categoryId,username,cover_img,createUserId,files = []) => {
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
    url: `/article`,
    method: "POST",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
//获得某个用户的动态
export const getUserArticleList = (username) => {
  return request({
    url: `/article?username=${username}`,
    method: "GET",
  });
};
//删除文章
export const deleteArticleApi = (articleId) => {
  return request({
    url: `/article/deletArticle?articleId=${articleId}`,
    method: "GET",
  });
};