<template>
  <div class="me">
    <div class="header">
      <div class="cover"></div>
      <div class="profile">
        <div class="avatar"></div>
        <div class="name">我的昵称</div>
        <div class="desc">这个人很神秘，还没有简介</div>
      </div>
    </div>
    <div class="section">
      <div class="cell">
        <div>我的帖子</div>
        <div class="arrow">›</div>
      </div>
      <div class="cell">
        <div>设置</div>
        <div class="arrow">›</div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.me { min-height: 100%; background: #ffffff; }
.header { position: relative; }
.cover { height: 120px; background: linear-gradient(135deg, #1DA1F2, #74c0fc); }
.profile { padding: 0 16px 16px; margin-top: -28px; }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: #ffffff; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.name { margin-top: 8px; font-size: 18px; font-weight: 700; color: #0f1419; }
.desc { margin-top: 4px; font-size: 14px; color: #536471; }

.section { margin-top: 8px; border-top: 1px solid #eff3f4; border-bottom: 1px solid #eff3f4; }
.cell { height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #f5f5f5; color: #0f1419; }
.cell:last-child { border-bottom: none; }
.arrow { color: #c4c4c4; }
</style>


