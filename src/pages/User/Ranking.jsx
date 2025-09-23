import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Card,
  Table,
  Avatar,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Progress,
  Space
} from 'antd'
import ModernCard from '../../components/ModernCard'
import {
  TrophyOutlined,
  StarOutlined,
  CrownOutlined,
  RiseOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { rankingsService } from '../../services/rankingsService'
import { message } from 'antd'

const Ranking = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('year')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [rankings, setRankings] = useState({
    year: [],
    month: [],
    quarter: []
  })
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
  const [myRanking, setMyRanking] = useState({
    year: null,
    month: null,
    quarter: null
  })
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
  const [forceUpdate, setForceUpdate] = useState(0)

  // 获取排名数据
  const fetchRankings = async (period, page = 1, pageSize = 10, append = false) => {
    if (!user?.id) return
    
    if (isMobile && append) {
      setMobileLoading(prev => ({ ...prev, [period]: true }))
    } else {
      setLoading(true)
    }
    
    try {
      console.log(`Fetching rankings for period: ${period}, page: ${page}, pageSize: ${pageSize}, append: ${append}`)
      const response = await rankingsService.getRankings({ 
        period, 
        page, 
        limit: pageSize 
      })
      console.log(`Rankings response for ${period}:`, response)
      
      if (response.success) {
        const rankingsData = response.data || []
        
        if (isMobile && append) {
          // 移动端追加数据
          setRankings(prev => ({
            ...prev,
            [period]: [...prev[period], ...rankingsData]
          }))
        } else {
          // 桌面端或首次加载，替换数据
          setRankings(prev => ({
            ...prev,
            [period]: rankingsData
          }))
        }
        
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
        
        // 检查是否还有更多数据
        setHasMore(prev => ({
          ...prev,
          [period]: response.pagination?.hasNext || false
        }))
      } else {
        message.error(response.message || '获取排名数据失败')
      }
    } catch (error) {
      console.error('获取排名数据失败:', error)
      message.error('获取排名数据失败，请稍后重试')
    } finally {
      if (isMobile && append) {
        setMobileLoading(prev => ({ ...prev, [period]: false }))
      } else {
        setLoading(false)
      }
    }
  }

  // 获取我的排名信息
  const fetchMyRanking = async (period) => {
    if (!user?.id) return
    
    try {
      const response = await rankingsService.getMyRanking({ period })
      if (response.success) {
        setMyRanking(prev => ({
          ...prev,
          [period]: response.data.user
        }))
      }
    } catch (error) {
      console.error('获取我的排名信息失败:', error)
    }
  }

  // 初始化数据
  useEffect(() => {
    if (user?.id) {
      fetchRankings('year')
      fetchRankings('month')
      fetchRankings('quarter')
      fetchMyRanking('year')
      fetchMyRanking('month')
      fetchMyRanking('quarter')
    }
  }, [user?.id])

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 获取当前用户在各个排名中的位置
  const userYearRank = myRanking.year
  const userMonthRank = myRanking.month
  const userQuarterRank = myRanking.quarter

  // 移动端排行榜卡片组件
  const RankingCard = ({ item, index }) => (
    <Card
      size="small"
      style={{ 
        marginBottom: 12,
        backgroundColor: item.id === user.id ? '#e6f7ff' : '#fff',
        border: item.id === user.id ? '1px solid #1890ff' : '1px solid #f0f0f0'
      }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 排名 */}
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: item.ranking <= 3 ? '#fadb14' : '#f5f5f5',
            color: item.ranking <= 3 ? '#fff' : '#666',
            fontWeight: 'bold',
            fontSize: 14
          }}>
            {item.ranking <= 3 ? getRankIcon(item.ranking) : item.ranking}
          </div>
          
          {/* 用户信息 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Avatar 
                size="small" 
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: item.id === user.id ? '#1890ff' : item.is_admin ? '#fa8c16' : '#87d068' 
                }}
              />
              <span style={{ 
                fontWeight: item.id === user.id ? 'bold' : 'normal',
                color: item.id === user.id ? '#1890ff' : 'inherit',
                fontSize: 14
              }}>
                {item.name}
              </span>
              {item.id === user.id && <Tag color="blue" size="small">我</Tag>}
              {item.is_admin && <Tag color="orange" size="small">管理员</Tag>}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#666' }}>
              <Tag color="geekblue" size="small">{item.department}</Tag>
              <Tag color="cyan" size="small">{item.position}</Tag>
            </div>
          </div>
        </div>
        
        {/* 获赞数量 */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 'bold',
            color: item.id === user.id ? '#1890ff' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <StarOutlined style={{ color: '#fadb14' }} />
            {item.received_stars}
          </div>
        </div>
      </div>
    </Card>
  )

  // 排名图标
  const getRankIcon = (rank) => {
    if (rank === 1) return <CrownOutlined style={{ color: '#fadb14' }} />
    if (rank === 2) return <TrophyOutlined style={{ color: '#d9d9d9' }} />
    if (rank === 3) return <TrophyOutlined style={{ color: '#d46b08' }} />
    return <span style={{ color: '#666' }}>{rank}</span>
  }

  // 排名颜色
  const getRankColor = (rank) => {
    if (rank === 1) return '#fadb14'
    if (rank === 2) return '#d9d9d9'
    if (rank === 3) return '#d46b08'
    return '#666'
  }

  // 表格列定义
  const getColumns = (type) => [
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 80,
      align: 'center',
      responsive: ['md'], // 中等屏幕以上显示
      render: (ranking, record) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: record.id === user.id ? 'bold' : 'normal',
          color: record.id === user.id ? '#1890ff' : getRankColor(ranking)
        }}>
          {getRankIcon(ranking)}
        </div>
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            style={{ 
              backgroundColor: record.id === user.id ? '#1890ff' : record.is_admin ? '#fa8c16' : '#87d068' 
            }}
          />
          <span style={{ 
            fontWeight: record.id === user.id ? 'bold' : 'normal',
            color: record.id === user.id ? '#1890ff' : 'inherit'
          }}>
            {name}
            {record.id === user.id && <Tag color="blue" size="small" style={{ marginLeft: 8 }}>我</Tag>}
            {record.is_admin && <Tag color="orange" size="small" style={{ marginLeft: 8 }}>管理员</Tag>}
          </span>
        </Space>
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      responsive: ['lg'], // 大屏幕以上显示
      render: (department) => <Tag color="geekblue">{department}</Tag>
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      responsive: ['xl'], // 超大屏幕以上显示
      render: (position) => <Tag color="cyan">{position}</Tag>
    },
    {
      title: '获赞数量',
      dataIndex: 'received_stars',
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

  // 处理分页变化
  const handleTableChange = (period, pagination) => {
    fetchRankings(period, pagination.current, pagination.pageSize)
  }

  // 移动端加载更多数据
  const loadMoreData = (period) => {
    if (mobileLoading[period] || !hasMore[period]) return
    
    const currentPage = pagination[period]?.current || 1
    const pageSize = pagination[period]?.pageSize || 10
    const nextPage = currentPage + 1
    
    fetchRankings(period, nextPage, pageSize, true)
  }

  // 滚动监听和触底检测
  const scrollContainerRef = useRef(null)
  
  const handleScroll = useCallback((e) => {
    if (!isMobile) return
    
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const threshold = 100 // 距离底部100px时触发加载
    
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMoreData(activeTab)
    }
  }, [isMobile, activeTab, mobileLoading, hasMore, pagination])

  // 添加滚动监听
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container && isMobile) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, isMobile])

  // 渲染排行榜内容
  const renderRankingContent = (period) => {
    const data = rankings[period]
    const paginationInfo = pagination[period]
    
    if (isMobile) {
      // 移动端卡片视图
      return (
        <div>
          {data.map((item, index) => (
            <RankingCard key={item.id} item={item} index={index} />
          ))}
          
          {/* 加载更多状态 */}
          {mobileLoading[period] && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#1890ff'
            }}>
              <div>加载更多数据中...</div>
            </div>
          )}
          
          {/* 没有更多数据提示 */}
          {!hasMore[period] && data.length > 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#999',
              fontSize: '14px'
            }}>
              已加载全部数据
            </div>
          )}
          
          {/* 空数据状态 */}
          {data.length === 0 && !loading && !mobileLoading[period] && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#999'
            }}>
              暂无排名数据
            </div>
          )}
          
          {/* 首次加载状态 */}
          {loading && data.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div>加载中...</div>
            </div>
          )}
        </div>
      )
    } else {
      // 桌面端表格视图
      return (
        <Table
          dataSource={data}
          columns={getColumns(period)}
          pagination={{
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize,
            total: paginationInfo.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 人`,
            onChange: (page, pageSize) => handleTableChange(period, { current: page, pageSize }),
            onShowSizeChange: (current, size) => handleTableChange(period, { current: 1, pageSize: size })
          }}
          size="small"
          rowKey="id"
          loading={loading}
          rowClassName={(record) => record.id === user.id ? 'user-row' : ''}
          locale={{
            emptyText: '暂无排名数据'
          }}
        />
      )
    }
  }

  const tabItems = [
    {
      key: 'year',
      label: '年度排名',
      children: renderRankingContent('year')
    },
    {
      key: 'month',
      label: '本月排名',
      children: renderRankingContent('month')
    },
    {
      key: 'quarter',
      label: '本季度排名',
      children: renderRankingContent('quarter')
    }
  ]

  return (
    <div>
      {/* 个人排名概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <ModernCard hoverable>
            <Statistic
              title="本月排名"
              value={myRanking.month?.ranking || currentUserRanking.month || '-'}
              prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
              suffix="位"
              valueStyle={{ color: '#1890ff', fontSize: isMobile ? 20 : 24 }}
            />
            <div style={{ marginTop: 8, fontSize: isMobile ? 11 : 12, color: '#666' }}>
              本月获赞 {myRanking.month?.received_stars || 0} ⭐
            </div>
            <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 11, color: '#52c41a', minHeight: isMobile ? 12 : 14 }}>
              {myRanking.month?.monthly_highlights ? (
                `比上月 ${myRanking.month.monthly_highlights.growth_percentage > 0 ? '增长' : '下降'} ${Math.abs(myRanking.month.monthly_highlights.growth_percentage)}%`
              ) : (
                <span style={{ opacity: 0 }}>占位</span>
              )}
            </div>
          </ModernCard>
        </Col>
        
        <Col xs={24} sm={8}>
          <ModernCard hoverable>
            <Statistic
              title="季度排名"
              value={myRanking.quarter?.ranking || currentUserRanking.quarter || '-'}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              suffix="位"
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? 20 : 24 }}
            />
            <div style={{ marginTop: 8, fontSize: isMobile ? 11 : 12, color: '#666' }}>
              本季度获赞 {myRanking.quarter?.received_stars || 0} ⭐
            </div>
            <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 11, color: '#52c41a', minHeight: isMobile ? 12 : 14 }}>
              {myRanking.quarter?.quarterly_highlights ? (
                `比上季度 ${myRanking.quarter.quarterly_highlights.growth_percentage > 0 ? '增长' : '下降'} ${Math.abs(myRanking.quarter.quarterly_highlights.growth_percentage)}%`
              ) : (
                <span style={{ opacity: 0 }}>占位</span>
              )}
            </div>
          </ModernCard>
        </Col>
        
        <Col xs={24} sm={8}>
          <ModernCard hoverable>
            <Statistic
              title="年度排名"
              value={myRanking.year?.ranking || currentUserRanking.year || '-'}
              prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
              suffix="位"
              valueStyle={{ color: '#fa8c16', fontSize: isMobile ? 20 : 24 }}
            />
            <div style={{ marginTop: 8, fontSize: isMobile ? 11 : 12, color: '#666' }}>
              年度获赞 {myRanking.year?.received_stars || 0} ⭐
            </div>
            <div style={{ marginTop: 4, fontSize: isMobile ? 10 : 11, color: '#52c41a', minHeight: isMobile ? 12 : 14 }}>
              {myRanking.year?.yearly_highlights ? (
                `比去年 ${myRanking.year.yearly_highlights.growth_percentage > 0 ? '增长' : '下降'} ${Math.abs(myRanking.year.yearly_highlights.growth_percentage)}%`
              ) : (
                <span style={{ opacity: 0 }}>占位</span>
              )}
            </div>
          </ModernCard>
        </Col>
      </Row>

      {/* 排名进度 */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="排名进度分析" className="card-shadow">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>年度目标进度</span>
                    <span>{Math.round(((userYearRank?.total_stars || 0) / 1200) * 100)}%</span>
                  </div>
                  <Progress
                    percent={Math.round(((userYearRank?.total_stars || 0) / 1200) * 100)}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    目标：1200 ⭐，当前：{userYearRank?.total_stars || 0} ⭐
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>月度活跃度</span>
                    <span>85%</span>
                  </div>
                  <Progress
                    percent={85}
                    strokeColor={{
                      '0%': '#fa541c',
                      '100%': '#faad14',
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    基于赠送和获赞活跃度计算
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row> */}

      {/* 排行榜 */}
      <ModernCard title="全员排行榜" hoverable>
        <div 
          ref={scrollContainerRef}
          className={isMobile ? 'ranking-scroll-container' : ''}
          style={{
            maxHeight: isMobile ? '70vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible',
            paddingRight: isMobile ? '8px' : '0'
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </div>
      </ModernCard>

      <style jsx="true">{`
        :global(.user-row) {
          background-color: #e6f7ff !important;
        }
        :global(.user-row:hover) {
          background-color: #bae7ff !important;
        }
        
        /* 移动端样式优化 */
        @media (max-width: 768px) {
          :global(.ant-card-body) {
            padding: 12px !important;
          }
          
          :global(.ant-statistic-title) {
            font-size: 12px !important;
          }
          
          :global(.ant-statistic-content) {
            font-size: 18px !important;
          }
          
          :global(.ant-tabs-tab) {
            font-size: 14px !important;
            padding: 8px 12px !important;
          }
          
          :global(.ant-tabs-content-holder) {
            padding-top: 12px !important;
          }
          
          :global(.ant-avatar) {
            width: 24px !important;
            height: 24px !important;
            line-height: 24px !important;
          }
          
          :global(.ant-tag) {
            font-size: 10px !important;
            padding: 2px 6px !important;
            margin: 2px !important;
          }
        }
        
        /* 移动端卡片样式 */
        @media (max-width: 768px) {
          .ranking-card {
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          }
          
          .ranking-card .ant-card-body {
            padding: 12px !important;
          }
          
          /* 滚动容器样式 */
          .ranking-scroll-container {
            -webkit-overflow-scrolling: touch !important;
            scroll-behavior: smooth !important;
          }
          
          /* 滚动条样式 */
          .ranking-scroll-container::-webkit-scrollbar {
            width: 4px !important;
          }
          
          .ranking-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1 !important;
            border-radius: 2px !important;
          }
          
          .ranking-scroll-container::-webkit-scrollbar-thumb {
            background: #c1c1c1 !important;
            border-radius: 2px !important;
          }
          
          .ranking-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8 !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Ranking
