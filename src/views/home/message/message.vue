<template>
  <div class="messages">
    <!-- 顶部分段（收件箱/请求），UI-only -->
    <div class="seg">
      <button class="seg-btn active">收件箱</button>
      <button class="seg-btn">消息请求</button>
    </div>

    <!-- 会话列表（写死数据） -->
    <div class="conv" v-for="c in conversations" :key="c.id">
      <div class="avatar" :style="{ backgroundImage: 'url(' + c.avatar + ')' }"></div>
      <div class="content">
        <div class="row1">
          <div class="name">{{ c.name }}</div>
          <div class="time">{{ c.time }}</div>
        </div>
        <div class="row2">
          <div class="snippet">{{ c.snippet }}</div>
          <div class="unread" v-if="c.unread > 0">{{ c.unread }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const conversations = [
  { id: 1, name: '米咻', time: '现在', snippet: '你好，我们可以合作一下吗？', unread: 2, avatar: 'https://picsum.photos/seed/u1/80' },
  { id: 2, name: '小李', time: '1小时', snippet: '收到，明天发你', unread: 0, avatar: 'https://picsum.photos/seed/u2/80' },
  { id: 3, name: '开发群', time: '昨天', snippet: '记得合并分支', unread: 5, avatar: 'https://picsum.photos/seed/u3/80' },
  { id: 4, name: '设计师', time: '2天', snippet: '这里改成蓝色吧', unread: 0, avatar: 'https://picsum.photos/seed/u4/80' },
]
</script>

<style scoped>
* { box-sizing: border-box; }
.messages { background: #ffffff; min-height: 100%; }

.seg { display: flex; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #eff3f4; }
.seg-btn { flex: 0 0 auto; height: 32px; padding: 0 12px; border-radius: 16px; border: 1px solid #eff3f4; background: #f7f9f9; color: #0f1419; }
.seg-btn.active { background: #1DA1F2; color: #fff; border-color: #1DA1F2; }

.conv { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.avatar { width: 48px; height: 48px; border-radius: 50%; background-color: #d8d8d8; background-size: cover; background-position: center; }
.content { flex: 1; min-width: 0; }
.row1 { display: flex; justify-content: space-between; align-items: baseline; }
.name { font-weight: 700; color: #0f1419; }
.time { color: #536471; font-size: 13px; }
.row2 { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.snippet { color: #536471; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.unread { background: #1DA1F2; color: #fff; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; text-align: center; line-height: 20px; font-size: 12px; font-weight: 700; }
</style>
