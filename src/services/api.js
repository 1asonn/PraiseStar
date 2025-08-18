// 新的API服务 - 使用真实的API接口
import { authService } from './authService'
import { userService } from './userService'
import { starsService } from './starsService'
import { giftsService } from './giftsService'
import { rankingsService } from './rankingsService'
import { bulletsService } from './bulletsService'

// 为了保持向后兼容性，保留原有的API结构
// 但现在调用新的服务层

// 用户相关API
export const userApi = {
  // 登录
  login: async (phone) => {
    try {
      const response = await authService.login(phone)
      return response
    } catch (error) {
      return { success: false, message: error.message || '登录失败' }
    }
  },

  // 获取用户信息
  getUserInfo: async (userId) => {
    try {
      const response = await userService.getUserById(userId)
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取用户信息失败' }
    }
  },

  // 获取所有用户
  getAllUsers: async (params = {}) => {
    try {
      const response = await userService.getUserList(params)
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取用户列表失败' }
    }
  },

  // 添加用户
  addUser: async (userData) => {
    try {
      const response = await userService.addUser(userData)
      return response
    } catch (error) {
      return { success: false, message: error.message || '添加用户失败' }
    }
  },

  // 更新用户
  updateUser: async (userId, userData) => {
    try {
      const response = await userService.updateUser(userId, userData)
      return response
    } catch (error) {
      return { success: false, message: error.message || '更新用户失败' }
    }
  },

  // 删除用户
  deleteUser: async (userId) => {
    try {
      const response = await userService.deleteUser(userId)
      return response
    } catch (error) {
      return { success: false, message: error.message || '删除用户失败' }
    }
  },

  // 调整用户赞赞星
  adjustUserStars: async (userId, starData) => {
    try {
      const response = await userService.adjustUserStars(userId, starData)
      return response
    } catch (error) {
      return { success: false, message: error.message || '调整用户赞赞星失败' }
    }
  }
}

// 赞赞星相关API
export const starApi = {
  // 赠送赞赞星
  giveStars: async (fromUserId, toUserId, stars, reason, customReason) => {
    try {
      const giveData = {
        toUserId,
        stars,
        reason,
        customReason
      }
      const response = await starsService.giveStars(giveData)
      return response
    } catch (error) {
      return { success: false, message: error.message || '赠送赞赞星失败' }
    }
  },

  // 获取赠送记录
  getGiveRecords: async (userId = null) => {
    try {
      const params = userId ? { type: 'all' } : {}
      const response = await starsService.getGiveRecords(params)
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取赠送记录失败' }
    }
  },

  // 奖励赞赞星
  awardStars: async (userIds, stars, reason) => {
    try {
      const awardData = { userIds, stars, reason }
      const response = await starsService.awardStars(awardData)
      return response
    } catch (error) {
      return { success: false, message: error.message || '奖励赞赞星失败' }
    }
  },

  // 获取系统统计
  getSystemStats: async () => {
    try {
      const response = await starsService.getStatistics()
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取系统统计失败' }
    }
  }
}

// 礼品相关API
export const giftApi = {
  // 获取所有礼品
  getAllGifts: async () => {
    try {
      const response = await giftsService.getGiftList()
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取礼品列表失败' }
    }
  },

  // 获取可用礼品
  getAvailableGifts: async () => {
    try {
      const response = await giftsService.getAvailableGifts()
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取可用礼品失败' }
    }
  },

  // 添加礼品
  addGift: async (giftData) => {
    try {
      const response = await giftsService.addGift(giftData)
      return response
    } catch (error) {
      return { success: false, message: error.message || '添加礼品失败' }
    }
  },

  // 更新礼品
  updateGift: async (giftId, giftData) => {
    try {
      const response = await giftsService.updateGift(giftId, giftData)
      return response
    } catch (error) {
      return { success: false, message: error.message || '更新礼品失败' }
    }
  },

  // 删除礼品
  deleteGift: async (giftId) => {
    try {
      const response = await giftsService.deleteGift(giftId)
      return response
    } catch (error) {
      return { success: false, message: error.message || '删除礼品失败' }
    }
  },

  // 切换礼品状态
  toggleGiftStatus: async (giftId) => {
    try {
      // 这里需要先获取礼品信息，然后切换状态
      const gift = await giftsService.getGiftById(giftId)
      if (gift.success) {
        const updatedData = { isActive: !gift.data.isActive }
        const response = await giftsService.updateGift(giftId, updatedData)
        return response
      }
      return { success: false, message: '获取礼品信息失败' }
    } catch (error) {
      return { success: false, message: error.message || '切换礼品状态失败' }
    }
  },

  // 兑换礼品
  redeemGift: async (userId, giftId, deliveryInfo) => {
    try {
      const response = await giftsService.redeemGift(giftId, deliveryInfo)
      return response
    } catch (error) {
      return { success: false, message: error.message || '兑换礼品失败' }
    }
  },

  // 获取兑换记录
  getRedemptions: async (userId = null) => {
    try {
      const response = userId 
        ? await giftsService.getUserRedemptions()
        : await giftsService.getAllRedemptions()
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取兑换记录失败' }
    }
  }
}

// 排名相关API
export const rankingApi = {
  // 获取排名
  getRankings: async (type = 'year') => {
    try {
      const response = await rankingsService.getRankings({ period: type })
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取排名失败' }
    }
  },

  // 获取用户排名
  getUserRanking: async (userId, type = 'year') => {
    try {
      const response = await rankingsService.getUserRanking(userId, { period: type })
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取用户排名失败' }
    }
  }
}

// 弹幕相关API
export const bulletScreenApi = {
  // 获取弹幕设置
  getBulletSettings: async () => {
    try {
      const response = await bulletsService.getBulletSettings()
      return response
    } catch (error) {
      return { success: false, message: error.message || '获取弹幕设置失败' }
    }
  },

  // 更新弹幕设置
  updateBulletSettings: async (settings) => {
    try {
      const response = await bulletsService.batchUpdateBulletSettings(settings)
      return response
    } catch (error) {
      return { success: false, message: error.message || '更新弹幕设置失败' }
    }
  },

  // 发送测试弹幕
  sendTestBullet: async (type, content) => {
    try {
      const response = await bulletsService.sendTestBullet({ type, content })
      return response
    } catch (error) {
      return { success: false, message: error.message || '发送测试弹幕失败' }
    }
  }
}

// 文件上传API
export const uploadApi = {
  // 上传图片
  uploadImage: async (file) => {
    try {
      const response = await giftsService.uploadGiftImage(file)
      return response
    } catch (error) {
      return { success: false, message: error.message || '上传图片失败' }
    }
  },

  // 批量导入用户
  importUsers: async (file) => {
    try {
      const response = await userService.importUsers(file)
      return response
    } catch (error) {
      return { success: false, message: error.message || '批量导入用户失败' }
    }
  },

  // 导出数据
  exportData: async (type, data) => {
    try {
      let response
      switch (type) {
        case 'users':
          response = await userService.exportUsers(data)
          break
        case 'stars':
          response = await starsService.exportStarsData(data)
          break
        case 'gifts':
          response = await giftsService.exportGiftData(data)
          break
        case 'rankings':
          response = await rankingsService.exportRankingData(data)
          break
        default:
          throw new Error('不支持的导出类型')
      }
      return response
    } catch (error) {
      return { success: false, message: error.message || '导出数据失败' }
    }
  }
}
