import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// 引入 vConsole (仅在开发环境)
// if (import.meta.env.DEV) {
  import('vconsole').then(VConsole => {
    const vConsole = new VConsole.default({
      defaultPlugins: ['system', 'network', 'element', 'storage'], // 启用所有面板
      maxLogNumber: 1000, // 最大日志数量
      onReady: function () {
        console.log('vConsole 已启动，网络调试功能已启用')
      }
    })
  })
// }

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
