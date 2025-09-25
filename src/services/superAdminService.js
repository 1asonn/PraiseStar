import { api } from './apiClient'
import { passwordUtils } from '../utils/passwordUtils'

// 超级管理员相关API服务
export const superAdminService = {
  /**
   * 超级管理员登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise} 登录结果
   */
  login: async (username, password) => {
    try {
      // 对密码进行MD5加密
      const encryptedPassword = passwordUtils.encryptPassword(password)
      const response = await api.post('/super-admin/login', { 
        username, 
        password: encryptedPassword 
      })
      
      if (response.success && response.data.token) {
        // 保存token和超级管理员信息到本地存储，使用标准token存储
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.superAdmin))
      }
      
      return response
    } catch (error) {
      console.error('超级管理员登录失败:', error)
      throw error
    }
  },

  /**
   * 验证超级管理员Token有效性
   * @returns {Promise} 验证结果
   */
  verifyToken: async () => {
    try {
      const response = await api.get('/super-admin/profile')
      return response
    } catch (error) {
      console.error('超级管理员Token验证失败:', error)
      // 只在确实是认证错误时才清除本地存储
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      throw error
    }
  },

  /**
   * 超级管理员登出
   * @returns {Promise} 登出结果
   */
  logout: async () => {
    try {
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      return { success: true, message: '登出成功' }
    } catch (error) {
      console.error('超级管理员登出失败:', error)
      // 即使后端登出失败，也要清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw error
    }
  },

  /**
   * 获取当前超级管理员信息
   * @returns {Object|null} 超级管理员信息
   */
  getCurrentSuperAdmin: () => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('获取超级管理员信息失败:', error)
      return null
    }
  },

  /**
   * 获取当前超级管理员Token
   * @returns {string|null} Token
   */
  getCurrentToken: () => {
    return localStorage.getItem('token')
  },

  /**
   * 检查是否已登录为超级管理员
   * @returns {boolean} 是否已登录
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  /**
   * 更新本地超级管理员信息
   * @param {Object} superAdminData - 超级管理员数据
   */
  updateLocalSuperAdminInfo: (superAdminData) => {
    try {
      localStorage.setItem('user', JSON.stringify(superAdminData))
    } catch (error) {
      console.error('更新本地超级管理员信息失败:', error)
    }
  }
}

export default superAdminService
