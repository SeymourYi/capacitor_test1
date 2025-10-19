<template>
  <div class="me">
    <!-- 加载状态 - 骨架屏 -->
    <div v-if="loading" class="loading-container">
      <SkeletonLoader type="profile" :count="1" />
    </div>

    <!-- 用户信息 -->
    <div v-else class="header">
      <div class="cover" :style="{ backgroundImage: userStore.userInfo && userStore.userInfo.bgImg ? 'url(' + userStore.userInfo.bgImg + ')' : '' }"></div>
      <div class="profile">
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
        <div class="desc">{{ userStore.userInfo ? (userStore.userInfo.bio || '这个人很神秘，还没有简介') : '这个人很神秘，还没有简介' }}</div>
        <div v-if="userStore.userInfo" class="meta">
          <span class="meta-item">{{ userStore.userInfo.location || '未知' }}</span>
          <span class="meta-item">{{ userStore.userInfo.createTime || '' }}</span>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="cell">
        <div>我的帖子</div>
        <div class="arrow">›</div>
      </div>
      <div class="cell" @click="goAttentionList">
        <div>关注列表</div>
        <div class="arrow">›</div>
      </div>
      <div class="cell" @click="goSettings">
        <div>设置</div>
        <div class="arrow">›</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义组件名称
defineOptions({
  name: 'Me'
})

import { ref, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import { debugLoading } from '@/utils/debug.js'

const router = useRouter()
const userStore = useUserStore()

// 加载状态
const loading = ref(false)

const goSettings = () => router.push({ name: 'Settings' })
const goAttentionList = () => router.push({ name: 'AttentionList' })

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 模拟加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    // 这里可以添加实际的用户信息加载逻辑
  } finally {
    loading.value = false
  }
}

// 组件被激活时（从缓存中恢复）
onActivated(() => {
  debugLoading.logActivation('Me')
  debugLoading.logLoadingState('Me', loading, userStore.userInfo)
  
  // 如果用户信息为空，则加载
  if (!userStore.userInfo) {
    loadUserInfo()
  }
})

// 组件被停用时（进入缓存）
onDeactivated(() => {
  debugLoading.logDeactivation('Me')
})
</script>

<style scoped>
.me { min-height: 100%; background: #ffffff; }

/* 加载状态 */
.loading-container {
  padding: 0;
}

/* 品牌Logo区域 */
.brand-header {
  background: linear-gradient(135deg, #1DA1F2, #1991db);
  padding: 20px 16px;
  text-align: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
}

.header { position: relative; }
.cover { height: 120px; background: linear-gradient(135deg, #1DA1F2, #74c0fc); background-size: cover; background-position: center; }
.profile { padding: 0 16px 16px; margin-top: -28px; }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: #ffffff; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: #1DA1F2; }
.name { margin-top: 8px; font-size: 18px; font-weight: 700; color: #0f1419; }
.desc { margin-top: 4px; font-size: 14px; color: #536471; }
.meta { margin-top: 8px; display: flex; gap: 16px; color: #536471; font-size: 14px; }

.section { margin-top: 8px; border-top: 1px solid #eff3f4; border-bottom: 1px solid #eff3f4; }
.cell { height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #f5f5f5; color: #0f1419; }
.cell:last-child { border-bottom: none; }
.arrow { color: #c4c4c4; }
</style>


