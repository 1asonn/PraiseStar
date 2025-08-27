// Gifts页面API集成测试工具
export const giftsTest = {
  // 测试礼品列表API
  testGiftListAPI: async () => {
    console.log('🧪 测试礼品列表API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
      const response = await giftsService.getGiftList()
      
      console.log('✅ 礼品列表API响应:', response)
      
             if (response.success) {
         console.log('✅ 礼品列表获取成功')
         console.log('  - 礼品数量:', response.data?.length || 0)
         console.log('  - 数据结构:', response.data?.[0] || '无数据')
         console.log('  - 分页信息:', response.pagination || '无分页')
       } else {
         console.log('❌ 礼品列表获取失败:', response.message)
       }
      
      return response
    } catch (error) {
      console.error('❌ 礼品列表API测试失败:', error)
      throw error
    }
  },

  // 测试兑换记录API
  testRedemptionsAPI: async () => {
    console.log('🧪 测试兑换记录API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
      const response = await giftsService.getAllRedemptions()
      
      console.log('✅ 兑换记录API响应:', response)
      
      if (response.success) {
        console.log('✅ 兑换记录获取成功')
        console.log('  - 记录数量:', response.data.redemptions?.length || 0)
        console.log('  - 数据结构:', response.data.redemptions?.[0] || '无数据')
      } else {
        console.log('❌ 兑换记录获取失败:', response.message)
      }
      
      return response
    } catch (error) {
      console.error('❌ 兑换记录API测试失败:', error)
      throw error
    }
  },

  // 测试统计信息API
  testStatisticsAPI: async () => {
    console.log('🧪 测试统计信息API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
      const response = await giftsService.getGiftStatistics()
      
      console.log('✅ 统计信息API响应:', response)
      
      if (response.success) {
        console.log('✅ 统计信息获取成功')
        console.log('  - 统计数据:', response.data)
      } else {
        console.log('❌ 统计信息获取失败:', response.message)
      }
      
      return response
    } catch (error) {
      console.error('❌ 统计信息API测试失败:', error)
      throw error
    }
  },

  // 测试添加礼品API
  testAddGiftAPI: async () => {
    console.log('🧪 测试添加礼品API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
             const testGiftData = {
         name: '测试礼品',
         description: '这是一个测试礼品',
         stars_cost: 100,
         stock: 10,
         sort_order: 1,
         image: '/images/gift-placeholder.jpg'
       }
      
      const response = await giftsService.addGift(testGiftData)
      
      console.log('✅ 添加礼品API响应:', response)
      
      if (response.success) {
        console.log('✅ 礼品添加成功')
        console.log('  - 新礼品ID:', response.data.gift?.id)
        console.log('  - 礼品信息:', response.data.gift)
      } else {
        console.log('❌ 礼品添加失败:', response.message)
      }
      
      return response
    } catch (error) {
      console.error('❌ 添加礼品API测试失败:', error)
      throw error
    }
  },

  // 测试更新礼品API
  testUpdateGiftAPI: async (giftId) => {
    console.log('🧪 测试更新礼品API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
             const updateData = {
         name: '更新后的测试礼品',
         description: '这是更新后的测试礼品描述',
         stars_cost: 150,
         stock: 15
       }
      
      const response = await giftsService.updateGift(giftId, updateData)
      
      console.log('✅ 更新礼品API响应:', response)
      
      if (response.success) {
        console.log('✅ 礼品更新成功')
        console.log('  - 更新后的礼品:', response.data.gift)
      } else {
        console.log('❌ 礼品更新失败:', response.message)
      }
      
      return response
    } catch (error) {
      console.error('❌ 更新礼品API测试失败:', error)
      throw error
    }
  },

  // 测试删除礼品API
  testDeleteGiftAPI: async (giftId) => {
    console.log('🧪 测试删除礼品API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
      const response = await giftsService.deleteGift(giftId)
      
      console.log('✅ 删除礼品API响应:', response)
      
      if (response.success) {
        console.log('✅ 礼品删除成功')
      } else {
        console.log('❌ 礼品删除失败:', response.message)
      }
      
      return response
    } catch (error) {
      console.error('❌ 删除礼品API测试失败:', error)
      throw error
    }
  },

  // 测试图片上传API
  testImageUploadAPI: async () => {
    console.log('🧪 测试图片上传API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
      
      // 创建一个测试文件
      const testFile = new File(['test image content'], 'test-image.jpg', {
        type: 'image/jpeg'
      })
      
      const response = await giftsService.uploadGiftImage(testFile)
      
      console.log('✅ 图片上传API响应:', response)
      
      if (response.success) {
        console.log('✅ 图片上传成功')
        console.log('  - 图片URL:', response.data.url)
      } else {
        console.log('❌ 图片上传失败:', response.message)
      }
      
      return response
    } catch (error) {
      console.error('❌ 图片上传API测试失败:', error)
      throw error
    }
  },

  // 测试导出功能API
  testExportAPI: async () => {
    console.log('🧪 测试导出功能API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
      const response = await giftsService.exportGiftData({
        type: 'redemptions'
      })
      
      console.log('✅ 导出功能API响应:', response)
      
      if (response.success) {
        console.log('✅ 导出功能成功')
        console.log('  - 下载URL:', response.data.downloadUrl)
      } else {
        console.log('❌ 导出功能失败:', response.message)
      }
      
      return response
    } catch (error) {
      console.error('❌ 导出功能API测试失败:', error)
      throw error
    }
  },

  // 测试兑换记录状态更新API
  testUpdateRedemptionStatusAPI: async (redemptionId) => {
    console.log('🧪 测试兑换记录状态更新API...')
    
    try {
      const { giftsService } = await import('../services/giftsService')
      const response = await giftsService.updateRedemptionStatus(redemptionId, {
        status: '配送中',
        adminNote: '测试状态更新'
      })
      
      console.log('✅ 兑换记录状态更新API响应:', response)
      
      if (response.success) {
        console.log('✅ 状态更新成功')
        console.log('  - 更新后的记录:', response.data.redemption)
      } else {
        console.log('❌ 状态更新失败:', response.message)
      }
      
      return response
    } catch (error) {
      console.error('❌ 兑换记录状态更新API测试失败:', error)
      throw error
    }
  },

  // 测试页面组件功能
  testPageComponents: () => {
    console.log('🧪 测试页面组件功能...')
    
    // 检查页面元素
    const elements = {
      giftTable: document.querySelector('.ant-table'),
      redemptionTable: document.querySelector('.ant-table'),
      addButton: document.querySelector('button[type="primary"]'),
      refreshButtons: document.querySelectorAll('button[icon*="reload"]'),
      exportButton: document.querySelector('button[icon*="download"]'),
      statistics: document.querySelectorAll('.ant-statistic')
    }
    
    console.log('✅ 页面元素检查:')
    Object.entries(elements).forEach(([name, element]) => {
      if (element) {
        console.log(`  - ${name}: 存在`)
      } else {
        console.log(`  - ${name}: 不存在`)
      }
    })
    
    // 检查统计数据
    const statValues = Array.from(document.querySelectorAll('.ant-statistic-content-value'))
    console.log('✅ 统计数据检查:')
    statValues.forEach((value, index) => {
      console.log(`  - 统计${index + 1}: ${value.textContent}`)
    })
    
    return elements
  },

  // 测试表单功能
  testFormFunctionality: () => {
    console.log('🧪 测试表单功能...')
    
    // 检查表单字段
    const formFields = {
      name: document.querySelector('input[name="name"]'),
      description: document.querySelector('textarea[name="description"]'),
      starsCost: document.querySelector('input[name="starsCost"]'),
      stock: document.querySelector('input[name="stock"]'),
      sortOrder: document.querySelector('input[name="sortOrder"]')
    }
    
    console.log('✅ 表单字段检查:')
    Object.entries(formFields).forEach(([name, field]) => {
      if (field) {
        console.log(`  - ${name}: 存在`)
      } else {
        console.log(`  - ${name}: 不存在`)
      }
    })
    
    return formFields
  },

  // 测试移动端响应式功能
  testMobileResponsive: () => {
    console.log('🧪 测试移动端响应式功能...')
    
    const isMobile = window.innerWidth <= 768
    console.log(`✅ 当前屏幕宽度: ${window.innerWidth}px`)
    console.log(`✅ 设备类型: ${isMobile ? '移动端' : '桌面端'}`)
    
    // 检查移动端卡片视图
    const giftCards = document.querySelectorAll('.ant-card')
    const giftTable = document.querySelector('.ant-table')
    
    if (isMobile) {
      console.log('✅ 移动端检查:')
      console.log(`  - 礼品卡片数量: ${giftCards.length}`)
      console.log(`  - 表格是否隐藏: ${!giftTable || giftTable.style.display === 'none'}`)
      
      // 检查卡片内容
      if (giftCards.length > 0) {
        const firstCard = giftCards[0]
        const cardImage = firstCard.querySelector('img')
        const cardTitle = firstCard.querySelector('div[style*="font-weight: bold"]')
        const cardDescription = firstCard.querySelector('div[style*="color: #666"]')
        
        console.log('  - 卡片图片:', cardImage ? '存在' : '不存在')
        console.log('  - 卡片标题:', cardTitle ? '存在' : '不存在')
        console.log('  - 卡片描述:', cardDescription ? '存在' : '不存在')
      }
    } else {
      console.log('✅ 桌面端检查:')
      console.log(`  - 表格是否存在: ${!!giftTable}`)
      console.log(`  - 卡片是否隐藏: ${giftCards.length === 0}`)
    }
    
    return {
      isMobile,
      screenWidth: window.innerWidth,
      giftCardsCount: giftCards.length,
      tableExists: !!giftTable
    }
  },

  // 完整测试
  runFullTest: async () => {
    console.log('🚀 开始Gifts页面完整测试...')
    
    try {
      // 1. 测试API功能
      console.log('\n📋 1. 测试API功能')
      const giftListTest = await giftsTest.testGiftListAPI()
      const redemptionsTest = await giftsTest.testRedemptionsAPI()
      const statisticsTest = await giftsTest.testStatisticsAPI()
      
      // 2. 测试页面组件
      console.log('\n📋 2. 测试页面组件')
      const componentsTest = giftsTest.testPageComponents()
      
             // 3. 测试表单功能
       console.log('\n📋 3. 测试表单功能')
       const formTest = giftsTest.testFormFunctionality()
       
       // 4. 测试移动端响应式功能
       console.log('\n📋 4. 测试移动端响应式功能')
       const mobileTest = giftsTest.testMobileResponsive()
       
       console.log('\n📊 测试结果汇总:')
       console.log('✅ 礼品列表API:', giftListTest?.success ? '正常' : '异常')
       console.log('✅ 兑换记录API:', redemptionsTest?.success ? '正常' : '异常')
       console.log('✅ 统计信息API:', statisticsTest?.success ? '正常' : '异常')
       console.log('✅ 页面组件:', componentsTest.giftTable ? '正常' : '异常')
       console.log('✅ 表单功能:', formTest.name ? '正常' : '异常')
       console.log('✅ 移动端响应式:', mobileTest.isMobile ? '移动端模式' : '桌面端模式')
      
      console.log('\n✅ Gifts页面测试完成')
      
             return {
         giftListTest,
         redemptionsTest,
         statisticsTest,
         componentsTest,
         formTest,
         mobileTest
       }
      
    } catch (error) {
      console.error('❌ Gifts页面测试失败:', error)
      throw error
    }
  }
}

