<template>
  <div class="profile">
    <!-- 顶部栏置于最上方，避免下滑出现封面占位空白 -->
    <div class="topbar">
      <button class="back" @click="goBack">
        <svg viewBox="0 0 24 24" class="icon"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="top-title">{{ displayName }}</div>
      <div class="spacer"></div>
    </div>
    <!-- 顶部封面 -->
    <div class="cover"></div>

    <!-- 头像与编辑/关注按钮 -->
    <div class="header">
      <div class="avatar"></div>
      <button class="follow">关注</button>
    </div>

    <!-- 用户信息 -->
    <div class="info">
      <div class="name">{{ displayName }}</div>
      <div class="username">@{{ username }}</div>
      <div class="bio">这个人很神秘，还没有简介</div>
      <div class="meta">
        <span class="meta-item">{ { following } } 关注中</span>
        <span class="meta-item">{ { followers } } 关注者</span>
      </div>
    </div>

    <!-- Tabs：推文 / 喜欢 / 互动 -->
    <div class="tabs">
      <div class="tab" :class="{ active: currentTab === 'tweets' }" @click="currentTab = 'tweets'">推文</div>
      <div class="tab" :class="{ active: currentTab === 'likes' }" @click="currentTab = 'likes'">喜欢</div>
      <div class="tab" :class="{ active: currentTab === 'interactions' }" @click="currentTab = 'interactions'">互动</div>
    </div>

    <!-- 推文列表占位（与主页风格一致） -->
    <div v-if="currentTab === 'tweets'" class="tweets">
      <div class="tweet-card" v-for="i in 5" :key="'t'+i">
        <div class="tweet-avatar"></div>
        <div class="tweet-content">
          <div class="tweet-header">
            <span class="tweet-name">{{ displayName }}</span>
            <span class="tweet-username">@{{ username }}</span>
            <span class="tweet-time">· 刚刚</span>
          </div>
          <div class="tweet-text">个人主页的推文占位内容 {{ i }}</div>
        </div>
      </div>
    </div>

    <!-- 喜欢列表占位（显示他点赞过的推文样式） -->
    <div v-else-if="currentTab === 'likes'" class="tweets">
      <div class="tweet-card" v-for="i in 5" :key="'l'+i">
        <div class="tweet-avatar liked"></div>
        <div class="tweet-content">
          <div class="tweet-header">
            <span class="tweet-name">某用户</span>
            <span class="tweet-username">@someone</span>
            <span class="tweet-time">· 1天</span>
          </div>
          <div class="tweet-text">这是 {{ displayName }} 点赞过的内容占位 {{ i }}</div>
        </div>
      </div>
    </div>

    <!-- 互动列表占位（提及/回复/转推等） -->
    <div v-else class="tweets">
      <div class="tweet-card" v-for="i in 5" :key="'i'+i">
        <div class="tweet-avatar interact"></div>
        <div class="tweet-content">
          <div class="tweet-header">
            <span class="tweet-name">来自他人的互动</span>
            <span class="tweet-username">@another</span>
            <span class="tweet-time">· 2小时</span>
          </div>
          <div class="tweet-text">@{{ username }} 收到的互动/提及占位 {{ i }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.params.id)
const displayName = computed(() => `用户${userId.value}`)
const username = computed(() => `user_${userId.value}`)
const following = 12
const followers = 34

const goBack = () => router.back()

const currentTab = ref('tweets')
</script>

<style scoped>
* { box-sizing: border-box; }
.profile { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; min-height: 100vh; border-left: 1px solid #eff3f4; border-right: 1px solid #eff3f4; }
.cover { height: 140px; background: #e6ecf0; }
.topbar { position: sticky; top: 0; height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #eff3f4; z-index: 100; }
.back { background: transparent; border: none; color: #0f1419; }
.icon { width: 22px; height: 22px; }
.top-title { font-size: 18px; font-weight: 700; color: #0f1419; }
.spacer { width: 22px; height: 22px; }

.header { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 16px; margin-top: -28px; }
.avatar { width: 80px; height: 80px; border-radius: 50%; border: 4px solid #ffffff; background: #1DA1F2; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.follow { height: 34px; padding: 0 14px; border-radius: 18px; border: 1px solid #1DA1F2; color: #1DA1F2; background: #fff; font-weight: 700; }

.info { padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.name { font-size: 20px; font-weight: 800; color: #0f1419; }
.username { font-size: 15px; color: #536471; }
.bio { margin-top: 8px; font-size: 15px; color: #0f1419; }
.meta { margin-top: 8px; display: flex; gap: 16px; color: #536471; font-size: 14px; }

.tabs { display: flex; }
.tab { flex: 1; text-align: center; height: 46px; line-height: 46px; color: #536471; border-bottom: 2px solid transparent; }
.tab.active { color: #0f1419; border-bottom-color: #1DA1F2; font-weight: 700; }

.tweets { display: flex; flex-direction: column; }
.tweet-card { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.tweet-avatar { width: 48px; height: 48px; border-radius: 50%; background: #1DA1F2; flex-shrink: 0; }
.tweet-avatar.liked { background: #f91880; }
.tweet-avatar.interact { background: #00ba7c; }
.tweet-content { flex: 1; min-width: 0; }
.tweet-header { display: flex; align-items: baseline; gap: 6px; }
.tweet-name { font-weight: 700; color: #0f1419; }
.tweet-username, .tweet-time { color: #536471; }
.tweet-text { margin-top: 6px; color: #0f1419; white-space: pre-wrap; word-break: break-word; }

@media (max-width: 600px) { .profile { border-left: none; border-right: none; } }
</style>
