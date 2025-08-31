# 登录页面闪烁问题修复方案

## 问题描述
登录时页面会闪烁一下并刷新，影响用户体验。

## 问题原因分析

### 1. API客户端配置不一致
- `apiClient.js` 中硬编码了 `http://39.105.117.48:3000/api`
- `webpack.config.js` 中也硬编码了API地址
- 与 `config.js` 中的动态配置不一致

### 2. 响应拦截器中的页面跳转
- 401错误时使用 `window.location.href` 直接跳转
- 导致页面刷新而不是React Router的客户端路由

### 3. 登录状态更新时机
- 登录成功后立即更新状态可能导致不必要的重渲染
- 缺少加载状态的优化处理

## 修复方案

### 1. 统一API配置
```javascript
// 修复前
const API_BASE_URL = 'http://39.105.117.48:3000/api'

// 修复后
import { API_CONFIG } from './config'
const API_BASE_URL = API_CONFIG.BASE_URL
```

### 2. 优化响应拦截器
```javascript
// 修复前
case 401:
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
  break

// 修复后
case 401:
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  console.warn('Token已过期，请重新登录')
  break
```

### 3. 优化登录流程
- 移除登录成功后的延迟消息显示
- 让React Router自动处理重定向
- 添加认证状态加载时的显示

### 4. 清理webpack配置
- 移除硬编码的API地址配置
- 统一使用配置文件中的动态配置

## 修复效果

1. **消除页面刷新**: 不再使用 `window.location.href` 进行页面跳转
2. **减少重渲染**: 优化状态更新时机，减少不必要的组件重渲染
3. **统一配置**: 所有API配置都从统一的配置文件读取
4. **更好的用户体验**: 登录过程更加流畅，没有闪烁现象

## 测试建议

1. 测试正常登录流程
2. 测试Token过期的情况
3. 测试网络错误的情况
4. 测试不同环境下的API地址配置

## 注意事项

1. 确保后端API地址配置正确
2. 确保CORS配置正确
3. 确保开发和生产环境的配置一致