// 在开发环境下自动挂载到window对象
if (process.env.NODE_ENV === 'development') {
  window.giftsTest = giftsTest
  console.log('🛠️ Gifts页面测试工具已加载到 window.giftsTest')
  console.log('可用命令:')
  console.log('  - giftsTest.testGiftListAPI() - 测试礼品列表API')
  console.log('  - giftsTest.testRedemptionsAPI() - 测试兑换记录API')
  console.log('  - giftsTest.testStatisticsAPI() - 测试统计信息API')
  console.log('  - giftsTest.testAddGiftAPI() - 测试添加礼品API')
  console.log('  - giftsTest.testUpdateGiftAPI(giftId) - 测试更新礼品API')
  console.log('  - giftsTest.testDeleteGiftAPI(giftId) - 测试删除礼品API')
  console.log('  - giftsTest.testImageUploadAPI() - 测试图片上传API')
  console.log('  - giftsTest.testExportAPI() - 测试导出功能API')
  console.log('  - giftsTest.testUpdateRedemptionStatusAPI(redemptionId) - 测试兑换记录状态更新API')
  console.log('  - giftsTest.testPageComponents() - 测试页面组件')
  console.log('  - giftsTest.testFormFunctionality() - 测试表单功能')
  console.log('  - giftsTest.testMobileResponsive() - 测试移动端响应式功能')
  console.log('  - giftsTest.runFullTest() - 运行完整测试')
}

export default giftsTest
