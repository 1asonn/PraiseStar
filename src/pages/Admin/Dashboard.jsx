import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Progress, List, Avatar, Tag, Space, Spin, message } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  StarOutlined,
  GiftOutlined,
  SendOutlined,
  RiseOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { starApi, giftApi, rankingApi } from '../../services/api'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    overview: {
      total_users: 0,
      monthly_allocated: "0",
      monthly_given: "0",
      remaining_unused: "0"
    },
    activity: {
      users_who_gave: 0,
      users_who_gave_rate: 0,
      users_who_received: 0,
      users_who_received_rate: 0
    },
    usage: {
      usage_rate: 0,
      total_allocated: "0",
      total_used: "0",
      used_display: "0/0"
    },
    departments: []
  })
  const [rankings, setRankings] = useState([])
  const [recentGives, setRecentGives] = useState([])
  const [recentRedemptions, setRecentRedemptions] = useState([])

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      setLoading(true)
      const statsResponse = await starApi.getSystemStats()
      if (statsResponse.success) {
        setStats(statsResponse.data)
      } else {
        message.error(statsResponse.message || '获取统计数据失败')
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
      message.error('获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载排行榜数据
  const loadRankings = async () => {
    try {
      const rankingsResponse = await rankingApi.getRankings('year')
      if (rankingsResponse.success) {
        setRankings(rankingsResponse.data.slice(0, 5)) // 前5名
      }
    } catch (error) {
      console.error('加载排行榜失败:', error)
    }
  }

  // 加载最近赠送记录
  const loadRecentGives = async () => {
    try {
      const givesResponse = await starApi.getGiveRecords({ page: 1, limit: 5 })
      if (givesResponse.success) {
        setRecentGives(givesResponse.data.slice(0, 5))
      }
    } catch (error) {
      console.error('加载最近赠送记录失败:', error)
    }
  }

  // 加载最近兑换记录
  const loadRecentRedemptions = async () => {
    try {
      const redemptionsResponse = await giftApi.getRedemptions()
      if (redemptionsResponse.success) {
        setRecentRedemptions(redemptionsResponse.data.slice(0, 5))
      }
    } catch (error) {
      console.error('加载最近兑换记录失败:', error)
    }
  }

  // 初始化加载数据
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadStatistics(),
        loadRankings(),
        loadRecentGives(),
        loadRecentRedemptions()
      ])
    }
    loadAllData()
  }, [])

  // 部门统计数据
  const departmentStats = stats.departments || []

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
              fontSize: '12px',
              backgroundColor: '#f0f8ff',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '6px'
            }}>
              {keyword}
            </span>
            <span style={{ color: '#333', fontSize: '12px' }}>
              {reason}
            </span>
          </div>
        )
      } else if (keyword) {
        return (
          <span style={{ 
            color: '#1890ff', 
            fontWeight: 'bold',
            fontSize: '12px',
            backgroundColor: '#f0f8ff',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {keyword}
          </span>
        )
      } else if (reason) {
        return <span style={{ color: '#333', fontSize: '12px' }}>{reason}</span>
      }
    }
    
    // 兼容旧数据结构
    if (item.reason === '其他' && item.customReason) {
      return <span style={{ color: '#333', fontSize: '12px' }}>{item.customReason}</span>
    }
    
    return <span style={{ color: '#999', fontSize: '12px' }}>{typeof item.reason === 'string' ? item.reason : '无理由'}</span>
  }

  const departmentColumns = [
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '总人数',
      dataIndex: 'total_users',
      key: 'total_users',
      align: 'center'
    },
    {
      title: '活跃人数',
      dataIndex: 'active_users',
      key: 'active_users',
      align: 'center',
      render: (activeUsers, record) => (
        <span>
          {activeUsers}
          <span style={{ color: '#666', fontSize: 12, marginLeft: 4 }}>
            ({Math.round((activeUsers / record.total_users) * 100)}%)
          </span>
        </span>
      )
    },
    {
      title: '活跃率',
      dataIndex: 'active_rate',
      key: 'active_rate',
      align: 'center',
      render: (rate) => (
        <span style={{ color: rate > 50 ? '#52c41a' : '#fa8c16' }}>
          {rate}%
        </span>
      )
    },
    {
      title: '人均获赞',
      dataIndex: 'avg_received_per_person',
      key: 'avg_received_per_person',
      align: 'center',
      render: (avgStars) => (
        <Space>
          <StarOutlined style={{ color: '#fadb14' }} />
          {avgStars}
        </Space>
      )
    }
  ]

  return (
    <div>
      <style>{`
        /* 移动端样式优化 */
        @media (max-width: 768px) {
          :global(.ant-card-body) {
            padding: 12px !important;
          }
          
          :global(.ant-statistic-title) {
            font-size: 12px !important;
            margin-bottom: 4px !important;
          }
          
          :global(.ant-statistic-content) {
            font-size: 18px !important;
          }
          
          :global(.ant-statistic-content-value) {
            font-size: 18px !important;
          }
          
          :global(.ant-statistic-content-suffix) {
            font-size: 14px !important;
          }
          
          :global(.ant-progress-text) {
            font-size: 12px !important;
          }
          
          :global(.ant-table) {
            font-size: 12px;
          }
          
          :global(.ant-table-thead > tr > th) {
            padding: 8px 4px !important;
            font-size: 12px !important;
          }
          
          :global(.ant-table-tbody > tr > td) {
            padding: 8px 4px !important;
            font-size: 12px !important;
          }
          
          :global(.ant-list-item-meta-avatar) {
            margin-right: 12px !important;
          }
          
          :global(.ant-avatar) {
            width: 36px !important;
            height: 36px !important;
          }
          
          :global(.ant-list-item-meta-title) {
            font-size: 14px !important;
            margin-bottom: 4px !important;
          }
          
          :global(.ant-list-item-meta-description) {
            font-size: 12px !important;
          }
        }
        
        /* 超小屏幕优化 */
        @media (max-width: 480px) {
          :global(.ant-card-body) {
            padding: 8px !important;
          }
          
          :global(.ant-statistic-content) {
            font-size: 16px !important;
          }
          
          :global(.ant-statistic-content-value) {
            font-size: 16px !important;
          }
          
          :global(.ant-statistic-title) {
            font-size: 11px !important;
          }
        }
      `}</style>
      
      {loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <Spin size="large" />
        </div>
      )}
            {!loading && (
        <>
          {/* 系统总览统计 */}
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card className="card-shadow" style={{ height: '100%' }}>
            <Statistic
              title="总用户数"
              value={stats.overview.total_users}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card className="card-shadow" style={{ height: '100%' }}>
            <Statistic
              title="本月已分配"
              value={stats.overview.monthly_allocated}
              prefix={<StarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card className="card-shadow" style={{ height: '100%' }}>
            <Statistic
              title="本月已赠送"
              value={stats.overview.monthly_given}
              prefix={<SendOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card className="card-shadow" style={{ height: '100%' }}>
            <Statistic
              title="剩余未使用"
              value={stats.overview.remaining_unused}
              prefix={<StarOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 活跃度统计 */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="本月活跃度统计" className="card-shadow">
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a', marginBottom: 8 }}>
                    {stats.activity.users_who_gave}
                  </div>
                  <div style={{ color: '#666' }}>赠送用户数</div>
                  <Progress
                    percent={stats.activity.users_who_gave_rate}
                    size="small"
                    strokeColor="#52c41a"
                    style={{ marginTop: 8 }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff', marginBottom: 8 }}>
                    {stats.activity.users_who_received}
                  </div>
                  <div style={{ color: '#666' }}>获赞用户数</div>
                  <Progress
                    percent={stats.activity.users_who_received_rate}
                    size="small"
                    strokeColor="#1890ff"
                    style={{ marginTop: 8 }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="使用率分析" className="card-shadow">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>赞赞星使用率</span>
                <span>{stats.usage.usage_rate}%</span>
              </div>
              <Progress
                percent={stats.usage.usage_rate}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              已使用 {stats.usage.used_display} ⭐
            </div>
          </Card>
        </Col>
      </Row>

      {/* 部门统计表格 */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="部门活跃度统计" className="card-shadow">
            <Table
              dataSource={departmentStats}
              columns={departmentColumns}
              pagination={false}
              size="small"
              rowKey="department"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[8, 8]}>
        {/* 排行榜前5 */}
        <Col xs={24} lg={12}>
          <Card title="年度获赠排行榜 TOP5" className="card-shadow">
            <List
              dataSource={rankings}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: index < 3 ? ['#fadb14', '#d9d9d9', '#d46b08'][index] : '#87d068'
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <span>{item.name || item.userName}</span>
                        <Tag color="blue" size="small">{item.department}</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <StarOutlined style={{ color: '#fadb14' }} />
                        <span>{item.received_stars} ⭐</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近赠送记录 */}
        <Col xs={24} lg={12}>
          <Card title="最近赠送记录" className="card-shadow">
            <List
              dataSource={recentGives}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<SendOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                    title={
                      <Space>
                        <span>{item.from_user_name || item.fromUser?.name}</span>
                        <span>→</span>
                        <span>{item.to_user_name || item.toUser?.name}</span>
                        <Tag color="green">+{item.stars}⭐</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ fontSize: 12 }}>
                          {getDisplayReason(item)}
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                          {item.createTime || item.createdAt}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近兑换记录 */}
      <Row style={{ marginTop: 8 }}>
        <Col span={24}>
          <Card title="最近兑换记录" className="card-shadow">
            <List
              dataSource={recentRedemptions}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Tag color={item.status === '已完成' ? 'green' : 'blue'}>
                      {item.status}
                    </Tag>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<GiftOutlined />} style={{ backgroundColor: '#fa8c16' }} />}
                    title={
                      <Space>
                        <span>{item.userName || item.user?.name}</span>
                        <span>兑换</span>
                        <span>{item.giftName || item.gift?.name}</span>
                        <Tag color="orange">-{item.starsCost || item.starCost}⭐</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ fontSize: 12 }}>
                          配送方式：{item.deliveryMethod === 'pickup' ? '现场领取' : '邮寄'}
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                          {item.createTime || item.createdAt}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
