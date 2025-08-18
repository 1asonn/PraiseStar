import { api } from './apiClient'

// 礼品管理相关API服务
export const giftsService = {
  /**
   * 获取礼品列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @param {boolean} params.available - 是否只获取可用礼品
   * @returns {Promise} 礼品列表
   */
  getGiftList: async (params = {}) => {
    try {
      const response = await api.get('/gifts', params)
      return response
    } catch (error) {
      console.error('获取礼品列表失败:', error)
      throw error
    }
  },

  /**
   * 获取可兑换礼品
   * @returns {Promise} 可兑换礼品列表
   */
  getAvailableGifts: async () => {
    try {
      const response = await api.get('/gifts/available')
      return response
    } catch (error) {
      console.error('获取可兑换礼品失败:', error)
      throw error
    }
  },

  /**
   * 获取礼品详情
   * @param {number} giftId - 礼品ID
   * @returns {Promise} 礼品详情
   */
  getGiftById: async (giftId) => {
    try {
      const response = await api.get(`/gifts/${giftId}`)
      return response
    } catch (error) {
      console.error('获取礼品详情失败:', error)
      throw error
    }
  },

  /**
   * 添加礼品（管理员）
   * @param {Object} giftData - 礼品数据
   * @param {string} giftData.name - 礼品名称
   * @param {string} giftData.description - 礼品描述
   * @param {string} giftData.image - 礼品图片URL
   * @param {number} giftData.starsCost - 所需赞赞星
   * @param {number} giftData.stock - 库存数量
   * @param {number} giftData.sortOrder - 排序
   * @returns {Promise} 添加结果
   */
  addGift: async (giftData) => {
    try {
      const response = await api.post('/gifts', giftData)
      return response
    } catch (error) {
      console.error('添加礼品失败:', error)
      throw error
    }
  },

  /**
   * 更新礼品信息（管理员）
   * @param {number} giftId - 礼品ID
   * @param {Object} giftData - 礼品数据
   * @returns {Promise} 更新结果
   */
  updateGift: async (giftId, giftData) => {
    try {
      const response = await api.put(`/gifts/${giftId}`, giftData)
      return response
    } catch (error) {
      console.error('更新礼品失败:', error)
      throw error
    }
  },

  /**
   * 删除礼品（管理员）
   * @param {number} giftId - 礼品ID
   * @returns {Promise} 删除结果
   */
  deleteGift: async (giftId) => {
    try {
      const response = await api.delete(`/gifts/${giftId}`)
      return response
    } catch (error) {
      console.error('删除礼品失败:', error)
      throw error
    }
  },

  /**
   * 兑换礼品
   * @param {number} giftId - 礼品ID
   * @param {Object} deliveryInfo - 配送信息
   * @param {string} deliveryInfo.deliveryMethod - 配送方式
   * @param {string} deliveryInfo.recipientName - 收件人姓名
   * @param {string} deliveryInfo.recipientPhone - 收件人电话
   * @param {string} deliveryInfo.address - 收件地址
   * @returns {Promise} 兑换结果
   */
  redeemGift: async (giftId, deliveryInfo) => {
    try {
      const response = await api.post(`/gifts/${giftId}/redeem`, deliveryInfo)
      return response
    } catch (error) {
      console.error('兑换礼品失败:', error)
      throw error
    }
  },

  /**
   * 获取用户兑换记录
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @returns {Promise} 兑换记录
   */
  getUserRedemptions: async (params = {}) => {
    try {
      const response = await api.get('/gifts/redemptions', params)
      return response
    } catch (error) {
      console.error('获取用户兑换记录失败:', error)
      throw error
    }
  },

  /**
   * 获取所有兑换记录（管理员）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @param {string} params.status - 状态筛选
   * @param {string} params.search - 搜索关键词
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 兑换记录
   */
  getAllRedemptions: async (params = {}) => {
    try {
      const response = await api.get('/gifts/redemptions/all', params)
      return response
    } catch (error) {
      console.error('获取所有兑换记录失败:', error)
      throw error
    }
  },

  /**
   * 更新兑换记录状态（管理员）
   * @param {number} redemptionId - 兑换记录ID
   * @param {Object} statusData - 状态数据
   * @param {string} statusData.status - 新状态
   * @param {string} statusData.adminNote - 管理员备注
   * @returns {Promise} 更新结果
   */
  updateRedemptionStatus: async (redemptionId, statusData) => {
    try {
      const response = await api.put(`/gifts/redemptions/${redemptionId}/status`, statusData)
      return response
    } catch (error) {
      console.error('更新兑换状态失败:', error)
      throw error
    }
  },

  /**
   * 批量更新兑换记录状态（管理员）
   * @param {number[]} redemptionIds - 兑换记录ID数组
   * @param {Object} statusData - 状态数据
   * @returns {Promise} 更新结果
   */
  batchUpdateRedemptionStatus: async (redemptionIds, statusData) => {
    try {
      const response = await api.post('/gifts/redemptions/batch-update-status', {
        redemptionIds,
        ...statusData
      })
      return response
    } catch (error) {
      console.error('批量更新兑换状态失败:', error)
      throw error
    }
  },

  /**
   * 获取礼品统计信息（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 统计信息
   */
  getGiftStatistics: async (params = {}) => {
    try {
      const response = await api.get('/gifts/statistics', params)
      return response
    } catch (error) {
      console.error('获取礼品统计信息失败:', error)
      throw error
    }
  },

  /**
   * 获取热门礼品排行（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 统计周期（week/month/quarter/year）
   * @param {number} params.limit - 获取数量
   * @returns {Promise} 热门礼品排行
   */
  getPopularGifts: async (params = {}) => {
    try {
      const response = await api.get('/gifts/popular', params)
      return response
    } catch (error) {
      console.error('获取热门礼品排行失败:', error)
      throw error
    }
  },

  /**
   * 获取礼品库存预警（管理员）
   * @param {number} threshold - 预警阈值
   * @returns {Promise} 库存预警信息
   */
  getStockAlert: async (threshold = 10) => {
    try {
      const response = await api.get('/gifts/stock-alert', { threshold })
      return response
    } catch (error) {
      console.error('获取库存预警失败:', error)
      throw error
    }
  },

  /**
   * 批量调整礼品库存（管理员）
   * @param {Object[]} stockAdjustments - 库存调整数据
   * @param {number} stockAdjustments[].giftId - 礼品ID
   * @param {number} stockAdjustments[].adjustment - 调整数量（正数增加，负数减少）
   * @param {string} stockAdjustments[].reason - 调整原因
   * @returns {Promise} 调整结果
   */
  batchAdjustStock: async (stockAdjustments) => {
    try {
      const response = await api.post('/gifts/batch-adjust-stock', { stockAdjustments })
      return response
    } catch (error) {
      console.error('批量调整库存失败:', error)
      throw error
    }
  },

  /**
   * 导出礼品数据（管理员）
   * @param {Object} params - 导出参数
   * @param {string} params.type - 导出类型（gifts/redemptions/statistics）
   * @param {string} params.startDate - 开始日期
   * @param {string} params.endDate - 结束日期
   * @returns {Promise} 导出结果
   */
  exportGiftData: async (params = {}) => {
    try {
      const response = await api.get('/gifts/export', params)
      return response
    } catch (error) {
      console.error('导出礼品数据失败:', error)
      throw error
    }
  },

  /**
   * 上传礼品图片
   * @param {File} file - 图片文件
   * @returns {Promise} 上传结果
   */
  uploadGiftImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.upload('/upload/image', formData)
      return response
    } catch (error) {
      console.error('上传礼品图片失败:', error)
      throw error
    }
  }
}

export default giftsService
