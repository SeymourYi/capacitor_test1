<template>
  <teleport to="body">
    <transition name="preview-fade">
      <div 
        v-if="visible" 
        class="wechat-preview-overlay"
        @click="handleClose"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 顶部状态栏 -->
        <div class="preview-header">
          <div class="image-counter">{{ currentIndex + 1 }} / {{ images.length }}</div>
        </div>

        <!-- 图片容器 -->
        <div class="preview-container" @click="handleContainerClick" @click.stop>
          <div 
            class="image-slider"
            :style="{ transform: `translateX(${-currentIndex * 100}%)` }"
          >
            <div 
              v-for="(img, index) in images" 
              :key="index"
              class="image-slide"
              @dblclick="handleDoubleClick"
              @touchstart="handleImageTouchStart"
              @touchmove="handleImageTouchMove"
              @touchend="handleImageTouchEnd"
              @contextmenu="handleContextMenu"
            >
              <img 
                :src="img" 
                :alt="`图片 ${index + 1}`"
                class="preview-image"
                :class="{ 'zoomed': isZoomed }"
                :style="{ transform: `scale(${scale})` }"
                @load="handleImageLoad"
                @error="handleImageError"
                @dblclick="handleDoubleClick"
              />
            </div>
          </div>
        </div>

        <!-- 微信风格底部操作框 -->
        <transition name="action-slide">
          <div v-if="showActionSheet" class="action-sheet" @click.stop>
            <!-- 转发给朋友区域 -->
            <!-- <div class="forward-section">
              <div class="forward-label">转发给</div>
              <div class="forward-contacts">
                <div class="contact-item">
                  <div class="contact-avatar">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMxREExRjIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAxMkMxNCAyMDkgMTIgMjAgMTIgMjBDMTIgMjAgMTAgMjA5IDEyIDEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=" alt="用户头像" />
                  </div>
                  <div class="contact-name">A*朵朵</div>
                </div>
                <div class="contact-placeholder">
                  <div class="placeholder-icon">+</div>
                </div>
              </div>
            </div> -->

            <!-- 操作按钮网格 -->
            <div class="action-grid">
              <!-- <div class="action-row">
                <div class="action-btn" @click="handleSendToFriend">
                  <div class="action-btn-icon send-icon">📤</div>
                  <div class="action-btn-text">发送给朋友</div>
                </div>
                <div class="action-btn" @click="handleCollect">
                  <div class="action-btn-icon collect-icon">📦</div>
                  <div class="action-btn-text">收藏</div>
                </div>
                <div class="action-btn" @click="handleSearch">
                  <div class="action-btn-icon search-icon">🔍</div>
                  <div class="action-btn-text">搜一搜</div>
                </div>
                <div class="action-btn" @click="handleOpenWithOther">
                  <div class="action-btn-icon other-icon">⋯</div>
                  <div class="action-btn-text">用其他应用打开</div>
                </div>
              </div> -->
              <div class="action-row">
                <div class="action-btn" @click="handleSaveImage">
                  <div class="action-btn-icon save-icon">💾</div>
                  <div class="action-btn-text">保存图片</div>
                </div>
                <!-- <div class="action-btn" @click="handleEdit">
                  <div class="action-btn-icon edit-icon">✏️</div>
                  <div class="action-btn-text">编辑</div>
                </div>
                <div class="action-btn" @click="handleLocateInChat">
                  <div class="action-btn-icon locate-icon">💬</div>
                  <div class="action-btn-text">定位到聊天位置</div>
                </div>
                <div class="action-btn" @click="handleShowMedia">
                  <div class="action-btn-icon media-icon">🖼️</div>
                  <div class="action-btn-text">此聊天中的图片视频</div>
                </div>
                <div class="action-btn" @click="handleTranslate">
                  <div class="action-btn-icon translate-icon">🌐</div>
                  <div class="action-btn-text">翻译</div>
                </div>
                <div class="action-btn" @click="handleExtractText">
                  <div class="action-btn-icon extract-icon">📝</div>
                  <div class="action-btn-text">提取文字</div>
                </div> -->
              </div>
            </div>

            <!-- 取消按钮 -->
            <div class="cancel-btn" @click="hideActionSheet">取消</div>
          </div>
        </transition>

        <!-- 底部指示器 -->
        <div v-if="images.length > 1 && !showActionSheet" class="indicator-dots">
          <div 
            v-for="(_, index) in images" 
            :key="index"
            class="dot"
            :class="{ active: index === currentIndex }"
            @click.stop="handleDotClick(index)"
          ></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  images: {
    type: Array,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:visible', 'close'])

const currentIndex = ref(0)
const isZoomed = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTime = ref(0)
const isTransitioning = ref(false)
const showActionSheet = ref(false)
const longPressTimer = ref(null)
const isLongPressing = ref(false)
const scale = ref(1)
const lastTouchDistance = ref(0)

watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentIndex.value = props.initialIndex
    isZoomed.value = false
    scale.value = 1
    showActionSheet.value = false
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

watch(() => props.initialIndex, (newVal) => {
  currentIndex.value = newVal
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handlePrev = () => {
  if (currentIndex.value > 0 && !isTransitioning.value) {
    isTransitioning.value = true
    currentIndex.value--
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }
}

const handleNext = () => {
  if (currentIndex.value < props.images.length - 1 && !isTransitioning.value) {
    isTransitioning.value = true
    currentIndex.value++
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }
}

const handleDotClick = (index) => {
  if (!isTransitioning.value) {
    isTransitioning.value = true
    currentIndex.value = index
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }
}

const handleDoubleClick = () => {
  isZoomed.value = !isZoomed.value
  scale.value = isZoomed.value ? 2 : 1
}

const handleContainerClick = () => {
  if (showActionSheet.value) {
    hideActionSheet()
  } else {
    handleClose()
  }
}

const hideActionSheet = () => {
  showActionSheet.value = false
}

const handleImageTouchStart = (e) => {
  if (e.touches.length === 1) {
    // 单指触摸 - 长按检测
    const touch = e.touches[0]
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    touchStartTime.value = Date.now()
    
    longPressTimer.value = setTimeout(() => {
      if (!isLongPressing.value) {
        isLongPressing.value = true
        showActionSheet.value = true
      }
    }, 500) // 500ms长按
  } else if (e.touches.length === 2) {
    // 双指触摸 - 缩放检测
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    lastTouchDistance.value = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }
}

const handleImageTouchMove = (e) => {
  if (e.touches.length === 1) {
    // 单指移动 - 取消长按
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
  } else if (e.touches.length === 2) {
    // 双指移动 - 缩放
    e.preventDefault()
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    
    if (lastTouchDistance.value > 0) {
      const scaleChange = currentDistance / lastTouchDistance.value
      scale.value = Math.max(0.5, Math.min(3, scale.value * scaleChange))
      isZoomed.value = scale.value > 1.5
    }
    
    lastTouchDistance.value = currentDistance
  }
}

const handleImageTouchEnd = (e) => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  
  if (e.touches.length === 0) {
    isLongPressing.value = false
  }
}

const handleContextMenu = (e) => {
  e.preventDefault()
  showActionSheet.value = true
}

const handleSaveImage = async () => {
  try {
    const currentImage = props.images[currentIndex.value]
    const response = await fetch(currentImage)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `image_${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    hideActionSheet()
    alert('图片已保存到下载文件夹')
  } catch (error) {
    console.error('保存图片失败:', error)
    alert('保存图片失败，请稍后重试')
  }
}

const handleShareImage = async () => {
  try {
    if (navigator.share) {
      const currentImage = props.images[currentIndex.value]
      await navigator.share({
        title: '分享图片',
        text: '查看这张图片',
        url: currentImage
      })
    } else {
      // 降级处理 - 复制链接
      const currentImage = props.images[currentIndex.value]
      await navigator.clipboard.writeText(currentImage)
      alert('图片链接已复制到剪贴板')
    }
    hideActionSheet()
  } catch (error) {
    console.error('分享图片失败:', error)
    alert('分享失败，请稍后重试')
  }
}

// 新增的操作函数
const handleSendToFriend = () => {
  console.log('发送给朋友')
  hideActionSheet()
  // TODO: 实现发送给朋友功能
}

const handleCollect = () => {
  console.log('收藏')
  hideActionSheet()
  // TODO: 实现收藏功能
}

const handleSearch = () => {
  console.log('搜一搜')
  hideActionSheet()
  // TODO: 实现搜一搜功能
}

const handleOpenWithOther = () => {
  console.log('用其他应用打开')
  hideActionSheet()
  // TODO: 实现用其他应用打开功能
}

const handleEdit = () => {
  console.log('编辑')
  hideActionSheet()
  // TODO: 实现编辑功能
}

const handleLocateInChat = () => {
  console.log('定位到聊天位置')
  hideActionSheet()
  // TODO: 实现定位到聊天位置功能
}

const handleShowMedia = () => {
  console.log('此聊天中的图片视频')
  hideActionSheet()
  // TODO: 实现显示聊天媒体功能
}

const handleTranslate = () => {
  console.log('翻译')
  hideActionSheet()
  // TODO: 实现翻译功能
}

const handleExtractText = () => {
  console.log('提取文字')
  hideActionSheet()
  // TODO: 实现提取文字功能
}

// 触摸事件处理
const handleTouchStart = (e) => {
  if (isZoomed.value) return
  
  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchStartTime.value = Date.now()
}

const handleTouchMove = (e) => {
  if (isZoomed.value) return
  
  e.preventDefault()
}

const handleTouchEnd = (e) => {
  if (isZoomed.value) return
  
  const touch = e.changedTouches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  const deltaTime = Date.now() - touchStartTime.value
  
  // 判断是否为滑动操作
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 300) {
    if (deltaX > 0) {
      handlePrev()
    } else {
      handleNext()
    }
  }
}

const handleImageLoad = () => {
  // 图片加载完成
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 键盘事件
const handleKeydown = (e) => {
  if (!props.visible) return
  
  if (e.key === 'Escape') {
    handleClose()
  } else if (e.key === 'ArrowLeft') {
    handlePrev()
  } else if (e.key === 'ArrowRight') {
    handleNext()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.wechat-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  user-select: none;
  -webkit-user-select: none;
}

.preview-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.image-counter {
  color: white;
  font-size: 16px;
  font-weight: 400;
  text-align: center;
}

.preview-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-slider {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.image-slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
  cursor: zoom-in;
}

.preview-image.zoomed {
  cursor: zoom-out;
}

.indicator-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.2);
}

.dot:hover {
  background: rgba(255, 255, 255, 0.7);
}

/* 微信风格操作框 */
.action-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f7f7f7;
  border-radius: 12px 12px 0 0;
  z-index: 20;
  max-height: 70vh;
  overflow-y: auto;
}

/* 转发给朋友区域 */
.forward-section {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #e5e5e5;
}

.forward-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
}

.forward-contacts {
  display: flex;
  gap: 12px;
  align-items: center;
}

.contact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.contact-avatar {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contact-name {
  font-size: 12px;
  color: #333;
  text-align: center;
}

.contact-placeholder {
  width: 50px;
  height: 50px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.contact-placeholder:hover {
  border-color: #1DA1F2;
}

.placeholder-icon {
  font-size: 20px;
  color: #ccc;
  font-weight: bold;
}

/* 操作按钮网格 */
.action-grid {
  padding: 16px 20px;
}

.action-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.action-row:last-child {
  margin-bottom: 0;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  min-width: 0;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.action-btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-btn-text {
  font-size: 12px;
  color: #333;
  text-align: center;
  line-height: 1.2;
  word-break: break-all;
}

/* 取消按钮 */
.cancel-btn {
  margin: 8px 20px 20px;
  height: 50px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.cancel-btn:hover {
  background: #f0f0f0;
}

/* 操作框动画 */
.action-slide-enter-active,
.action-slide-leave-active {
  transition: transform 0.3s ease;
}

.action-slide-enter-from,
.action-slide-leave-to {
  transform: translateY(100%);
}

/* 过渡动画 */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.3s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .preview-header {
    height: 40px;
  }
  
  .image-counter {
    font-size: 14px;
  }
  
  .image-slide {
    padding: 10px;
  }
  
  .indicator-dots {
    bottom: 15px;
  }
  
  .dot {
    width: 6px;
    height: 6px;
  }
  
  .action-sheet {
    max-height: 60vh;
  }
  
  .forward-section {
    padding: 12px 16px 8px;
  }
  
  .contact-avatar {
    width: 40px;
    height: 40px;
  }
  
  .contact-placeholder {
    width: 40px;
    height: 40px;
  }
  
  .action-grid {
    padding: 12px 16px;
  }
  
  .action-row {
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .action-btn {
    padding: 8px 4px;
  }
  
  .action-btn-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .action-btn-text {
    font-size: 11px;
  }
  
  .cancel-btn {
    margin: 6px 16px 16px;
    height: 44px;
    font-size: 15px;
  }
}

/* 横屏优化 */
@media (orientation: landscape) {
  .preview-header {
    height: 36px;
  }
  
  .image-slide {
    padding: 15px;
  }
  
  .indicator-dots {
    bottom: 10px;
  }
}

/* 防止图片被选中 */
.preview-image {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .preview-image {
    cursor: default;
  }
  
  .preview-image.zoomed {
    cursor: default;
  }
}
</style>

