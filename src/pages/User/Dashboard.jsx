import React from 'react'
import { Row, Col, Card, Statistic, Progress, List, Avatar, Tag, Space } from 'antd'
import {
  StarOutlined,
  SendOutlined,
  GiftOutlined,
  TrophyOutlined,
  RiseOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { mockGiveRecords } from '../../data/mockData'

const Dashboard = () => {
  const { user } = useAuth()

  // 获取最近的赠送记录（给自己的）
  const recentReceived = mockGiveRecords
    .filter(record => record.toUserId === user.id)
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    .slice(0, 5)

  // 获取最近的赠送记录（自己给别人的）
  const recentGiven = mockGiveRecords
    .filter(record => record.fromUserId === user.id)
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    .slice(0, 5)

  // 计算进度百分比
  const giveProgress = Math.round(((user.monthlyAllocation - user.availableToGive) / user.monthlyAllocation) * 100)
  const redeemProgress = user.availableToRedeem > 0 ? Math.round((user.redeemedThisYear / (user.redeemedThisYear + user.availableToRedeem)) * 100) : 0

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 个人赞赞星统计卡片 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow">
            <Statistic
              title="本月可赠送"
              value={user.availableToGive}
              prefix={<SendOutlined style={{ color: '#52c41a' }} />}
              suffix="⭐"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow">
            <Statistic
              title="累计获赠"
              value={user.receivedThisYear}
              prefix={<StarOutlined style={{ color: '#1890ff' }} />}
              suffix="⭐"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow">
            <Statistic
              title="可兑换余额"
              value={user.availableToRedeem}
              prefix={<GiftOutlined style={{ color: '#fa8c16' }} />}
              suffix="⭐"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-shadow">
            <Statistic
              title="当前排名"
              value={user.ranking}
              prefix={<TrophyOutlined style={{ color: '#eb2f96' }} />}
              suffix="位"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 本月赠送进度 */}
        <Col xs={24} lg={12}>
          <Card title="本月赠送进度" className="card-shadow">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>已赠送</span>
                <span>{user.monthlyAllocation - user.availableToGive}/{user.monthlyAllocation} ⭐</span>
              </div>
              <Progress 
                percent={giveProgress} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              💡 本月剩余 {user.availableToGive} 颗赞赞星，月底未送出将自动清零
            </div>
          </Card>
        </Col>

        {/* 兑换统计 */}
        <Col xs={24} lg={12}>
          <Card title="年度兑换统计" className="card-shadow">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>已兑换</span>
                <span>{user.redeemedThisYear} ⭐</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>可兑换</span>
                <span>{user.availableToRedeem} ⭐</span>
              </div>
              <Progress 
                percent={redeemProgress} 
                strokeColor={{
                  '0%': '#fa541c',
                  '100%': '#faad14',
                }}
              />
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              💡 获赠的赞赞星年底未兑换将自动清零
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 最近收到的赞赞星 */}
        <Col xs={24} lg={12}>
          <Card title="最近收到的赞赞星" className="card-shadow">
            <List
              dataSource={recentReceived}
              locale={{ emptyText: '暂无收到的赞赞星记录' }}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<StarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={
                      <Space>
                        <span>{item.fromUserName}</span>
                        <Tag color="blue">+{item.stars}⭐</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{item.reason === '其他' ? item.customReason : item.reason}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
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

        {/* 最近赠送的赞赞星 */}
        <Col xs={24} lg={12}>
          <Card title="最近赠送的赞赞星" className="card-shadow">
            <List
              dataSource={recentGiven}
              locale={{ emptyText: '暂无赠送记录' }}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<SendOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                    title={
                      <Space>
                        <span>赠送给 {item.toUserName}</span>
                        <Tag color="green">-{item.stars}⭐</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{item.reason === '其他' ? item.customReason : item.reason}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
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

      {/* 月度亮点 */}
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="本月亮点" className="card-shadow">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <RiseOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    本月获赠 {user.receivedThisMonth} ⭐
                  </div>
                  <div style={{ color: '#666' }}>
                    比上月增长 12%
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <TrophyOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    排名第 {user.ranking} 位
                  </div>
                  <div style={{ color: '#666' }}>
                    {user.ranking <= 5 ? '表现优秀！' : '继续加油！'}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <StarOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    活跃指数 85%
                  </div>
                  <div style={{ color: '#666' }}>
                    团队氛围贡献者
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
