import { api } from './apiClient'
import { API_CONFIG } from './config'
import axios from 'axios'
import { passwordUtils } from '../utils/passwordUtils'

// 用户管理相关API服务
export const userService = {
  /**
   * 获取当前用户信息
   * @returns {Promise} 用户信息
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile')
      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  /**
   * 获取用户列表（管理员）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @param {string} params.search - 搜索关键词
   * @param {string} params.department - 部门筛选
   * @param {boolean} params.isAdmin - 管理员筛选
   * @returns {Promise} 用户列表
   */
  getUserList: async (params = {}) => {
    try {
      const response = await api.get('/users', params)
      return response
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  },

  /**
   * 获取指定用户信息（管理员）
   * @param {number} userId - 用户ID
   * @returns {Promise} 用户信息
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  /**
   * 添加用户（管理员）
   * @param {Object} userData - 用户数据
   * @param {string} userData.name - 姓名
   * @param {string} userData.phone - 手机号
   * @param {string} userData.password - 初始密码
   * @param {string} userData.department - 部门
   * @param {string} userData.position - 职位
   * @param {boolean} userData.isAdmin - 是否为管理员
   * @param {number} userData.monthlyAllocation - 月度赞赞星分配
   * @returns {Promise} 添加结果
   */
  addUser: async (userData) => {
    try {
      // 对密码进行MD5加密
      const processedUserData = { ...userData }
      if (processedUserData.password) {
        processedUserData.password = passwordUtils.encryptPassword(processedUserData.password)
      }
      
      const response = await api.post('/users', processedUserData)
      return response
    } catch (error) {
      console.error('添加用户失败:', error)
      throw error
    }
  },

  /**
   * 更新用户信息（管理员）
   * @param {number} userId - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise} 更新结果
   */
  updateUser: async (userId, userData) => {
    try {
      // 对密码进行MD5加密（如果包含密码字段）
      const processedUserData = { ...userData }
      if (processedUserData.password) {
        processedUserData.password = passwordUtils.encryptPassword(processedUserData.password)
      }
      
      const response = await api.put(`/users/${userId}`, processedUserData)
      return response
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  },

  /**
   * 删除用户（管理员）
   * @param {number} userId - 用户ID
   * @returns {Promise} 删除结果
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`)
      return response
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  },

  /**
   * 调整用户赞赞星（管理员）
   * @param {number} userId - 用户ID
   * @param {Object} adjustData - 调整数据
   * @param {string} adjustData.type - 调整类型（give/redeem）
   * @param {number} adjustData.amount - 调整数量
   * @param {string} adjustData.reason - 调整原因
   * @returns {Promise} 调整结果
   */
  adjustUserStars: async (userId, adjustData) => {
    try {
      const response = await api.post(`/users/${userId}/adjust-stars`, adjustData)
      return response
    } catch (error) {
      console.error('调整用户赞赞星失败:', error)
      throw error
    }
  },

  /**
   * 批量导入用户（管理员）
   * @param {File} file - Excel文件
   * @returns {Promise} 导入结果
   */
  importUsers: async (file) => {
    try {
      const formData = new FormData()
      formData.append('excel', file)
      
      const response = await api.upload('/upload/excel', formData)
      return response
    } catch (error) {
      console.error('批量导入用户失败:', error)
      throw error
    }
  },

  /**
   * 导出用户数据（管理员）
   * @param {Object} params - 导出参数
   * @returns {Promise} 导出结果
   */
  exportUsers: async (params = {}) => {
    try {
      const response = await api.get('/users/export', params)
      return response
    } catch (error) {
      console.error('导出用户数据失败:', error)
      throw error
    }
  },

  /**
   * 获取部门列表
   * @returns {Promise} 部门列表
   */
  getDepartments: async () => {
    try {
      const response = await api.get('/users/departments')
      return response
    } catch (error) {
      console.error('获取部门列表失败:', error)
      throw error
    }
  },

  /**
   * 获取用户统计信息（管理员）
   * @returns {Promise} 统计信息
   */
  getUserStatistics: async () => {
    try {
      const response = await api.get('/users/statistics')
      return response
    } catch (error) {
      console.error('获取用户统计信息失败:', error)
      throw error
    }
  },

  /**
   * 重置用户密码（管理员）
   * @param {number} userId - 用户ID
   * @returns {Promise} 重置结果
   */
  resetUserPassword: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/reset-password`)
      return response
    } catch (error) {
      console.error('重置用户密码失败:', error)
      throw error
    }
  },

  /**
   * 更新用户头像
   * @param {File} file - 头像文件
   * @returns {Promise} 更新结果
   */
  updateAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.upload('/upload/image', formData)
      return response
    } catch (error) {
      console.error('更新头像失败:', error)
      throw error
    }
  },

  /**
   * 导出用户数据
   * @param {Object} options - 导出选项
   * @param {string} options.format - 导出格式 ('csv' | 'json')
   * @param {boolean} options.includeStats - 是否包含统计信息
   * @returns {Promise} 导出结果
   */
  exportUsers: async (options = {}) => {
    try {
      const { format = 'csv', includeStats = true } = options
      
      if (format === 'csv') {
        // CSV格式导出，需要直接使用axios实例来获取blob
        const axios = require('axios')
        const token = localStorage.getItem('token')
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/user-data/export`, {
          params: {
            format,
            includeStats: includeStats
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        })
        
        // 处理CSV文件下载
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        link.download = `users_export_${timestamp}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        return { success: true, message: '用户数据导出成功' }
      } else {
        // JSON格式导出
        const response = await api.get('/user-data/export', {
          format,
          includeStats: includeStats
        })
        return response
      }
    } catch (error) {
      console.error('导出用户数据失败:', error)
      throw error
    }
  },

  /**
   * 导入用户数据
   * @param {File} file - CSV文件
   * @param {Object} options - 导入选项
   * @param {boolean} options.updateExisting - 是否更新已存在用户
   * @param {string} options.defaultPassword - 默认密码
   * @returns {Promise} 导入结果
   */
  importUsers: async (file, options = {}) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('updateExisting', options.updateExisting || false)
      formData.append('defaultPassword', options.defaultPassword || '123456')

      // 直接使用axios实例，不通过api类
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_CONFIG.BASE_URL}/user-data/import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 不设置Content-Type，让浏览器自动设置multipart/form-data with boundary
        }
      })
      
      return response.data
    } catch (error) {
      console.error('导入用户数据失败:', error)
      throw error
    }
  },

  /**
   * 下载导入模板
   * @returns {Promise} 下载结果
   */
  downloadImportTemplate: async (format = 'xlsx') => {
    try {
      // 直接使用axios实例来获取blob
      const axios = require('axios')
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/user-data/import-template?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      })
      
      // 根据格式设置正确的MIME类型和文件扩展名
      const mimeType = format === 'xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8'
      
      const fileExtension = format === 'xlsx' ? 'xlsx' : 'csv'
      
      // 创建blob URL并下载
      const blob = new Blob([response.data], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `user_import_template.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return { success: true, message: '模板下载成功' }
    } catch (error) {
      console.error('下载导入模板失败:', error)
      throw error
    }
  },

  /**
   * 验证导入文件
   * @param {File} file - CSV文件
   * @returns {Promise} 验证结果
   */
  validateImportFile: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      // 调试信息
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }
      console.log('File in FormData:', formData.get('file'))
      console.log('File type:', typeof formData.get('file'))
      console.log('Is File instance:', formData.get('file') instanceof File)

      // 使用原生axios实例，避免apiClient的默认配置干扰
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_CONFIG.BASE_URL}/user-data/validate-import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 不设置Content-Type，让浏览器自动设置multipart/form-data with boundary
        }
      })
      
      console.log('Response:', response.data)
      return response.data
    } catch (error) {
      console.error('验证导入文件失败:', error)
      throw error
    }
  },

  /**
   * 执行用户数据导入
   * @param {File} file - CSV文件
   * @param {Object} options - 导入选项
   * @param {boolean} options.updateExisting - 是否更新已存在用户
   * @param {string} options.defaultPassword - 默认密码
   * @returns {Promise} 导入结果
   */
  importUsers: async (file, options = {}) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('updateExisting', options.updateExisting || false)
      
      // 对默认密码进行MD5加密
      const defaultPassword = options.defaultPassword || '123456'
      const encryptedDefaultPassword = passwordUtils.encryptPassword(defaultPassword)
      formData.append('defaultPassword', encryptedDefaultPassword)

      // 调试信息
      console.log('Import FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      // 使用原生axios实例，与validateImportFile保持一致
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_CONFIG.BASE_URL}/user-data/import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 不设置Content-Type，让浏览器自动设置multipart/form-data with boundary
        }
      })
      
      console.log('Import Response:', response.data)
      return response.data
    } catch (error) {
      console.error('导入用户数据失败:', error)
      throw error
    }
  },


  /**
   * 重置用户密码（管理员）
   * @param {number} userId - 用户ID
   * @returns {Promise} 重置结果
   */
  resetUserPassword: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/reset-password`)
      return response
    } catch (error) {
      console.error('重置用户密码失败:', error)
      throw error
    }
  },

  /**
   * 获取赞赞星统计数据
   * @returns {Promise} 统计数据
   */
  getStatistics: async () => {
    try {
      const response = await api.get('/stars/statistics')
      return response
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  },

  /**
   * 修改用户密码
   * @param {Object} passwordData - 密码数据
   * @param {string} passwordData.oldPassword - 旧密码
   * @param {string} passwordData.newPassword - 新密码
   * @returns {Promise} 修改结果
   */
  changePassword: async (passwordData) => {
    try {
      // 对密码进行MD5加密
      const processedPasswordData = {
        oldPassword: passwordUtils.encryptPassword(passwordData.oldPassword),
        newPassword: passwordUtils.encryptPassword(passwordData.newPassword)
      }
      
      const response = await api.post('/users/change-password', processedPasswordData)
      return response
    } catch (error) {
      console.error('修改密码失败:', error)
      throw error
    }
  },

  /**
   * 更新用户个人信息（手机号和密码）
   * @param {Object} profileData - 个人信息数据
   * @param {string} profileData.phone - 新手机号（可选）
   * @param {string} profileData.password - 新密码（可选）
   * @param {string} profileData.currentPassword - 当前密码（修改时必需）
   * @returns {Promise} 更新结果
   */
  updateProfile: async (profileData) => {
    try {
      // 对密码进行MD5加密（如果包含密码字段）
      const processedProfileData = { ...profileData }
      if (processedProfileData.password) {
        processedProfileData.password = passwordUtils.encryptPassword(processedProfileData.password)
      }
      if (processedProfileData.currentPassword) {
        processedProfileData.currentPassword = passwordUtils.encryptPassword(processedProfileData.currentPassword)
      }
      
      const response = await api.put('/users/profile', processedProfileData)
      return response
    } catch (error) {
      console.error('更新个人信息失败:', error)
      throw error
    }
  }
}

export default userService
