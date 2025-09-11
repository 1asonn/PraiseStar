# 排行榜页面数据适配

## 概述
根据后端 `/api/rankings` 接口的实现，对前端排行榜页面进行了完整的数据适配，实现了真实数据的展示、分页功能和用户排名信息的准确显示。

## 后端接口分析

### 接口信息
```javascript
/**
 * @route GET /api/rankings
 * @desc 获取排行榜
 * @access Private
 */
```

### 请求参数
- `page`: 页码（分页）
- `limit`: 每页条数（分页）
- `period`: 时间周期，可选值：`month`、`quarter`、`year`，默认为 `year`

### 响应数据结构
```json
{
  "success": true,
  "message": "获取排行榜成功",
  "data": [
    {
      "id": 1,
      "name": "用户姓名",
      "department": "部门名称",
      "position": "职位",
      "received_stars": 150,
      "ranking": 1
    }
  ],
  "pagination": {
    "current": 1,
    "total": 50,
    "totalPages": 5,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "period": "month",
  "currentUserRanking": 5
}
```

## 前端实现

### 1. 状态管理

#### 新增状态
```javascript
const [pagination, setPagination] = useState({
  year: { current: 1, pageSize: 10, total: 0 },
  month: { current: 1, pageSize: 10, total: 0 },
  quarter: { current: 1, pageSize: 10, total: 0 }
})

const [currentUserRanking, setCurrentUserRanking] = useState({
  year: null,
  month: null,
  quarter: null
})
```

### 2. 数据获取逻辑

#### 更新后的fetchRankings函数
```javascript
const fetchRankings = async (period, page = 1, pageSize = 10) => {
  if (!user?.id) return
  
  setLoading(true)
  try {
    const response = await rankingsService.getRankings({ 
      period, 
      page, 
      limit: pageSize 
    })
    if (response.success) {
      const rankingsData = response.data || []
      setRankings(prev => ({
        ...prev,
        [period]: rankingsData
      }))
      
      // 更新分页信息
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          [period]: {
            current: response.pagination.current || page,
            pageSize: response.pagination.limit || pageSize,
            total: response.pagination.total || 0
          }
        }))
      }
      
      // 更新当前用户排名
      if (response.currentUserRanking !== undefined) {
        setCurrentUserRanking(prev => ({
          ...prev,
          [period]: response.currentUserRanking
        }))
      }
    }
  } catch (error) {
    console.error('获取排名数据失败:', error)
    message.error('获取排名数据失败，请稍后重试')
  } finally {
    setLoading(false)
  }
}
```

### 3. 表格列定义更新

#### 数据结构适配
```javascript
const getColumns = (type) => [
  {
    title: '排名',
    dataIndex: 'ranking', // 从 'rank' 改为 'ranking'
    key: 'ranking',
    width: 80,
    align: 'center',
    render: (ranking, record) => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: record.id === user.id ? 'bold' : 'normal', // 从 'user_id' 改为 'id'
        color: record.id === user.id ? '#1890ff' : getRankColor(ranking)
      }}>
        {getRankIcon(ranking)}
      </div>
    )
  },
  {
    title: '姓名',
    dataIndex: 'name', // 从 'user_name' 改为 'name'
    key: 'name',
    render: (name, record) => (
      <Space>
        <Avatar 
          size="small" 
          icon={<UserOutlined />}
          style={{ 
            backgroundColor: record.id === user.id ? '#1890ff' : '#87d068' 
          }}
        />
        <span style={{ 
          fontWeight: record.id === user.id ? 'bold' : 'normal',
          color: record.id === user.id ? '#1890ff' : 'inherit'
        }}>
          {name}
          {record.id === user.id && <Tag color="blue" size="small" style={{ marginLeft: 8 }}>我</Tag>}
        </span>
      </Space>
    )
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    render: (department) => <Tag color="geekblue">{department}</Tag>
  },
  {
    title: '职位', // 新增职位列
    dataIndex: 'position',
    key: 'position',
    render: (position) => <Tag color="cyan">{position}</Tag>
  },
  {
    title: '获赞数量',
    dataIndex: 'received_stars', // 从 'total_stars' 改为 'received_stars'
    key: 'received_stars',
    align: 'right',
    render: (stars, record) => (
      <Space>
        <StarOutlined style={{ color: '#fadb14' }} />
        <span style={{ 
          fontWeight: 'bold',
          color: record.id === user.id ? '#1890ff' : '#666'
        }}>
          {stars}
        </span>
      </Space>
    )
  }
]
```

### 4. 分页功能实现

#### 分页处理函数
```javascript
const handleTableChange = (period, pagination) => {
  fetchRankings(period, pagination.current, pagination.pageSize)
}
```

