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

        <!-- 操作菜单 -->
        <div v-if="showActionMenu" class="action-menu" @click.stop>
          <div class="action-item" @click="handleSaveImage">
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>保存图片</span>
          </div>
          <div class="action-item" @click="handleShareImage">
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 1 5.367-2.684 3 3 0 0 1-5.367 2.684zm0 9.316a3 3 0 1 1 5.367 2.684 3 3 0 0 1-5.367-2.684z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>分享</span>
          </div>
          <div class="action-item" @click="handleClose">
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>关闭</span>
          </div>
        </div>

        <!-- 底部指示器 -->
        <div v-if="images.length > 1" class="indicator-dots">
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
const showActionMenu = ref(false)
const longPressTimer = ref(null)
const isLongPressing = ref(false)
const scale = ref(1)
const lastTouchDistance = ref(0)

watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentIndex.value = props.initialIndex
    isZoomed.value = false
    scale.value = 1
    showActionMenu.value = false
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
  if (showActionMenu.value) {
    showActionMenu.value = false
  } else {
    handleClose()
  }
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
        showActionMenu.value = true
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
  showActionMenu.value = true
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
    
    showActionMenu.value = false
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
    showActionMenu.value = false
  } catch (error) {
    console.error('分享图片失败:', error)
    alert('分享失败，请稍后重试')
  }
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

/* 操作菜单 */
.action-menu {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  gap: 20px;
  z-index: 20;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  min-width: 60px;
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.action-item span {
  color: white;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
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
  
  .action-menu {
    bottom: 50px;
    gap: 16px;
  }
  
  .action-item {
    padding: 10px 12px;
    min-width: 50px;
  }
  
  .action-icon {
    width: 20px;
    height: 20px;
  }
  
  .action-item span {
    font-size: 11px;
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

