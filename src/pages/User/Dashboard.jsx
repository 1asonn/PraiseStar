import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Progress, List, Avatar, Tag, Space, Spin, message } from 'antd'
import ModernCard from '../../components/ModernCard'
import ModernLoading from '../../components/ModernLoading'
import {
  StarOutlined,
  SendOutlined,
  GiftOutlined,
  TrophyOutlined,
  RiseOutlined,
  ReloadOutlined,
  HeartOutlined,
  LikeOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { starsService } from '../../services/starsService'
import { rankingsService } from '../../services/rankingsService'
import { userService } from '../../services/userService'

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

const Dashboard = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [recentReceived, setRecentReceived] = useState([])
  const [recentGiven, setRecentGiven] = useState([])
  const [myRanking, setMyRanking] = useState(null)
  const [monthlyHighlights, setMonthlyHighlights] = useState(null)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(user)

  // 获取最新的用户信息
  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile()
      if (response.success) {
        setCurrentUser(response.data)
        // 更新AuthContext中的用户信息
        updateUser(response.data)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 获取用户信息失败不影响主要功能
    }
  }

  // 获取最近的赠送记录
  const fetchRecentRecords = async () => {
    try {
      setRefreshing(true)
      setError(null)

      // 并行获取收到的和赠送的记录
      const [receivedRes, givenRes] = await Promise.all([
        starsService.getGiveRecords({
          type: 'received',
          page: 1,
          limit: 5
        }),
        starsService.getGiveRecords({
          type: 'sent',
          page: 1,
          limit: 5
        })
      ])

      if (receivedRes.success) {
        setRecentReceived(receivedRes.data.records || receivedRes.data || [])
      }

      if (givenRes.success) {
        setRecentGiven(givenRes.data.records || givenRes.data || [])
      }

    } catch (error) {
      console.error('获取赠送记录失败:', error)
      setError('获取赠送记录失败')
      message.error('获取赠送记录失败，请稍后重试')
    } finally {
      setRefreshing(false)
    }
  }

  // 获取我的排名信息
  const fetchMyRanking = async () => {
    try {
      const response = await rankingsService.getMyRanking({
        period: 'month' // 获取月度排名
      })

      if (response.success) {
        setMyRanking(response.data.user)
        // 设置月度亮点数据
        setMonthlyHighlights(response.data.user.monthly_highlights)
      }
    } catch (error) {
      console.error('获取排名信息失败:', error)
      // 排名获取失败不影响主要功能，只记录错误
    }
  }

  // 刷新所有数据
  const refreshAllData = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchRecentRecords(),
        fetchMyRanking()
      ])
      message.success('数据已刷新')
    } catch (error) {
      console.error('刷新数据失败:', error)
      message.error('刷新数据失败，请稍后重试')
    } finally {
      setRefreshing(false)
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    if (user?.id) {
      const loadInitialData = async () => {
        setLoading(true)
        try {
          await Promise.all([
            fetchUserProfile(),
            fetchRecentRecords(),
            fetchMyRanking()
          ])
        } catch (error) {
          console.error('加载初始数据失败:', error)
        } finally {
          setLoading(false)
        }
      }
      loadInitialData()
    }
  }, [user?.id])

  // 计算进度百分比
  const giveProgress = Math.round(((currentUser.monthlyAllocation - currentUser.availableToGive) / currentUser.monthlyAllocation) * 100)
  
  // 兑换进度计算：已兑换数量 / 总获得数量 * 100
  const totalReceivedThisYear = currentUser.redeemedThisYear + currentUser.availableToRedeem
  const redeemProgress = totalReceivedThisYear > 0 ? Math.round((currentUser.redeemedThisYear / totalReceivedThisYear) * 100) : 0

  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr) return '未知时间'
    
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
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
    if (item.reason === '其他' && item.custom_reason) {
      return <span style={{ color: '#333', fontSize: '12px' }}>{item.custom_reason}</span>
    }
    
    return <span style={{ color: '#999', fontSize: '12px' }}>{typeof item.reason === 'string' ? item.reason : '无理由'}</span>
  }


  if (loading) {
    return <ModernLoading size="large" text="加载中..." type="card" />
  }

  return (
    <div>
      {/* 页面标题和刷新按钮 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <h2 style={{ margin: 0, color: '#1890ff' }}>个人中心</h2>
        <button
          onClick={refreshAllData}
          disabled={refreshing}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#1890ff',
            fontSize: 14
          }}
        >
          <ReloadOutlined spin={refreshing} />
          {refreshing ? '刷新中...' : '刷新数据'}
        </button>
      </div>

      <Row gutter={[16, 16]}>
        {/* 个人赞赞星统计卡片 */}
        <Col xs={24} sm={12} md={8} lg={4}>
          <ModernCard hoverable>
            <Statistic
              title="本月可赠送"
              value={currentUser.availableToGive}
              prefix={<SendOutlined style={{ color: '#52c41a' }} />}
              suffix={<StarIcon color="#52c41a" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ModernCard>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <ModernCard hoverable>
            <Statistic
              title="本月获赠"
              value={currentUser?.receivedThisMonth|| 0}
              prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
              suffix={<StarIcon color="#722ed1" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </ModernCard>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <ModernCard hoverable>
            <Statistic
              title="累计获赠"
              value={currentUser.receivedThisYear}
              prefix={<LikeOutlined style={{ color: '#1890ff' }} />}
              suffix={<StarIcon color="#1890ff" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </ModernCard>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <ModernCard hoverable>
            <Statistic
              title="可兑换余额"
              value={currentUser.availableToRedeem}
              prefix={<GiftOutlined style={{ color: '#fa8c16' }} />}
              suffix={<StarIcon color="#fa8c16" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </ModernCard>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={4}>
          <ModernCard hoverable>
            <Statistic
              title="当前排名"
              value={myRanking?.ranking || '--'}
              prefix={<TrophyOutlined style={{ color: '#eb2f96' }} />}
              suffix="位"
              valueStyle={{ color: '#eb2f96' }}
            />
          </ModernCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 本月赠送进度 */}
        <Col xs={24} lg={12}>
          <ModernCard title="本月赠送进度" hoverable>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>已赠送</span>
                <span>{currentUser.monthlyAllocation - currentUser.availableToGive} <StarIcon color="#52c41a" size="14px" /></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>可赠送</span>
                <span>{currentUser.availableToGive} <StarIcon color="#52c41a" size="14px" /></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: '#666' }}>
                <span>月度配额</span>
                <span>{currentUser.monthlyAllocation} <StarIcon color="#52c41a" size="14px" /></span>
              </div>
              <Progress 
                percent={giveProgress} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={(percent) => `${percent}%`}
              />
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              💡 本月剩余 {currentUser.availableToGive} 颗赞赞星，月底未送出将自动清零
            </div>
          </ModernCard>
        </Col>

        {/* 兑换统计 */}
        <Col xs={24} lg={12}>
          <ModernCard title="年度兑换统计" hoverable>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>已兑换</span>
                <span>{currentUser.redeemedThisYear} <StarIcon color="#fa8c16" size="14px" /></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>可兑换</span>
                <span>{currentUser.availableToRedeem} <StarIcon color="#fa8c16" size="14px" /></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: '#666' }}>
                <span>年度总计</span>
                <span>{totalReceivedThisYear} <StarIcon color="#fa8c16" size="14px" /></span>
              </div>
              <Progress 
                percent={redeemProgress} 
                strokeColor={{
                  '0%': '#fa541c',
                  '100%': '#faad14',
                }}
                format={(percent) => `${percent}%`}
              />
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              💡 获赠的赞赞星年底未兑换将自动清零
            </div>
          </ModernCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 最近收到的赞赞星 */}
        <Col xs={24} lg={12}>
          <ModernCard 
            title="最近收到的赞赞星" 
            hoverable
            extra={
              <a onClick={() => fetchRecentRecords()}>刷新</a>
            }
          >
            <List
              dataSource={recentReceived}
              locale={{ emptyText: '暂无收到的赞赞星记录' }}
              renderItem={item => (
                <List.Item style={{ padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<StarOutlined />} 
                        style={{ backgroundColor: '#1890ff' }}
                        size="default"
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>
                          {item.from_user_name || '未知用户'}
                        </span>
                        <Tag color="blue" style={{ margin: 0 }}>
                          +{item.stars}<StarIcon color="#1890ff" size="12px" />
                        </Tag>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 6, fontSize: 13 }}>
                          <span style={{ color: '#666' }}>部门: </span>
                          <span style={{ color: '#1890ff', fontWeight: 500 }}>
                            {item.from_user_department || '未知部门'}
                          </span>
                        </div>
                        <div style={{ marginBottom: 6, fontSize: 13 }}>
                          <span style={{ color: '#666' }}>理由: </span>
                          <span style={{ color: '#333' }}>
                            {getDisplayReason(item)}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {formatTime(item.created_at)}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </ModernCard>
        </Col>

        {/* 最近赠送的赞赞星 */}
        <Col xs={24} lg={12}>
          <ModernCard 
            title="最近赠送的赞赞星" 
            hoverable
            extra={
              <a onClick={() => fetchRecentRecords()}>刷新</a>
            }
          >
            <List
              dataSource={recentGiven}
              locale={{ emptyText: '暂无赠送记录' }}
              renderItem={item => (
                <List.Item style={{ padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<SendOutlined />} 
                        style={{ backgroundColor: '#52c41a' }}
                        size="default"
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>
                          赠送给 {item.to_user_name || '未知用户'}
                        </span>
                        <Tag color="green" style={{ margin: 0 }}>
                          -{item.stars}<StarIcon color="#52c41a" size="12px" />
                        </Tag>
                      </div>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 6, fontSize: 13 }}>
                          <span style={{ color: '#666' }}>部门: </span>
                          <span style={{ color: '#1890ff', fontWeight: 500 }}>
                            {item.to_user_department || '未知部门'}
                          </span>
                        </div>
                        <div style={{ marginBottom: 6, fontSize: 13 }}>
                          <span style={{ color: '#666' }}>理由: </span>
                          <span style={{ color: '#333' }}>
                            {getDisplayReason(item)}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {formatTime(item.created_at)}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </ModernCard>
        </Col>
      </Row>

      {/* 月度亮点 */}
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <ModernCard title="本月亮点" hoverable>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <RiseOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    本月获赠 {monthlyHighlights?.received_this_month || 0} <StarIcon color="#52c41a" size="16px" />
                  </div>
                  <div style={{ color: '#666' }}>
                    {monthlyHighlights?.growth_percentage > 0 ? (
                      <span style={{ color: '#52c41a' }}>
                        比上月增长 {monthlyHighlights.growth_percentage}%
                      </span>
                    ) : monthlyHighlights?.growth_percentage < 0 ? (
                      <span style={{ color: '#ff4d4f' }}>
                        比上月下降 {Math.abs(monthlyHighlights.growth_percentage)}%
                      </span>
                    ) : (
                      <span style={{ color: '#666' }}>
                        与上月持平
                      </span>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <TrophyOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    排名第 {myRanking?.ranking || '--'} 位
                  </div>
                  <div style={{ color: '#666' }}>
                    {myRanking?.ranking && myRanking.ranking <= 5 ? (
                      <span style={{ color: '#fa8c16' }}>表现优秀！</span>
                    ) : myRanking?.ranking && myRanking.ranking <= 10 ? (
                      <span style={{ color: '#1890ff' }}>表现良好！</span>
                    ) : (
                      <span style={{ color: '#666' }}>继续加油！</span>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <StarOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    获赠词条最多
                  </div>
                  <div style={{ color: '#666' }}>
                    {monthlyHighlights?.top_reason ? (
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff', marginBottom: 4 }}>
                          {monthlyHighlights.top_reason.reason?.keyword || monthlyHighlights.top_reason.reason?.reason || '无词条'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#666' }}>暂无数据</span>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            
            {/* 额外信息展示 */}
            {/* {monthlyHighlights && (
              <div style={{ 
                marginTop: 16, 
                padding: 16, 
                background: '#f6f8fa', 
                borderRadius: 8,
                border: '1px solid #e1e4e8'
              }}>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>上月获赠星数：</span>
                      <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        {monthlyHighlights.last_month_stars} <StarIcon color="#1890ff" size="14px" />
                      </span>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>团队总人数：</span>
                      <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        {myRanking?.total_users || 0} 人
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            )} */}
          </ModernCard>
        </Col>
      </Row>
      
      <style jsx="true">{`
        :global(.card-shadow) {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        
        :global(.ant-statistic-title) {
          color: #666;
          font-size: 14px;
        }
        
        :global(.ant-statistic-content) {
          color: #262626;
        }
        
        :global(.ant-list-item-meta-title) {
          margin-bottom: 4px;
        }
        
        :global(.ant-list-item-meta-description) {
          color: #666;
        }
        
        /* 移动端列表优化 */
        @media (max-width: 768px) {
          :global(.ant-list-item) {
            padding: 8px 0 !important;
          }
          
          :global(.ant-list-item-meta-avatar) {
            margin-right: 12px !important;
          }
          
          :global(.ant-avatar) {
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
          }
          
          :global(.ant-tag) {
            font-size: 11px !important;
            padding: 2px 6px !important;
          }
        }
        
        /* 列表项悬停效果 */
        :global(.ant-list-item:hover) {
          background-color: #fafafa;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }
        
      `}</style>
    </div>
  )
}

export default Dashboard
