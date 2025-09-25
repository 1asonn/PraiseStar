import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  Input,
  Space,
  message,
  Table,
  Tag,
  Statistic,
  Spin,
  Alert,
  Divider,
  Typography,
  Tooltip,
  Badge,
  Tabs
} from 'antd'
import {
  TrophyOutlined,
  UserOutlined,
  StarOutlined,
  SearchOutlined,
  ReloadOutlined,
  BarChartOutlined,
  TeamOutlined,
  FireOutlined,
  RiseOutlined,
  TagOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import axios from 'axios'
import apiClient from '../../services/apiClient'
import ModernCard from '../../components/ModernCard'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { Search } = Input

const KeywordRankings = () => {
  const [loading, setLoading] = useState(false)
  const [rankings, setRankings] = useState([])
  const [summary, setSummary] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [filters, setFilters] = useState({
    period: 'year',
    keyword: ''
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 获取词条排行榜数据
  const fetchRankings = async (page = 1, keyword = '') => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.pageSize.toString(),
        period: filters.period,
        ...(keyword && { keyword })
      })

      // 使用临时axios实例绕过拦截器
      const tempAxios = axios.create({
        baseURL: apiClient.defaults.baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      tempAxios.defaults.headers.Authorization = `Bearer ${token}`
      
      const response = await tempAxios.get(`/rankings/keywords?${params}`)
      
      if (response.data.success) {
        setRankings(response.data.data)
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.data.pagination.total
        }))
        setSummary(response.data.meta)
      } else {
        message.error(response.data.message || '获取排行榜失败')
      }
    } catch (error) {
      console.error('获取词条排行榜失败:', error)
      message.error('获取排行榜失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取词条统计摘要
  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        period: filters.period
      })

      const tempAxios = axios.create({
        baseURL: apiClient.defaults.baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      tempAxios.defaults.headers.Authorization = `Bearer ${token}`
      
      const response = await tempAxios.get(`/rankings/keywords/summary?${params}`)
      
      if (response.data.success) {
        setSummary(response.data.data)
      }
    } catch (error) {
      console.error('获取统计摘要失败:', error)
    }
  }

  // 初始化数据
  useEffect(() => {
    fetchRankings()
    fetchSummary()
  }, [filters.period])

  // 处理搜索
  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, keyword: value }))
    fetchRankings(1, value)
  }

  // 处理分页
  const handleTableChange = (pagination) => {
    fetchRankings(pagination.current, filters.keyword)
  }

  // 处理周期切换
  const handlePeriodChange = (period) => {
    setFilters(prev => ({ ...prev, period }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 刷新数据
  const handleRefresh = () => {
    fetchRankings(pagination.current, filters.keyword)
    fetchSummary()
  }

  // 移动端表格列定义
  const mobileColumns = [
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 60,
      align: 'center',
      render: (ranking) => {
        if (ranking <= 3) {
          const colors = ['#ffd700', '#c0c0c0', '#cd7f32']
          return (
            <Badge 
              count={ranking} 
              style={{ 
                backgroundColor: colors[ranking - 1],
                color: '#fff',
                fontSize: '12px'
              }}
            />
          )
        }
        return <span style={{ color: '#666', fontSize: '12px' }}>{ranking}</span>
      }
    },
    {
      title: '用户',
      key: 'user',
      render: (record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {record.user_name}
          </div>
          <div style={{ color: '#666', fontSize: '11px' }}>
            {record.user_department}
          </div>
        </div>
      )
    },
    {
      title: '星数',
      dataIndex: 'total_stars',
      key: 'total_stars',
      width: 80,
      align: 'center',
      render: (stars) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '12px' }}>{stars}</span>
          <StarOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
        </div>
      )
    },
    {
      title: '次数',
      dataIndex: 'total_count',
      key: 'total_count',
      width: 60,
      align: 'center',
      render: (count) => (
        <Tag color="blue" style={{ fontSize: '11px' }}>{count}</Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => {
            // 显示详细信息
            message.info(`${record.user_name} 的详细词条分布`)
          }}
        >
          详情
        </Button>
      )
    }
  ]

  // 桌面端表格列定义
  const desktopColumns = [
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 80,
      align: 'center',
      render: (ranking) => {
        if (ranking <= 3) {
          const colors = ['#ffd700', '#c0c0c0', '#cd7f32']
          return (
            <Badge 
              count={ranking} 
              style={{ 
                backgroundColor: colors[ranking - 1],
                color: '#fff'
              }}
            />
          )
        }
        return <span style={{ color: '#666' }}>{ranking}</span>
      }
    },
    {
      title: '用户信息',
      key: 'user',
      render: (record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {record.user_name}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.user_department} · {record.user_position}
          </div>
        </div>
      )
    },
    {
      title: '总获得星数',
      dataIndex: 'total_stars',
      key: 'total_stars',
      width: 120,
      align: 'center',
      render: (stars) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{stars}</span>
          <StarOutlined style={{ color: '#1890ff' }} />
        </div>
      )
    },
    {
      title: '总获得次数',
      dataIndex: 'total_count',
      key: 'total_count',
      width: 100,
      align: 'center',
      render: (count) => (
        <Tag color="blue">{count}</Tag>
      )
    },
    {
      title: '词条分布',
      key: 'keywords',
      render: (record) => {
        const keywordEntries = Object.entries(record.keywords || {})
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 3) // 只显示前3个词条

        return (
          <div>
            {keywordEntries.map(([keyword, stats]) => (
              <div key={keyword} style={{ marginBottom: 4 }}>
                <Tag color="green" style={{ marginBottom: 2 }}>
                  {keyword} ({stats.count}次)
                </Tag>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {stats.total_stars}⭐
                </div>
              </div>
            ))}
            {Object.keys(record.keywords || {}).length > 3 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                +{Object.keys(record.keywords || {}).length - 3} 个词条
              </Text>
            )}
          </div>
        )
      }
    }
  ]

  // 移动端词条统计表格列
  const mobileKeywordColumns = [
    {
      title: '词条',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (keyword) => (
        <Tag color="blue" style={{ fontSize: '12px', padding: '2px 6px' }}>
          {keyword}
        </Tag>
      )
    },
    {
      title: '次数',
      dataIndex: 'total_count',
      key: 'total_count',
      width: 60,
      align: 'center',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a', fontSize: '10px' }} />
      )
    },
    {
      title: '星数',
      dataIndex: 'total_stars',
      key: 'total_stars',
      width: 70,
      align: 'center',
      render: (stars) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '12px' }}>{stars}</span>
          <StarOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
        </div>
      )
    },
    {
      title: '用户',
      dataIndex: 'unique_users',
      key: 'unique_users',
      width: 60,
      align: 'center',
      render: (users) => (
        <Tag color="purple" style={{ fontSize: '11px' }}>{users}人</Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => {
            message.info(`${record.keyword} 的详细统计信息`)
          }}
        >
          详情
        </Button>
      )
    }
  ]

  // 桌面端词条统计表格列
  const desktopKeywordColumns = [
    {
      title: '词条名称',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (keyword) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
          {keyword}
        </Tag>
      )
    },
    {
      title: '获得次数',
      dataIndex: 'total_count',
      key: 'total_count',
      width: 100,
      align: 'center',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '总星数',
      dataIndex: 'total_stars',
      key: 'total_stars',
      width: 100,
      align: 'center',
      render: (stars) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{stars}</span>
          <StarOutlined style={{ color: '#1890ff' }} />
        </div>
      )
    },
    {
      title: '参与用户',
      dataIndex: 'unique_users',
      key: 'unique_users',
      width: 100,
      align: 'center',
      render: (users) => (
        <Tag color="purple">{users}人</Tag>
      )
    },
    {
      title: '平均星数/人',
      dataIndex: 'avg_stars_per_user',
      key: 'avg_stars_per_user',
      width: 120,
      align: 'center',
      render: (avg) => (
        <span style={{ color: '#666' }}>{avg.toFixed(2)}</span>
      )
    }
  ]

  // 获取统计概览数据
  const getOverviewStats = () => {
    if (!summary) return null
    
    return {
      totalUsers: summary.summary?.total_users || 0,
      activeUsers: summary.summary?.active_users || 0,
      totalKeywords: summary.summary?.total_keywords || 0,
      totalRecords: summary.summary?.total_records || 0,
      userActivityRate: summary.summary?.user_activity_rate || 0
    }
  }

  const overviewStats = getOverviewStats()

  return (
    <div>
      {/* 统计概览 */}
      {/* {overviewStats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <ModernCard hoverable>
              <Statistic
                title="总用户数"
                value={overviewStats.totalUsers}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: isMobile ? 20 : 24 }}
              />
              <div style={{ marginTop: 8, fontSize: isMobile ? 11 : 12, color: '#666' }}>
                活跃用户 {overviewStats.activeUsers} 人
      </div>
            </ModernCard>
          </Col>
          
          <Col xs={24} sm={6}>
            <ModernCard hoverable>
              <Statistic
                title="词条总数"
                value={overviewStats.totalKeywords}
                prefix={<TagOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: isMobile ? 20 : 24 }}
              />
              <div style={{ marginTop: 8, fontSize: isMobile ? 11 : 12, color: '#666' }}>
                记录总数 {overviewStats.totalRecords} 条
              </div>
            </ModernCard>
          </Col>
          
          <Col xs={24} sm={6}>
            <ModernCard hoverable>
              <Statistic
                title="用户活跃度"
                value={overviewStats.userActivityRate}
                prefix={<RiseOutlined style={{ color: '#fa8c16' }} />}
                suffix="%"
                valueStyle={{ color: '#fa8c16', fontSize: isMobile ? 20 : 24 }}
              />
              <div style={{ marginTop: 8, fontSize: isMobile ? 11 : 12, color: '#666' }}>
                活跃用户占比
              </div>
            </ModernCard>
          </Col>
          
          <Col xs={24} sm={6}>
            <ModernCard hoverable>
              <Statistic
                title="时间周期"
                value={filters.period === 'month' ? '本月' : filters.period === 'quarter' ? '本季度' : '本年'}
                prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: isMobile ? 20 : 24 }}
              />
              <div style={{ marginTop: 8, fontSize: isMobile ? 11 : 12, color: '#666' }}>
                当前筛选周期
              </div>
            </ModernCard>
          </Col>
        </Row>
      )} */}

      {/* 筛选和搜索 */}
      <ModernCard style={{ marginBottom: '24px' }}>
        <Row gutter={isMobile ? [0, 16] : [16, 0]} align={isMobile ? 'stretch' : 'middle'}>
          <Col xs={24} sm={8} md={6}>
            <div>
              <Text strong>时间周期：</Text>
              <Select
                value={filters.period}
                onChange={handlePeriodChange}
                style={{ width: '100%', marginTop: 8 }}
                size={isMobile ? 'middle' : 'default'}
              >
                <Option value="month">本月</Option>
                <Option value="quarter">本季度</Option>
                <Option value="year">本年</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={16} md={12}>
            <div>
              <Text strong>搜索词条：</Text>
              <Search
                placeholder="输入词条名称搜索"
                value={filters.keyword}
                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                onSearch={handleSearch}
                style={{ marginTop: 8 }}
                allowClear
                size={isMobile ? 'middle' : 'default'}
              />
            </div>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
              style={{ 
                marginTop: isMobile ? 0 : 24,
                width: isMobile ? '100%' : 'auto'
              }}
              size={isMobile ? 'middle' : 'default'}
            >
              刷新数据
            </Button>
          </Col>
        </Row>
      </ModernCard>


      {/* 排行榜 */}
      <ModernCard title="排行榜" hoverable>
        <Tabs
          defaultActiveKey="users"
          items={[
            {
              key: 'users',
              label: '用户获赠排行',
              children: (
                <div>
            {filters.keyword && (
                    <div style={{ 
                      marginBottom: 16, 
                      padding: '8px 12px', 
                      backgroundColor: '#e6f7ff', 
                      borderRadius: '6px',
                      border: '1px solid #91d5ff'
                    }}>
                      <Text type="secondary">
                        当前筛选词条: <strong>{filters.keyword}</strong>
                      </Text>
          </div>
                  )}
                  
        {isMobile ? (
          // 移动端卡片列表
          <div>
            {rankings.map((record, index) => (
              <Card 
                key={record.user_id}
                size="small" 
                style={{ 
                  marginBottom: '8px',
                            border: record.ranking <= 3 ? '2px solid #52c41a' : '1px solid #d9d9d9',
                            background: record.ranking <= 3 ? 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)' : '#fff',
                            borderRadius: '8px',
                            boxShadow: record.ranking <= 3 ? '0 2px 8px rgba(82, 196, 26, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.3s ease'
                }}
              >
                <Row gutter={8} align="middle">
                  <Col span={3}>
                    <div style={{ textAlign: 'center' }}>
                      {record.ranking <= 3 ? (
                        <Badge 
                          count={record.ranking} 
                          style={{ 
                            backgroundColor: ['#ffd700', '#c0c0c0', '#cd7f32'][record.ranking - 1],
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                      ) : (
                        <span style={{ color: '#666', fontSize: '12px' }}>{record.ranking}</span>
                      )}
                    </div>
                  </Col>
                            <Col span={10}>
                    <div>
                                <div style={{ fontWeight: 'bold', fontSize: '14px', color: record.ranking <= 3 ? '#52c41a' : '#262626' }}>
                        {record.user_name}
                      </div>
                      <div style={{ color: '#666', fontSize: '11px' }}>
                        {record.user_department}
                      </div>
                    </div>
                  </Col>
                            <Col span={6}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                  <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '14px' }}>{record.total_stars}</span>
                                  <StarOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                                </div>
                                <div style={{ fontSize: '11px', color: '#666' }}>
                                  {record.total_count} 次
                      </div>
                    </div>
                  </Col>
                            <Col span={5}>
                    <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>平均</div>
                                <div style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '12px' }}>
                                  {(record.total_stars / record.total_count).toFixed(1)}⭐/次
                                </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
            
            {/* 移动端分页 */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Button 
                disabled={pagination.current === 1}
                onClick={() => handleTableChange({ current: pagination.current - 1 })}
                style={{ marginRight: '8px' }}
              >
                上一页
              </Button>
              <span style={{ margin: '0 16px', fontSize: '12px' }}>
                第 {pagination.current} 页，共 {Math.ceil(pagination.total / pagination.pageSize)} 页
              </span>
              <Button 
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => handleTableChange({ current: pagination.current + 1 })}
              >
                下一页
              </Button>
            </div>
          </div>
        ) : (
          // 桌面端表格
          <Table
                      columns={[
                        {
                          title: '排名',
                          dataIndex: 'ranking',
                          key: 'ranking',
                          width: 80,
                          align: 'center',
                          render: (ranking) => {
                            if (ranking <= 3) {
                              const colors = ['#ffd700', '#c0c0c0', '#cd7f32']
                              return (
                                <Badge 
                                  count={ranking} 
                                  style={{ 
                                    backgroundColor: colors[ranking - 1],
                                    color: '#fff'
                                  }}
                                />
                              )
                            }
                            return <span style={{ color: '#666' }}>{ranking}</span>
                          }
                        },
                        {
                          title: '用户信息',
                          key: 'user',
                          render: (record) => (
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '16px', color: record.ranking <= 3 ? '#52c41a' : '#262626' }}>
                                {record.user_name}
                              </div>
                              <div style={{ color: '#666', fontSize: '12px' }}>
                                {record.user_department} · {record.user_position}
                              </div>
                            </div>
                          )
                        },
                        {
                          title: '总获赠星数',
                          dataIndex: 'total_stars',
                          key: 'total_stars',
                          width: 120,
                          align: 'center',
                          render: (stars) => (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{stars}</span>
                              <StarOutlined style={{ color: '#52c41a' }} />
                            </div>
                          )
                        },
                        {
                          title: '获赠次数',
                          dataIndex: 'total_count',
                          key: 'total_count',
                          width: 100,
                          align: 'center',
                          render: (count) => (
                            <Tag color="green">{count}</Tag>
                          )
                        },
                        {
                          title: '平均星数/次',
                          key: 'avg_stars',
                          width: 120,
                          align: 'center',
                          render: (record) => (
                            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                              {(record.total_stars / record.total_count).toFixed(1)}
                            </span>
                          )
                        },
                        {
                          title: '词条分布',
                          key: 'keywords',
                          render: (record) => {
                            const keywordEntries = Object.entries(record.keywords || {})
                              .sort((a, b) => b[1].count - a[1].count)
                              .slice(0, 3)

                            return (
                              <div>
                                {keywordEntries.map(([keyword, stats]) => (
                                  <div key={keyword} style={{ marginBottom: 4 }}>
                                    <Tag color="blue" style={{ marginBottom: 2 }}>
                                      {keyword} ({stats.count}次)
                                    </Tag>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                      {stats.total_stars}⭐
                                    </div>
                                  </div>
                                ))}
                                {Object.keys(record.keywords || {}).length > 3 && (
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    +{Object.keys(record.keywords || {}).length - 3} 个词条
                                  </Text>
                                )}
                              </div>
                            )
                          }
                        }
                      ]}
            dataSource={rankings}
            rowKey="user_id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            size="middle"
          />
        )}
            </div>
              )
            },
            {
              key: 'keywords',
              label: '词条统计',
              children: (
                <div>
                  {summary && summary.keywordSummary && (
                    <div>
          {isMobile ? (
                        // 移动端卡片列表
            <div>
              {summary.keywordSummary.map((item, index) => (
                <Card 
                  key={item.keyword}
                  size="small" 
                  style={{ 
                    marginBottom: '12px',
                                border: index === 0 ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                borderRadius: '8px',
                                boxShadow: index === 0 ? '0 2px 8px rgba(24, 144, 255, 0.2)' : '0 1px 4px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.3s ease'
                  }}
                >
                  <Row gutter={12} align="middle">
                    <Col span={12}>
                      <div>
                        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px', marginBottom: '4px' }}>
                          {item.keyword}
                        </Tag>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.unique_users}人参与
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>{item.total_stars}</span>
                          <StarOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.total_count} 次获得
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          ) : (
            // 桌面端表格
            <Table
              columns={desktopKeywordColumns}
              dataSource={summary.keywordSummary}
              rowKey="keyword"
              pagination={false}
              scroll={{ x: 600 }}
              size="small"
            />
          )}
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </ModernCard>


      {/* 热门词条 */}
      {summary && summary.topKeywords && summary.topKeywords.length > 0 && (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FireOutlined style={{ color: '#ff4d4f' }} />
              热门词条 TOP 5
            </div>
          }
          style={{ marginTop: '24px' }}
        >
          <Row gutter={isMobile ? [8, 8] : [16, 16]}>
            {summary.topKeywords.map((keyword, index) => (
              <Col xs={12} sm={8} md={4} key={keyword.keyword}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: isMobile ? '20px' : '24px', 
                    fontWeight: 'bold', 
                    color: '#1890ff' 
                  }}>
                    #{index + 1}
                  </div>
                  <div style={{ 
                    margin: isMobile ? '4px 0' : '8px 0', 
                    fontSize: isMobile ? '14px' : '16px', 
                    fontWeight: 'bold' 
                  }}>
                    {keyword.keyword}
                  </div>
                  <div style={{ 
                    color: '#666', 
                    fontSize: isMobile ? '11px' : '12px' 
                  }}>
                    {keyword.total_count} 次获得
                  </div>
                  <div style={{ 
                    color: '#666', 
                    fontSize: isMobile ? '11px' : '12px' 
                  }}>
                    {keyword.total_stars} ⭐
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  )
}

export default KeywordRankings
