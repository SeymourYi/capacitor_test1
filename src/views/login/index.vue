<template>
  <div class="login">
    <div class="card">
      <div class="title">登录</div>
      <input class="input" placeholder="用户名" v-model="username" />
      <input class="input" placeholder="密码" type="password" v-model="password" />
      <button class="btn" @click="onLogin" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userLogin, getUserInfo } from '@/api/user.js'
import { useUserStore } from '@/store/user.js'

const router = useRouter()
const userStore = useUserStore()

// 默认账号
const username = ref('19137056165')
const password = ref('多少楼台烟雨中')
const loading = ref(false)
const error = ref('')

const onLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await userLogin(username.value, password.value)
    if (res && res.code === 0) {
      const token = res.data && (res.data.token || res.data)
      if (token) {
        userStore.setToken(token)
        
        // 登录成功后获取用户信息
        try {
          const userRes = await getUserInfo()
          if (userRes && userRes.code === 0) {
            userStore.setUserInfo(userRes.data)
          }
        } catch (e) {
          console.error('获取用户信息失败:', e)
        }
        
        router.replace({ name: 'HomeFeed' })
      } else {
        error.value = '登录成功但未返回token'
      }
    } else {
      error.value = (res && res.msg) || '登录失败'
    }
  } catch (e) {
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #ffffff; }
.card { width: 320px; padding: 20px; border: 1px solid #eff3f4; border-radius: 12px; }
.title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.input { width: 100%; height: 40px; border: 1px solid #eff3f4; border-radius: 8px; padding: 0 10px; margin: 8px 0; }
.btn { width: 100%; height: 40px; background: #1DA1F2; color: #fff; border: none; border-radius: 8px; font-weight: 700; margin-top: 8px; }
</style>


