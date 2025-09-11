# 排行榜移动端下拉分页功能实现

## 功能概述

为排行榜页面实现了移动端下拉分页功能，支持无限滚动加载更多数据，提升移动端用户体验。

## 主要功能

### 1. 移动端检测
- 使用 `window.innerWidth <= 768` 检测移动端
- 监听窗口大小变化，动态切换显示模式
- 移动端使用卡片视图，桌面端使用表格视图

### 2. 无限滚动加载
- 实现触底检测，距离底部100px时自动加载更多数据
- 支持追加数据到现有列表，而不是替换
- 防止重复加载和无效请求

### 3. 状态管理
```javascript
// 移动端无限滚动状态
const [mobileLoading, setMobileLoading] = useState({
  year: false,
  month: false,
  quarter: false
})
const [hasMore, setHasMore] = useState({
  year: true,
  month: true,
  quarter: true
})
```

### 4. 数据加载逻辑
- 首次加载：替换数据
- 追加加载：合并到现有数据
- 分页信息更新：保持当前页码和总数
- 加载状态管理：区分首次加载和追加加载

## 核心实现

### 1. 修改fetchRankings函数
```javascript
const fetchRankings = async (period, page = 1, pageSize = 10, append = false) => {
  // 根据append参数决定是替换还是追加数据
  if (isMobile && append) {
    setRankings(prev => ({
      ...prev,
      [period]: [...prev[period], ...rankingsData]
    }))
  } else {
    setRankings(prev => ({
      ...prev,
      [period]: rankingsData
    }))
  }
}
```

### 2. 滚动监听和触底检测
```javascript
const handleScroll = useCallback((e) => {
  if (!isMobile) return
  
  const { scrollTop, scrollHeight, clientHeight } = e.target
  const threshold = 100 // 距离底部100px时触发加载
  
  if (scrollHeight - scrollTop - clientHeight < threshold) {
    loadMoreData(activeTab)
  }
}, [isMobile, activeTab, mobileLoading, hasMore, pagination])
```

### 3. 移动端卡片视图
- 响应式设计，适配不同屏幕尺寸
- 显示排名、用户信息、部门、职位、获赞数量
- 当前用户高亮显示
- 管理员用户特殊标识

### 4. 加载状态提示
- 首次加载：显示"加载中..."
- 追加加载：显示"加载更多数据中..."
- 无更多数据：显示"已加载全部数据"
- 空数据：显示"暂无排名数据"

## 用户体验优化

### 1. 滚动体验
- 设置最大高度为70vh，避免页面过长
- 启用平滑滚动和触摸滚动
- 自定义滚动条样式，更美观

### 2. 响应式设计
- 移动端字体大小适配
- 卡片间距和内边距优化
- 头像和标签尺寸调整

### 3. 性能优化
- 使用useCallback优化滚动监听函数
- 防抖处理，避免频繁触发加载
- 条件渲染，减少不必要的DOM操作

## 技术特点

1. **自适应显示**：根据屏幕尺寸自动切换卡片/表格视图
2. **无限滚动**：移动端支持下拉加载更多数据
3. **状态管理**：完善的加载状态和数据状态管理
4. **用户体验**：流畅的滚动体验和清晰的状态提示
5. **性能优化**：合理的滚动监听和防抖处理

## 使用说明

1. 在移动端访问排行榜页面
2. 滚动到列表底部，自动加载更多数据
3. 支持年度、月度、季度三个时间维度的无限滚动
4. 桌面端保持原有的分页表格显示方式

## 兼容性

- 支持现代移动端浏览器
- 兼容iOS Safari和Android Chrome
- 桌面端功能不受影响
- 响应式设计适配各种屏幕尺寸
