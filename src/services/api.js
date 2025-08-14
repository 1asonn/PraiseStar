// 模拟API服务
import { 
  mockUsers, 
  mockGifts, 
  mockRedemptions, 
  mockGiveRecords,
  getUserRankings,
  getSystemStats
} from '../data/mockData'

// 模拟网络延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟API响应
const createResponse = (data, success = true, message = '') => ({
  success,
  data,
  message
})

// 用户相关API
export const userApi = {
  // 登录
  login: async (phone) => {
    await delay()
    const user = mockUsers.find(u => u.phone === phone)
    if (user) {
      return createResponse(user, true, '登录成功')
    }
    return createResponse(null, false, '用户不存在')
  },

  // 获取用户信息
  getUserInfo: async (userId) => {
    await delay()
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      return createResponse(user, true)
    }
    return createResponse(null, false, '用户不存在')
  },

  // 获取所有用户
  getAllUsers: async () => {
    await delay()
    return createResponse(mockUsers, true)
  },

  // 添加用户
  addUser: async (userData) => {
    await delay()
    const newUser = {
      ...userData,
      id: Date.now(),
      monthlyAllocation: userData.isAdmin ? 200 : 100,
      availableToGive: userData.isAdmin ? 200 : 100,
      receivedThisMonth: 0,
      receivedThisQuarter: 0,
      receivedThisYear: 0,
      redeemedThisYear: 0,
      availableToRedeem: 0,
      ranking: mockUsers.length + 1
    }
    return createResponse(newUser, true, '用户添加成功')
  },

  // 更新用户
  updateUser: async (userId, userData) => {
    await delay()
    return createResponse({ ...userData, id: userId }, true, '用户更新成功')
  },

  // 删除用户
  deleteUser: async (userId) => {
    await delay()
    return createResponse(null, true, '用户删除成功')
  },

  // 调整用户赞赞星
  adjustUserStars: async (userId, starData) => {
    await delay()
    return createResponse(starData, true, '赞赞星调整成功')
  }
}

// 赞赞星相关API
export const starApi = {
  // 赠送赞赞星
  giveStars: async (fromUserId, toUserId, stars, reason, customReason) => {
    await delay()
    const giveRecord = {
      id: Date.now(),
      fromUserId,
      toUserId,
      stars,
      reason,
      customReason,
      createTime: new Date().toLocaleString()
    }
    return createResponse(giveRecord, true, '赞赞星赠送成功')
  },

  // 获取赠送记录
  getGiveRecords: async (userId = null) => {
    await delay()
    let records = mockGiveRecords
    if (userId) {
      records = records.filter(r => r.fromUserId === userId || r.toUserId === userId)
    }
    return createResponse(records, true)
  },

  // 奖励赞赞星
  awardStars: async (userIds, stars, reason) => {
    await delay()
    return createResponse(null, true, '奖励赞赞星成功')
  },

  // 获取系统统计
  getSystemStats: async () => {
    await delay()
    return createResponse(getSystemStats(), true)
  }
}

// 礼品相关API
export const giftApi = {
  // 获取所有礼品
  getAllGifts: async () => {
    await delay()
    return createResponse(mockGifts, true)
  },

  // 获取可用礼品
  getAvailableGifts: async () => {
    await delay()
    const availableGifts = mockGifts.filter(g => g.isActive && g.stock > 0)
    return createResponse(availableGifts, true)
  },

  // 添加礼品
  addGift: async (giftData) => {
    await delay()
    const newGift = {
      ...giftData,
      id: Date.now(),
      isActive: true
    }
    return createResponse(newGift, true, '礼品添加成功')
  },

  // 更新礼品
  updateGift: async (giftId, giftData) => {
    await delay()
    return createResponse({ ...giftData, id: giftId }, true, '礼品更新成功')
  },

  // 删除礼品
  deleteGift: async (giftId) => {
    await delay()
    return createResponse(null, true, '礼品删除成功')
  },

  // 切换礼品状态
  toggleGiftStatus: async (giftId) => {
    await delay()
    return createResponse(null, true, '礼品状态更新成功')
  },

  // 兑换礼品
  redeemGift: async (userId, giftId, deliveryInfo) => {
    await delay()
    const redemption = {
      id: Date.now(),
      userId,
      giftId,
      ...deliveryInfo,
      createTime: new Date().toLocaleString(),
      status: '处理中'
    }
    return createResponse(redemption, true, '礼品兑换成功')
  },

  // 获取兑换记录
  getRedemptions: async (userId = null) => {
    await delay()
    let redemptions = mockRedemptions
    if (userId) {
      redemptions = redemptions.filter(r => r.userId === userId)
    }
    return createResponse(redemptions, true)
  }
}

// 排名相关API
export const rankingApi = {
  // 获取排名
  getRankings: async (type = 'year') => {
    await delay()
    const rankings = getUserRankings()
    return createResponse(rankings, true)
  },

  // 获取用户排名
  getUserRanking: async (userId, type = 'year') => {
    await delay()
    const rankings = getUserRankings()
    const userRanking = rankings.find(r => r.id === userId)
    return createResponse(userRanking, true)
  }
}

// 弹幕相关API
export const bulletScreenApi = {
  // 获取弹幕设置
  getBulletSettings: async () => {
    await delay()
    const settings = {
      giveEnabled: true,
      giveThreshold: 10,
      rankingEnabled: true,
      rankingTime: '09:00',
      achievementEnabled: true,
      achievementThreshold: 66,
      congratulationEnabled: true
    }
    return createResponse(settings, true)
  },

  // 更新弹幕设置
  updateBulletSettings: async (settings) => {
    await delay()
    return createResponse(settings, true, '弹幕设置保存成功')
  },

  // 发送测试弹幕
  sendTestBullet: async (type, content) => {
    await delay()
    return createResponse(null, true, '测试弹幕发送成功')
  }
}

// 文件上传API
export const uploadApi = {
  // 上传图片
  uploadImage: async (file) => {
    await delay(1000)
    // 模拟上传成功，返回图片URL
    const imageUrl = `/images/uploaded/${Date.now()}.jpg`
    return createResponse({ url: imageUrl }, true, '图片上传成功')
  },

  // 批量导入用户
  importUsers: async (file) => {
    await delay(2000)
    return createResponse({ count: 10 }, true, '批量导入成功，共导入10个用户')
  },

  // 导出数据
  exportData: async (type, data) => {
    await delay(1000)
    return createResponse({ downloadUrl: `/export/${type}_${Date.now()}.xlsx` }, true, '数据导出成功')
  }
}
