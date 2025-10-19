<template>
  <div class="moments-container">
    <!-- 顶部栏（仿朋友圈：取消/发布） -->
    <div class="nav">
      <button class="nav-cancel" @click="onCancel">取消</button>
      <div class="nav-title">发表</div>
      <button 
        class="nav-publish" 
        :class="{ 'disabled': (!content.trim() && selectedImages.length === 0) || publishing }"
        :disabled="(!content.trim() && selectedImages.length === 0) || publishing"
        @click="onPublish"
      >
        {{ publishing ? '发布中...' : '发表' }}
      </button>
    </div>

    <!-- 内容编辑区 -->
    <div class="editor">
      <div class="author">
        <div class="avatar">
          <img 
            v-if="userStore.userInfo && userStore.userInfo.userPic" 
            :src="userStore.userInfo.userPic" 
            class="avatar-img" 
            :alt="userStore.userInfo.nickname"
            @error="handleImageError"
          />
          <div v-else class="avatar-placeholder"></div>
        </div>
        <div class="name">{{ userStore.userInfo ? userStore.userInfo.nickname : '我的昵称' }}</div>
      </div>

      <textarea 
        class="content" 
        rows="6" 
        placeholder="这一刻的想法..."
        v-model="content"
      ></textarea>

      <!-- 图片九宫格（3列），含添加按钮卡片 -->
      <div class="media-grid">
        <!-- 添加图片按钮 -->
        <div class="add-card" @click="selectImages" v-if="selectedImages.length < 9">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect" 
            multiple 
            accept="image/*" 
            style="display: none"
          />
          <svg class="add-icon" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
          </svg>
        </div>
        
        <!-- 已选择的图片预览 -->
        <div 
          v-for="(image, index) in selectedImages" 
          :key="index" 
          class="media-thumb"
        >
          <img :src="image.preview" :alt="`图片${index + 1}`" class="thumb-image" />
          <button class="remove-btn" @click="removeImage(index)">×</button>
        </div>
      </div>
    </div>

    <!-- 功能项（仿朋友圈：位置、可见范围、提醒谁看、标签） -->
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { publishArticleApi } from '@/api/article.js'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const content = ref('')
const publishing = ref(false)
const selectedImages = ref([])
const fileInput = ref(null)

const onCancel = () => {
  router.back()
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
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

// 发布文章
const onPublish = async () => {
  if (!content.value.trim() && selectedImages.value.length === 0) {
    return
  }

  if (!userStore.userInfo || !userStore.userInfo.username) {
    console.error('用户未登录')
    return
  }

  publishing.value = true

  try {
    const res = await publishArticleApi(
      content.value.trim(),
      1, // categoryId 默认为1
      userStore.userInfo.username,
      '', // cover_img 默认为空
      userStore.userInfo.id, // createUserId 使用用户信息中的id
      selectedImages.value.map(img => img.file) // 添加图片文件数组
    )

    if (res && res.code === 0) {
      console.log('文章发布成功:', res)
      // 清理预览URL
      selectedImages.value.forEach(img => URL.revokeObjectURL(img.preview))
      // 发布成功后返回上一页
      router.back()
    } else {
      console.error('发布失败:', res?.msg || '未知错误')
    }
  } catch (error) {
    console.error('发布请求失败:', error)
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

.moments-container {
  width: 100%;
  max-width: 600px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #f7f7f7;
}

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

/* 用户信息栏 */
.user-info-bar {
  background: #ffffff;
  border-bottom: 1px solid #ececec;
  padding: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: #d8d8d8;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #1DA1F2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 2px;
}

.user-bio {
  font-size: 13px;
  color: #666;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor { background: #ffffff; padding: 12px; }
.author { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.avatar { 
  width: 36px; 
  height: 36px; 
  border-radius: 4px; 
  background: #d8d8d8; 
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

.name { font-size: 15px; color: #333; }

.content {
  width: 100%;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  color: #111;
}

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
}

.add-icon { width: 28px; height: 28px; color: #b2b2b2; }

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.media-thumb {
  position: relative;
}

.cells { margin-top: 10px; background: #ffffff; border-top: 1px solid #ececec; border-bottom: 1px solid #ececec; }
.cell { height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1px solid #f2f2f2; }
.cell:last-child { border-bottom: none; }
.cell-left { font-size: 16px; color: #111; }
.cell-right { display: flex; align-items: center; gap: 6px; color: #999; font-size: 14px; }
.arrow { width: 18px; height: 18px; color: #c7c7c7; }

/* 移动端优化 */
@media (max-width: 600px) {
  .moments-container { max-width: 100%; }
}
</style>
