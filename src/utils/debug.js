// 调试工具 - 用于检查loading状态
export const debugLoading = {
  // 在控制台显示当前页面的loading状态
  logLoadingState(componentName, loading, data = null) {
    console.log(`[${componentName}] Loading状态:`, loading.value)
    if (data) {
      console.log(`[${componentName}] 数据状态:`, data.value)
    }
  },
  
  // 检查组件是否正确激活
  logActivation(componentName) {
    console.log(`[${componentName}] 组件已激活`)
  },
  
  // 检查组件是否正确停用
  logDeactivation(componentName) {
    console.log(`[${componentName}] 组件已停用`)
  },
  
  // 强制设置loading状态为false（用于调试）
  forceStopLoading(loading) {
    console.warn('强制停止loading状态')
    loading.value = false
  }
}

// 在开发环境下自动添加到window对象，方便调试
if (import.meta.env.DEV) {
  window.debugLoading = debugLoading
}
