// Mock用户数据
export const mockUsers = [
  {
    id: 1,
    name: '袁倩倩',
    phone: '13800138001',
    department: '人力行政部',
    position: '部门负责人',
    isAdmin: true,
    monthlyAllocation: 200, // 每月分配的赞赞星
    availableToGive: 150, // 本月可赠送的赞赞星
    receivedThisMonth: 88, // 本月获赠
    receivedThisQuarter: 266, // 本季度累计获赠
    receivedThisYear: 888, // 年度累计获赠
    redeemedThisYear: 132, // 年度累计已兑换
    availableToRedeem: 756, // 剩余可兑换
    ranking: 3 // 排名
  },
  {
    id: 2,
    name: '王倩',
    phone: '13800138002',
    department: '人力行政部',
    position: 'HR专员',
    isAdmin: true,
    monthlyAllocation: 200,
    availableToGive: 120,
    receivedThisMonth: 95,
    receivedThisQuarter: 285,
    receivedThisYear: 950,
    redeemedThisYear: 198,
    availableToRedeem: 752,
    ranking: 2
  },
  {
    id: 3,
    name: '李婷',
    phone: '13800138003',
    department: '人力行政部',
    position: 'HR专员',
    isAdmin: true,
    monthlyAllocation: 200,
    availableToGive: 180,
    receivedThisMonth: 72,
    receivedThisQuarter: 216,
    receivedThisYear: 720,
    redeemedThisYear: 66,
    availableToRedeem: 654,
    ranking: 5
  },
  {
    id: 4,
    name: '耿豪',
    phone: '13800138004',
    department: '总经理办',
    position: '总经理',
    isAdmin: false,
    monthlyAllocation: 300,
    availableToGive: 250,
    receivedThisMonth: 120,
    receivedThisQuarter: 360,
    receivedThisYear: 1200,
    redeemedThisYear: 264,
    availableToRedeem: 936,
    ranking: 1
  },
  {
    id: 5,
    name: '超越',
    phone: '13800138005',
    department: '总经理办',
    position: '副总经理',
    isAdmin: false,
    monthlyAllocation: 300,
    availableToGive: 200,
    receivedThisMonth: 98,
    receivedThisQuarter: 294,
    receivedThisYear: 980,
    redeemedThisYear: 198,
    availableToRedeem: 782,
    ranking: 2
  },
  {
    id: 6,
    name: '张三',
    phone: '13800138006',
    department: '研发中心',
    position: '前端工程师',
    isAdmin: false,
    monthlyAllocation: 100,
    availableToGive: 80,
    receivedThisMonth: 45,
    receivedThisQuarter: 135,
    receivedThisYear: 450,
    redeemedThisYear: 132,
    availableToRedeem: 318,
    ranking: 8
  },
  {
    id: 7,
    name: '李四',
    phone: '13800138007',
    department: '研发中心',
    position: '后端工程师',
    isAdmin: false,
    monthlyAllocation: 100,
    availableToGive: 60,
    receivedThisMonth: 68,
    receivedThisQuarter: 204,
    receivedThisYear: 680,
    redeemedThisYear: 66,
    availableToRedeem: 614,
    ranking: 6
  },
  {
    id: 8,
    name: '王五',
    phone: '13800138008',
    department: '市场部',
    position: '市场专员',
    isAdmin: false,
    monthlyAllocation: 100,
    availableToGive: 90,
    receivedThisMonth: 52,
    receivedThisQuarter: 156,
    receivedThisYear: 520,
    redeemedThisYear: 198,
    availableToRedeem: 322,
    ranking: 7
  }
]

// 赠送理由选项
export const giveReasons = [
  '符合公司文化价值观',
  '业绩/工作表现好',
  '鼓励',
  '感谢',
  '祝贺',
  '送鸡汤',
  '其他'
]

