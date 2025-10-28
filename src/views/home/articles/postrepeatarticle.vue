<template>
  <div class="moments-container">
    <!-- 顶部栏（保持与postarticle一致） -->
    <div class="nav">
      <button class="nav-cancel" @click="onCancel">取消</button>
      <div class="nav-title">引用</div>
      <button 
        class="nav-publish" 
        :class="{ 'disabled': (!content.trim() && selectedImages.length === 0) || publishing }"
        :disabled="(!content.trim() && selectedImages.length === 0) || publishing"
        @click="onPublish"
      >
        {{ publishing ? '发布中...' : '引用' }}
      </button>
    </div>

    <!-- 被引用的文章内容（Twitter风格） -->
    <div class="original-post">
      <div class="post-header">
        <div class="post-avatar">
          <img 
            v-if="articleAuthorPic" 
            :src="articleAuthorPic" 
            class="avatar-img" 
            :alt="articleAuthor"
            @error="handleArticleImageError"
          />
          <div v-else class="avatar-placeholder"></div>
        </div>
        <div class="post-info">
          <div class="post-author">{{ articleAuthor || '原作者' }}</div>
          <div class="post-meta">原文</div>
        </div>
      </div>
      <div class="post-content">{{ articleContent || '被引用的文章内容' }}</div>
      
      <!-- 原文图片显示 -->
      <div v-if="hasArticleImages" class="article-images">
        <div 
          v-for="(img, index) in articleImages" 
          :key="index"
          class="article-image"
          @click="openImagePreview(index)"
        >
          <img :src="img" alt="文章图片" @error="handleArticleImageError" />
        </div>
      </div>
    </div>

    <!-- 引用编辑区（Twitter风格） -->
    <div class="repeat-section">
      <div class="repeat-header">
        <div class="repeat-avatar">
          <img 
            v-if="userStore.userInfo && userStore.userInfo.userPic" 
            :src="userStore.userInfo.userPic" 
            class="avatar-img" 
            :alt="userStore.userInfo.nickname"
            @error="handleImageError"
          />
          <div v-else class="avatar-placeholder"></div>
        </div>
        <div class="repeat-info">
          <div class="repeat-author">{{ userStore.userInfo ? userStore.userInfo.nickname : '我的昵称' }}</div>
          <div class="repeat-meta">引用 {{ articleAuthor || '原作者' }}</div>
        </div>
      </div>

      <div class="repeat-editor">
        <textarea 
          class="repeat-textarea" 
          placeholder="添加评论..."
          v-model="content"
        ></textarea>
        
        <!-- 媒体网格（保持与postarticle一致） -->
        <div class="media-grid">
          <!-- 添加图片按钮 -->
          <div v-if="selectedImages.length < 9" class="add-card" @click="selectImages">
            <svg class="add-icon" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
            </svg>
          </div>
          
          <!-- 已选择的图片 -->
          <div 
            v-for="(image, index) in selectedImages" 
            :key="index"
            class="media-thumb"
            @click="removeImage(index)"
          >
            <img :src="image.preview" :alt="`图片${index + 1}`" />
            <div class="remove-overlay">
              <svg viewBox="0 0 24 24" class="remove-icon">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          
          <!-- 隐藏的文件输入 -->
          <input 
            ref="fileInput"
            type="file" 
            multiple 
            accept="image/*" 
            style="display: none"
            @change="handleFileSelect"
          />
        </div>
      </div>
    </div>

    <!-- 功能选项（保持与postarticle一致） -->
    <div class="cells">
      <div class="cell">
        <div class="cell-left">所在位置</div>
        <div class="cell-right">
          添加
          <svg viewBox="0 0 24 24" class="arrow"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="cell">
        <div class="cell-left">谁可以看</div>
        <div class="cell-right">
          公开
          <svg viewBox="0 0 24 24" class="arrow"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="cell">
        <div class="cell-left">提醒谁看</div>
        <div class="cell-right">
          无
          <svg viewBox="0 0 24 24" class="arrow"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="cell">
        <div class="cell-left">添加标签</div>
        <div class="cell-right">
          无
          <svg viewBox="0 0 24 24" class="arrow"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </div>

    <!-- 图片预览组件 -->
    <PreviewImg 
      v-model:visible="previewVisible"
      :images="previewImages"
      :initial-index="previewIndex"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { publishRepeatArticleApi } from '@/api/article.js'
import PreviewImg from '@/components/PreviewImg.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const content = ref('')
const publishing = ref(false)

// 图片相关
const selectedImages = ref([])
const fileInput = ref(null)

// 从路由参数获取文章信息
const articleId = ref(route.query.articleId)
const articleContent = ref(route.query.articleContent)
const articleAuthor = ref(route.query.articleAuthor)
const articleAuthorPic = ref(route.query.articleAuthorPic)
const articleImages = ref([])

// 图片预览相关
const previewVisible = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

// 计算属性：是否有文章图片
const hasArticleImages = computed(() => {
  return articleImages.value && articleImages.value.length > 0
})

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const handleArticleImageError = (e) => {
  e.target.style.display = 'none'
}

