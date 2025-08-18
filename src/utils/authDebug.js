// 认证调试工具
export const authDebug = {
  // 启用调试模式
  enable: () => {
    localStorage.setItem('auth_debug', 'true')
    console.log('🔧 认证调试模式已启用')
  },

  // 禁用调试模式
  disable: () => {
    localStorage.removeItem('auth_debug')
    console.log('🔧 认证调试模式已禁用')
  },

  // 检查是否启用调试
  isEnabled: () => {
    return localStorage.getItem('auth_debug') === 'true'
  },

  // 调试日志
  log: (message, data = null) => {
    if (authDebug.isEnabled()) {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`🔐 [${timestamp}] ${message}`, data || '')
    }
  },

  // 检查认证状态
  checkAuthState: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    console.log('🔍 当前认证状态检查:')
    console.log('Token:', token ? `${token.substring(0, 20)}...` : '无')
    console.log('User:', user ? JSON.parse(user) : '无')
    
    return { hasToken: !!token, hasUser: !!user }
  },

  // 模拟登录状态
  simulateAuth: (userData = null) => {
    const defaultUser = {
      id: 1,
      name: '调试用户',
      phone: '13800138001',
      department: '测试部门',
      position: '测试职位',
      isAdmin: false,
      monthlyAllocation: 100,
      availableToGive: 80,
      receivedThisMonth: 45,
      receivedThisQuarter: 135,
      receivedThisYear: 450,
      redeemedThisYear: 132,
      availableToRedeem: 318
    }

    const user = userData || defaultUser
    const token = 'debug_token_' + Date.now()

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    console.log('🎭 已模拟登录状态:', user)
    return { token, user }
  },

  // 清除认证状态
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('🗑️ 已清除认证状态')
  },

  // 监听存储变化
  watchStorage: () => {
    const originalSetItem = localStorage.setItem
    const originalRemoveItem = localStorage.removeItem

    localStorage.setItem = function(key, value) {
      if (key === 'token' || key === 'user') {
        authDebug.log(`localStorage.setItem: ${key}`, value)
      }
      originalSetItem.apply(this, arguments)
    }

    localStorage.removeItem = function(key) {
      if (key === 'token' || key === 'user') {
        authDebug.log(`localStorage.removeItem: ${key}`)
      }
      originalRemoveItem.apply(this, arguments)
    }

    console.log('👀 已开始监听存储变化')
  },

  // 测试页面刷新行为
  testRefresh: () => {
    console.log('🔄 页面刷新测试:')
    console.log('1. 当前状态:', authDebug.checkAuthState())
    
    setTimeout(() => {
      console.log('2. 准备刷新页面...')
      window.location.reload()
    }, 2000)
  }
}

// 在开发环境下自动启用调试
if (process.env.NODE_ENV === 'development') {
  // 将调试工具挂载到window对象
  window.authDebug = authDebug
  
  // 自动启用调试模式
  authDebug.enable()
  authDebug.watchStorage()
  
  console.log('🛠️ 认证调试工具已加载到 window.authDebug')
  console.log('可用命令:')
  console.log('  - authDebug.checkAuthState() - 检查认证状态')
  console.log('  - authDebug.simulateAuth() - 模拟登录')
  console.log('  - authDebug.clearAuth() - 清除认证状态')
  console.log('  - authDebug.testRefresh() - 测试页面刷新')
}

export default authDebug
