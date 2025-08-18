# API 对接使用指南

## 概述

本项目已完成与后端API的完整对接，提供了完整的前端API服务层。所有的API调用都通过统一的服务层进行，支持错误处理、认证管理、请求重试等功能。

## 项目结构

```
src/services/
├── apiClient.js          # API客户端基础配置
├── authService.js        # 认证相关服务
├── userService.js        # 用户管理服务
├── starsService.js       # 赞赞星管理服务
├── giftsService.js       # 礼品管理服务
├── rankingsService.js    # 排行榜服务
├── bulletsService.js     # 弹幕设置服务
├── config.js            # API配置文件
├── index.js             # 服务统一导出
└── api.js               # 兼容层（保持向后兼容）
```

## 快速开始

### 1. 基础使用

```javascript
import { services } from '../services'

// 使用认证服务
const loginResult = await services.auth.login('13800138001')

// 使用用户服务
const userList = await services.user.getUserList({ page: 1, limit: 10 })

// 使用赞赞星服务
const giveResult = await services.stars.giveStars({
  toUserId: 2,
  stars: 10,
  reason: '业绩/工作表现好'
})
```

### 2. 错误处理

所有API调用都包含统一的错误处理：

```javascript
try {
  const response = await services.user.getUserList()
  if (response.success) {
    console.log('数据:', response.data)
  }
} catch (error) {
  console.error('错误:', error.message)
  // error对象包含: { success: false, message: '错误信息', errors: [], status: 状态码 }
}
```

### 3. 认证管理

认证功能已集成到AuthContext中：

```javascript
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, login, logout, isAuthenticated, isAdmin } = useAuth()
  
  const handleLogin = async (phone) => {
    const result = await login(phone)
    if (result.success) {
      console.log('登录成功:', result.user)
    }
  }
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>欢迎, {user.name}</p>
          {isAdmin() && <p>管理员权限</p>}
          <button onClick={logout}>退出</button>
        </div>
      ) : (
        <button onClick={() => handleLogin('13800138001')}>登录</button>
      )}
    </div>
  )
}
```

## 主要服务介绍

### 1. 认证服务 (authService)

```javascript
import { authService } from '../services'

// 用户登录
const result = await authService.login('13800138001')

// 验证Token
const isValid = await authService.verifyToken()

// 刷新Token
const newToken = await authService.refreshToken()

// 登出
await authService.logout()

// 获取当前用户
const currentUser = authService.getCurrentUser()

// 检查是否已登录
const isLoggedIn = authService.isAuthenticated()

// 检查是否为管理员
const isAdminUser = authService.isAdmin()
```

### 2. 用户服务 (userService)

```javascript
import { userService } from '../services'

// 获取用户列表
const users = await userService.getUserList({
  page: 1,
  limit: 10,
  search: '张三',
  department: '研发中心'
})

// 添加用户
const newUser = await userService.addUser({
  name: '新用户',
  phone: '13800138009',
  department: '研发中心',
  position: '工程师',
  isAdmin: false,
  monthlyAllocation: 100
})

// 更新用户
const updatedUser = await userService.updateUser(1, {
  name: '更新后的姓名'
})

// 调整用户赞赞星
await userService.adjustUserStars(1, {
  type: 'give',
  amount: 50,
  reason: '系统调整'
})
```

### 3. 赞赞星服务 (starsService)

```javascript
import { starsService } from '../services'

// 赠送赞赞星
const giveResult = await starsService.giveStars({
  toUserId: 2,
  stars: 10,
  reason: '业绩/工作表现好',
  customReason: '项目完成得很出色'
})

// 获取赠送记录
const records = await starsService.getGiveRecords({
  page: 1,
  limit: 10,
  type: 'all'
})

// 批量奖励
await starsService.awardStars({
  userIds: [1, 2, 3],
  stars: 20,
  reason: '季度优秀员工奖励'
})

// 获取统计数据
const stats = await starsService.getStatistics()
```

### 4. 礼品服务 (giftsService)

```javascript
import { giftsService } from '../services'

// 获取可兑换礼品
const availableGifts = await giftsService.getAvailableGifts()

// 兑换礼品
const redemption = await giftsService.redeemGift(1, {
  deliveryMethod: '邮寄',
  recipientName: '张三',
  recipientPhone: '13800138006',
  address: '北京市朝阳区xxx街道xxx号'
})

// 获取兑换记录
const redemptions = await giftsService.getUserRedemptions()

// 管理员功能
const allGifts = await giftsService.getGiftList()
const newGift = await giftsService.addGift({
  name: '新礼品',
  description: '礼品描述',
  starsCost: 100,
  stock: 50
})
```

### 5. 排行榜服务 (rankingsService)

```javascript
import { rankingsService } from '../services'

// 获取排行榜
const rankings = await rankingsService.getRankings({
  period: 'year',
  page: 1,
  limit: 10
})

// 获取TOP排行榜
const topRankings = await rankingsService.getTopRankings({
  period: 'year',
  limit: 10
})

// 获取我的排名
const myRanking = await rankingsService.getMyRanking({
  period: 'year'
})

// 获取部门排行榜
const deptRankings = await rankingsService.getDepartmentRankings({
  period: 'year'
})
```

### 6. 弹幕服务 (bulletsService)