// Mock礼品数据
export const mockGifts = [
  {
    id: 1,
    name: '星巴克咖啡券',
    image: '/images/starbucks.jpg',
    starsCost: 66,
    stock: 50,
    description: '星巴克任意饮品券，有效期3个月',
    isActive: true
  },
  {
    id: 2,
    name: '小米充电宝',
    image: '/images/powerbank.jpg',
    starsCost: 132,
    stock: 20,
    description: '小米10000mAh快充移动电源',
    isActive: true
  },
  {
    id: 3,
    name: '定制保温杯',
    image: '/images/thermos.jpg',
    starsCost: 99,
    stock: 30,
    description: '公司LOGO定制保温杯，316不锈钢',
    isActive: true
  },
  {
    id: 4,
    name: '京东购物卡',
    image: '/images/jd-card.jpg',
    starsCost: 200,
    stock: 15,
    description: '京东100元购物卡',
    isActive: true
  },
  {
    id: 5,
    name: '蓝牙耳机',
    image: '/images/earphones.jpg',
    starsCost: 300,
    stock: 10,
    description: '无线蓝牙耳机，降噪功能',
    isActive: true
  },
  {
    id: 6,
    name: '健身房月卡',
    image: '/images/gym.jpg',
    starsCost: 400,
    stock: 5,
    description: '附近健身房一个月会员卡',
    isActive: false
  }
]

// Mock兑换记录
export const mockRedemptions = [
  {
    id: 1,
    userId: 1,
    userName: '袁倩倩',
    giftId: 1,
    giftName: '星巴克咖啡券',
    starsCost: 66,
    deliveryMethod: '现场领取',
    address: '',
    recipientName: '',
    recipientPhone: '',
    createTime: '2024-12-01 10:30:00',
    status: '已完成'
  },
  {
    id: 2,
    userId: 2,
    userName: '王倩',
    giftId: 2,
    giftName: '小米充电宝',
    starsCost: 132,
    deliveryMethod: '邮寄',
    address: '北京市朝阳区xxx街道xxx号',
    recipientName: '王倩',
    recipientPhone: '13800138002',
    createTime: '2024-12-02 14:20:00',
    status: '配送中'
  }
]

// Mock赠送记录
export const mockGiveRecords = [
  {
    id: 1,
    fromUserId: 1,
    fromUserName: '袁倩倩',
    toUserId: 4,
    toUserName: '耿豪',
    stars: 10,
    reason: '业绩/工作表现好',
    customReason: '',
    createTime: '2024-12-15 09:30:00'
  },
  {
    id: 2,
    fromUserId: 2,
    fromUserName: '王倩',
    toUserId: 6,
    toUserName: '张三',
    stars: 15,
    reason: '其他',
    customReason: '项目完成得很出色，值得表扬',
    createTime: '2024-12-15 11:45:00'
  },
  {
    id: 3,
    fromUserId: 3,
    fromUserName: '李婷',
    toUserId: 7,
    toUserName: '李四',
    stars: 8,
    reason: '感谢',
    customReason: '',
    createTime: '2024-12-15 16:20:00'
  }
]

// 获取用户排名数据
export const getUserRankings = () => {
  return mockUsers
    .map(user => ({
      id: user.id,
      name: user.name,
      department: user.department,
      receivedThisYear: user.receivedThisYear,
      ranking: user.ranking
    }))
    .sort((a, b) => b.receivedThisYear - a.receivedThisYear)
    .map((user, index) => ({
      ...user,
      ranking: index + 1
    }))
}

// 获取系统统计数据
export const getSystemStats = () => {
  const totalUsers = mockUsers.length
  const totalAllocatedThisMonth = mockUsers.reduce((sum, user) => sum + user.monthlyAllocation, 0)
  const totalGivenThisMonth = mockUsers.reduce((sum, user) => sum + (user.monthlyAllocation - user.availableToGive), 0)
  const usersWhoGave = mockUsers.filter(user => user.availableToGive < user.monthlyAllocation).length
  const usersWhoReceived = mockUsers.filter(user => user.receivedThisMonth > 0).length
  const totalReceivedThisMonth = mockUsers.reduce((sum, user) => sum + user.receivedThisMonth, 0)
  const totalRemainingThisMonth = mockUsers.reduce((sum, user) => sum + user.availableToGive, 0)

  return {
    totalUsers,
    totalAllocatedThisMonth,
    totalGivenThisMonth,
    usersWhoGave,
    usersWhoReceived,
    totalReceivedThisMonth,
    totalRemainingThisMonth
  }
}
