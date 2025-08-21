# 管理员仪表板API对接

## 功能概述

将管理员仪表板页面从模拟数据改为真实的API接口调用，实现实时数据展示。

## API接口对接

### 1. 统计数据接口
- **接口地址**: `/api/stars/statistics`
- **请求方式**: GET
- **返回数据结构**: 包含overview、activity、usage、departments四个部分

### 2. 排行榜接口
- **接口地址**: `/api/rankings`
- **请求方式**: GET
- **参数**: `period=year`

### 3. 赠送记录接口
- **接口地址**: `/api/stars/give-records`
- **请求方式**: GET
- **参数**: `page=1&limit=5`

### 4. 兑换记录接口
- **接口地址**: `/api/gifts/redemptions`
- **请求方式**: GET

## 前端修改内容

### 1. 状态管理
- 添加loading状态
- 使用useState管理统计数据
- 分别管理排行榜、赠送记录、兑换记录

### 2. 数据加载函数
- loadStatistics(): 加载统计数据
- loadRankings(): 加载排行榜数据
- loadRecentGives(): 加载最近赠送记录
- loadRecentRedemptions(): 加载最近兑换记录

### 3. 初始化加载
- 使用useEffect在组件挂载时加载所有数据
- 使用Promise.all并发加载多个接口

### 4. 数据展示更新
- 系统总览统计使用stats.overview数据
- 活跃度统计使用stats.activity数据
- 使用率分析使用stats.usage数据
- 部门统计表格使用stats.departments数据

### 5. 加载状态处理
- 显示加载动画
- 数据加载完成后显示内容

## 数据兼容性处理

### 1. 排行榜数据
- 支持name/userName字段
- 支持receivedThisYear/totalReceived字段

### 2. 赠送记录数据
- 支持fromUserName/fromUser.name字段
- 支持toUserName/toUser.name字段
- 支持stars/starCount字段

### 3. 兑换记录数据
- 支持userName/user.name字段
- 支持giftName/gift.name字段
- 支持starsCost/starCost字段

## 错误处理

### 1. API调用错误
- 使用try-catch包装所有API调用
- 显示友好的错误提示信息
- 记录错误日志到控制台

### 2. 数据格式错误
- 使用可选链操作符防止空值错误
- 提供默认值处理缺失字段
- 使用||操作符处理字段名差异

## 预期效果

- ✅ 实时显示系统统计数据
- ✅ 动态更新排行榜信息
- ✅ 展示最新的赠送和兑换记录
- ✅ 良好的加载体验
- ✅ 完善的错误处理机制