```javascript
import { bulletsService } from '../services'

// 获取弹幕设置
const settings = await bulletsService.getBulletSettings()

// 更新弹幕设置
await bulletsService.updateBulletSetting('give', {
  enabled: true,
  thresholdValue: 15,
  template: '🎉 {fromUser} 向 {toUser} 赠送了 {stars} 颗赞赞星'
})

// 批量更新设置
await bulletsService.batchUpdateBulletSettings({
  give: { enabled: true, thresholdValue: 10 },
  ranking: { enabled: false }
})

// 发送测试弹幕
await bulletsService.sendTestBullet({
  type: 'give',
  content: '测试弹幕内容'
})
```

## 配置说明

### API配置 (config.js)

```javascript
import { API_CONFIG } from '../services/config'

// 修改API基础URL
API_CONFIG.BASE_URL = 'https://your-api-domain.com/api'

// 修改请求超时时间
API_CONFIG.TIMEOUT = 15000

// 修改分页默认值
API_CONFIG.PAGINATION.defaultLimit = 20
```

### 环境变量配置

创建 `.env` 文件：

```bash
# 开发环境
NODE_ENV=development
REACT_APP_API_BASE_URL=http://localhost:3000/api

# 生产环境
NODE_ENV=production
REACT_APP_API_BASE_URL=https://api.praisestar.com/api
```

## 错误处理

### 全局错误处理

API客户端已配置全局错误处理：

- **401 未授权**: 自动清除token并跳转登录页
- **403 禁止访问**: 显示权限不足提示
- **404 资源不存在**: 显示资源不存在提示
- **500 服务器错误**: 显示服务器错误提示
- **网络错误**: 显示网络连接失败提示

### 自定义错误处理

```javascript
import { ERROR_CODES, ERROR_MESSAGES } from '../services/config'

try {
  const response = await services.user.getUserList()
} catch (error) {
  switch (error.status) {
    case 400:
      console.error('参数错误:', error.message)
      break
    case 401:
      console.error('未授权:', error.message)
      // 跳转到登录页
      break
    default:
      console.error('未知错误:', error.message)
  }
}
```

## 数据格式

### 统一响应格式

```javascript
// 成功响应
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-12-15T10:30:00.000Z"
}

// 分页响应
{
  "success": true,
  "message": "获取成功",
  "data": [],
  "pagination": {
    "current": 1,
    "total": 100,
    "totalPages": 10,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  }
}

// 错误响应
{
  "success": false,
  "message": "错误信息",
  "errors": [],
  "timestamp": "2024-12-15T10:30:00.000Z"
}
```

## 最佳实践

### 1. 使用统一的服务层

```javascript
// ✅ 推荐
import { services } from '../services'
const result = await services.user.getUserList()

// ❌ 不推荐
import axios from 'axios'
const result = await axios.get('/api/users')
```

### 2. 正确的错误处理

```javascript
// ✅ 推荐
try {
  const response = await services.user.addUser(userData)
  if (response.success) {
    message.success('用户添加成功')
    return response.data
  }
} catch (error) {
  message.error(error.message || '添加用户失败')
  throw error
}

// ❌ 不推荐
const response = await services.user.addUser(userData)
// 没有错误处理
```

### 3. 使用认证上下文

```javascript
// ✅ 推荐
import { useAuth } from '../contexts/AuthContext'

function Component() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  
  if (!isAuthenticated) {
    return <div>请先登录</div>
  }
  
  return <div>欢迎, {user.name}</div>
}

// ❌ 不推荐
function Component() {
  const user = JSON.parse(localStorage.getItem('user'))
  // 直接使用localStorage
}
```

### 4. 合理使用加载状态

```javascript
function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  
  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await services.user.getUserList()
      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      {loading ? <Spin /> : <UserTable data={users} />}
    </div>
  )
}
```

## 调试和测试

### 开启调试模式

在浏览器控制台中设置：

```javascript
localStorage.setItem('debug', 'api')
// 这将显示所有API请求和响应的详细信息
```

### API测试

```javascript
// 在浏览器控制台中测试API
import { services } from './src/services'

// 测试登录
const loginResult = await services.auth.login('13800138001')
console.log(loginResult)

// 测试获取用户列表
const users = await services.user.getUserList()
console.log(users)
```

## 常见问题

### 1. Token过期处理

系统会自动处理token过期情况，无需手动处理。当token过期时：
- 自动清除本地存储
- 跳转到登录页面
- 显示过期提示

### 2. 网络错误重试

API客户端已配置自动重试机制：
- 网络错误时自动重试3次
- 使用指数退避算法
- 超过重试次数后返回错误

### 3. 并发请求处理

系统支持并发请求，但建议：
- 避免同时发起大量相同请求
- 使用防抖和节流优化用户操作
- 合理使用加载状态

### 4. 文件上传

```javascript
// 上传图片示例
const handleUpload = async (file) => {
  try {
    const response = await services.gifts.uploadGiftImage(file)
    if (response.success) {
      console.log('图片URL:', response.data.url)
    }
  } catch (error) {
    message.error('上传失败: ' + error.message)
  }
}
```

## 更新日志

- **v1.0.0** (2024-12-15): 完成API对接，支持所有后端接口
- 认证管理：登录、登出、token刷新
- 用户管理：CRUD操作、权限管理
- 赞赞星管理：赠送、统计、记录查询
- 礼品管理：兑换、库存管理
- 排行榜：多维度排名查询
- 弹幕设置：配置管理、测试发送

## 支持

如有问题，请联系开发团队或查看API文档：
- API文档：http://localhost:3000/api-docs
- 项目仓库：[项目地址]
- 技术支持：[联系方式]
