<template>
  <div class="skeleton-loader">
    <!-- 文章列表骨架屏 -->
    <div v-if="type === 'article'" class="skeleton-article">
      <div v-for="n in count" :key="n" class="skeleton-article-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-header">
            <div class="skeleton-name"></div>
            <div class="skeleton-username"></div>
            <div class="skeleton-time"></div>
          </div>
          <div class="skeleton-text">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div v-if="showImages" class="skeleton-images">
            <div class="skeleton-image"></div>
            <div class="skeleton-image"></div>
            <div class="skeleton-image"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-action"></div>
            <div class="skeleton-action"></div>
            <div class="skeleton-action"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户信息骨架屏 -->
    <div v-else-if="type === 'user'" class="skeleton-user">
      <div class="skeleton-user-header">
        <div class="skeleton-cover"></div>
        <div class="skeleton-user-info">
          <div class="skeleton-user-avatar"></div>
          <div class="skeleton-user-name"></div>
          <div class="skeleton-user-bio"></div>
          <div class="skeleton-user-meta">
            <div class="skeleton-meta-item"></div>
            <div class="skeleton-meta-item"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-user-stats">
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
      </div>
    </div>

    <!-- 通知列表骨架屏 -->
    <div v-else-if="type === 'notification'" class="skeleton-notification">
      <div v-for="n in count" :key="n" class="skeleton-notification-item">
        <div class="skeleton-notification-avatar"></div>
        <div class="skeleton-notification-content">
          <div class="skeleton-notification-text"></div>
          <div class="skeleton-notification-time"></div>
        </div>
      </div>
    </div>

    <!-- 搜索列表骨架屏 -->
    <div v-else-if="type === 'search'" class="skeleton-search">
      <div v-for="n in count" :key="n" class="skeleton-search-item">
        <div class="skeleton-search-avatar"></div>
        <div class="skeleton-search-content">
          <div class="skeleton-search-name"></div>
          <div class="skeleton-search-username"></div>
          <div class="skeleton-search-bio"></div>
        </div>
        <div class="skeleton-search-action"></div>
      </div>
    </div>

    <!-- 个人中心骨架屏 -->
    <div v-else-if="type === 'profile'" class="skeleton-profile">
      <div class="skeleton-profile-header">
        <div class="skeleton-profile-cover"></div>
        <div class="skeleton-profile-info">
          <div class="skeleton-profile-avatar"></div>
          <div class="skeleton-profile-name"></div>
          <div class="skeleton-profile-desc"></div>
        </div>
      </div>
      <div class="skeleton-profile-sections">
        <div class="skeleton-section"></div>
        <div class="skeleton-section"></div>
        <div class="skeleton-section"></div>
      </div>
    </div>

    <!-- 默认骨架屏 -->
    <div v-else class="skeleton-default">
      <div v-for="n in count" :key="n" class="skeleton-default-item">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line medium"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['article', 'user', 'notification', 'search', 'profile', 'default'].includes(value)
  },
  count: {
    type: Number,
    default: 3
  },
  showImages: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
  padding: 16px;
}

/* 基础骨架屏样式 */
.skeleton-avatar,
.skeleton-name,
.skeleton-username,
.skeleton-time,
.skeleton-text,
.skeleton-line,
.skeleton-image,
.skeleton-action,
.skeleton-cover,
.skeleton-user-avatar,
.skeleton-user-name,
.skeleton-user-bio,
.skeleton-meta-item,
.skeleton-stat,
.skeleton-notification-avatar,
.skeleton-notification-text,
.skeleton-notification-time,
.skeleton-search-avatar,
.skeleton-search-name,
.skeleton-search-username,
.skeleton-search-bio,
.skeleton-search-action,
.skeleton-profile-avatar,
.skeleton-profile-name,
.skeleton-profile-desc,
.skeleton-section {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 文章列表骨架屏 */
.skeleton-article-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  min-width: 0;
}

.skeleton-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.skeleton-name {
  width: 80px;
  height: 16px;
  margin-right: 8px;
}

.skeleton-username {
  width: 60px;
  height: 14px;
  margin-right: 8px;
}

.skeleton-time {
  width: 40px;
  height: 14px;
}

.skeleton-text {
  margin-bottom: 12px;
}

.skeleton-line {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.medium {
  width: 80%;
}

.skeleton-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.skeleton-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

.skeleton-actions {
  display: flex;
  gap: 24px;
}

.skeleton-action {
  width: 60px;
  height: 20px;
}

/* 用户信息骨架屏 */
.skeleton-user-header {
  position: relative;
  margin-bottom: 20px;
}

.skeleton-cover {
  width: 100%;
  height: 200px;
  border-radius: 0;
}

.skeleton-user-info {
  position: relative;
  padding: 0 16px;
  margin-top: -60px;
}

.skeleton-user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #fff;
  margin-bottom: 12px;
}

.skeleton-user-name {
  width: 120px;
  height: 20px;
  margin-bottom: 8px;
}

.skeleton-user-bio {
  width: 200px;
  height: 16px;
  margin-bottom: 12px;
}

.skeleton-user-meta {
  display: flex;
  gap: 16px;
}

.skeleton-meta-item {
  width: 80px;
  height: 14px;
}

.skeleton-user-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.skeleton-stat {
  width: 60px;
  height: 16px;
}

/* 通知列表骨架屏 */
.skeleton-notification-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-notification-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.skeleton-notification-content {
  flex: 1;
}

.skeleton-notification-text {
  width: 100%;
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-notification-time {
  width: 80px;
  height: 14px;
}

/* 搜索列表骨架屏 */
.skeleton-search-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-search-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.skeleton-search-content {
  flex: 1;
}

.skeleton-search-name {
  width: 100px;
  height: 18px;
  margin-bottom: 6px;
}

.skeleton-search-username {
  width: 80px;
  height: 14px;
  margin-bottom: 6px;
}

.skeleton-search-bio {
  width: 150px;
  height: 14px;
}

.skeleton-search-action {
  width: 80px;
  height: 32px;
  border-radius: 16px;
}

/* 个人中心骨架屏 */
.skeleton-profile-header {
  position: relative;
  margin-bottom: 20px;
}

.skeleton-profile-cover {
  width: 100%;
  height: 150px;
  border-radius: 0;
}

.skeleton-profile-info {
  position: relative;
  padding: 0 16px;
  margin-top: -50px;
  text-align: center;
}

.skeleton-profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #fff;
  margin: 0 auto 12px;
}

.skeleton-profile-name {
  width: 120px;
  height: 20px;
  margin: 0 auto 8px;
}

.skeleton-profile-desc {
  width: 200px;
  height: 16px;
  margin: 0 auto;
}

.skeleton-profile-sections {
  padding: 0 16px;
}

.skeleton-section {
  width: 100%;
  height: 50px;
  margin-bottom: 12px;
  border-radius: 8px;
}

/* 默认骨架屏 */
.skeleton-default-item {
  margin-bottom: 16px;
}

.skeleton-default-item .skeleton-line {
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skeleton-loader {
    padding: 12px;
  }
  
  .skeleton-article-item {
    padding: 12px 0;
  }
  
  .skeleton-avatar {
    width: 36px;
    height: 36px;
  }
  
  .skeleton-user-avatar {
    width: 70px;
    height: 70px;
  }
  
  .skeleton-profile-avatar {
    width: 70px;
    height: 70px;
  }
}
</style>