// 打开图片预览
const openImagePreview = (index) => {
  previewImages.value = articleImages.value
  previewIndex.value = index
  previewVisible.value = true
}

// 选择图片
const selectImages = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  const maxFiles = 9 - selectedImages.value.length
  const remainingSlots = Math.min(files.length, maxFiles)
  
  for (let i = 0; i < remainingSlots; i++) {
    const file = files[i]
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      console.warn('请选择图片文件:', file.name)
      continue
    }
    
    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn('图片文件过大:', file.name)
      continue
    }
    
    // 创建预览URL
    const preview = URL.createObjectURL(file)
    selectedImages.value.push({
      file: file,
      preview: preview
    })
  }
  
  // 清空input值，允许重复选择同一文件
  event.target.value = ''
}

// 删除图片
const removeImage = (index) => {
  // 释放预览URL内存
  URL.revokeObjectURL(selectedImages.value[index].preview)
  selectedImages.value.splice(index, 1)
}

const onCancel = () => {
  // 清理预览URL
  selectedImages.value.forEach(img => URL.revokeObjectURL(img.preview))
  router.back()
}

const onPublish = async () => {
  // 检查是否有内容或图片
  if (!content.value.trim() && selectedImages.value.length === 0) {
    console.log('没有内容或图片，无法发布')
    return
  }

  // 检查用户登录状态
  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  publishing.value = true

  try {
    // 准备API调用参数
    const apiParams = {
      content: content.value.trim(),
      categoryId: 1, // 默认分类ID
      username: userStore.userInfo.username,
      createUserId: userStore.userInfo.id,
      BeSharearticleID: articleId.value, // 被引用的文章ID
      createUserName: userStore.userInfo.username,
      files: selectedImages.value.map(img => img.file)
    }

    // 打印发布数据结构供调试
    console.log('=== 引用文章发布数据结构 ===')
    console.log('API参数:', apiParams)
    console.log('内容:', apiParams.content)
    console.log('被引用文章ID:', apiParams.BeSharearticleID)
    console.log('用户信息:', {
      username: apiParams.username,
      userId: apiParams.createUserId,
      createUserName: apiParams.createUserName
    })
    console.log('图片文件数量:', apiParams.files.length)
    console.log('图片文件详情:', apiParams.files.map((file, index) => ({
      index: index,
      name: file.name,
      size: file.size,
      type: file.type
    })))
    console.log('原文信息:', {
      id: articleId.value,
      content: articleContent.value,
      author: articleAuthor.value,
      authorPic: articleAuthorPic.value,
      images: articleImages.value
    })
    console.log('==============================')

    // 调用真实的API接口
    const res = await publishRepeatArticleApi(
      apiParams.content,
      apiParams.categoryId,
      apiParams.username,
      apiParams.createUserId,
      apiParams.BeSharearticleID,
      apiParams.createUserName,
      apiParams.files
    )
    
    if (res && res.code === 0) {
      console.log('引用文章发布成功:', res)
      
      // 清理预览URL
      selectedImages.value.forEach(img => URL.revokeObjectURL(img.preview))
      
      // 发布成功后返回上一页
      router.back()
    } else {
      console.error('发布失败:', res?.msg || '未知错误')
    }
    
  } catch (error) {
    console.error('发布引用文章失败:', error)
  } finally {
    publishing.value = false
  }
}

onMounted(() => {
  // 解析文章图片
  try {
    if (route.query.articleImages) {
      articleImages.value = JSON.parse(route.query.articleImages)
    }
  } catch (error) {
    console.error('解析文章图片失败:', error)
    articleImages.value = []
  }

  console.log('引用页面加载，文章信息:', {
    articleId: articleId.value,
    articleContent: articleContent.value,
    articleAuthor: articleAuthor.value,
    articleAuthorPic: articleAuthorPic.value,
    articleImages: articleImages.value
  })
})
</script>

<style scoped>
* { box-sizing: border-box; }

.moments-container {
  width: 100%;
  max-width: 600px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #f7f7f7;
  /* 确保底部有足够的安全区域空间 */
  padding-bottom: var(--safe-area-inset-bottom, 0px);
}

/* 顶部导航栏（保持与postarticle一致） */
.nav {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 12px;
  background: #ffffff;
  border-bottom: 1px solid #ececec;
  z-index: 1000;
  /* 考虑安全区域，确保头部不被状态栏遮挡 */
  padding-top: var(--safe-area-inset-top, 0px);
  margin-top: calc(-1 * var(--safe-area-inset-top, 0px));
  min-height: calc(46px + var(--safe-area-inset-top, 0px));
}

