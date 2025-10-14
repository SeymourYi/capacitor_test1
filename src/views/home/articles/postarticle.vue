<template>
  <div class="moments-container">
    <!-- 顶部栏（仿朋友圈：取消/发布） -->
    <div class="nav">
      <button class="nav-cancel" @click="onCancel">取消</button>
      <div class="nav-title">发表</div>
      <button class="nav-publish">发表</button>
    </div>

    <!-- 内容编辑区 -->
    <div class="editor">
      <div class="author">
        <div class="avatar"></div>
        <div class="name">昵称</div>
      </div>

      <textarea class="content" rows="6" placeholder="这一刻的想法..."></textarea>

      <!-- 图片九宫格（3列），含添加按钮卡片 -->
      <div class="media-grid">
        <div class="add-card">
          <svg class="add-icon" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
          </svg>
        </div>
        <div class="media-thumb"></div>
        <div class="media-thumb"></div>
        <div class="media-thumb"></div>
      </div>
    </div>

    <!-- 功能项（仿朋友圈：位置、可见范围、提醒谁看） -->
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
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const onCancel = () => {
  router.back()
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
.nav-publish { background: #1DA1F2; color: #fff; border: none; height: 30px; padding: 0 12px; border-radius: 6px; font-size: 15px; }

.editor { background: #ffffff; padding: 12px; }
.author { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.avatar { width: 36px; height: 36px; border-radius: 4px; background: #d8d8d8; }
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
