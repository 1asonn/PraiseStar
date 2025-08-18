import { api } from './apiClient'

// 认证相关API服务
export const authService = {
  /**
   * 用户登录
   * @param {string} phone - 手机号
   * @returns {Promise} 登录结果
   */
  login: async (phone, password) => {
    try {
      const response = await api.post('/auth/login', { phone, password })
      
      if (response.success && response.data.token) {
        // 保存token和用户信息到本地存储
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },

  /**
   * 验证Token有效性
   * @returns {Promise} 验证结果
   */
  verifyToken: async () => {
    try {
      const response = await api.post('/auth/verify')
      return response
    } catch (error) {
      console.error('Token验证失败:', error)
      // 只在确实是认证错误时才清除本地存储
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      throw error
    }
  },

  /**
   * 刷新Token
   * @returns {Promise} 刷新结果
   */
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh')
      
      if (response.success && response.data.token) {
        // 更新本地存储中的token
        localStorage.setItem('token', response.data.token)
      }
      
      return response
    } catch (error) {
      console.error('Token刷新失败:', error)
      // 刷新失败时清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw error
    }
  },

  /**
   * 用户登出
   * @returns {Promise} 登出结果
   */
  logout: async () => {
    try {
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // 可以调用后端登出接口（如果有的话）
      // await api.post('/auth/logout')
      
      return { success: true, message: '登出成功' }
    } catch (error) {
      console.error('登出失败:', error)
      // 即使后端登出失败，也要清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw error
    }
  },

  /**
   * 获取当前用户信息
   * @returns {Object|null} 用户信息
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  },

  /**
   * 获取当前Token
   * @returns {string|null} Token
   */
  getCurrentToken: () => {
    return localStorage.getItem('token')
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  /**
   * 检查是否为管理员
   * @returns {boolean} 是否为管理员
   */
  isAdmin: () => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.isAdmin === true
      }
      return false
    } catch (error) {
      console.error('检查管理员权限失败:', error)
      return false
    }
  },

  /**
   * 更新本地用户信息
   * @param {Object} userData - 用户数据
   */
  updateLocalUserInfo: (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('更新本地用户信息失败:', error)
    }
  }
}

export default authService
