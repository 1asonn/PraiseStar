import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Select,
  Button,
  Space,
  Tag,
  Avatar,
  Spin,
  message,
  Tabs,
  Empty,
  Tooltip,
  List
} from 'antd'
import {
  StarOutlined,
  SendOutlined,
  CalendarOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  HistoryOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { starsService } from '../../services/starsService'
import dayjs from 'dayjs'

// 立体星星组件
const StarIcon = ({ color = '#722ed1', size = '16px' }) => (
  <span style={{
    display: 'inline-block',
    fontSize: size,
    filter: `drop-shadow(0 2px 4px ${color}40)`,
    textShadow: `0 1px 3px ${color}60, 0 0 6px ${color}40`,
    transform: 'perspective(100px) rotateX(10deg)',
    fontWeight: 'bold'
  }}>
    ⭐
  </span>
)

const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs

const Record = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({
    totalReceived: 0,
    totalGiven: 0,
    totalReceivedCount: 0,
    totalGivenCount: 0
  })

  // 根据筛选条件计算显示的统计数据
  const getDisplaySummary = () => {
    if (filters.type === 'received') {
      return {
        totalReceived: summary.totalReceived,
        totalGiven: 0,
        totalReceivedCount: summary.totalReceivedCount,
        totalGivenCount: 0
      }
    } else if (filters.type === 'sent') {
      return {
        totalReceived: 0,
        totalGiven: summary.totalGiven,
        totalReceivedCount: 0,
        totalGivenCount: summary.totalGivenCount
      }
    } else {
      return summary
    }
  }
  
  // 响应式状态
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
  // 筛选状态
  const [filters, setFilters] = useState({
    type: 'all', // all, received, given
    timeRange: 'month', // day, week, month, year, custom
    startDate: null,
    endDate: null
  })

  // 懒加载状态
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // 获取记录数据
  const fetchRecords = async (page = 1, append = false) => {
    if (!user?.id) return

    if (page === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = {
        page: page,
        limit: pageSize
      }

      // 根据筛选条件设置参数
      if (filters.type !== 'all') {
        params.type = filters.type
      }

      // 设置时间范围
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD')
        params.endDate = filters.endDate.format('YYYY-MM-DD')
      } else {
        // 根据时间范围类型设置默认时间
        const now = dayjs()
        switch (filters.timeRange) {
          case 'day':
            params.startDate = now.format('YYYY-MM-DD')
            params.endDate = now.format('YYYY-MM-DD')
            break
          case 'week':
            params.startDate = now.startOf('week').format('YYYY-MM-DD')
            params.endDate = now.endOf('week').format('YYYY-MM-DD')
            break
          case 'month':
            params.startDate = now.startOf('month').format('YYYY-MM-DD')
            params.endDate = now.endOf('month').format('YYYY-MM-DD')
            break
          case 'year':
            params.startDate = now.startOf('year').format('YYYY-MM-DD')
            params.endDate = now.endOf('year').format('YYYY-MM-DD')
            break
          default:
            break
        }
      }

      const response = await starsService.getGiveRecords(params)
      
      if (response.success) {
        const newRecords = response.data.records || response.data || []
        
        if (append) {
          setRecords(prev => [...prev, ...newRecords])
        } else {
          setRecords(newRecords)
        }
        
        // 检查是否还有更多数据
        setHasMore(newRecords.length === pageSize)
        
        // 计算汇总数据（只在第一页时计算）
        if (page === 1) {
          const recordsData = response.data.records || response.data || []
          const receivedRecords = recordsData.filter(record => record.to_user_id === user.id)
          const givenRecords = recordsData.filter(record => record.from_user_id === user.id)
          
          setSummary({
            totalReceived: receivedRecords.reduce((sum, record) => sum + record.stars, 0),
            totalGiven: givenRecords.reduce((sum, record) => sum + record.stars, 0),
            totalReceivedCount: receivedRecords.length,
            totalGivenCount: givenRecords.length
          })
        }
      }
    } catch (error) {
      console.error('获取记录失败:', error)
      message.error('获取记录失败，请稍后重试')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 组件加载时获取数据
  useEffect(() => {
    setCurrentPage(1)
    fetchRecords(1, false)
  }, [user?.id, filters])

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    setCurrentPage(prevPage => {
      const nextPage = prevPage + 1
      fetchRecords(nextPage, true)
      return nextPage
    })
  }, [loadingMore, hasMore])

  // 处理筛选条件变化
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // 处理时间范围变化
  const handleTimeRangeChange = (dates) => {
    setFilters(prev => ({
      ...prev,
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
      timeRange: dates ? 'custom' : 'month'
    }))
  }

  // 重置筛选条件
  const resetFilters = () => {
    setFilters({
      type: 'all',
      timeRange: 'month',
      startDate: null,
      endDate: null
    })
  }

  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr) return '未知时间'
    return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss')
  }

  // 获取显示理由
  const getDisplayReason = (item) => {
    // 新的数据结构：reason是对象，包含keyword和reason
    if (item.reason && typeof item.reason === 'object') {
      const { keyword, reason } = item.reason
      if (keyword && reason) {
        return (
          <div>
            <span style={{ 
              color: '#1890ff', 
              fontWeight: 'bold',
              fontSize: '13px',
              backgroundColor: '#f0f8ff',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '6px'
            }}>
              {keyword}
            </span>
            <span style={{ color: '#333', fontSize: '13px' }}>
              {reason}
            </span>
          </div>
        )
      } else if (keyword) {
        return (
          <span style={{ 
            color: '#1890ff', 
            fontWeight: 'bold',
            fontSize: '13px',
            backgroundColor: '#f0f8ff',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {keyword}
          </span>
        )
      } else if (reason) {
        return <span style={{ color: '#333', fontSize: '13px' }}>{reason}</span>
      }
    }
    
    // 兼容旧数据结构
    if (item.reason === '其他' && item.custom_reason) {
      return <span style={{ color: '#333', fontSize: '13px' }}>{item.custom_reason}</span>
    }
    
    return <span style={{ color: '#999', fontSize: '13px' }}>{typeof item.reason === 'string' ? item.reason : '无理由'}</span>
  }

  // 表格列定义
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (_, record) => {
        const isReceived = record.to_user_id === user?.id
        return (
          <Tag color={isReceived ? 'blue' : 'green'}>
            {isReceived ? '收到' : '赠送'}
          </Tag>
        )
      }
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (_, record) => {
        const isReceived = record.to_user_id === user?.id
        const userName = isReceived ? record.from_user_name : record.to_user_name
        const userDepartment = isReceived ? record.from_user_department : record.to_user_department
        
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{userName || '未知用户'}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{userDepartment || '未知部门'}</div>
          </div>
        )
      }
    },
    {
      title: '赞赞星',
      dataIndex: 'stars',
      key: 'stars',
      width: 100,
      render: (stars, record) => {
        const isReceived = record.to_user_id === user?.id
        return (
          <Tag color={isReceived ? 'blue' : 'green'} style={{ fontSize: 14 }}>
            {isReceived ? '+' : '-'}{stars} <StarIcon color={isReceived ? '#1890ff' : '#52c41a'} size="14px" />
          </Tag>
        )
      }
    },
    {
      title: '理由',
      key: 'reason',
      render: (_, record) => getDisplayReason(record)
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (timeStr) => formatTime(timeStr)
    }
  ]

  // 桌面端分页配置
  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: records.length + (hasMore ? pageSize : 0), // 估算总数
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    onChange: (page, pageSize) => {
      setCurrentPage(page)
      fetchRecords(page, false)
    }
  }

  // 桌面端表格渲染
  const renderDesktopTable = () => {
    return (
      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        locale={{
          emptyText: (
            <Empty
              description="暂无记录"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
        scroll={{ x: 800 }}
      />
    )
  }

  // 移动端卡片列表渲染
  const renderMobileCardList = () => {
    return (
      <div>
        <List
          dataSource={records}
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description="暂无记录"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
          renderItem={(record) => {
            const isReceived = record.to_user_id === user?.id
            const userName = isReceived ? record.from_user_name : record.to_user_name
            const userDepartment = isReceived ? record.from_user_department : record.to_user_department
            
            return (
              <List.Item style={{ padding: '12px 0' }}>
                <Card
                  size="small"
                  style={{ 
                    width: '100%',
                    border: `1px solid ${isReceived ? '#e6f7ff' : '#f6ffed'}`,
                    borderRadius: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* 头像和类型标识 */}
                    <div style={{ flexShrink: 0 }}>
                      <Avatar 
                        icon={<UserOutlined />} 
                        style={{ 
                          backgroundColor: isReceived ? '#1890ff' : '#52c41a',
                          marginBottom: 4
                        }} 
                      />
                      <div style={{ textAlign: 'center' }}>
                        <Tag 
                          color={isReceived ? 'blue' : 'green'} 
                          size="small"
                          style={{ fontSize: 10, padding: '0 4px' }}
                        >
                          {isReceived ? '收到' : '赠送'}
                        </Tag>
                      </div>
                    </div>
                    
                    {/* 内容区域 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* 用户信息 */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          fontSize: 14,
                          color: '#262626',
                          marginBottom: 2
                        }}>
                          {userName || '未知用户'}
                        </div>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#8c8c8c'
                        }}>
                          {userDepartment || '未知部门'}
                        </div>
                      </div>
                      
                      {/* 赞赞星数量 */}
                      <div style={{ marginBottom: 8 }}>
                        <Tag 
                          color={isReceived ? 'blue' : 'green'} 
                          style={{ 
                            fontSize: 16, 
                            padding: '4px 8px',
                            fontWeight: 'bold'
                          }}
                        >
                          {isReceived ? '+' : '-'}{record.stars} <StarIcon color={isReceived ? '#1890ff' : '#52c41a'} size="16px" />
                        </Tag>
                      </div>
                      
                      {/* 理由 */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>
                          理由:
                        </div>
                        <div style={{ fontSize: 13, color: '#262626' }}>
                          {getDisplayReason(record)}
                        </div>
                      </div>
                      
                      {/* 时间 */}
                      <div style={{ fontSize: 11, color: '#bfbfbf' }}>
                        {formatTime(record.created_at)}
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )
          }}
        />
        
        {/* 懒加载更多按钮 */}
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button 
              onClick={loadMore}
              loading={loadingMore}
              type="dashed"
              size="small"
              style={{ width: '100%' }}
            >
              {loadingMore ? '加载中...' : '加载更多'}
            </Button>
          </div>
        )}
        
        {/* 没有更多数据提示 */}
        {!hasMore && records.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16, color: '#999', fontSize: 12 }}>
            已加载全部数据
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#1890ff' }}>
          <HistoryOutlined style={{ marginRight: 8 }} />
          历史记录
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          查看您的赞赞星赠送与获得历史记录
        </p>
      </div>

        {/* 筛选器 */}
       <Card style={{ marginBottom: 16 }}>
         <Row gutter={[16, 16]} align="middle">
           <Col xs={24} sm={12} md={6}>
             <div>
               <label style={{ display: 'block', marginBottom: 4, color: '#666', fontSize: isMobile ? 12 : 14 }}>
                 记录类型
               </label>
               <Select
                 value={filters.type}
                 onChange={(value) => handleFilterChange('type', value)}
                 style={{ width: '100%' }}
                 size={isMobile ? 'small' : 'middle'}
               >
                 <Option value="all">全部记录</Option>
                 <Option value="received">收到的记录</Option>
                 <Option value="sent">赠送的记录</Option>
               </Select>
             </div>
           </Col>
           
           <Col xs={24} sm={12} md={6}>
             <div>
               <label style={{ display: 'block', marginBottom: 4, color: '#666', fontSize: isMobile ? 12 : 14 }}>
                 时间范围
               </label>
               <Select
                 value={filters.timeRange}
                 onChange={(value) => handleFilterChange('timeRange', value)}
                 style={{ width: '100%' }}
                 size={isMobile ? 'small' : 'middle'}
               >
                 <Option value="day">今天</Option>
                 <Option value="week">本周</Option>
                 <Option value="month">本月</Option>
                 <Option value="year">今年</Option>
               </Select>
             </div>
           </Col>
           
           
           <Col xs={24} sm={12} md={4}>
             <div style={{ 
               display: 'flex', 
               flexDirection: isMobile ? 'column' : 'row',
               gap: isMobile ? 8 : 8,
               alignItems: isMobile ? 'stretch' : 'flex-end',
               height: '100%',
               paddingTop: isMobile ? 0 : 22 // 与label高度对齐
             }}>
               <Button
                 type="primary"
                 icon={<FilterOutlined />}
                 onClick={() => fetchRecords(1, false)}
                 loading={loading}
                 size={isMobile ? 'small' : 'middle'}
                 style={{ flex: isMobile ? 'none' : 1 }}
               >
                 筛选
               </Button>
               <Button
                 icon={<ReloadOutlined />}
                 onClick={resetFilters}
                 size={isMobile ? 'small' : 'middle'}
                 style={{ flex: isMobile ? 'none' : 1 }}
               >
                 重置
               </Button>
             </div>
           </Col>
         </Row>
       </Card>

             {/* 数据汇总 */}
       <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
         {(() => {
           const displaySummary = getDisplaySummary()
           const showReceived = filters.type === 'all' || filters.type === 'received'
           const showGiven = filters.type === 'all' || filters.type === 'sent'
           
           return (
             <>
               {showReceived && (
                 <>
                   <Col xs={12} sm={12} lg={6}>
                     <Card size={isMobile ? 'small' : 'default'}>
                       <Statistic
                         title={<span style={{ fontSize: isMobile ? 12 : 14 }}>收到赞赞星</span>}
                         value={displaySummary.totalReceived}
                         prefix={<StarOutlined style={{ color: '#1890ff' }} />}
                         suffix={<StarIcon color="#1890ff" />}
                         valueStyle={{ 
                           color: '#1890ff',
                           fontSize: isMobile ? 16 : 20
                         }}
                       />
                     </Card>
                   </Col>
                   <Col xs={12} sm={12} lg={6}>
                     <Card size={isMobile ? 'small' : 'default'}>
                       <Statistic
                         title={<span style={{ fontSize: isMobile ? 12 : 14 }}>收到次数</span>}
                         value={displaySummary.totalReceivedCount}
                         prefix={<StarOutlined style={{ color: '#1890ff' }} />}
                         suffix="次"
                         valueStyle={{ 
                           color: '#1890ff',
                           fontSize: isMobile ? 16 : 20
                         }}
                       />
                     </Card>
                   </Col>
                 </>
               )}
               {showGiven && (
                 <>
                   <Col xs={12} sm={12} lg={6}>
                     <Card size={isMobile ? 'small' : 'default'}>
                       <Statistic
                         title={<span style={{ fontSize: isMobile ? 12 : 14 }}>赠送赞赞星</span>}
                         value={displaySummary.totalGiven}
                         prefix={<SendOutlined style={{ color: '#52c41a' }} />}
                         suffix={<StarIcon color="#52c41a" />}
                         valueStyle={{ 
                           color: '#52c41a',
                           fontSize: isMobile ? 16 : 20
                         }}
                       />
                     </Card>
                   </Col>
                   <Col xs={12} sm={12} lg={6}>
                     <Card size={isMobile ? 'small' : 'default'}>
                       <Statistic
                         title={<span style={{ fontSize: isMobile ? 12 : 14 }}>赠送次数</span>}
                         value={displaySummary.totalGivenCount}
                         prefix={<SendOutlined style={{ color: '#52c41a' }} />}
                         suffix="次"
                         valueStyle={{ 
                           color: '#52c41a',
                           fontSize: isMobile ? 16 : 20
                         }}
                       />
                     </Card>
                   </Col>
                 </>
               )}
             </>
           )
         })()}
       </Row>

             {/* 记录列表 */}
       <Card
         title={
           <Space>
             <CalendarOutlined />
             <span style={{ fontSize: isMobile ? 14 : 16 }}>记录详情</span>
             <Tag color="blue" size={isMobile ? 'small' : 'default'}>
               {records.length} 条记录
             </Tag>
           </Space>
         }
         extra={
           !isMobile && (
             <Tooltip title="导出记录">
               <Button icon={<DownloadOutlined />} disabled={records.length === 0}>
                 导出
               </Button>
             </Tooltip>
           )
         }
       >
                   {isMobile ? (
            renderMobileCardList()
          ) : (
            renderDesktopTable()
          )}
       </Card>
    </div>
  )
}

export default Record
