// Record页面测试工具
export const recordTest = {
  // 测试获取历史记录
  testGetRecords: async (params = {}) => {
    try {
      console.log('🧪 测试获取历史记录...')
      const { starsService } = await import('../services/starsService')
      
      const defaultParams = {
        type: 'all',
        page: 1,
        limit: 20,
        ...params
      }
      
      console.log('📋 请求参数:', defaultParams)
      const response = await starsService.getGiveRecords(defaultParams)
      
      console.log('✅ 获取记录成功:', response.data)
      return response
    } catch (error) {
      console.error('❌ 获取记录失败:', error)
      throw error
    }
  },

  // 测试不同时间范围的筛选
  testTimeRangeFilters: async () => {
    console.log('🧪 测试时间范围筛选...')
    
    const timeRanges = [
      { name: '今天', params: { startDate: '2025-01-27', endDate: '2025-01-27' } },
      { name: '本周', params: { startDate: '2025-01-20', endDate: '2025-01-26' } },
      { name: '本月', params: { startDate: '2025-01-01', endDate: '2025-01-31' } },
      { name: '今年', params: { startDate: '2025-01-01', endDate: '2025-12-31' } }
    ]
    
    const results = []
    
    for (const range of timeRanges) {
      try {
        console.log(`📅 测试 ${range.name} 筛选...`)
        const response = await recordTest.testGetRecords(range.params)
        results.push({
          name: range.name,
          success: true,
          count: response.data.records?.length || response.data?.length || 0
        })
      } catch (error) {
        results.push({
          name: range.name,
          success: false,
          error: error.message
        })
      }
    }
    
    console.log('📊 时间范围筛选测试结果:', results)
    return results
  },

  // 测试记录类型筛选
  testTypeFilters: async () => {
    console.log('🧪 测试记录类型筛选...')
    
    const types = ['all', 'received', 'given']
    const results = []
    
    for (const type of types) {
      try {
        console.log(`📋 测试 ${type} 类型筛选...`)
        const response = await recordTest.testGetRecords({ type })
        results.push({
          type,
          success: true,
          count: response.data.records?.length || response.data?.length || 0
        })
      } catch (error) {
        results.push({
          type,
          success: false,
          error: error.message
        })
      }
    }
    
    console.log('📊 类型筛选测试结果:', results)
    return results
  },

  // 测试数据汇总计算
  testSummaryCalculation: (records, userId) => {
    console.log('🧪 测试数据汇总计算...')
    
    if (!records || !Array.isArray(records)) {
      console.error('❌ 记录数据无效')
      return null
    }
    
    const receivedRecords = records.filter(record => record.to_user_id === userId)
    const givenRecords = records.filter(record => record.from_user_id === userId)
    
    const summary = {
      totalReceived: receivedRecords.reduce((sum, record) => sum + record.stars, 0),
      totalGiven: givenRecords.reduce((sum, record) => sum + record.stars, 0),
      totalReceivedCount: receivedRecords.length,
      totalGivenCount: givenRecords.length
    }
    
    console.log('📊 汇总计算结果:', summary)
    console.log('📋 收到记录详情:', receivedRecords)
    console.log('📋 赠送记录详情:', givenRecords)
    
    return summary
  },

  // 测试模拟数据
  testWithMockData: () => {
    console.log('🧪 使用模拟数据测试...')
    
    const mockRecords = [
      {
        id: 1,
        stars: 5,
        reason: "帮助同事",
        custom_reason: null,
        created_at: "2025-01-27T10:30:00.000Z",
        from_user_id: 14,
        from_user_name: "张三",
        from_user_department: "产品部",
        to_user_id: 13,
        to_user_name: "李四",
        to_user_department: "研发中心"
      },
      {
        id: 2,
        stars: 3,
        reason: "其他",
        custom_reason: "工作认真负责",
        created_at: "2025-01-26T15:20:00.000Z",
        from_user_id: 13,
        from_user_name: "李四",
        from_user_department: "研发中心",
        to_user_id: 14,
        to_user_name: "张三",
        to_user_department: "产品部"
      },
      {
        id: 3,
        stars: 2,
        reason: "团队协作",
        custom_reason: null,
        created_at: "2025-01-25T09:15:00.000Z",
        from_user_id: 15,
        from_user_name: "王五",
        from_user_department: "设计部",
        to_user_id: 13,
        to_user_name: "李四",
        to_user_department: "研发中心"
      }
    ]
    
    console.log('✅ 模拟记录数据:', mockRecords)
    
    // 测试汇总计算
    const summary = recordTest.testSummaryCalculation(mockRecords, 13)
    
    return {
      records: mockRecords,
      summary
    }
  },

  // 完整测试
  runFullTest: async () => {
    console.log('🚀 开始Record页面完整测试...')
    
    try {
      // 1. 测试基本记录获取
      console.log('\n📋 1. 测试基本记录获取')
      const basicResponse = await recordTest.testGetRecords()
      
      // 2. 测试时间范围筛选
      console.log('\n📅 2. 测试时间范围筛选')
      const timeRangeResults = await recordTest.testTimeRangeFilters()
      
      // 3. 测试类型筛选
      console.log('\n📋 3. 测试类型筛选')
      const typeResults = await recordTest.testTypeFilters()
      
      // 4. 测试数据汇总
      console.log('\n📊 4. 测试数据汇总')
      const records = basicResponse.data.records || basicResponse.data || []
      const summary = recordTest.testSummaryCalculation(records, 13) // 假设用户ID为13
      
      // 5. 测试模拟数据
      console.log('\n🧪 5. 测试模拟数据')
      const mockData = recordTest.testWithMockData()
      
      // 6. UI组件测试
      console.log('\n🧪 6. UI组件测试')
      recordTest.testUIComponents()

      // 7. 响应式功能测试
      console.log('\n🧪 7. 响应式功能测试')
      recordTest.testResponsive()

      // 8. 移动端卡片渲染测试
      console.log('\n🧪 8. 移动端卡片渲染测试')
      recordTest.testMobileCardRendering()

      // 9. 懒加载功能测试
      console.log('\n🧪 9. 懒加载功能测试')
      recordTest.testLazyLoading()

      // 10. 分页功能测试
      console.log('\n🧪 10. 分页功能测试')
      recordTest.testPagination()
      
      const results = {
        basic: basicResponse.success,
        timeRange: timeRangeResults,
        type: typeResults,
        summary: summary,
        mockData: mockData
      }
      
      console.log('\n📊 Record页面测试结果汇总:', results)
      return results
      
    } catch (error) {
      console.error('❌ Record页面测试失败:', error)
      throw error
    }
  },

  // 测试UI组件功能
  testUIComponents: () => {
    console.log('🧪 测试UI组件功能...')
    
    // 模拟筛选器状态
    const mockFilters = {
      type: 'all',
      timeRange: 'month',
      startDate: null,
      endDate: null,
      page: 1,
      pageSize: 20
    }
    
    // 模拟表格列配置
    const mockColumns = [
      { title: '类型', key: 'type' },
      { title: '用户', key: 'user' },
      { title: '赞赞星', key: 'stars' },
      { title: '理由', key: 'reason' },
      { title: '时间', key: 'created_at' }
    ]
    
    // 模拟分页配置
    const mockPagination = {
      current: 1,
      pageSize: 20,
      total: 100,
      showSizeChanger: true,
      showQuickJumper: true
    }
    
    console.log('✅ 筛选器配置:', mockFilters)
    console.log('✅ 表格列配置:', mockColumns)
    console.log('✅ 分页配置:', mockPagination)
    
    return {
      filters: mockFilters,
      columns: mockColumns,
      pagination: mockPagination
    }
  },

  // 测试响应式功能
  testResponsive: () => {
    console.log('🧪 测试响应式功能...')
    
    const screenSizes = [
      { name: '移动端', width: 375, isMobile: true },
      { name: '平板端', width: 768, isMobile: false },
      { name: '桌面端', width: 1200, isMobile: false }
    ]
    
    const results = screenSizes.map(size => {
      // 模拟窗口大小变化
      const originalWidth = window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: size.width
      })
      
      // 触发resize事件
      window.dispatchEvent(new Event('resize'))
      
      const isMobile = size.width <= 768
      
      // 恢复原始宽度
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalWidth
      })
      
      return {
        name: size.name,
        width: size.width,
        expectedMobile: size.isMobile,
        actualMobile: isMobile,
        match: size.isMobile === isMobile
      }
    })
    
    console.log('📱 响应式测试结果:', results)
    return results
  },

    // 测试移动端卡片渲染
  testMobileCardRendering: () => {
    console.log('🧪 测试移动端卡片渲染...')

    const mockRecord = {
      id: 1,
      stars: 5,
      reason: "帮助同事",
      custom_reason: null,
      created_at: "2025-01-27T10:30:00.000Z",
      from_user_id: 14,
      from_user_name: "张三",
      from_user_department: "产品部",
      to_user_id: 13,
      to_user_name: "李四",
      to_user_department: "研发中心"
    }

    const userId = 13
    const isReceived = mockRecord.to_user_id === userId
    const userName = isReceived ? mockRecord.from_user_name : mockRecord.to_user_name
    const userDepartment = isReceived ? mockRecord.from_user_department : mockRecord.to_user_department

    const cardData = {
      isReceived,
      userName,
      userDepartment,
      stars: mockRecord.stars,
      reason: mockRecord.reason === '其他' && mockRecord.custom_reason 
        ? mockRecord.custom_reason 
        : mockRecord.reason,
      time: new Date(mockRecord.created_at).toLocaleString('zh-CN')
    }

    console.log('✅ 移动端卡片数据:', cardData)
    console.log('✅ 卡片类型:', isReceived ? '收到' : '赠送')
    console.log('✅ 用户信息:', `${userName} (${userDepartment})`)
    console.log('✅ 赞赞星数量:', `${isReceived ? '+' : '-'}${mockRecord.stars}⭐`)
    console.log('✅ 理由:', cardData.reason)
    console.log('✅ 时间:', cardData.time)

    return cardData
  },

  // 测试懒加载功能
  testLazyLoading: () => {
    console.log('🧪 测试懒加载功能...')

    const mockState = {
      currentPage: 1,
      pageSize: 20,
      hasMore: true,
      loadingMore: false,
      records: [
        { id: 1, stars: 5, reason: "帮助同事", created_at: "2025-01-27T10:30:00.000Z" },
        { id: 2, stars: 3, reason: "团队协作", created_at: "2025-01-26T15:20:00.000Z" }
      ]
    }

    // 模拟加载更多
    const loadMore = () => {
      console.log('📥 加载更多数据...')
      mockState.loadingMore = true
      
      // 模拟异步加载
      setTimeout(() => {
        const newRecords = [
          { id: 3, stars: 2, reason: "工作认真", created_at: "2025-01-25T09:15:00.000Z" },
          { id: 4, stars: 4, reason: "创新思维", created_at: "2025-01-24T14:30:00.000Z" }
        ]
        
        mockState.records = [...mockState.records, ...newRecords]
        mockState.currentPage += 1
        mockState.loadingMore = false
        mockState.hasMore = mockState.currentPage < 5 // 模拟5页数据
        
        console.log('✅ 懒加载完成:', {
          totalRecords: mockState.records.length,
          currentPage: mockState.currentPage,
          hasMore: mockState.hasMore
        })
      }, 1000)
    }

    console.log('✅ 初始状态:', mockState)
    console.log('✅ 懒加载函数已准备就绪')
    
    return {
      state: mockState,
      loadMore
    }
  },

  // 测试分页功能
  testPagination: () => {
    console.log('🧪 测试分页功能...')

    const mockPagination = {
      current: 1,
      pageSize: 20,
      total: 100,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
    }

    console.log('✅ 分页配置:', mockPagination)
    console.log('✅ 分页信息:', mockPagination.showTotal(mockPagination.total, [1, 20]))

    return mockPagination
  }
}

// 在开发环境下自动挂载到window对象
if (process.env.NODE_ENV === 'development') {
  window.recordTest = recordTest
  console.log('🛠️ Record页面测试工具已加载到 window.recordTest')
  console.log('可用命令:')
  console.log('  - recordTest.testGetRecords() - 测试获取记录')
  console.log('  - recordTest.testTimeRangeFilters() - 测试时间范围筛选')
  console.log('  - recordTest.testTypeFilters() - 测试类型筛选')
  console.log('  - recordTest.testSummaryCalculation() - 测试汇总计算')
  console.log('  - recordTest.testWithMockData() - 使用模拟数据测试')
  console.log('  - recordTest.testUIComponents() - 测试UI组件')
           console.log('  - recordTest.testResponsive() - 测试响应式功能')
         console.log('  - recordTest.testMobileCardRendering() - 测试移动端卡片渲染')
         console.log('  - recordTest.testLazyLoading() - 测试懒加载功能')
         console.log('  - recordTest.testPagination() - 测试分页功能')
         console.log('  - recordTest.runFullTest() - 运行完整测试')
}

export default recordTest
