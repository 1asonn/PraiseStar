// Cascader组件测试工具
export const cascaderTest = {
  // 测试数据格式转换
  testDataTransformation: () => {
    console.log('🧪 测试Cascader数据格式转换...')
    
    const mockDepartments = [
      {
        department: "产品部",
        users: [
          {
            id: 15,
            name: "测试用户3",
            department: "产品部",
            position: "产品经理",
            monthlyAllocation: 150,
            givenThisMonth: "20",
            availableToGive: "130"
          },
          {
            id: 16,
            name: "张三",
            department: "产品部",
            position: "产品助理",
            monthlyAllocation: 100,
            givenThisMonth: "20",
            availableToGive: "80"
          }
        ]
      },
      {
        department: "技术部",
        users: [
          {
            id: 17,
            name: "测试管理员",
            department: "技术部",
            position: "技术总监",
            monthlyAllocation: 200,
            givenThisMonth: "8",
            availableToGive: "192"
          }
        ]
      }
    ]
    
    // 转换为Cascader格式
    const cascaderOptions = mockDepartments.map(dept => ({
      value: dept.department,
      label: dept.department,
      children: dept.users.map(user => ({
        value: user.id,
        label: `${user.name} (${user.position}) - 可用: ${user.availableToGive}⭐`,
        user: user
      }))
    }))
    
    console.log('✅ 原始数据:', mockDepartments)
    console.log('✅ Cascader格式:', cascaderOptions)
    
    return {
      originalData: mockDepartments,
      cascaderOptions: cascaderOptions
    }
  },

  // 测试选择逻辑
  testSelectionLogic: () => {
    console.log('🧪 测试Cascader选择逻辑...')
    
    const mockCascaderOptions = [
      {
        value: "产品部",
        label: "产品部",
        children: [
          {
            value: 15,
            label: "测试用户3 (产品经理) - 可用: 130⭐",
            user: { id: 15, name: "测试用户3", department: "产品部", position: "产品经理" }
          }
        ]
      }
    ]
    
    // 模拟选择事件
    const handleUserSelect = (value, selectedOptions) => {
      console.log('📋 选择值:', value)
      console.log('📋 选择选项:', selectedOptions)
      
      if (selectedOptions && selectedOptions.length === 2) {
        // 选择了用户（第二级）
        const selectedUserData = selectedOptions[1].user
        console.log('✅ 选择的用户:', selectedUserData)
        return selectedUserData
      } else {
        console.log('⚠️ 未选择用户')
        return null
      }
    }
    
    // 测试用例
    const testCases = [
      {
        name: '选择部门',
        value: ["产品部"],
        selectedOptions: [{ value: "产品部", label: "产品部" }]
      },
      {
        name: '选择用户',
        value: ["产品部", 15],
        selectedOptions: [
          { value: "产品部", label: "产品部" },
          { 
            value: 15, 
            label: "测试用户3 (产品经理) - 可用: 130⭐", 
            user: { id: 15, name: "测试用户3", department: "产品部", position: "产品经理" } 
          }
        ]
      }
    ]
    
    testCases.forEach((testCase, index) => {
      console.log(`\n📋 测试用例 ${index + 1}: ${testCase.name}`)
      const result = handleUserSelect(testCase.value, testCase.selectedOptions)
      console.log(`✅ 结果:`, result)
    })
    
    return {
      options: mockCascaderOptions,
      handleUserSelect,
      testCases
    }
  },

  // 测试搜索功能
  testSearchFunction: () => {
    console.log('🧪 测试Cascader搜索功能...')
    
    const mockCascaderOptions = [
      {
        value: "产品部",
        label: "产品部",
        children: [
          {
            value: 15,
            label: "测试用户3 (产品经理) - 可用: 130⭐",
            user: { id: 15, name: "测试用户3", department: "产品部", position: "产品经理" }
          }
        ]
      },
      {
        value: "技术部",
        label: "技术部",
        children: [
          {
            value: 16,
            label: "李四 (前端开发) - 可用: 100⭐",
            user: { id: 16, name: "李四", department: "技术部", position: "前端开发" }
          }
        ]
      }
    ]
    
    // 搜索过滤函数
    const searchFilter = (inputValue, path) => {
      return path.some(option => 
        option.label && 
        (typeof option.label === 'string' ? 
          option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1 :
          option.user && option.user.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
        )
      )
    }
    
    // 测试搜索
    const searchTests = [
      { input: "产品", expected: true },
      { input: "技术", expected: true },
      { input: "测试用户3", expected: true },
      { input: "李四", expected: true },
      { input: "前端", expected: true },
      { input: "不存在的", expected: false }
    ]
    
    searchTests.forEach((test, index) => {
      console.log(`\n📋 搜索测试 ${index + 1}: "${test.input}"`)
      
      // 模拟搜索产品部
      const productPath = [
        { value: "产品部", label: "产品部" },
        { 
          value: 15, 
          label: "测试用户3 (产品经理) - 可用: 130⭐", 
          user: { id: 15, name: "测试用户3", department: "产品部", position: "产品经理" } 
        }
      ]
      
      const result = searchFilter(test.input, productPath)
      console.log(`✅ 搜索结果: ${result} (期望: ${test.expected})`)
    })
    
    return {
      options: mockCascaderOptions,
      searchFilter,
      searchTests
    }
  },

  // 测试显示渲染
  testDisplayRender: () => {
    console.log('🧪 测试Cascader显示渲染...')
    
    const displayRender = (labels, selectedOptions) => {
      if (selectedOptions && selectedOptions.length === 2) {
        const user = selectedOptions[1].user
        return `${labels[0]} / ${user.name}`
      }
      return labels.join(' / ')
    }
    
    // 测试用例
    const testCases = [
      {
        name: '只选择部门',
        labels: ['产品部'],
        selectedOptions: [{ value: "产品部", label: "产品部" }]
      },
      {
        name: '选择用户',
        labels: ['产品部', '测试用户3'],
        selectedOptions: [
          { value: "产品部", label: "产品部" },
          { 
            value: 15, 
            label: "测试用户3 (产品经理) - 可用: 130⭐", 
            user: { id: 15, name: "测试用户3", department: "产品部", position: "产品经理" } 
          }
        ]
      }
    ]
    
    testCases.forEach((testCase, index) => {
      console.log(`\n📋 显示测试 ${index + 1}: ${testCase.name}`)
      const result = displayRender(testCase.labels, testCase.selectedOptions)
      console.log(`✅ 显示结果: "${result}"`)
    })
    
    return {
      displayRender,
      testCases
    }
  },

  // 完整测试
  runFullTest: () => {
    console.log('🚀 开始Cascader组件完整测试...')
    
    try {
      // 1. 测试数据格式转换
      console.log('\n📋 1. 测试数据格式转换')
      cascaderTest.testDataTransformation()
      
      // 2. 测试选择逻辑
      console.log('\n📋 2. 测试选择逻辑')
      cascaderTest.testSelectionLogic()
      
      // 3. 测试搜索功能
      console.log('\n📋 3. 测试搜索功能')
      cascaderTest.testSearchFunction()
      
      // 4. 测试显示渲染
      console.log('\n📋 4. 测试显示渲染')
      cascaderTest.testDisplayRender()
      
      console.log('\n✅ Cascader组件测试完成')
      
    } catch (error) {
      console.error('❌ Cascader组件测试失败:', error)
      throw error
    }
  }
}

// 在开发环境下自动挂载到window对象
if (process.env.NODE_ENV === 'development') {
  window.cascaderTest = cascaderTest
  console.log('🛠️ Cascader组件测试工具已加载到 window.cascaderTest')
  console.log('可用命令:')
  console.log('  - cascaderTest.testDataTransformation() - 测试数据格式转换')
  console.log('  - cascaderTest.testSelectionLogic() - 测试选择逻辑')
  console.log('  - cascaderTest.testSearchFunction() - 测试搜索功能')
  console.log('  - cascaderTest.testDisplayRender() - 测试显示渲染')
  console.log('  - cascaderTest.runFullTest() - 运行完整测试')
}

export default cascaderTest
