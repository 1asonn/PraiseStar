import { api } from './apiClient'

// 赞赞星管理相关API服务
export const starsService = {
  /**
   * 赠送赞赞星
   * @param {Object} giveData - 赠送数据
   * @param {number} giveData.toUserId - 接收用户ID
   * @param {number} giveData.stars - 赞赞星数量
   * @param {string} giveData.reason - 赠送理由
   * @param {string} giveData.customReason - 自定义理由
   * @returns {Promise} 赠送结果
   */
  giveStars: async (giveData) => {
    try {
      const response = await api.post('/stars/give', giveData)
      return response
    } catch (error) {
      console.error('赠送赞赞星失败:', error)
      throw error
    }
  },

  /**
   * 获取赠送记录
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @param {string} params.type - 记录类型（all/sent/received）
   * @returns {Promise} 赠送记录
   */
  getGiveRecords: async (params = {}) => {
    try {
      const response = await api.get('/stars/give-records', params)
      return response
    } catch (error) {
      console.error('获取赠送记录失败:', error)
      throw error
    }
  },

  /**
   * 获取所有赠送记录（管理员）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @param {string} params.search - 搜索关键词
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 赠送记录
   */
  getAllGiveRecords: async (params = {}) => {
    try {
      const response = await api.get('/stars/give-records/all', params)
      return response
    } catch (error) {
      console.error('获取所有赠送记录失败:', error)
      throw error
    }
  },

  /**
   * 批量奖励赞赞星（管理员）
   * @param {Object} awardData - 奖励数据
   * @param {number[]} awardData.userIds - 用户ID数组
   * @param {number} awardData.stars - 赞赞星数量
   * @param {string} awardData.reason - 奖励理由
   * @returns {Promise} 奖励结果
   */
  awardStars: async (awardData) => {
    try {
      const response = await api.post('/stars/award', awardData)
      return response
    } catch (error) {
      console.error('批量奖励赞赞星失败:', error)
      throw error
    }
  },

  /**
   * 获取统计数据（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 统计周期（day/week/month/quarter/year）
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 统计数据
   */
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get('/stars/statistics', params)
      return response
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  },

  /**
   * 获取赠送理由选项
   * @returns {Promise} 理由选项列表
   */
  getGiveReasons: async () => {
    try {
      const response = await api.get('/stars/reasons')
      return response
    } catch (error) {
      console.error('获取赠送理由选项失败:', error)
      throw error
    }
  },

  /**
   * 获取可用用户列表（按部门分组）
   * @returns {Promise} 可用用户列表
   */
  getAvailableUsers: async () => {
    try {
      const response = await api.get('/stars/available-users')
      return response
    } catch (error) {
      console.error('获取可用用户列表失败:', error)
      throw error
    }
  },

  /**
   * 获取用户赞赞星余额
   * @param {number} userId - 用户ID（可选，不传则获取当前用户）
   * @returns {Promise} 赞赞星余额信息
   */
  getUserStarsBalance: async (userId = null) => {
    try {
      const url = userId ? `/stars/balance/${userId}` : '/stars/balance'
      const response = await api.get(url)
      return response
    } catch (error) {
      console.error('获取用户赞赞星余额失败:', error)
      throw error
    }
  },

  /**
   * 获取赞赞星流水记录
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @param {string} params.type - 类型（give/receive/award/redeem/adjust）
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 流水记录
   */
  getStarsFlow: async (params = {}) => {
    try {
      const response = await api.get('/stars/flow', params)
      return response
    } catch (error) {
      console.error('获取赞赞星流水记录失败:', error)
      throw error
    }
  },

  /**
   * 获取月度赞赞星分配统计（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.year - 年份
   * @param {string} params.month - 月份
   * @returns {Promise} 月度统计
   */
  getMonthlyAllocationStats: async (params = {}) => {
    try {
      const response = await api.get('/stars/monthly-allocation', params)
      return response
    } catch (error) {
      console.error('获取月度分配统计失败:', error)
      throw error
    }
  },

  /**
   * 重置用户月度赞赞星分配（管理员）
   * @param {number[]} userIds - 用户ID数组
   * @returns {Promise} 重置结果
   */
  resetMonthlyAllocation: async (userIds) => {
    try {
      const response = await api.post('/stars/reset-monthly-allocation', { userIds })
      return response
    } catch (error) {
      console.error('重置月度分配失败:', error)
      throw error
    }
  },

  /**
   * 获取赞赞星使用趋势（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 周期（week/month/quarter）
   * @param {number} params.count - 获取数量
   * @returns {Promise} 趋势数据
   */
  getUsageTrend: async (params = {}) => {
    try {
      const response = await api.get('/stars/usage-trend', params)
      return response
    } catch (error) {
      console.error('获取使用趋势失败:', error)
      throw error
    }
  },

  /**
   * 获取热门赠送理由统计（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @param {number} params.limit - 获取数量
   * @returns {Promise} 理由统计
   */
  getPopularReasons: async (params = {}) => {
    try {
      const response = await api.get('/stars/popular-reasons', params)
      return response
    } catch (error) {
      console.error('获取热门理由统计失败:', error)
      throw error
    }
  },

  /**
   * 导出赞赞星数据（管理员）
   * @param {Object} params - 导出参数
   * @param {string} params.type - 导出类型（give-records/statistics/flow）
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 导出结果
   */
  exportStarsData: async (params = {}) => {
    try {
      const response = await api.get('/stars/export', params)
      return response
    } catch (error) {
      console.error('导出赞赞星数据失败:', error)
      throw error
    }
  }
}

export default starsService
