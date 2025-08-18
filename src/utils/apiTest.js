// API连接测试工具
import { services } from '../services'

// 测试API连接
export const testApiConnection = async () => {
  const results = {
    connection: false,
    auth: false,
    details: []
  }

  try {
    console.log('🔍 开始测试API连接...')
    
    // 测试1: 基础连接测试（尝试获取用户列表，即使失败也能判断连接状态）
    try {
      console.log('📡 测试基础连接...')
      await services.user.getUserList()
      results.connection = true
      results.details.push('✅ 基础连接成功')
    } catch (error) {
      if (error.status === 401) {
        // 401错误说明连接成功但需要认证
        results.connection = true
        results.details.push('✅ 基础连接成功（需要认证）')
      } else if (error.isCorsError) {
        results.details.push('❌ CORS错误 - 需要配置后端CORS或使用代理')
      } else {
        results.details.push(`❌ 连接失败: ${error.message}`)
      }
    }

    // 测试2: 认证测试
    if (results.connection) {
      try {
        console.log('🔐 测试认证接口...')
        await services.auth.login('test')
        results.auth = true
        results.details.push('✅ 认证接口可用')
      } catch (error) {
        if (error.status >= 400 && error.status < 500) {
          results.auth = true
          results.details.push('✅ 认证接口可用（参数错误是正常的）')
        } else {
          results.details.push(`❌ 认证接口失败: ${error.message}`)
        }
      }
    }

    // 输出测试结果
    console.log('\n📊 API连接测试结果:')
    console.log(`基础连接: ${results.connection ? '✅' : '❌'}`)
    console.log(`认证功能: ${results.auth ? '✅' : '❌'}`)
    console.log('\n详细信息:')
    results.details.forEach(detail => console.log(`  ${detail}`))

    return results
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
    results.details.push(`❌ 测试失败: ${error.message}`)
    return results
  }
}

// 快速测试单个接口
export const testSingleApi = async (apiCall, description) => {
  try {
    console.log(`🧪 测试: ${description}`)
    const result = await apiCall()
    console.log(`✅ ${description} - 成功`, result)
    return { success: true, result }
  } catch (error) {
    console.log(`❌ ${description} - 失败:`, error.message)
    return { success: false, error }
  }
}

// 在浏览器控制台中使用的便捷函数
if (typeof window !== 'undefined') {
  window.testApi = testApiConnection
  window.testSingleApi = testSingleApi
  window.services = services
  
  console.log('🛠️ API测试工具已加载到window对象:')
  console.log('  - window.testApi() - 完整API连接测试')
  console.log('  - window.testSingleApi(apiCall, description) - 单个API测试')
  console.log('  - window.services - 所有API服务')
  console.log('\n示例:')
  console.log('  window.testApi()')
  console.log('  window.testSingleApi(() => services.user.getUserList(), "获取用户列表")')
}

export default { testApiConnection, testSingleApi }
