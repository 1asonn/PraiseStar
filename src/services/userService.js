import { api } from './apiClient'

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
      const response = await api.post('/users', userData)
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
      const response = await api.put(`/users/${userId}`, userData)
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
  }
}

export default userService
