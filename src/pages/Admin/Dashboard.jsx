import React from 'react'
import { Row, Col, Card, Statistic, Table, Progress, List, Avatar, Tag, Space } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  StarOutlined,
  GiftOutlined,
  SendOutlined,
  RiseOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import { getSystemStats, getUserRankings, mockGiveRecords, mockRedemptions } from '../../data/mockData'

const AdminDashboard = () => {
  const stats = getSystemStats()
  const rankings = getUserRankings().slice(0, 5) // 前5名
  const recentGives = mockGiveRecords.slice(0, 5)
  const recentRedemptions = mockRedemptions.slice(0, 5)

  // 部门统计数据
  const departmentStats = [
    { department: '研发中心', totalUsers: 15, activeUsers: 12, avgStars: 45 },
    { department: '市场部', totalUsers: 8, activeUsers: 6, avgStars: 38 },
    { department: '人力行政部', totalUsers: 5, activeUsers: 5, avgStars: 52 },
    { department: '总经理办', totalUsers: 2, activeUsers: 2, avgStars: 109 }
  ]

  const departmentColumns = [
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '总人数',
      dataIndex: 'totalUsers',
      key: 'totalUsers',
      align: 'center'
    },
    {
      title: '活跃人数',
      dataIndex: 'activeUsers',
      key: 'activeUsers',
      align: 'center',
      render: (activeUsers, record) => (
        <span>
          {activeUsers}
          <span style={{ color: '#666', fontSize: 12, marginLeft: 4 }}>
            ({Math.round((activeUsers / record.totalUsers) * 100)}%)
          </span>
        </span>
      )
    },
    {
      title: '人均获赞',
      dataIndex: 'avgStars',
      key: 'avgStars',
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
      {/* 系统总览统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="本月已分配"
              value={stats.totalAllocatedThisMonth}
              prefix={<StarOutlined style={{ color: '#52c41a' }} />}
              suffix="⭐"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="本月已赠送"
              value={stats.totalGivenThisMonth}
              prefix={<SendOutlined style={{ color: '#fa8c16' }} />}
              suffix="⭐"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="剩余未使用"
              value={stats.totalRemainingThisMonth}
              prefix={<StarOutlined style={{ color: '#eb2f96' }} />}
              suffix="⭐"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 活跃度统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="本月活跃度统计" className="card-shadow">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a', marginBottom: 8 }}>
                    {stats.usersWhoGave}
                  </div>
                  <div style={{ color: '#666' }}>赠送用户数</div>
                  <Progress
                    percent={Math.round((stats.usersWhoGave / stats.totalUsers) * 100)}
                    size="small"
                    strokeColor="#52c41a"
                    style={{ marginTop: 8 }}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff', marginBottom: 8 }}>
                    {stats.usersWhoReceived}
                  </div>
                  <div style={{ color: '#666' }}>获赞用户数</div>
                  <Progress
                    percent={Math.round((stats.usersWhoReceived / stats.totalUsers) * 100)}
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
                <span>{Math.round((stats.totalGivenThisMonth / stats.totalAllocatedThisMonth) * 100)}%</span>
              </div>
              <Progress
                percent={Math.round((stats.totalGivenThisMonth / stats.totalAllocatedThisMonth) * 100)}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              已使用 {stats.totalGivenThisMonth} / {stats.totalAllocatedThisMonth} ⭐
            </div>
          </Card>
        </Col>
      </Row>

      {/* 部门统计表格 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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

      <Row gutter={[16, 16]}>
        {/* 排行榜前5 */}
        <Col xs={24} lg={12}>
          <Card title="年度排行榜 TOP5" className="card-shadow">
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
                        <span>{item.name}</span>
                        <Tag color="blue" size="small">{item.department}</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <StarOutlined style={{ color: '#fadb14' }} />
                        <span>{item.receivedThisYear} ⭐</span>
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
                        <span>{item.fromUserName}</span>
                        <span>→</span>
                        <span>{item.toUserName}</span>
                        <Tag color="green">+{item.stars}⭐</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ fontSize: 12 }}>
                          {item.reason === '其他' ? item.customReason : item.reason}
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                          {item.createTime}
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
      <Row style={{ marginTop: 16 }}>
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
                        <span>{item.userName}</span>
                        <span>兑换</span>
                        <span>{item.giftName}</span>
                        <Tag color="orange">-{item.starsCost}⭐</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ fontSize: 12 }}>
                          配送方式：{item.deliveryMethod === 'pickup' ? '现场领取' : '邮寄'}
                        </div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                          {item.createTime}
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
    </div>
  )
}

export default AdminDashboard
