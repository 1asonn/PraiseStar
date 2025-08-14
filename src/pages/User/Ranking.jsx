import React, { useState } from 'react'
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
import {
  TrophyOutlined,
  StarOutlined,
  CrownOutlined,
  RiseOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { getUserRankings, mockUsers } from '../../data/mockData'

const Ranking = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('year')

  // 获取排名数据
  const yearRankings = getUserRankings()
  
  // 模拟月度和季度排名数据
  const monthRankings = mockUsers
    .map(u => ({
      id: u.id,
      name: u.name,
      department: u.department,
      receivedThisMonth: u.receivedThisMonth,
      ranking: 0
    }))
    .sort((a, b) => b.receivedThisMonth - a.receivedThisMonth)
    .map((item, index) => ({ ...item, ranking: index + 1 }))

  const quarterRankings = mockUsers
    .map(u => ({
      id: u.id,
      name: u.name,
      department: u.department,
      receivedThisQuarter: u.receivedThisQuarter,
      ranking: 0
    }))
    .sort((a, b) => b.receivedThisQuarter - a.receivedThisQuarter)
    .map((item, index) => ({ ...item, ranking: index + 1 }))

  // 获取当前用户在各个排名中的位置
  const userYearRank = yearRankings.find(r => r.id === user.id)
  const userMonthRank = monthRankings.find(r => r.id === user.id)
  const userQuarterRank = quarterRankings.find(r => r.id === user.id)

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
      render: (rank, record) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: record.id === user.id ? 'bold' : 'normal',
          color: record.id === user.id ? '#1890ff' : getRankColor(rank)
        }}>
          {getRankIcon(rank)}
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
      title: '获赞数量',
      key: 'stars',
      align: 'right',
      render: (_, record) => {
        let stars = 0
        if (type === 'month') stars = record.receivedThisMonth
        else if (type === 'quarter') stars = record.receivedThisQuarter
        else stars = record.receivedThisYear

        return (
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
    }
  ]

  const tabItems = [
    {
      key: 'month',
      label: '本月排名',
      children: (
        <Table
          dataSource={monthRankings}
          columns={getColumns('month')}
          pagination={false}
          size="small"
          rowKey="id"
          rowClassName={(record) => record.id === user.id ? 'user-row' : ''}
        />
      )
    },
    {
      key: 'quarter',
      label: '本季度排名',
      children: (
        <Table
          dataSource={quarterRankings}
          columns={getColumns('quarter')}
          pagination={false}
          size="small"
          rowKey="id"
          rowClassName={(record) => record.id === user.id ? 'user-row' : ''}
        />
      )
    },
    {
      key: 'year',
      label: '年度排名',
      children: (
        <Table
          dataSource={yearRankings}
          columns={getColumns('year')}
          pagination={false}
          size="small"
          rowKey="id"
          rowClassName={(record) => record.id === user.id ? 'user-row' : ''}
        />
      )
    }
  ]

  return (
    <div>
      {/* 个人排名概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="card-shadow">
            <Statistic
              title="本月排名"
              value={userMonthRank?.ranking || '-'}
              prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
              suffix="位"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              本月获赞 {user.receivedThisMonth} ⭐
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card className="card-shadow">
            <Statistic
              title="季度排名"
              value={userQuarterRank?.ranking || '-'}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              suffix="位"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              本季度获赞 {user.receivedThisQuarter} ⭐
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card className="card-shadow">
            <Statistic
              title="年度排名"
              value={userYearRank?.ranking || '-'}
              prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
              suffix="位"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              年度获赞 {user.receivedThisYear} ⭐
            </div>
          </Card>
        </Col>
      </Row>

      {/* 排名进度 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="排名进度分析" className="card-shadow">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>年度目标进度</span>
                    <span>{Math.round((user.receivedThisYear / 1200) * 100)}%</span>
                  </div>
                  <Progress
                    percent={Math.round((user.receivedThisYear / 1200) * 100)}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    目标：1200 ⭐，当前：{user.receivedThisYear} ⭐
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
      </Row>

      {/* 排行榜 */}
      <Card title="全员排行榜" className="card-shadow">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <style jsx>{`
        :global(.user-row) {
          background-color: #e6f7ff !important;
        }
        :global(.user-row:hover) {
          background-color: #bae7ff !important;
        }
      `}</style>
    </div>
  )
}

export default Ranking
