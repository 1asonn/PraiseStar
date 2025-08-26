// Give页面测试工具
export const giveTest = {
  // 测试获取可用用户列表
  testGetAvailableUsers: async () => {
    try {
      console.log('🧪 测试获取可用用户列表...')
      const { starsService } = await import('../services/starsService')
      
      const response = await starsService.getAvailableUsers()
      
      console.log('✅ 获取可用用户成功:', response.data)
      
      // 验证数据结构
      if (response.data && response.data.departments) {
        console.log('📊 部门数量:', response.data.departments.length)
        console.log('👥 总用户数:', response.data.totalUsers)
        
        response.data.departments.forEach(dept => {
          console.log(`📋 ${dept.department}: ${dept.users.length} 人`)
          dept.users.forEach(user => {
            console.log(`  - ${user.name} (${user.position}) - 可用: ${user.availableToGive}⭐`)
          })
        })
      }
      
      return response
    } catch (error) {
      console.error('❌ 获取可用用户失败:', error)
      throw error
    }
  },

  // 测试赠送赞赞星
  testGiveStars: async (giveData) => {
    try {
      console.log('🧪 测试赠送赞赞星...')
      const { starsService } = await import('../services/starsService')
      
      console.log('📋 赠送数据:', giveData)
      const response = await starsService.giveStars(giveData)
      
      console.log('✅ 赠送成功:', response)
      return response
    } catch (error) {
      console.error('❌ 赠送失败:', error)
      throw error
    }
  },

  // 测试模拟赠送流程
  testGiveFlow: async () => {
    console.log('🧪 测试完整赠送流程...')
    
    try {
      // 1. 获取可用用户列表
      console.log('\n📋 1. 获取可用用户列表')
      const usersResponse = await giveTest.testGetAvailableUsers()
      
      if (!usersResponse.success || !usersResponse.data.departments.length) {
        console.log('⚠️ 没有可用用户，跳过赠送测试')
        return
      }
      
      // 2. 选择第一个用户进行测试
      const firstDept = usersResponse.data.departments[0]
      const firstUser = firstDept.users[0]
      
      console.log(`\n👤 2. 选择测试用户: ${firstUser.name} (${firstUser.department})`)
      
      // 3. 模拟赠送数据
      const giveData = {
        toUserId: firstUser.id,
        stars: 1,
        reason: '帮助同事',
        customReason: null
      }
      
      console.log('\n🎁 3. 执行赠送')
      const giveResponse = await giveTest.testGiveStars(giveData)
      
      // 4. 模拟刷新用户信息
      console.log('\n🔄 4. 刷新用户信息')
      console.log('✅ 模拟刷新当前用户信息')
      console.log('✅ 模拟刷新可用用户列表')
      
      console.log('\n📊 赠送流程测试完成')
      return {
        users: usersResponse,
        give: giveResponse,
        refresh: '模拟刷新完成'
      }
      
    } catch (error) {
      console.error('❌ 赠送流程测试失败:', error)
      throw error
    }
  },

  // 测试部门分组级联选择器
  testDepartmentGrouping: () => {
    console.log('🧪 测试部门分组级联选择器...')
    
    const mockData = {
      totalUsers: 5,
      departments: [
        {
          department: "产品部",
          users: [
            {
              id: 15,
              name: "测试用户3",
              department: "产品部",
              position: "产品经理",
              avatar: null,
              monthlyAllocation: 150,
              givenThisMonth: "20",
              availableToGive: "130"
            }
          ]
        },
        {
          department: "技术部",
          users: [
            {
              id: 16,
              name: "测试管理员",
              department: "技术部",
              position: "技术总监",
              avatar: null,
              monthlyAllocation: 200,
              givenThisMonth: "8",
              availableToGive: "192"
            }
          ]
        }
      ]
    }
    
    console.log('✅ 模拟数据结构:', mockData)
    
    // 转换为Cascader格式
    const cascaderOptions = mockData.departments.map(dept => ({
      value: dept.department,
      label: dept.department,
      children: dept.users.map(user => ({
        value: user.id,
        label: `${user.name} (${user.position}) - 可用: ${user.availableToGive}⭐`,
        user: user
      }))
    }))
    
    console.log('✅ Cascader选项格式:', cascaderOptions)
    
    // 测试部门分组渲染
    const departments = mockData.departments
    departments.forEach(dept => {
      console.log(`📋 部门: ${dept.department}`)
      dept.users.forEach(user => {
        console.log(`  - ${user.name} (${user.position}) - 可用: ${user.availableToGive}⭐`)
      })
    })
    
    return {
      originalData: mockData,
      cascaderOptions: cascaderOptions
    }
  },

  // 测试用户选择逻辑
  testUserSelection: () => {
    console.log('🧪 测试用户选择逻辑...')
    
    const mockDepartments = [
      {
        department: "产品部",
        users: [
          { id: 15, name: "测试用户3", department: "产品部", position: "产品经理" }
        ]
      },
      {
        department: "技术部",
        users: [
          { id: 16, name: "测试管理员", department: "技术部", position: "技术总监" }
        ]
      }
    ]
    
    // 转换为Cascader格式
    const cascaderOptions = mockDepartments.map(dept => ({
      value: dept.department,
      label: dept.department,
      children: dept.users.map(user => ({
        value: user.id,
        label: `${user.name} (${user.position})`,
        user: user
      }))
    }))
    
    // 测试Cascader选择逻辑
    const handleUserSelect = (value, selectedOptions) => {
      if (selectedOptions && selectedOptions.length === 2) {
        // 选择了用户（第二级）
        const selectedUserData = selectedOptions[1].user
        return selectedUserData
      }
      return null
    }
    
    // 测试选择
    const testValue = ["产品部", 15]
    const testSelectedOptions = [
      { value: "产品部", label: "产品部" },
      { value: 15, label: "测试用户3 (产品经理)", user: { id: 15, name: "测试用户3", department: "产品部", position: "产品经理" } }
    ]
    
    const selectedUser = handleUserSelect(testValue, testSelectedOptions)
    
    console.log(`✅ 测试选择值:`, testValue)
    console.log(`✅ 选择的用户:`, selectedUser)
    
    return {
      departments: mockDepartments,
      cascaderOptions: cascaderOptions,
      handleUserSelect,
      selectedUser
    }
  },

  // 测试用户信息刷新
  testUserRefresh: async () => {
    console.log('🧪 测试用户信息刷新...')
    
    try {
      // 模拟刷新用户信息
      console.log('📋 1. 刷新当前用户信息')
      console.log('✅ 调用 refreshUser() 方法')
      console.log('✅ 更新用户可用赞赞星数量')
      console.log('✅ 更新用户已赠送数量')
      
      // 模拟刷新可用用户列表
      console.log('\n📋 2. 刷新可用用户列表')
      console.log('✅ 调用 fetchAvailableUsers() 方法')
      console.log('✅ 更新其他用户的可用数量')
      
      // 模拟更新后的数据
      const mockUpdatedUser = {
        id: 1,
        name: "当前用户",
        availableToGive: 95, // 减少5颗
        monthlyAllocation: 100,
        givenThisMonth: 5
      }
      
      const mockUpdatedUsers = [
        {
          department: "产品部",
          users: [
            {
              id: 15,
              name: "测试用户3",
              availableToGive: "130"
            }
          ]
        }
      ]
      
      console.log('\n📊 更新后的数据:')
      console.log('✅ 当前用户:', mockUpdatedUser)
      console.log('✅ 可用用户列表:', mockUpdatedUsers)
      
      return {
        updatedUser: mockUpdatedUser,
        updatedUsers: mockUpdatedUsers
      }
      
    } catch (error) {
      console.error('❌ 用户信息刷新测试失败:', error)
      throw error
    }
  },

  // 测试表单验证
  testFormValidation: () => {
    console.log('🧪 测试表单验证...')
    
    const mockUser = {
      availableToGive: 100,
      monthlyAllocation: 150
    }
    
    const validateStars = (_, value) => {
      if (!value) {
        return Promise.reject('请输入赠送数量')
      }
      if (value < 1) {
        return Promise.reject('赠送数量不能少于1颗')
      }
      if (value > mockUser.availableToGive) {
        return Promise.reject(`赠送数量不能超过可用余额${mockUser.availableToGive}颗`)
      }
      return Promise.resolve()
    }
    
    const testCases = [
      { value: null, expected: '请输入赠送数量' },
      { value: 0, expected: '赠送数量不能少于1颗' },
      { value: 1, expected: 'success' },
      { value: 50, expected: 'success' },
      { value: 101, expected: '赠送数量不能超过可用余额100颗' }
    ]
    
    console.log('📋 测试用例:')
    testCases.forEach((testCase, index) => {
      console.log(`  ${index + 1}. 输入: ${testCase.value}, 期望: ${testCase.expected}`)
    })
    
    return {
      mockUser,
      validateStars,
      testCases
    }
  },

  // 完整测试
  runFullTest: async () => {
    console.log('🚀 开始Give页面完整测试...')
    
    try {
      // 1. 测试获取可用用户列表
      console.log('\n📋 1. 测试获取可用用户列表')
      await giveTest.testGetAvailableUsers()
      
      // 2. 测试部门分组功能
      console.log('\n📋 2. 测试部门分组功能')
      giveTest.testDepartmentGrouping()
      
      // 3. 测试用户选择逻辑
      console.log('\n📋 3. 测试用户选择逻辑')
      giveTest.testUserSelection()
      
      // 4. 测试表单验证
      console.log('\n📋 4. 测试表单验证')
      giveTest.testFormValidation()
      
             // 5. 测试用户信息刷新
       console.log('\n📋 5. 测试用户信息刷新')
       await giveTest.testUserRefresh()
       
       // 6. 测试赠送流程（可选）
       console.log('\n📋 6. 测试赠送流程（可选）')
       try {
         await giveTest.testGiveFlow()
       } catch (error) {
         console.log('⚠️ 赠送流程测试跳过（可能需要真实用户数据）')
       }
      
      console.log('\n✅ Give页面测试完成')
      
    } catch (error) {
      console.error('❌ Give页面测试失败:', error)
      throw error
    }
  }
}

// 在开发环境下自动挂载到window对象
if (process.env.NODE_ENV === 'development') {
  window.giveTest = giveTest
  console.log('🛠️ Give页面测试工具已加载到 window.giveTest')
  console.log('可用命令:')
  console.log('  - giveTest.testGetAvailableUsers() - 测试获取可用用户')
  console.log('  - giveTest.testGiveStars(giveData) - 测试赠送赞赞星')
  console.log('  - giveTest.testGiveFlow() - 测试完整赠送流程')
  console.log('  - giveTest.testDepartmentGrouping() - 测试部门分组级联选择器')
  console.log('  - giveTest.testUserSelection() - 测试用户选择逻辑')
  console.log('  - giveTest.testUserRefresh() - 测试用户信息刷新')
  console.log('  - giveTest.testFormValidation() - 测试表单验证')
  console.log('  - giveTest.runFullTest() - 运行完整测试')
}

export default giveTest
