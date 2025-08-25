# 用户仪表板API集成文档

## 📋 概述

用户仪表板已成功从模拟数据迁移到真实API调用，实现了以下功能：

- ✅ 实时获取用户信息
- ✅ 获取最近的赠送记录（收到和发送）
- ✅ 获取用户排名信息
- ✅ 数据刷新功能
- ✅ 错误处理和加载状态

## 🔧 API集成详情

### 1. 用户信息获取

**API端点**: `GET /api/users/profile`

**服务方法**: `userService.getProfile()`

**功能**:
- 获取当前用户的完整信息
- 包括赞赞星余额、排名等统计数据
- 自动更新AuthContext中的用户信息

### 2. 赠送记录获取

**API端点**: `GET /api/stars/give-records`

**服务方法**: `starsService.getGiveRecords()`

**参数**:
- `type`: 'received' | 'sent' | 'all'
- `page`: 页码
- `limit`: 每页条数

**返回数据结构**:
```javascript
// 收到的记录示例
{
  "id": 6,
  "stars": 5,
  "reason": "其他",
  "custom_reason": null,
  "created_at": "2025-08-24T16:28:20.000Z",
  "from_user_id": 14,
  "from_user_name": "测试用户2",
  "from_user_department": "研发中心",
  "to_user_id": 13,
  "to_user_name": "测试用户1",
  "to_user_department": "研发中心"
}

// 赠送的记录示例
{
  "id": 9,
  "stars": 1,
  "reason": "帮助同事",
  "custom_reason": null,
  "created_at": "2025-08-22T12:45:03.000Z",
  "from_user_id": 13,
  "from_user_name": "测试用户1",
  "from_user_department": "研发中心",
  "to_user_id": 17,
  "to_user_name": "测试用户5",
  "to_user_department": "设计部"
}
```

**功能**:
- 获取用户收到的赞赞星记录
- 获取用户发送的赞赞星记录
- 支持分页查询

### 3. 排名信息获取

**API端点**: `GET /api/rankings/my-ranking`

**服务方法**: `rankingsService.getMyRanking()`

**参数**:
- `period`: 'month' | 'quarter' | 'year'

**功能**:
- 获取当前用户的排名信息
- 支持不同时间周期的排名查询

## 🎯 组件功能

### 数据展示
- **统计卡片**: 显示本月可赠送、累计获赠、可兑换余额、当前排名
- **进度条**: 显示本月赠送进度和年度兑换统计
- **记录列表**: 显示最近的收到和发送记录，包含用户部门信息
- **月度亮点**: 显示用户表现概览

### 字段映射
界面展示与API数据字段的映射关系：

| 界面显示 | API字段 | 说明 |
|---------|---------|------|
| 发送者姓名 | `from_user_name` | 发送赞赞星的用户姓名 |
| 接收者姓名 | `to_user_name` | 接收赞赞星的用户姓名 |
| 发送者部门 | `from_user_department` | 发送者所属部门 |
| 接收者部门 | `to_user_department` | 接收者所属部门 |
| 赞赞星数量 | `stars` | 赠送的赞赞星数量 |
| 赠送理由 | `reason` | 预设理由或"其他" |
| 自定义理由 | `custom_reason` | 当reason为"其他"时的自定义理由 |
| 赠送时间 | `created_at` | ISO格式的时间戳 |

### 交互功能
- **数据刷新**: 页面顶部提供刷新按钮
- **实时更新**: 组件加载时自动获取最新数据
- **错误处理**: 网络错误时显示友好提示
- **加载状态**: 数据加载时显示加载动画

## 🛠️ 开发工具

### 测试工具
在开发环境下，可以通过浏览器控制台使用以下测试命令：

```javascript
// 测试用户信息获取
dashboardTest.testUserProfile()

// 测试赠送记录获取
dashboardTest.testGiveRecords()

// 测试排名信息获取
dashboardTest.testRanking()

// 运行完整测试
dashboardTest.runFullTest()

// 使用模拟数据测试
dashboardTest.testWithMockData()

// 测试数据展示（验证字段映射）
dashboardTest.testDataDisplay()
```

### 调试功能
- 自动加载到 `window.dashboardTest`
- 详细的错误日志输出
- 模拟数据测试支持
- 数据展示验证功能

## 📱 响应式设计

仪表板完全支持响应式布局：

- **桌面端**: 4列统计卡片布局
- **平板端**: 2列统计卡片布局
- **移动端**: 1列统计卡片布局
- **自适应**: 表格和列表自动适配屏幕尺寸

## 🔄 数据更新机制

### 自动更新
- 组件挂载时自动获取数据
- 用户信息变化时重新获取

### 手动更新
- 页面顶部刷新按钮
- 各卡片区域的独立刷新

### 状态同步
- 用户信息与AuthContext同步
- 本地状态与服务器数据同步

## 🚨 错误处理

### 网络错误
- 显示友好的错误提示
- 不影响其他功能模块
- 提供重试机制

### 数据异常
- 空数据处理
- 数据格式验证
- 降级显示策略

## 📊 性能优化

### 并行请求
- 使用 `Promise.all` 并行获取数据
- 减少页面加载时间

### 缓存策略
- 合理使用本地状态
- 避免重复请求

### 懒加载
- 按需加载数据
- 分页加载记录

## 🔧 配置说明

### API配置
```javascript
// 在 src/services/apiClient.js 中配置
const API_BASE_URL = 'http://localhost:3000/api'
```

### 开发环境
```javascript
// 在 src/main.jsx 中自动加载测试工具
if (process.env.NODE_ENV === 'development') {
  import('./utils/dashboardTest')
}
```

## 📝 使用示例

### 基本使用
```javascript
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'

const Dashboard = () => {
  const { user } = useAuth()
  
  // 获取用户信息
  const fetchUserProfile = async () => {
    const response = await userService.getProfile()
    if (response.success) {
      // 处理用户数据
    }
  }
}
```

### 错误处理
```javascript
try {
  const response = await starsService.getGiveRecords({
    type: 'received',
    page: 1,
    limit: 5
  })
} catch (error) {
  console.error('获取记录失败:', error)
  message.error('获取记录失败，请稍后重试')
}
```

## 🎉 总结

用户仪表板已成功集成真实API，提供了：

1. **完整的数据展示**: 用户统计、记录列表、排名信息
2. **良好的用户体验**: 加载状态、错误处理、刷新功能
3. **响应式设计**: 适配各种设备屏幕
4. **开发友好**: 测试工具、调试功能、详细文档

所有功能都已通过API集成测试，可以正常使用。
