<template>
  <div class="notice">
    <!-- 顶部分段选择（全部/提及），UI-only -->
    <div class="seg">
      <button class="seg-btn active">全部</button>
      <button class="seg-btn">提及</button>
    </div>

    <!-- 系统类通知（写死示例） -->
    <div class="group">
      <div class="group-title">较早</div>
      <div class="item">
        <div class="icon like"></div>
        <div class="content">
          <div class="line">
            <span class="name">用户2</span>
            <span> 喜欢了你的推文</span>
            <span class="time">· 5m</span>
          </div>
          <div class="excerpt">这是被点赞的推文摘要占位</div>
        </div>
      </div>
      <div class="item">
        <div class="icon follow"></div>
        <div class="content">
          <div class="line">
            <span class="name">用户3</span>
            <span> 关注了你</span>
            <span class="time">· 1h</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 互动/提及类通知（写死示例） -->
    <div class="group">
      <div class="group-title">本周</div>
      <div class="item">
        <div class="icon mention"></div>
        <div class="content">
          <div class="line">
            <span>有人在推文中提及了你</span>
            <span class="time">· 2d</span>
          </div>
          <div class="excerpt">@user_1 你好，这是一个提及占位</div>
        </div>
      </div>
      <div class="item">
        <div class="icon retweet"></div>
        <div class="content">
          <div class="line">
            <span class="name">用户4</span>
            <span> 转推了你的推文</span>
            <span class="time">· 3d</span>
          </div>
          <div class="excerpt">这是被转推的推文摘要占位</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
* { box-sizing: border-box; }
.notice { background: #ffffff; min-height: 100%; }

.seg { display: flex; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #eff3f4; }
.seg-btn { flex: 0 0 auto; height: 32px; padding: 0 12px; border-radius: 16px; border: 1px solid #eff3f4; background: #f7f9f9; color: #0f1419; }
.seg-btn.active { background: #1DA1F2; color: #fff; border-color: #1DA1F2; }

.group { padding: 8px 0; }
.group-title { padding: 8px 16px; color: #536471; font-size: 13px; }
.item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.icon { width: 36px; height: 36px; border-radius: 50%; background: #dfe7f1; }
.icon.like { background: #fce7f3; }
.icon.follow { background: #e6f4ff; }
.icon.mention { background: #fff4e6; }
.icon.retweet { background: #e6fff4; }
.content { flex: 1; min-width: 0; }
.line { color: #0f1419; }
.name { font-weight: 700; }
.time { color: #536471; margin-left: 6px; }
.excerpt { margin-top: 4px; color: #536471; }
</style>
