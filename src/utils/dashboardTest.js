// 用户仪表板API集成测试工具
export const dashboardTest = {
  // 测试获取用户信息
  testUserProfile: async () => {
    try {
      console.log('🧪 测试获取用户信息...')
      const { userService } = await import('../services/userService')
      const response = await userService.getProfile()
      console.log('✅ 用户信息获取成功:', response.data)
      return response
    } catch (error) {
      console.error('❌ 用户信息获取失败:', error)
      throw error
    }
  },

  // 测试获取赠送记录
  testGiveRecords: async () => {
    try {
      console.log('🧪 测试获取赠送记录...')
      const { starsService } = await import('../services/starsService')
      
      const [receivedRes, givenRes] = await Promise.all([
        starsService.getGiveRecords({ type: 'received', page: 1, limit: 5 }),
        starsService.getGiveRecords({ type: 'sent', page: 1, limit: 5 })
      ])
      
      console.log('✅ 收到的记录:', receivedRes.data)
      console.log('✅ 赠送的记录:', givenRes.data)
      
      return { received: receivedRes, given: givenRes }
    } catch (error) {
      console.error('❌ 赠送记录获取失败:', error)
      throw error
    }
  },

  // 测试获取排名信息
  testRanking: async () => {
    try {
      console.log('🧪 测试获取排名信息...')
      const { rankingsService } = await import('../services/rankingsService')
      const response = await rankingsService.getMyRanking({ period: 'month' })
      console.log('✅ 排名信息获取成功:', response.data)
      return response
    } catch (error) {
      console.error('❌ 排名信息获取失败:', error)
      throw error
    }
  },

  // 完整测试
  runFullTest: async () => {
    console.log('🚀 开始用户仪表板API集成测试...')
    
    try {
      const results = await Promise.allSettled([
        dashboardTest.testUserProfile(),
        dashboardTest.testGiveRecords(),
        dashboardTest.testRanking()
      ])
      
      console.log('📊 测试结果汇总:')
      results.forEach((result, index) => {
        const testNames = ['用户信息', '赠送记录', '排名信息']
        if (result.status === 'fulfilled') {
          console.log(`✅ ${testNames[index]}: 成功`)
        } else {
          console.log(`❌ ${testNames[index]}: 失败 - ${result.reason.message}`)
        }
      })
      
      return results
    } catch (error) {
      console.error('❌ 测试执行失败:', error)
      throw error
    }
  },

  // 测试数据展示
  testDataDisplay: () => {
    console.log('🧪 测试数据展示...')
    
    const testData = dashboardTest.testWithMockData()
    
    // 模拟组件状态
    const mockState = {
      recentReceived: testData.receivedRecords,
      recentGiven: testData.givenRecords,
      currentUser: testData.user,
      myRanking: testData.ranking
    }
    
    console.log('📊 模拟组件状态:', mockState)
    
    // 测试时间格式化
    const formatTime = (timeStr) => {
      if (!timeStr) return '未知时间'
      
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
    
    // 测试理由显示
    const getDisplayReason = (item) => {
      if (item.reason === '其他' && item.custom_reason) {
        return item.custom_reason
      }
      return item.reason || '无理由'
    }
    
    console.log('⏰ 时间格式化测试:')
    mockState.recentReceived.forEach(record => {
      console.log(`  ${record.from_user_name} -> ${formatTime(record.created_at)}`)
    })
    
         console.log('📝 理由显示测试:')
     mockState.recentReceived.forEach(record => {
       console.log(`  ${record.from_user_name}: ${getDisplayReason(record)}`)
     })
     
     console.log('🏢 部门信息测试:')
     mockState.recentReceived.forEach(record => {
       console.log(`  ${record.from_user_name} (${record.from_user_department}) -> ${record.to_user_name} (${record.to_user_department})`)
     })
    
    console.log('✅ 数据展示测试完成')
    return mockState
  },

  // 模拟数据测试（用于开发环境）
  testWithMockData: () => {
    console.log('🧪 使用模拟数据进行测试...')
    
    const mockUser = {
      id: 1,
      name: '测试用户',
      phone: '13800138001',
      department: '测试部门',
      position: '测试职位',
      isAdmin: false,
      monthlyAllocation: 100,
      availableToGive: 80,
      receivedThisMonth: 45,
      receivedThisQuarter: 135,
      receivedThisYear: 450,
      redeemedThisYear: 132,
      availableToRedeem: 318,
      ranking: 5
    }
    
         const mockReceivedRecords = [
       {
         id: 6,
         stars: 5,
         reason: "其他",
         custom_reason: null,
         created_at: "2025-08-24T16:28:20.000Z",
         from_user_id: 14,
         from_user_name: "测试用户2",
         from_user_department: "产品部",
         to_user_id: 13,
         to_user_name: "测试用户1",
         to_user_department: "研发中心"
       }
     ]
    
    const mockGivenRecords = [
      {
        id: 9,
        stars: 1,
        reason: "帮助同事",
        custom_reason: null,
        created_at: "2025-08-22T12:45:03.000Z",
        from_user_id: 13,
        from_user_name: "测试用户1",
        from_user_department: "研发中心",
        to_user_id: 17,
        to_user_name: "测试用户5",
        to_user_department: "设计部"
      }
    ]
    
    const mockRanking = {
      rank: 5,
      totalStars: 450,
      period: 'month'
    }
    
    console.log('✅ 模拟用户数据:', mockUser)
    console.log('✅ 模拟收到的记录:', mockReceivedRecords)
    console.log('✅ 模拟赠送的记录:', mockGivenRecords)
    console.log('✅ 模拟排名数据:', mockRanking)
    
    return { 
      user: mockUser, 
      receivedRecords: mockReceivedRecords, 
      givenRecords: mockGivenRecords, 
      ranking: mockRanking 
    }
  }
}

// 在开发环境下自动挂载到window对象
if (process.env.NODE_ENV === 'development') {
  window.dashboardTest = dashboardTest
  console.log('🛠️ 用户仪表板测试工具已加载到 window.dashboardTest')
  console.log('可用命令:')
  console.log('  - dashboardTest.testUserProfile() - 测试用户信息获取')
  console.log('  - dashboardTest.testGiveRecords() - 测试赠送记录获取')
  console.log('  - dashboardTest.testRanking() - 测试排名信息获取')
  console.log('  - dashboardTest.runFullTest() - 运行完整测试')
  console.log('  - dashboardTest.testWithMockData() - 使用模拟数据测试')
  console.log('  - dashboardTest.testDataDisplay() - 测试数据展示')
}

export default dashboardTest
