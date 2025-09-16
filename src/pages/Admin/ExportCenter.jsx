import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  DatePicker,
  Space,
  message,
  Typography,
  Divider,
  Alert,
  Table,
  Tag,
  Modal,
  Descriptions,
  Spin
} from 'antd'
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileOutlined,
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import axios from 'axios'
import apiClient from '../../services/apiClient'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const ExportCenter = () => {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState('userData')
  const [exportFormat, setExportFormat] = useState('csv')
  const [includeStats, setIncludeStats] = useState(true)
  const [keywordPeriod, setKeywordPeriod] = useState('month')
  const [keywordYear, setKeywordYear] = useState(dayjs().year())
  const [keywordMonth, setKeywordMonth] = useState(dayjs().month() + 1)
  const [exportHistory, setExportHistory] = useState([])

  // 导出用户数据
  const exportUserData = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        format: exportFormat,
        includeStats: includeStats
      })
      
      // 添加时间戳防止缓存
      params.append('_t', Date.now())
      
      // 直接使用axios实例，完全绕过响应拦截器
      let response
      try {
        // 创建一个临时的axios实例，不包含拦截器
        const tempAxios = axios.create({
          baseURL: apiClient.defaults.baseURL,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        // 添加认证token
        tempAxios.defaults.headers.Authorization = `Bearer ${token}`
        
        response = await tempAxios.request({
          method: 'GET',
          url: `/user-data/export?${params}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          responseType: 'blob'
        })
        
        // 检查响应对象是否存在
        if (!response) {
          throw new Error('请求失败：响应对象为空')
        }
        
      } catch (requestError) { 
        // 重新抛出错误，让外层catch处理
        throw requestError
      }
      
      // 检查响应状态
      if (response.status !== 200) {
        throw new Error(`服务器返回错误状态: ${response.status} ${response.statusText}`)
      }
      
      // 检查响应数据
      if (!response.data) {
        throw new Error('服务器返回空数据')
      }
      
      const blob = new Blob([response.data], { 
        type: exportFormat === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
             exportFormat === 'json' ? 'application/json' : 'text/csv;charset=utf-8'
      })
      
      
      if (blob.size === 0) {
        throw new Error('生成的文件为空')
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users_export_${new Date().toISOString().replace(/[:.]/g, '-')}.${exportFormat === 'xlsx' ? 'xlsx' : exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      message.success('用户数据导出成功')
      
      // 添加到导出历史
      setExportHistory(prev => [{
        id: Date.now(),
        type: '用户数据',
        format: exportFormat.toUpperCase(),
        includeStats: includeStats,
        timestamp: new Date().toLocaleString()
      }, ...prev.slice(0, 9)]) // 保留最近10条记录
      
    } catch (error) {
      console.error('导出用户数据失败:', error)
      message.error(`导出用户数据失败: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  // 导出词条统计
  const exportKeywordStats = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        period: keywordPeriod,
        year: keywordYear,
        month: keywordPeriod === 'month' ? keywordMonth : undefined,
        format: exportFormat
      })
      
      // 添加时间戳防止缓存
      params.append('_t', Date.now())
      
      // 直接使用axios实例，完全绕过响应拦截器
      let response
      try {
        // 创建一个临时的axios实例，不包含拦截器
        const tempAxios = axios.create({
          baseURL: apiClient.defaults.baseURL,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        // 添加认证token
        tempAxios.defaults.headers.Authorization = `Bearer ${token}`
        
        response = await tempAxios.request({
          method: 'GET',
          url: `/user-data/export-keyword-stats?${params}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          responseType: 'blob'
        })
        
        // 检查响应对象是否存在
        if (!response) {
          throw new Error('请求失败：响应对象为空')
        }
        
      } catch (requestError) {
        // 重新抛出错误，让外层catch处理
        throw requestError
      }
      
      // 检查响应状态
      if (response.status !== 200) {
        throw new Error(`服务器返回错误状态: ${response.status} ${response.statusText}`)
      }
      
      // 检查响应数据
      if (!response.data) {
        throw new Error('服务器返回空数据')
      }
      
      const blob = new Blob([response.data], { 
        type: exportFormat === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
             exportFormat === 'json' ? 'application/json' : 'text/csv;charset=utf-8'
      })
      
      if (blob.size === 0) {
        throw new Error('生成的文件为空')
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `keyword_stats_${keywordPeriod}_${keywordYear}${keywordPeriod === 'month' ? `_${keywordMonth.toString().padStart(2, '0')}` : ''}_${new Date().toISOString().replace(/[:.]/g, '-')}.${exportFormat === 'xlsx' ? 'xlsx' : exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      message.success('词条统计导出成功')
      
      // 添加到导出历史
      setExportHistory(prev => [{
        id: Date.now(),
        type: '词条统计',
        format: exportFormat.toUpperCase(),
        period: `${keywordYear}年${keywordPeriod === 'month' ? `${keywordMonth}月` : ''}`,
        timestamp: new Date().toLocaleString()
      }, ...prev.slice(0, 9)])
      
    } catch (error) {
      console.error('导出词条统计失败:', error)
      message.error(`导出词条统计失败: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  // 执行导出
  const handleExport = () => {
    if (exportType === 'userData') {
      exportUserData()
    } else if (exportType === 'keywordStats') {
      exportKeywordStats()
    }
  }

  // 导出历史表格列
  const historyColumns = [
    {
      title: '导出类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const color = type === '用户数据' ? 'blue' : 'green'
        return <Tag color={color}>{type}</Tag>
      }
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format'
    },
    {
      title: '包含统计',
      dataIndex: 'includeStats',
      key: 'includeStats',
      render: (includeStats) => includeStats ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
    },
    {
      title: '统计周期',
      dataIndex: 'period',
      key: 'period',
      render: (period) => period || '-'
    },
    {
      title: '导出时间',
      dataIndex: 'timestamp',
      key: 'timestamp'
    }
  ]

  return (
    <div>
      <Title level={2}>导出中心</Title>
      <Paragraph>
        支持导出用户数据和词条统计数据，提供多种格式选择。
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* 导出配置 */}
        <Col span={24}>
          <Card title="导出配置" className="card-shadow">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>导出类型</Text>
                  <Select
                    value={exportType}
                    onChange={setExportType}
                    style={{ width: '100%' }}
                  >
                    <Option value="userData">
                      <Space>
                        <UserOutlined />
                        用户数据
                      </Space>
                    </Option>
                    <Option value="keywordStats">
                      <Space>
                        <BarChartOutlined />
                        词条统计
                      </Space>
                    </Option>
                  </Select>
                </Space>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>导出格式</Text>
                  <Select
                    value={exportFormat}
                    onChange={setExportFormat}
                    style={{ width: '100%' }}
                  >
                    <Option value="csv">
                      <Space>
                        <FileTextOutlined />
                        CSV
                      </Space>
                    </Option>
                    <Option value="xlsx">
                      <Space>
                        <FileExcelOutlined />
                        Excel
                      </Space>
                    </Option>
                    <Option value="json">
                      <Space>
                        <FileOutlined />
                        JSON
                      </Space>
                    </Option>
                  </Select>
                </Space>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>操作</Text>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExport}
                    loading={exporting}
                    style={{ width: '100%' }}
                  >
                    开始导出
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 用户数据导出选项 */}
        {exportType === 'userData' && (
          <Col span={24}>
            <Card title="用户数据导出选项" className="card-shadow">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Alert
                    message="导出内容"
                    description="包含用户基本信息、分配规则和赞赞星统计数据"
                    type="info"
                    showIcon
                  />
                </Col>
                
                <Col xs={24} sm={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>包含统计信息</Text>
                    <Select
                      value={includeStats}
                      onChange={setIncludeStats}
                      style={{ width: '100%' }}
                    >
                      <Option value={true}>是</Option>
                      <Option value={false}>否</Option>
                    </Select>
                  </Space>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>导出字段</Text>
                    <div>
                      <Tag color="blue">基本信息</Tag>
                      <Tag color="green">分配规则</Tag>
                      {includeStats && <Tag color="orange">统计数据</Tag>}
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* 词条统计导出选项 */}
        {exportType === 'keywordStats' && (
          <Col span={24}>
            <Card title="词条统计导出选项" className="card-shadow">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Alert
                    message="统计内容"
                    description="统计用户获得各个词条的次数和赞赞星数量"
                    type="info"
                    showIcon
                  />
                </Col>
                
                <Col xs={24} sm={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>统计周期</Text>
                    <Select
                      value={keywordPeriod}
                      onChange={setKeywordPeriod}
                      style={{ width: '100%' }}
                    >
                      <Option value="month">按月统计</Option>
                      <Option value="year">按年统计</Option>
                    </Select>
                  </Space>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>年份</Text>
                    <Select
                      value={keywordYear}
                      onChange={setKeywordYear}
                      style={{ width: '100%' }}
                    >
                      {Array.from({ length: 10 }, (_, i) => dayjs().year() - 5 + i).map(year => (
                        <Option key={year} value={year}>{year}年</Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
                
                {keywordPeriod === 'month' && (
                  <Col xs={24} sm={8}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>月份</Text>
                      <Select
                        value={keywordMonth}
                        onChange={setKeywordMonth}
                        style={{ width: '100%' }}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <Option key={month} value={month}>{month}月</Option>
                        ))}
                      </Select>
                    </Space>
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
        )}

        {/* 导出历史 */}
        <Col span={24}>
          <Card title="导出历史" className="card-shadow">
            {exportHistory.length > 0 ? (
              <Table
                columns={historyColumns}
                dataSource={exportHistory}
                pagination={false}
                size="small"
                rowKey="id"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无导出记录
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ExportCenter
