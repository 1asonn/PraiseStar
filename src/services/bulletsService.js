import { api } from './apiClient'

// 弹幕设置相关API服务
export const bulletsService = {
  /**
   * 获取弹幕设置（管理员）
   * @returns {Promise} 弹幕设置
   */
  getBulletSettings: async () => {
    try {
      const response = await api.get('/bullets/settings')
      return response
    } catch (error) {
      console.error('获取弹幕设置失败:', error)
      throw error
    }
  },

  /**
   * 更新单个弹幕设置（管理员）
   * @param {string} type - 弹幕类型（give/ranking/achievement/congratulation）
   * @param {Object} settings - 设置数据
   * @param {boolean} settings.enabled - 是否启用
   * @param {number} settings.thresholdValue - 阈值（可选）
   * @param {string} settings.sendTime - 发送时间（可选）
   * @param {string} settings.template - 弹幕模板（可选）
   * @returns {Promise} 更新结果
   */
  updateBulletSetting: async (type, settings) => {
    try {
      const response = await api.put(`/bullets/settings/${type}`, settings)
      return response
    } catch (error) {
      console.error('更新弹幕设置失败:', error)
      throw error
    }
  },

  /**
   * 批量更新弹幕设置（管理员）
   * @param {Object} settings - 批量设置数据
   * @param {Object} settings.give - 赠送弹幕设置
   * @param {Object} settings.ranking - 排行榜弹幕设置
   * @param {Object} settings.achievement - 成就弹幕设置
   * @param {Object} settings.congratulation - 祝贺弹幕设置
   * @returns {Promise} 更新结果
   */
  batchUpdateBulletSettings: async (settings) => {
    try {
      const response = await api.post('/bullets/settings/batch', { settings })
      return response
    } catch (error) {
      console.error('批量更新弹幕设置失败:', error)
      throw error
    }
  },

  /**
   * 发送测试弹幕（管理员）
   * @param {Object} testData - 测试数据
   * @param {string} testData.type - 弹幕类型
   * @param {string} testData.content - 弹幕内容
   * @returns {Promise} 发送结果
   */
  sendTestBullet: async (testData) => {
    try {
      const response = await api.post('/bullets/test', testData)
      return response
    } catch (error) {
      console.error('发送测试弹幕失败:', error)
      throw error
    }
  },

  /**
   * 获取弹幕模板说明（管理员）
   * @returns {Promise} 模板说明
   */
  getBulletTemplates: async () => {
    try {
      const response = await api.get('/bullets/templates')
      return response
    } catch (error) {
      console.error('获取弹幕模板说明失败:', error)
      throw error
    }
  },

  /**
   * 手动发送弹幕（管理员）
   * @param {Object} bulletData - 弹幕数据
   * @param {string} bulletData.type - 弹幕类型（give/ranking/achievement/congratulation/custom）
   * @param {string} bulletData.content - 弹幕内容
   * @param {Object} bulletData.data - 弹幕相关数据（可选）
   * @returns {Promise} 发送结果
   */
  sendManualBullet: async (bulletData) => {
    try {
      const response = await api.post('/bullets/send', bulletData)
      return response
    } catch (error) {
      console.error('手动发送弹幕失败:', error)
      throw error
    }
  },

  /**
   * 获取弹幕历史记录（管理员）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @param {string} params.type - 弹幕类型筛选
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 弹幕历史记录
   */
  getBulletHistory: async (params = {}) => {
    try {
      const response = await api.get('/bullets/history', params)
      return response
    } catch (error) {
      console.error('获取弹幕历史记录失败:', error)
      throw error
    }
  },

  /**
   * 获取弹幕统计信息（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 统计周期（day/week/month）
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 弹幕统计信息
   */
  getBulletStatistics: async (params = {}) => {
    try {
      const response = await api.get('/bullets/statistics', params)
      return response
    } catch (error) {
      console.error('获取弹幕统计信息失败:', error)
      throw error
    }
  },

  /**
   * 删除弹幕记录（管理员）
   * @param {number} bulletId - 弹幕ID
   * @returns {Promise} 删除结果
   */
  deleteBullet: async (bulletId) => {
    try {
      const response = await api.delete(`/bullets/${bulletId}`)
      return response
    } catch (error) {
      console.error('删除弹幕记录失败:', error)
      throw error
    }
  },

  /**
   * 批量删除弹幕记录（管理员）
   * @param {number[]} bulletIds - 弹幕ID数组
   * @returns {Promise} 删除结果
   */
  batchDeleteBullets: async (bulletIds) => {
    try {
      const response = await api.post('/bullets/batch-delete', { bulletIds })
      return response
    } catch (error) {
      console.error('批量删除弹幕记录失败:', error)
      throw error
    }
  },

  /**
   * 获取弹幕预览（管理员）
   * @param {Object} previewData - 预览数据
   * @param {string} previewData.type - 弹幕类型
   * @param {string} previewData.template - 弹幕模板
   * @param {Object} previewData.data - 模拟数据
   * @returns {Promise} 预览结果
   */
  previewBullet: async (previewData) => {
    try {
      const response = await api.post('/bullets/preview', previewData)
      return response
    } catch (error) {
      console.error('获取弹幕预览失败:', error)
      throw error
    }
  },

  /**
   * 导出弹幕数据（管理员）
   * @param {Object} params - 导出参数
   * @param {string} params.type - 导出类型（history/statistics）
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 导出结果
   */
  exportBulletData: async (params = {}) => {
    try {
      const response = await api.get('/bullets/export', params)
      return response
    } catch (error) {
      console.error('导出弹幕数据失败:', error)
      throw error
    }
  },

  /**
   * 重置弹幕设置为默认值（管理员）
   * @param {string} type - 弹幕类型（可选，不传则重置所有）
   * @returns {Promise} 重置结果
   */
  resetBulletSettings: async (type = null) => {
    try {
      const url = type ? `/bullets/settings/reset/${type}` : '/bullets/settings/reset'
      const response = await api.post(url)
      return response
    } catch (error) {
      console.error('重置弹幕设置失败:', error)
      throw error
    }
  },

  /**
   * 获取弹幕发送状态（管理员）
   * @returns {Promise} 发送状态
   */
  getBulletSendStatus: async () => {
    try {
      const response = await api.get('/bullets/send-status')
      return response
    } catch (error) {
      console.error('获取弹幕发送状态失败:', error)
      throw error
    }
  },

  /**
   * 暂停/恢复弹幕发送（管理员）
   * @param {boolean} paused - 是否暂停
   * @returns {Promise} 操作结果
   */
  toggleBulletSending: async (paused) => {
    try {
      const response = await api.post('/bullets/toggle-sending', { paused })
      return response
    } catch (error) {
      console.error('切换弹幕发送状态失败:', error)
      throw error
    }
  }
}

export default bulletsService
