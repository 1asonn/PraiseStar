import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Card,
  Table,
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
  RiseOutlined,
  TagOutlined,
  FireOutlined,
  TeamOutlined
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
    month: []
  })
  // 移动端无限滚动状态
  const [mobileLoading, setMobileLoading] = useState({
    year: false,
    month: false
  })
  const [hasMore, setHasMore] = useState({
    year: true,
    month: true
  })
  const [myRanking, setMyRanking] = useState({
    year: null,
    month: null
  })
  const [pagination, setPagination] = useState({
    year: { current: 1, pageSize: 10, total: 0 },
    month: { current: 1, pageSize: 10, total: 0 }
  })
  const [currentUserRanking, setCurrentUserRanking] = useState({
    year: null,
    month: null
  })
  const [forceUpdate, setForceUpdate] = useState(0)
  
  // 词条排行榜相关状态
  const [keywordRankings, setKeywordRankings] = useState({
    year: [],
    month: []
  })
  const [keywordLoading, setKeywordLoading] = useState(false)
  const [keywordSummary, setKeywordSummary] = useState({
    year: null,
    month: null
  })
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [keywordPagination, setKeywordPagination] = useState({
    year: { current: 1, pageSize: 10, total: 0 },
    month: { current: 1, pageSize: 10, total: 0 }
  })
  const [keywordError, setKeywordError] = useState({
    year: null,
    month: null
  })

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

  // 获取词条排行榜数据
  const fetchKeywordRankings = async (period, page = 1, pageSize = 10) => {
    if (!user?.id) return
    
    setKeywordLoading(true)
    
    // 清除之前的错误状态
    setKeywordError(prev => ({
      ...prev,
      [period]: null
    }))
    
    try {
      console.log(`Fetching keyword rankings for period: ${period}, page: ${page}, pageSize: ${pageSize}`)
      const params = {
        period,
        page,
        limit: pageSize
      }
      
      // 如果选择了特定词条，添加到参数中
      if (selectedKeyword) {
        params.keyword = selectedKeyword
      }
      
      const response = await rankingsService.getKeywordRankings(params)
      console.log(`Keyword rankings response for ${period}:`, response)
      
      if (response.success) {
        const keywordData = response.data || []
        setKeywordRankings(prev => ({
          ...prev,
          [period]: keywordData
        }))
        
        // 更新分页信息
        if (response.pagination) {
          setKeywordPagination(prev => ({
            ...prev,
            [period]: {
              current: response.pagination.page || page,
              pageSize: response.pagination.limit || pageSize,
              total: response.pagination.total || 0
            }
          }))
        }
        
        // 如果响应中包含meta信息，更新摘要数据（用于筛选功能）
        if (response.meta && response.meta.keywordSummary) {
          setKeywordSummary(prev => ({
            ...prev,
            [period]: {
              ...prev[period],
              keywordSummary: response.meta.keywordSummary
            }
          }))
        }
        
        // 清除错误状态
        setKeywordError(prev => ({
          ...prev,
          [period]: null
        }))
      } else {
        const errorMsg = response.message || '获取词条排行榜失败'
        setKeywordError(prev => ({
          ...prev,
          [period]: errorMsg
        }))
        message.error(errorMsg)
      }
    } catch (error) {
      console.error('获取词条排行榜失败:', error)
      
      // 根据错误类型显示不同的错误信息
      let errorMessage = '获取词条排行榜失败，请稍后重试'
      if (error.response) {
        // 服务器响应错误
        const status = error.response.status
        if (status === 401) {
          errorMessage = '未授权访问，请重新登录'
        } else if (status === 400) {
          errorMessage = '请求参数错误'
        } else if (status === 500) {
          errorMessage = '服务器内部错误，请稍后重试'
        } else {
          errorMessage = error.response.data?.message || `服务器错误 (${status})`
        }
      } else if (error.request) {
        // 网络错误
        errorMessage = '网络连接失败，请检查网络连接'
      } else {
        // 其他错误
        errorMessage = error.message || '未知错误'
      }
      
      // 设置错误状态
      setKeywordError(prev => ({
        ...prev,
        [period]: errorMessage
      }))
      
      message.error(errorMessage)
      
      // 如果获取失败，清空当前数据
      setKeywordRankings(prev => ({
        ...prev,
        [period]: []
      }))
    } finally {
      setKeywordLoading(false)
    }
  }

  // 获取词条排行榜摘要
  const fetchKeywordSummary = async (period) => {
    if (!user?.id) return
    
    try {
      const response = await rankingsService.getKeywordRankingsSummary({ period })
      if (response.success) {
        setKeywordSummary(prev => ({
          ...prev,
          [period]: response.data
        }))
      } else {
        console.warn('获取词条排行榜摘要失败:', response.message)
        // 摘要失败不影响主功能，只记录警告
      }
    } catch (error) {
      console.error('获取词条排行榜摘要失败:', error)
      // 摘要失败不影响主功能，只记录错误
    }
  }

  // 初始化数据
  useEffect(() => {
    if (user?.id) {
      fetchRankings('year')
      fetchRankings('month')
      fetchMyRanking('year')
      fetchMyRanking('month')
      
      // 获取词条排行榜数据
      fetchKeywordRankings('year')
      fetchKeywordRankings('month')
      fetchKeywordSummary('year')
      fetchKeywordSummary('month')
    }
  }, [user?.id])

  // 当选择的词条改变时，重新获取数据
  useEffect(() => {
    if (user?.id && selectedKeyword !== undefined) {
      // 重置分页到第一页
      setKeywordPagination(prev => ({
        year: { ...prev.year, current: 1 },
        month: { ...prev.month, current: 1 }
      }))
      
      fetchKeywordRankings('year', 1, 10)
      fetchKeywordRankings('month', 1, 10)
    }
  }, [selectedKeyword])

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

  // 简化的词条排行榜卡片组件
  const KeywordRankingCard = ({ keywordData }) => (
    <Card
      size="small"
      style={{ 
        marginBottom: 16,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
        overflow: 'hidden'
      }}
    >
      {/* 词条标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        margin: '-16px -16px 16px -16px',
        padding: '16px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            {keywordData.keyword.charAt(0)}
          </div>
          <div>
            <h4 style={{ 
              margin: 0,
              fontWeight: 'bold', 
              fontSize: 18, 
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              {keywordData.keyword}
            </h4>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>
              {keywordData.unique_users}人参与
            </div>
          </div>
        </div>
        
        {/* 右侧统计信息 */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            {keywordData.total_stars} ⭐
          </div>
          <div style={{ 
            fontSize: 12, 
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            {keywordData.total_count} 次
          </div>
        </div>
      </div>
      
      {/* 简化的用户列表 - 只显示前5名 */}
      <div>
        {keywordData.users.slice(0, 5).map((user, index) => (
          <div
            key={user.user_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < 4 ? '1px solid #f5f5f5' : 'none'
            }}
          >
            {/* 排名 */}
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginRight: 12,
              ...getRankStyle(user.ranking, isMobile),
              fontSize: 12
            }}>
              {getRankDisplay(user.ranking)}
            </div>
            
            {/* 用户信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: user.user_id === user?.id ? 'bold' : 'normal',
                color: user.user_id === user?.id ? '#1890ff' : '#262626',
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.user_name}
                {user.user_id === user?.id && (
                  <span style={{
                    marginLeft: 8,
                    backgroundColor: '#1890ff',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: 10,
                    fontWeight: '500'
                  }}>
                    我
                  </span>
                )}
              </div>
            </div>
            
            {/* 统计信息 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              flexShrink: 0
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 'bold', 
                  color: user.user_id === user?.id ? '#1890ff' : '#262626'
                }}>
                  {user.count}
                </div>
                <div style={{ 
                  fontSize: 10, 
                  color: '#8c8c8c'
                }}>
                  次
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 'bold', 
                  color: user.user_id === user?.id ? '#1890ff' : '#262626'
                }}>
                  {user.total_stars}
                </div>
                <div style={{ 
                  fontSize: 10, 
                  color: '#8c8c8c'
                }}>
                  星
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* 显示更多提示 */}
        {keywordData.users.length > 5 && (
          <div style={{
            textAlign: 'center',
            padding: '8px 0',
            color: '#8c8c8c',
            fontSize: 12,
            borderTop: '1px solid #f5f5f5',
            marginTop: 8
          }}>
            还有 {keywordData.users.length - 5} 位用户...
          </div>
        )}
      </div>
    </Card>
  )

  // 移动端排行榜卡片组件
  const RankingCard = ({ item, index }) => (
    <Card
      size="small"
      style={{ 
        marginBottom: 12,
        backgroundColor: item.id === user.id ? '#e6f7ff' : '#fff',
        border: item.id === user.id ? '1px solid #1890ff' : '1px solid #f0f0f0'
      }}
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
            ...getRankStyle(item.ranking, false)
          }}>
            {getRankDisplay(item.ranking)}
          </div>
          
          {/* 用户信息 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ 
                fontWeight: item.id === user.id ? 'bold' : 'normal',
                color: item.id === user.id ? '#1890ff' : 'inherit',
                fontSize: 14
              }}>
                {item.name}
              </span>
              {item.id === user.id && (
                <Tag color="default" size="small" style={{ 
                  backgroundColor: '#e6f7ff',
                  color: '#1890ff',
                  border: '1px solid #91d5ff'
                }}>我</Tag>
              )}
              {item.is_admin && (
                <Tag color="default" size="small" style={{ 
                  backgroundColor: '#fff7e6',
                  color: '#fa8c16',
                  border: '1px solid #ffd591'
                }}>管理员</Tag>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#666' }}>
              <Tag color="default" size="small" style={{ 
                backgroundColor: '#f5f5f5',
                color: '#666',
                border: '1px solid #e8e8e8'
              }}>{item.department}</Tag>
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

  // 简化的排名显示
  const getRankDisplay = (rank) => {
    return rank
  }

  // 排名颜色 - 简化方案
  const getRankColor = (rank) => {
    if (rank <= 3) return '#1890ff'
    return '#666'
  }

  // 获取排名样式 - 简化颜色方案
  const getRankStyle = (rank, isMobile = false) => {
    const fontSize = isMobile ? 11 : 13
    
    if (rank <= 3) {
      return {
        backgroundColor: '#1890ff',
        color: '#fff',
        border: '1px solid #1890ff',
        boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
        fontSize,
        fontWeight: 'bold'
      }
    } else {
      return {
        backgroundColor: '#f5f5f5',
        color: '#666',
        border: '1px solid #e8e8e8',
        boxShadow: 'none',
        fontSize: fontSize - 1,
        fontWeight: 'normal'
      }
    }
  }

  // 表格列定义
  const getColumns = (type) => [
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
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
          {getRankDisplay(ranking)}
        </div>
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (name, record) => (
        <div>
          <span style={{ 
            fontWeight: record.id === user.id ? 'bold' : 'normal',
            color: record.id === user.id ? '#1890ff' : 'inherit'
          }}>
            {name}
            {record.id === user.id && <Tag color="default" size="small" style={{ 
              marginLeft: 8,
              backgroundColor: '#e6f7ff',
              color: '#1890ff',
              border: '1px solid #91d5ff'
            }}>我</Tag>}
            {record.is_admin && <Tag color="default" size="small" style={{ 
              marginLeft: 8,
              backgroundColor: '#fff7e6',
              color: '#fa8c16',
              border: '1px solid #ffd591'
            }}>管理员</Tag>}
          </span>
        </div>
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      responsive: ['lg'], // 大屏幕以上显示
      align: 'center',
      render: (department) => (
        <Tag color="default" style={{ 
          backgroundColor: '#f5f5f5',
          color: '#666',
          border: '1px solid #e8e8e8'
        }}>{department}</Tag>
      )
    },
    {
      title: '获赞数量',
      dataIndex: 'received_stars',
      key: 'received_stars',
      align: 'center',
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

  // 渲染词条排行榜内容
  const renderKeywordRankingContent = (period) => {
    const data = keywordRankings[period]
    const summary = keywordSummary[period]
    const paginationInfo = keywordPagination[period]
    
    if (isMobile) {
      // 移动端卡片视图
      return (
        <div>
          {/* 摘要信息 */}
          {summary && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
                    词条统计概览
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    共 {summary.summary?.total_keywords || 0} 个词条，
                    {summary.summary?.active_users || 0} 位活跃用户
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>
                    {summary.summary?.total_records || 0}
                  </div>
                  <div style={{ fontSize: 11, color: '#666' }}>总记录数</div>
                </div>
              </div>
            </Card>
          )}
          
          {/* 词条筛选 */}
          {summary?.keywordSummary && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>词条筛选</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Tag
                  color={selectedKeyword === '' ? 'blue' : 'default'}
                  style={{ 
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: selectedKeyword === '' ? '1px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                  onClick={() => setSelectedKeyword('')}
                >
                  📊 全部词条
                </Tag>
                {summary.keywordSummary.map((item) => (
                  <Tag
                    key={item.keyword}
                    color={selectedKeyword === item.keyword ? 'blue' : 'default'}
                    style={{ 
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: selectedKeyword === item.keyword ? '1px solid #1890ff' : '1px solid #d9d9d9'
                    }}
                    onClick={() => setSelectedKeyword(item.keyword)}
                  >
                    🏷️ {item.keyword} ({item.total_count}次)
                  </Tag>
                ))}
              </div>
              {selectedKeyword && (
                <div style={{ 
                  marginTop: 8, 
                  padding: '6px 12px', 
                  backgroundColor: '#e6f7ff', 
                  borderRadius: '6px',
                  fontSize: 12,
                  color: '#1890ff'
                }}>
                  当前筛选: <strong>{selectedKeyword}</strong>
                  <span 
                    style={{ 
                      marginLeft: 8, 
                      cursor: 'pointer', 
                      textDecoration: 'underline' 
                    }}
                    onClick={() => setSelectedKeyword('')}
                  >
                    清除筛选
                  </span>
                </div>
              )}
            </Card>
          )}
          
          {/* 词条排行榜 */}
          {data.map((keywordData, index) => (
            <KeywordRankingCard key={keywordData.keyword} keywordData={keywordData} />
          ))}
          
          {/* 加载状态 */}
          {keywordLoading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#1890ff'
            }}>
              <div>加载中...</div>
            </div>
          )}
          
          {/* 错误状态 */}
          {keywordError[period] && (
            <Card size="small" style={{ marginBottom: 16, border: '1px solid #ff4d4f' }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#ff4d4f'
              }}>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                  ⚠️ 加载失败
                </div>
                <div style={{ fontSize: 14, marginBottom: 12 }}>
                  {keywordError[period]}
                </div>
                <button
                  onClick={() => fetchKeywordRankings(period)}
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  🔄 重试
                </button>
              </div>
            </Card>
          )}
          
          {/* 空数据状态 */}
          {data.length === 0 && !keywordLoading && !keywordError[period] && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#999'
            }}>
              暂无词条排行榜数据
            </div>
          )}
        </div>
      )
    } else {
      // 桌面端视图
      return (
        <div>
          {/* 摘要信息 */}
          {/* {summary && (
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={6}>
                <ModernCard hoverable>
                  <Statistic
                    title="总词条数"
                    value={summary.summary?.total_keywords || 0}
                    prefix={<TagOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff', fontSize: isMobile ? 20 : 24 }}
                  />
                </ModernCard>
              </Col>
              <Col xs={24} sm={6}>
                <ModernCard hoverable>
                  <Statistic
                    title="活跃用户"
                    value={summary.summary?.active_users || 0}
                    prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                    suffix={`/ ${summary.summary?.total_users || 0}`}
                    valueStyle={{ color: '#52c41a', fontSize: isMobile ? 20 : 24 }}
                  />
                </ModernCard>
              </Col>
              <Col xs={24} sm={6}>
                <ModernCard hoverable>
                  <Statistic
                    title="总记录数"
                    value={summary.summary?.total_records || 0}
                    prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#fa8c16', fontSize: isMobile ? 20 : 24 }}
                  />
                </ModernCard>
              </Col>
              <Col xs={24} sm={6}>
                <ModernCard hoverable>
                  <Statistic
                    title="用户活跃度"
                    value={summary.summary?.user_activity_rate || 0}
                    prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
                    suffix="%"
                    valueStyle={{ color: '#722ed1', fontSize: isMobile ? 20 : 24 }}
                  />
                </ModernCard>
              </Col>
            </Row>
          )} */}
          
          {/* 词条筛选 */}
          {summary?.keywordSummary && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TagOutlined style={{ color: '#1890ff' }} />
                词条筛选
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Tag
                  color={selectedKeyword === '' ? 'blue' : 'default'}
                  style={{ 
                    cursor: 'pointer', 
                    fontSize: 14, 
                    padding: '6px 16px',
                    borderRadius: '16px',
                    border: selectedKeyword === '' ? '2px solid #1890ff' : '2px solid #d9d9d9',
                    fontWeight: selectedKeyword === '' ? 'bold' : 'normal'
                  }}
                  onClick={() => setSelectedKeyword('')}
                >
                  📊 全部词条
                </Tag>
                {summary.keywordSummary.map((item) => (
                  <Tag
                    key={item.keyword}
                    color={selectedKeyword === item.keyword ? 'blue' : 'default'}
                    style={{ 
                      cursor: 'pointer', 
                      fontSize: 14, 
                      padding: '6px 16px',
                      borderRadius: '16px',
                      border: selectedKeyword === item.keyword ? '2px solid #1890ff' : '2px solid #d9d9d9',
                      fontWeight: selectedKeyword === item.keyword ? 'bold' : 'normal'
                    }}
                    onClick={() => setSelectedKeyword(item.keyword)}
                  >
                    🏷️ {item.keyword} ({item.total_count}次)
                  </Tag>
                ))}
              </div>
              {selectedKeyword && (
                <div style={{ 
                  marginTop: 12, 
                  padding: '10px 16px', 
                  backgroundColor: '#e6f7ff', 
                  borderRadius: '8px',
                  border: '1px solid #91d5ff',
                  fontSize: 14,
                  color: '#1890ff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      当前筛选词条: <strong>{selectedKeyword}</strong>
                    </span>
                    <span 
                      style={{ 
                        cursor: 'pointer', 
                        textDecoration: 'underline',
                        fontWeight: 'bold'
                      }}
                      onClick={() => setSelectedKeyword('')}
                    >
                      ✕ 清除筛选
                    </span>
                  </div>
                </div>
              )}
            </Card>
          )}
          
          {/* 错误状态 */}
          {keywordError[period] && (
            <Card style={{ marginBottom: 16, border: '2px solid #ff4d4f' }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '32px',
                color: '#ff4d4f'
              }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
                  ⚠️ 数据加载失败
                </div>
                <div style={{ fontSize: 16, marginBottom: 20, maxWidth: '400px', margin: '0 auto 20px auto' }}>
                  {keywordError[period]}
                </div>
                <button
                  onClick={() => fetchKeywordRankings(period)}
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: 16,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#d9363e'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4f'}
                >
                  🔄 重新加载
                </button>
              </div>
            </Card>
          )}
          
          {/* 词条排行榜 */}
          {!keywordError[period] && data.map((keywordData, index) => (
            <KeywordRankingCard key={keywordData.keyword} keywordData={keywordData} />
          ))}
          
          {/* 加载状态 */}
          {keywordLoading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#1890ff'
            }}>
              <div>加载中...</div>
            </div>
          )}
          
          {/* 空数据状态 */}
          {data.length === 0 && !keywordLoading && !keywordError[period] && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#999'
            }}>
              暂无词条排行榜数据
            </div>
          )}
        </div>
      )
    }
  }

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
      key: 'overall',
      label: '全员排名',
      children: (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
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
          ]}
        />
      )
    },
    {
      key: 'keywords',
      label: '词条排行',
      children: (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'year',
              label: '年度词条',
              children: renderKeywordRankingContent('year')
            },
            {
              key: 'month',
              label: '本月词条',
              children: renderKeywordRankingContent('month')
            },
          ]}
        />
      )
    }
  ]

  return (
    <div>
      {/* 个人排名概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
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
        
        <Col xs={24} sm={12}>
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

      {/* 排行榜 */}
      <ModernCard title="排行榜" hoverable>
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
            defaultActiveKey="overall"
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
