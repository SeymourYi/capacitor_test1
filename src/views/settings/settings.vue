<template>
  <div class="settings">
    <!-- 顶部栏 -->
    <div class="topbar">
      <button class="back" @click="goBack">
        <svg viewBox="0 0 24 24" class="icon"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="title">设置</div>
      <div class="spacer"></div>
    </div>

    <!-- 账号与安全 -->
    <div class="group">
      <div class="group-title">账号</div>
      <!-- 账号信息选项 -->
      <div class="cell" @click="goToAccountInfo">
        <div class="cell-left">
          <div class="cell-title">账号信息</div>
          <div class="cell-sub">编辑昵称、位置、生日、头像</div>
        </div>
        <div class="cell-right">›</div>
      </div>
      <div class="cell" @click="goToChangePassword">
        <div class="cell-left">
          <div class="cell-title">密码与安全</div>
          <div class="cell-sub">修改密码等账号相关设置</div>
        </div>
        <div class="cell-right">›</div>
      </div>
    </div>

    <!-- 隐私和安全 -->
    <!-- <div class="group">
      <div class="group-title">隐私与安全</div>
      <div class="cell">
        <div class="cell-left">
          <div class="cell-title">私密账号</div>
          <div class="cell-sub">设置谁能看到你的帖子</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="isPrivate" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="cell">
        <div class="cell-left">
          <div class="cell-title">消息权限</div>
          <div class="cell-sub">设置谁能给你发消息</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="dmOpen" />
          <span class="slider"></span>
        </label>
      </div>
    </div> -->

    <!-- 外观 -->
    <!-- <div class="group">
      <div class="group-title">显示与声音</div>
      <div class="cell">
        <div class="cell-left">
          <div class="cell-title">主题色</div>
          <div class="cell-sub">推特蓝</div>
        </div>
        <div class="pill">#1DA1F2</div>
      </div>
      <div class="cell">
        <div class="cell-left">
          <div class="cell-title">深色模式</div>
          <div class="cell-sub">跟随系统</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="darkMode" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="cell">
        <div class="cell-left">
          <div class="cell-title">声音</div>
          <div class="cell-sub">通知声音与震动</div>
        </div>
        <div class="cell-right">›</div>
      </div>
    </div> -->

    <!-- 其他 -->
    <div class="group">
      <div class="group-title">其他</div>
      <!-- <div class="cell">
        <div class="cell-left">
          <div class="cell-title">清理缓存</div>
          <div class="cell-sub">已占用 {{ cacheSize }}</div>
        </div>
        <button class="btn">清理</button>
      </div> -->
      <div class="cell">
        <div class="cell-left">
          <div class="cell-title">关于</div>
          <div class="cell-sub">版本 1.0.0</div>
        </div>
        <div class="cell-right">›</div>
      </div>
      <div class="cell danger" @click="confirmLogout = true">
        <div class="cell-left">
          <div class="cell-title">退出登录</div>
        </div>
      </div>
    </div>

    <!-- 确认弹窗（UI-only） -->
    <div v-if="confirmLogout" class="modal-mask" @click.self="confirmLogout = false">
      <div class="modal">
        <div class="modal-title">确认退出登录？</div>
        <div class="modal-actions">
          <button class="m-btn" @click="confirmLogout = false">取消</button>
          <button class="m-btn danger" @click="doLogout">退出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()

const isPrivate = ref(false)
const dmOpen = ref(true)
const darkMode = ref(false)
const cacheSize = '12.4 MB'
const confirmLogout = ref(false)

const doLogout = () => {
  confirmLogout.value = false
  router.replace({ name: 'Login' })
}

const goToAccountInfo = () => {
  router.push({ name: 'AccountInfo' })
}

const goToChangePassword = () => {
  router.push({ name: 'ChangePassword' })
}
</script>

<style scoped>
* { box-sizing: border-box; }
.settings { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; min-height: 100vh; border-left: 1px solid #eff3f4; border-right: 1px solid #eff3f4; }
.topbar {
z-index: 9999 !important;
  /* 考虑安全区域，确保头部不被状态栏遮挡 */
  margin-top: calc(-1 * var(--safe-area-inset-top, 0px));
   position: sticky;
   top: 0; height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #eff3f4; z-index: 10; }
.back { background: transparent; border: none; color: #0f1419; }
.icon { width: 22px; height: 22px; }
.title { font-size: 18px; font-weight: 700; color: #0f1419; }
.spacer { width: 22px; height: 22px; }

.group { padding-top: 8px; }
.group-title { padding: 8px 16px; color: #536471; font-size: 13px; }
.cell { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #eff3f4; }
.cell.danger { color: #f91880; font-weight: 700; justify-content: center; }
.cell-left { min-width: 0; }
.cell-title { color: #0f1419; font-weight: 700; }
.cell-sub { color: #536471; font-size: 13px; margin-top: 2px; }
.cell-right { color: #c2c2c2; }
.pill { background: #f1f8ff; color: #1DA1F2; border: 1px solid #cfe7ff; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; }

/* Switch */
.switch { position: relative; display: inline-block; width: 46px; height: 26px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #cfd9de; transition: .2s; border-radius: 26px; }
.slider:before { content: ""; position: absolute; height: 20px; width: 20px; left: 3px; top: 3px; background: white; transition: .2s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.switch input:checked + .slider { background: #1DA1F2; }
.switch input:checked + .slider:before { transform: translateX(20px); }

@media (max-width: 600px) { .settings { border-left: none; border-right: none; } }

/* 简易弹窗 */
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { width: 86%; max-width: 360px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.15); }
.modal-title { font-size: 16px; font-weight: 700; color: #0f1419; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.m-btn { height: 34px; padding: 0 14px; border-radius: 18px; border: 1px solid #eff3f4; background: #fff; color: #0f1419; }
.m-btn.danger { background: #fef0f6; color: #f91880; border-color: #fcd1e3; }
</style>