.nav-title { font-size: 17px; font-weight: 600; color: #111; }
.nav-cancel { background: transparent; border: none; color: #1DA1F2; font-size: 16px; }
.nav-publish { 
  background: #1DA1F2; 
  color: #fff; 
  border: none; 
  height: 30px; 
  padding: 0 12px; 
  border-radius: 6px; 
  font-size: 15px; 
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-publish:disabled,
.nav-publish.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 被引用的文章内容（Twitter风格） */
.original-post {
  background: #ffffff;
  border-bottom: 1px solid #ececec;
  padding: 16px;
  margin-bottom: 1px;
  /* 参考评论界面的修复策略，为原文内容区域提供顶部间距 */
  margin-top: calc(var(--safe-area-inset-top, 0px));
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1DA1F2;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-author {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin-bottom: 2px;
}

.post-meta {
  font-size: 13px;
  color: #666;
}

.post-content {
  font-size: 15px;
  color: #111;
  line-height: 1.4;
  word-break: break-word;
  margin-left: 52px;
}

/* 原文图片显示样式 */
.article-images {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  margin-left: 52px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 300px;
}

/* 单张图片 */
.article-images:has(.article-image:nth-child(1):last-child) {
  grid-template-columns: 1fr;
  max-width: 250px;
}

.article-images:has(.article-image:nth-child(1):last-child) .article-image {
  max-height: 300px;
  aspect-ratio: auto;
}

/* 两张图片 */
.article-images:has(.article-image:nth-child(2):last-child) {
  grid-template-columns: 1fr 1fr;
  max-width: 250px;
}

.article-images:has(.article-image:nth-child(2):last-child) .article-image {
  aspect-ratio: 1;
}

/* 三张图片 - 微信朋友圈样式 */
.article-images:has(.article-image:nth-child(3):last-child) {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 250px;
}

.article-images:has(.article-image:nth-child(3):last-child) .article-image:nth-child(1) {
  grid-row: 1 / 3;
  aspect-ratio: 1;
}

.article-images:has(.article-image:nth-child(3):last-child) .article-image:nth-child(2),
.article-images:has(.article-image:nth-child(3):last-child) .article-image:nth-child(3) {
  aspect-ratio: 1;
}

/* 四张图片 - 2x2网格 */
.article-images:has(.article-image:nth-child(4):last-child) {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 250px;
}

.article-images:has(.article-image:nth-child(4):last-child) .article-image {
  aspect-ratio: 1;
}

/* 五张及以上图片 - 3列网格 */
.article-images:has(.article-image:nth-child(5)) {
  grid-template-columns: repeat(3, 1fr);
  max-width: 250px;
}

.article-images:has(.article-image:nth-child(5)) .article-image {
  aspect-ratio: 1;
}

.article-image {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.article-image:hover img {
  transform: scale(1.05);
}

/* 引用编辑区（Twitter风格） */
.repeat-section {
  background: #ffffff;
  border-bottom: 1px solid #ececec;
  padding: 16px;
}

.repeat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.repeat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1DA1F2;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #1DA1F2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.repeat-info {
  flex: 1;
  min-width: 0;
}

.repeat-author {
  font-size: 15px;
  font-weight: 600;
  color: #111;
  margin-bottom: 2px;
}

.repeat-meta {
  font-size: 13px;
  color: #666;
}

.repeat-editor {
  margin-left: 48px;
}

.repeat-textarea {
  width: 100%;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  color: #111;
  min-height: 100px;
  font-family: inherit;
}

.repeat-textarea::placeholder {
  color: #999;
}

/* 媒体网格（保持与postarticle一致） */
.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 12px;
}

.add-card,
.media-thumb {
  background: #f5f5f5;
  border-radius: 6px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.add-card:hover {
  background: #e6ecf0;
}

.add-icon { 
  width: 28px; 
  height: 28px; 
  color: #b2b2b2; 
}

.add-card:hover .add-icon {
  color: #1DA1F2;
}

.media-thumb:hover {
  background: #d1d9dd;
}

/* 图片删除样式 */
.media-thumb {
  position: relative;
  overflow: hidden;
}

.media-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.media-thumb:hover .remove-overlay {
  opacity: 1;
}

.remove-icon {
  width: 20px;
  height: 20px;
  color: white;
}

/* 功能选项（保持与postarticle一致） */
.cells { 
  margin-top: 10px; 
  background: #ffffff; 
  border-top: 1px solid #ececec; 
  border-bottom: 1px solid #ececec; 
}

.cell { 
  height: 48px; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 0 12px; 
  border-bottom: 1px solid #f2f2f2; 
  cursor: pointer;
}

.cell:last-child { 
  border-bottom: none; 
}

.cell-left { 
  font-size: 16px; 
  color: #111; 
}

.cell-right { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  color: #999; 
  font-size: 14px; 
}

.arrow { 
  width: 18px; 
  height: 18px; 
  color: #c7c7c7; 
}

/* 移动端优化 */
@media (max-width: 600px) {
  .moments-container { 
    max-width: 100%; 
  }
  
  .original-post,
  .repeat-section {
    padding: 12px;
  }
  
  .post-content,
  .repeat-editor {
    margin-left: 44px;
  }
  
  .repeat-editor {
    margin-left: 40px;
  }
}
</style>