#### 表格分页配置
```javascript
<Table
  dataSource={rankings.month}
  columns={getColumns('month')}
  pagination={{
    current: pagination.month.current,
    pageSize: pagination.month.pageSize,
    total: pagination.month.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 人`,
    onChange: (page, pageSize) => handleTableChange('month', { current: page, pageSize }),
    onShowSizeChange: (current, size) => handleTableChange('month', { current: 1, pageSize: size })
  }}
  size="small"
  rowKey="id" // 从 'user_id' 改为 'id'
  loading={loading}
  rowClassName={(record) => record.id === user.id ? 'user-row' : ''}
  locale={{
    emptyText: '暂无排名数据'
  }}
/>
```

### 5. 个人排名概览更新

#### 数据字段适配
```javascript
<Card className="card-shadow">
  <Statistic
    title="本月排名"
    value={myRanking.month?.ranking || currentUserRanking.month || '-'}
    prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
    suffix="位"
    valueStyle={{ color: '#1890ff' }}
  />
  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
    本月获赞 {myRanking.month?.received_stars || 0} ⭐
  </div>
  {myRanking.month?.monthly_highlights && (
    <div style={{ marginTop: 4, fontSize: 11, color: '#52c41a' }}>
      比上月 {myRanking.month.monthly_highlights.growth_percentage > 0 ? '增长' : '下降'} {Math.abs(myRanking.month.monthly_highlights.growth_percentage)}%
    </div>
  )}
</Card>
```

## 数据字段映射

### 后端到前端字段映射

| 后端字段 | 前端字段 | 说明 |
|----------|----------|------|
| `id` | `id` | 用户ID |
| `name` | `name` | 用户姓名 |
| `department` | `department` | 部门 |
| `position` | `position` | 职位 |
| `received_stars` | `received_stars` | 获赠星数 |
| `ranking` | `ranking` | 排名 |

### 分页信息映射

| 后端字段 | 前端字段 | 说明 |
|----------|----------|------|
| `pagination.current` | `pagination.current` | 当前页码 |
| `pagination.limit` | `pagination.pageSize` | 每页条数 |
| `pagination.total` | `pagination.total` | 总条数 |
| `currentUserRanking` | `currentUserRanking` | 当前用户排名 |

## 功能特性

### 1. 分页功能
- **页码切换**: 支持点击页码切换
- **页面大小**: 支持调整每页显示条数
- **快速跳转**: 支持输入页码快速跳转
- **总数显示**: 显示总人数信息

### 2. 数据展示
- **排名图标**: 前三名显示特殊图标
- **用户标识**: 当前用户行高亮显示
- **部门标签**: 部门信息用标签展示
- **职位信息**: 新增职位列显示

### 3. 个人排名概览
- **多周期排名**: 显示月度、季度、年度排名
- **获赞数量**: 显示各周期获赞星数
- **增长趋势**: 月度排名显示增长百分比
- **排名变化**: 实时显示排名变化

### 4. 用户体验
- **加载状态**: 数据加载时显示loading
- **错误处理**: API调用失败时显示错误信息
- **空状态**: 无数据时显示友好提示
- **响应式**: 支持移动端和桌面端

## 技术实现

### 1. 状态管理
- 使用React Hooks管理组件状态
- 分离不同周期的数据状态
- 独立管理分页状态

### 2. 数据获取
- 支持分页参数传递
- 并行获取多个周期数据
- 错误处理和重试机制

### 3. 组件设计
- 可复用的表格列定义
- 动态分页配置
- 条件渲染和样式

### 4. 性能优化
- 按需加载数据
- 避免不必要的重新渲染
- 合理的数据更新策略

## 业务逻辑

### 1. 排名计算
- 后端按获赠星数降序排列
- 相同星数按姓名升序排列
- 实时计算当前用户排名

### 2. 分页逻辑
- 支持不同周期的独立分页
- 保持分页状态
- 切换周期时重置分页

### 3. 数据同步
- 个人排名概览与排行榜数据同步
- 实时更新排名信息
- 支持数据刷新

## 后续优化建议

### 1. 缓存机制
- 实现数据缓存
- 减少重复API调用
- 提升用户体验

### 2. 实时更新
- 实现WebSocket连接
- 实时更新排名数据
- 动态刷新界面

### 3. 高级功能
- 添加排名趋势图
- 支持排名历史查看
- 提供排名分析报告

### 4. 性能优化
- 虚拟滚动支持大数据量
- 懒加载优化
- 数据预加载策略

通过这次数据适配，排行榜页面现在能够准确显示从后端接口获取的真实数据，包括完整的排名信息、分页功能、用户排名概览等，为用户提供了更准确和有意义的排名数据展示。
