import { api } from './apiClient'
import { getKeywordRankingsMock, getKeywordRankingsSummaryMock } from '../data/mockData'

// 排行榜相关API服务
export const rankingsService = {
  /**
   * 获取排行榜
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @returns {Promise} 排行榜数据
   */
  getRankings: async (params = {}) => {
    try {
      const response = await api.get('/rankings', params)
      return response
    } catch (error) {
      console.error('获取排行榜失败:', error)
      throw error
    }
  },

  /**
   * 获取TOP排行榜
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @param {number} params.limit - 获取数量
   * @returns {Promise} TOP排行榜数据
   */
  getTopRankings: async (params = {}) => {
    try {
      const response = await api.get('/rankings/top', params)
      return response
    } catch (error) {
      console.error('获取TOP排行榜失败:', error)
      throw error
    }
  },

  /**
   * 获取指定用户排名
   * @param {number} userId - 用户ID
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @returns {Promise} 用户排名信息
   */
  getUserRanking: async (userId, params = {}) => {
    try {
      const response = await api.get(`/rankings/user/${userId}`, params)
      return response
    } catch (error) {
      console.error('获取用户排名失败:', error)
      throw error
    }
  },

  /**
   * 获取部门排行榜
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @param {number} params.limit - 获取数量
   * @returns {Promise} 部门排行榜数据
   */
  getDepartmentRankings: async (params = {}) => {
    try {
      const response = await api.get('/rankings/departments', params)
      return response
    } catch (error) {
      console.error('获取部门排行榜失败:', error)
      throw error
    }
  },

  /**
   * 获取排名统计数据
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @returns {Promise} 排名统计数据
   */
  getRankingStatistics: async (params = {}) => {
    try {
      const response = await api.get('/rankings/statistics', params)
      return response
    } catch (error) {
      console.error('获取排名统计数据失败:', error)
      throw error
    }
  },

  /**
   * 获取我的排名信息
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @returns {Promise} 当前用户排名信息
   */
  getMyRanking: async (params = {}) => {
    try {
      const response = await api.get('/rankings/my', params)
      return response
    } catch (error) {
      console.error('获取我的排名信息失败:', error)
      throw error
    }
  },

  /**
   * 获取排名变化趋势
   * @param {Object} params - 查询参数
   * @param {number} params.userId - 用户ID（可选，不传则获取当前用户）
   * @param {string} params.period - 时间周期（week/month/quarter）
   * @param {number} params.count - 获取周期数量
   * @returns {Promise} 排名趋势数据
   */
  getRankingTrend: async (params = {}) => {
    try {
      const response = await api.get('/rankings/trend', params)
      return response
    } catch (error) {
      console.error('获取排名趋势失败:', error)
      throw error
    }
  },

  /**
   * 获取排名历史记录
   * @param {Object} params - 查询参数
   * @param {number} params.userId - 用户ID（可选，不传则获取当前用户）
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页条数
   * @returns {Promise} 排名历史记录
   */
  getRankingHistory: async (params = {}) => {
    try {
      const response = await api.get('/rankings/history', params)
      return response
    } catch (error) {
      console.error('获取排名历史记录失败:', error)
      throw error
    }
  },

  /**
   * 获取周边用户排名（当前用户前后几名）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @param {number} params.range - 前后范围（默认5）
   * @returns {Promise} 周边用户排名
   */
  getNearbyRankings: async (params = {}) => {
    try {
      const response = await api.get('/rankings/nearby', params)
      return response
    } catch (error) {
      console.error('获取周边用户排名失败:', error)
      throw error
    }
  },

  /**
   * 获取排名分布统计
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @param {string} params.type - 统计类型（department/position/level）
   * @returns {Promise} 排名分布统计
   */
  getRankingDistribution: async (params = {}) => {
    try {
      const response = await api.get('/rankings/distribution', params)
      return response
    } catch (error) {
      console.error('获取排名分布统计失败:', error)
      throw error
    }
  },

  /**
   * 获取排名突破记录（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @param {string} params.type - 突破类型（up/down）
   * @param {number} params.threshold - 突破阈值
   * @param {number} params.limit - 获取数量
   * @returns {Promise} 排名突破记录
   */
  getRankingBreakthroughs: async (params = {}) => {
    try {
      const response = await api.get('/rankings/breakthroughs', params)
      return response
    } catch (error) {
      console.error('获取排名突破记录失败:', error)
      throw error
    }
  },

  /**
   * 获取排名竞争分析（管理员）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @param {string} params.department - 部门筛选
   * @returns {Promise} 竞争分析数据
   */
  getRankingCompetition: async (params = {}) => {
    try {
      const response = await api.get('/rankings/competition', params)
      return response
    } catch (error) {
      console.error('获取排名竞争分析失败:', error)
      throw error
    }
  },

  /**
   * 导出排行榜数据（管理员）
   * @param {Object} params - 导出参数
   * @param {string} params.period - 时间周期
   * @param {string} params.type - 导出类型（rankings/departments/statistics）
   * @returns {Promise} 导出结果
   */
  exportRankingData: async (params = {}) => {
    try {
      const response = await api.get('/rankings/export', params)
      return response
    } catch (error) {
      console.error('导出排行榜数据失败:', error)
      throw error
    }
  },

  /**
   * 重新计算排名（管理员）
   * @param {Object} params - 计算参数
   * @param {string} params.period - 时间周期（month/quarter/year）
   * @param {boolean} params.force - 是否强制重新计算
   * @returns {Promise} 计算结果
   */
  recalculateRankings: async (params = {}) => {
    try {
      const response = await api.post('/rankings/recalculate', params)
      return response
    } catch (error) {
      console.error('重新计算排名失败:', error)
      throw error
    }
  },

  /**
   * 获取用户维度词条排行榜（公开）
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year），默认year
   * @param {string} params.keyword - 特定词条名称，用于筛选特定词条的用户排行榜
   * @param {number} params.page - 页码，默认1
   * @param {number} params.limit - 每页数量，默认20
   * @returns {Promise} 用户维度词条排行榜数据
   */
  getKeywordRankings: async (params = {}) => {
    try {
      console.log('调用后端接口获取词条排行榜:', params)
      const response = await api.get('/rankings/keywords/public', params)
      console.log('后端词条排行榜响应:', response)
      return response
    } catch (error) {
      console.error('获取用户维度词条排行榜失败:', error)
      
      // 如果后端接口失败，降级到mock数据
      console.log('降级使用mock数据')
      const { period = 'year', keyword, page = 1, limit = 20 } = params
      let mockData = getKeywordRankingsMock(period)
      
      // 如果指定了特定词条，则筛选该词条的数据
      if (keyword && keyword !== '') {
        mockData = mockData.filter(item => item.keyword === keyword)
      }
      
      // 模拟分页
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedData = mockData.slice(startIndex, endIndex)
      
      const fallbackResponse = {
        success: true,
        message: '获取用户维度词条排行榜成功（使用模拟数据）',
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: mockData.length,
          pages: Math.ceil(mockData.length / limit)
        }
      }
      
      console.log('Mock keyword rankings fallback response:', fallbackResponse)
      return fallbackResponse
    }
  },

  /**
   * 获取用户维度词条排行榜摘要
   * @param {Object} params - 查询参数
   * @param {string} params.period - 时间周期（month/quarter/year），默认year
   * @returns {Promise} 用户维度词条排行榜摘要数据
   */
  getKeywordRankingsSummary: async (params = {}) => {
    try {
      console.log('调用后端接口获取词条排行榜摘要:', params)
      const response = await api.get('/rankings/keywords/public/summary', params)
      console.log('后端词条排行榜摘要响应:', response)
      return response
    } catch (error) {
      console.error('获取用户维度词条排行榜摘要失败:', error)
      
      // 如果后端接口失败，降级到mock数据
      console.log('降级使用mock数据')
      const { period = 'year' } = params
      const mockData = getKeywordRankingsSummaryMock(period)
      
      const fallbackResponse = {
        success: true,
        message: '获取用户维度词条排行榜摘要成功（使用模拟数据）',
        data: mockData
      }
      
      console.log('Mock keyword rankings summary fallback response:', fallbackResponse)
      return fallbackResponse
    }
  }
}

export default rankingsService
