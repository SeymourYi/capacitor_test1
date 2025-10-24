<script setup>
import { ref } from 'vue'
import { userLogin } from '../api/user.js'
import { Capacitor } from '@capacitor/core'

defineProps({
  msg: String,
})

const count = ref(0)
const testResult = ref('')
const isLoading = ref(false)

// 测试网络请求
const testNetworkRequest = async () => {
  isLoading.value = true
  testResult.value = ''
  
  try {
    console.log('开始测试网络请求...')
    console.log('当前环境:', Capacitor.isNativePlatform() ? '移动端' : 'Web端')
    console.log('Capacitor平台:', Capacitor.getPlatform())
    console.log('使用纯axios请求，no-cors模式绕过CORS')
    
    // 测试登录请求
    const result = await userLogin('test', 'test')
    testResult.value = `请求成功: ${JSON.stringify(result)}`
    console.log('网络请求测试成功:', result)
  } catch (error) {
    testResult.value = `请求失败: ${error.message}`
    console.error('网络请求测试失败:', error)
    
    // 添加更详细的错误信息
    if (error.message.includes('403')) {
      testResult.value += '\n\n可能的原因:\n1. 服务器拒绝了来自Capacitor应用的请求\n2. 需要特定的认证头或参数\n3. 服务器配置问题\n4. 请求头不正确'
    } else if (error.message.includes('CORS')) {
      testResult.value += '\n\nCORS问题，已使用no-cors模式处理'
    } else if (error.message.includes('NETWORK_ERROR')) {
      testResult.value += '\n\n网络连接问题，请检查网络状态'
    } else if (error.message.includes('no-cors')) {
      testResult.value += '\n\n已使用no-cors模式，请求可能已发送但无法读取响应'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <div class="card">
    <h3>网络请求测试 (纯Axios + no-cors)</h3>
    <p>当前环境: {{ Capacitor.isNativePlatform() ? '移动端' : 'Web端' }}</p>
    <p>平台: {{ Capacitor.getPlatform() }}</p>
    <p>请求方式: 纯Axios + no-cors模式</p>
    <p>请求URL: https://qianxunweimeng.cn:5361/user/login</p>
    <p style="color: #666; font-size: 12px;">
      注意: no-cors模式会绕过CORS限制，但响应可能不透明
    </p>
    <button type="button" @click="testNetworkRequest" :disabled="isLoading">
      {{ isLoading ? '测试中...' : '测试网络请求' }}
    </button>
    <div v-if="testResult" class="test-result">
      <p><strong>测试结果:</strong></p>
      <pre>{{ testResult }}</pre>
    </div>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.test-result {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.test-result pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
}
</style>
