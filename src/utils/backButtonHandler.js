import { App } from '@capacitor/app'
import { useRouter } from 'vue-router'

/**
 * 返回按钮处理服务
 * 监听硬件返回按钮事件，实现软件内导航而不是直接退出应用
 */
export class BackButtonHandler {
  constructor(router) {
    this.router = router
    this.isListening = false
    this.backButtonListener = null
  }

  /**
   * 开始监听返回按钮事件
   */
  startListening() {
    if (this.isListening) {
      return
    }

    this.backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      this.handleBackButton(canGoBack)
    })

    this.isListening = true
    console.log('返回按钮监听已启动')
  }

  /**
   * 停止监听返回按钮事件
   */
  stopListening() {
    if (this.backButtonListener) {
      this.backButtonListener.remove()
      this.backButtonListener = null
    }
    this.isListening = false
    console.log('返回按钮监听已停止')
  }

  /**
   * 处理返回按钮事件
   * @param {boolean} canGoBack - 系统是否认为可以返回
   */
  handleBackButton(canGoBack) {
    // 获取当前路由
    const currentRoute = this.router.currentRoute.value
    
    // 定义需要特殊处理的页面
    const specialPages = [
      '/home',           // 首页
      '/home/me',        // 个人中心
      '/home/notifications', // 通知页面
      '/home/settings',  // 设置页面
      '/login',          // 登录页面
      '/register'        // 注册页面
    ]

    // 检查当前页面是否在特殊页面列表中
    const isSpecialPage = specialPages.includes(currentRoute.path)
    
    // 如果当前页面是特殊页面，或者没有历史记录可以返回
    if (isSpecialPage || !canGoBack) {
      // 显示退出确认对话框
      this.showExitConfirm()
    } else {
      // 执行软件内返回
      this.router.back()
    }
  }

  /**
   * 显示退出确认对话框
   */
  async showExitConfirm() {
    try {
      const result = await App.showAlert({
        title: '退出应用',
        message: '确定要退出应用吗？',
        buttonTitle: '取消',
        buttonTitle2: '退出'
      })

      if (result.buttonIndex === 2) {
        // 用户选择退出
        App.exitApp()
      }
    } catch (error) {
      console.error('显示退出确认对话框失败:', error)
      // 如果对话框显示失败，直接退出应用
      App.exitApp()
    }
  }

  /**
   * 获取当前路由信息（用于调试）
   */
  getCurrentRouteInfo() {
    const currentRoute = this.router.currentRoute.value
    return {
      path: currentRoute.path,
      name: currentRoute.name,
      params: currentRoute.params,
      query: currentRoute.query
    }
  }
}

/**
 * 创建返回按钮处理器的工厂函数
 * @param {Object} router - Vue Router 实例
 * @returns {BackButtonHandler} 返回按钮处理器实例
 */
export function createBackButtonHandler(router) {
  return new BackButtonHandler(router)
}
