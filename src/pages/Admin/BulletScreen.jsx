import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  InputNumber,
  Button,
  Input,
  Space,
  Alert,
  message,
  Row,
  Col,
  Tag,
  Table,
  Modal,
  Popconfirm,
  Typography,
  Tooltip,
  Empty,
  Tabs,
  Switch,
  Divider,
  Statistic
} from 'antd'
import {
  SettingOutlined,
  MessageOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { feishuConfigAPI } from '../../services/apiClient'
import apiClient from '../../services/apiClient'

const { Title, Text } = Typography

const AdminBulletScreen = () => {
  const [configForm] = Form.useForm()
  const [starGiveForm] = Form.useForm()
  const [testForm] = Form.useForm()
  
  // 飞书配置状态
  const [feishuConfigs, setFeishuConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [testingThreshold, setTestingThreshold] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
  // 赞赞星赠送飞书通知配置状态
  const [starGiveConfigs, setStarGiveConfigs] = useState([])
  const [starGiveModalVisible, setStarGiveModalVisible] = useState(false)
  const [editingStarGiveConfig, setEditingStarGiveConfig] = useState(null)
  const [testModalVisible, setTestModalVisible] = useState(false)
  const [testConfig, setTestConfig] = useState(null)

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
  

  // 组件挂载时加载飞书配置
  useEffect(() => {
    loadFeishuConfigs()
    loadStarGiveConfigs()
  }, [])

  // 加载飞书配置列表
  const loadFeishuConfigs = async () => {
    try {
      setLoading(true)
      const response = await feishuConfigAPI.getConfigs()
      if (response.success) {
        setFeishuConfigs(response.data || [])
      } else {
        message.error(response.message || '加载飞书配置失败')
      }
    } catch (error) {
      console.error('加载飞书配置失败:', error)
      message.error('加载飞书配置失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载赞赞星赠送飞书通知配置
  const loadStarGiveConfigs = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const tempAxios = axios.create({
        baseURL: apiClient.defaults.baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      tempAxios.defaults.headers.Authorization = `Bearer ${token}`
      
      const response = await tempAxios.get('/star-give-feishu/configs')
      
      if (response.data.success) {
        setStarGiveConfigs(response.data.data)
      } else {
        message.error(response.data.message || '获取赞赞星配置失败')
      }
    } catch (error) {
      console.error('获取赞赞星配置失败:', error)
      message.error('获取赞赞星配置失败')
    }
  }

  // 打开新增/编辑配置弹窗
  const handleOpenModal = (config = null) => {
    setEditingConfig(config)
    setModalVisible(true)
    if (config) {
      configForm.setFieldsValue({
        threshold: config.threshold,
        webhook_url: config.webhook_url,
        template_id: config.template_id,
        template_version: config.template_version
      })
    } else {
      configForm.resetFields()
    }
  }

  // 保存飞书配置
  const handleSaveConfig = async (values) => {
    try {
      setLoading(true)
      let response
      
      if (editingConfig) {
        // 编辑现有配置
        response = await feishuConfigAPI.updateConfig(editingConfig.id, values)
      } else {
        // 新增配置
        response = await feishuConfigAPI.saveConfig(values)
      }
      
      if (response.success) {
        message.success(response.message || '保存成功')
        setModalVisible(false)
        configForm.resetFields()
        setEditingConfig(null)
        loadFeishuConfigs() // 重新加载列表
      } else {
        message.error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('保存飞书配置失败:', error)
      message.error(error.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除飞书配置
  const handleDeleteConfig = async (id) => {
    try {
      setLoading(true)
      const response = await feishuConfigAPI.deleteConfig(id)
      if (response.success) {
        message.success('删除成功')
        loadFeishuConfigs() // 重新加载列表
      } else {
        message.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除飞书配置失败:', error)
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  // 测试飞书通知
  const handleTestNotification = async (threshold) => {
    try {
      setTestingThreshold(threshold)
      const response = await feishuConfigAPI.testNotification(threshold, '测试用户')
      if (response.success) {
        message.success('测试通知发送成功')
      } else {
        message.error(response.message || '测试通知发送失败')
      }
    } catch (error) {
      console.error('测试通知失败:', error)
      message.error(error.message || '测试通知发送失败')
    } finally {
      setTestingThreshold(null)
    }
  }

  // 赞赞星赠送飞书通知配置相关函数
  const handleOpenStarGiveModal = (config = null) => {
    setEditingStarGiveConfig(config)
    setStarGiveModalVisible(true)
    if (config) {
      starGiveForm.setFieldsValue({
        webhook_url: config.webhook_url,
        template_id: config.template_id,
        template_version: config.template_version,
        description: config.description,
        is_active: config.is_active
      })
    } else {
      starGiveForm.resetFields()
    }
  }

  const handleSaveStarGiveConfig = async (values) => {
    try {
      const token = localStorage.getItem('token')
      
      const tempAxios = axios.create({
        baseURL: apiClient.defaults.baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      tempAxios.defaults.headers.Authorization = `Bearer ${token}`
      
      let response
      if (editingStarGiveConfig) {
        response = await tempAxios.put(`/star-give-feishu/config/${editingStarGiveConfig.id}`, values)
      } else {
        response = await tempAxios.post('/star-give-feishu/config', values)
      }
      
      if (response.data.success) {
        message.success(editingStarGiveConfig ? '配置更新成功' : '配置创建成功')
        setStarGiveModalVisible(false)
        setEditingStarGiveConfig(null)
        starGiveForm.resetFields()
        loadStarGiveConfigs()
      } else {
        message.error(response.data.message || '保存配置失败')
      }
    } catch (error) {
      console.error('保存赞赞星配置失败:', error)
      message.error('保存配置失败')
    }
  }

  const handleDeleteStarGiveConfig = async (id) => {
    try {
      const token = localStorage.getItem('token')
      
      const tempAxios = axios.create({
        baseURL: apiClient.defaults.baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      tempAxios.defaults.headers.Authorization = `Bearer ${token}`
      
      const response = await tempAxios.delete(`/star-give-feishu/config/${id}`)
      
      if (response.data.success) {
        message.success('配置删除成功')
        loadStarGiveConfigs()
      } else {
        message.error(response.data.message || '删除配置失败')
      }
    } catch (error) {
      console.error('删除赞赞星配置失败:', error)
      message.error('删除配置失败')
    }
  }

  const handleOpenTestModal = (config) => {
    setTestConfig(config)
    testForm.setFieldsValue({
      test_user_name: '测试用户'
    })
    setTestModalVisible(true)
  }

  const handleTestStarGiveConfig = async (values) => {
    try {
      const token = localStorage.getItem('token')
      
      const tempAxios = axios.create({
        baseURL: apiClient.defaults.baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      tempAxios.defaults.headers.Authorization = `Bearer ${token}`
      
      const response = await tempAxios.post('/star-give-feishu/test', {
        config_id: testConfig.id,
        test_user_name: values.test_user_name
      })
      
      if (response.data.success) {
        message.success('测试通知发送成功')
        setTestModalVisible(false)
        testForm.resetFields()
      } else {
        message.error(response.data.message || '测试失败')
      }
    } catch (error) {
      console.error('测试失败:', error)
      message.error('测试失败')
    }
  }

  // 飞书配置表格列定义 - 桌面端
  const desktopColumns = [
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 100,
      render: (threshold) => (
        <Tag color="blue" style={{ fontWeight: 'bold' }}>
          {threshold} ⭐
        </Tag>
      ),
      sorter: (a, b) => a.threshold - b.threshold
    },
    {
      title: 'Webhook URL',
      dataIndex: 'webhook_url',
      key: 'webhook_url',
      ellipsis: true,
      render: (url) => (
        <Tooltip title={url}>
          <Text code style={{ fontSize: '12px' }}>
            {url.length > 40 ? `${url.substring(0, 40)}...` : url}
          </Text>
        </Tooltip>
      )
    },
    {
      title: '模板ID',
      dataIndex: 'template_id',
      key: 'template_id',
      width: 120,
      render: (templateId) => (
        <Text code style={{ fontSize: '12px' }}>
          {templateId.length > 10 ? `${templateId.substring(0, 10)}...` : templateId}
        </Text>
      )
    },
    {
      title: '版本',
      dataIndex: 'template_version',
      key: 'template_version',
      width: 80,
      render: (version) => (
        <Tag color="green" size="small">{version}</Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="测试">
            <Button
              type="primary"
              size="small"
              loading={testingThreshold === record.threshold}
              onClick={() => handleTestNotification(record.threshold)}
            >
              测试
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDeleteConfig(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 飞书配置表格列定义 - 移动端
  const mobileColumns = [
    {
      title: '配置信息',
      key: 'config',
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 8 }}>
            <Tag color="blue" style={{ fontWeight: 'bold', marginRight: 8 }}>
              {record.threshold} ⭐
            </Tag>
            <Tag color="green" size="small">
              {record.template_version}
            </Tag>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 12, color: '#666' }}>模板ID: </Text>
            <Text code style={{ fontSize: 11 }}>
              {record.template_id}
            </Text>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 12, color: '#666' }}>Webhook: </Text>
            <Text code style={{ fontSize: 11 }}>
              {record.webhook_url.length > 30 ? 
                `${record.webhook_url.substring(0, 30)}...` : 
                record.webhook_url
              }
            </Text>
          </div>
          <Space size="small">
            <Button
              type="primary"
              size="small"
              loading={testingThreshold === record.threshold}
              onClick={() => handleTestNotification(record.threshold)}
            >
              测试
            </Button>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除这个配置吗？"
              onConfirm={() => handleDeleteConfig(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>
      )
    }
  ]

  const feishuConfigColumns = isMobile ? mobileColumns : desktopColumns

  // 赞赞星赠送飞书通知配置表格列定义
  const starGiveColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center'
    },
    {
      title: '模板ID',
      dataIndex: 'template_id',
      key: 'template_id',
      width: 150,
      render: (templateId) => (
        <Tag color="blue">{templateId}</Tag>
      )
    },
    {
      title: '模板版本',
      dataIndex: 'template_version',
      key: 'template_version',
      width: 120,
      render: (version) => version || '-'
    },
    {
      title: 'Webhook URL',
      dataIndex: 'webhook_url',
      key: 'webhook_url',
      ellipsis: true,
      render: (url) => (
        <Tooltip title={url}>
          <Text code style={{ fontSize: '12px' }}>
            {url.length > 30 ? `${url.substring(0, 30)}...` : url}
          </Text>
        </Tooltip>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => description || '-'
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenStarGiveModal(record)}
            size="small"
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<SendOutlined />}
            onClick={() => handleOpenTestModal(record)}
            size="small"
            disabled={!record.is_active}
          >
            测试
          </Button>
          <Popconfirm
            title="确定要删除这个配置吗？"
            onConfirm={() => handleDeleteStarGiveConfig(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Tabs
        defaultActiveKey="threshold"
        items={[
          {
            key: 'threshold',
            label: (
              <span>
                <MessageOutlined />
                弹幕阈值配置
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                {/* 飞书配置管理 */}
                <Col xs={24}>
          <Card 
            title={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 12 : 0
              }}>
                <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
                  <MessageOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  飞书阈值配置管理
                </Title>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                  size={isMobile ? 'middle' : 'default'}
                  style={isMobile ? { width: '100%' } : {}}
                >
                  新增配置
                </Button>
                </div>
            }
            className="card-shadow"
          >
            {feishuConfigs.length > 0 ? (
              <Table
                columns={feishuConfigColumns}
                dataSource={feishuConfigs}
                loading={loading}
                rowKey="id"
                pagination={isMobile ? {
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                  simple: true,
                  showTotal: (total) => `共 ${total} 条`
                } : {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条配置`
                }}
                scroll={isMobile ? { x: 'max-content' } : { x: 800 }}
                size={isMobile ? 'small' : 'middle'}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无飞书配置"
                style={{ margin: '40px 0' }}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  立即创建
                      </Button>
              </Empty>
            )}
          </Card>
                  </Col>


        {/* 配置统计和说明 */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            {/* 配置统计 */}
            <Col xs={24} lg={12}>
              <Card title="配置统计" className="card-shadow">
                <Row gutter={[8, 16]}>
                  <Col xs={8} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: isMobile ? 24 : 32, 
                        fontWeight: 'bold', 
                        color: '#1890ff' 
                      }}>
                        {feishuConfigs.length}
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? 12 : 14, 
                        color: '#666' 
                      }}>
                        配置总数
                      </div>
                </div>
                  </Col>
                  <Col xs={8} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: isMobile ? 24 : 32, 
                        fontWeight: 'bold', 
                        color: '#52c41a' 
                      }}>
                        {feishuConfigs.filter(config => config.is_active).length}
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? 12 : 14, 
                        color: '#666' 
                      }}>
                        激活配置
                      </div>
                    </div>
                  </Col>
                  <Col xs={8} sm={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: isMobile ? 24 : 32, 
                        fontWeight: 'bold', 
                        color: '#fa8c16' 
                      }}>
                        {feishuConfigs.length > 0 ? Math.min(...feishuConfigs.map(c => c.threshold)) : '-'}
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? 12 : 14, 
                        color: '#666' 
                      }}>
                        最低阈值
                      </div>
                </div>
                  </Col>
                </Row>
          </Card>
        </Col>

            {/* 功能说明 */}
            <Col xs={24} lg={12}>
              <Card title="功能说明" className="card-shadow">
            <Alert
                  message="飞书配置说明"
              description={
                    <ul style={{ 
                      marginBottom: 0, 
                      paddingLeft: 16, 
                      fontSize: isMobile ? 12 : 13 
                    }}>
                      <li>支持配置多个阈值，每个阈值对应不同的飞书群</li>
                      <li>当用户累计获得赞赞星达到某个阈值时，会自动发送飞书通知</li>
                      <li>可以为每个阈值配置不同的消息模板和Webhook</li>
                      <li>支持测试功能，确保配置正确可用</li>
                      <li>配置支持实时编辑和删除，灵活管理</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
        </Col>
      </Row>
            )
          },
          {
            key: 'star-give',
            label: (
              <span>
                <SendOutlined />
                赞赞星赠送通知
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                {/* 统计概览 */}
                <Col xs={24}>
                  <Card>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic
                          title="总配置数"
                          value={starGiveConfigs.length}
                          prefix={<SettingOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="启用配置"
                          value={starGiveConfigs.filter(config => config.is_active).length}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="禁用配置"
                          value={starGiveConfigs.filter(config => !config.is_active).length}
                          prefix={<CloseCircleOutlined />}
                          valueStyle={{ color: '#ff4d4f' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* 配置列表 */}
                <Col xs={24}>
                  <Card
                    title="赞赞星赠送飞书通知配置"
                    extra={
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenStarGiveModal()}
                      >
                        新增配置
                      </Button>
                    }
                  >
                    <Table
                      columns={starGiveColumns}
                      dataSource={starGiveConfigs}
                      rowKey="id"
                      pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                          `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
                      }}
                      scroll={{ x: 1000 }}
                    />
                  </Card>
                </Col>

                {/* 说明信息 */}
                <Col xs={24}>
                  <Alert
                    message="配置说明"
                    description={
                      <div>
                        <p>• 当用户赠送赞赞星时，系统会根据配置的模板发送飞书通知</p>
                        <p>• 可以配置多个模板，系统会按顺序尝试发送</p>
                        <p>• 只有启用状态的配置才会生效</p>
                        <p>• 建议先测试配置是否正确，再启用使用</p>
                      </div>
                    }
                    type="info"
                    showIcon
                  />
                </Col>
              </Row>
            )
          }
        ]}
      />

      {/* 赞赞星赠送飞书通知配置弹窗 */}
      <Modal
        title={editingStarGiveConfig ? '编辑配置' : '新增配置'}
        open={starGiveModalVisible}
        onCancel={() => {
          setStarGiveModalVisible(false)
          setEditingStarGiveConfig(null)
          starGiveForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={starGiveForm}
          layout="vertical"
          onFinish={handleSaveStarGiveConfig}
        >
          <Form.Item
            name="webhook_url"
            label="Webhook URL"
            rules={[
              { required: true, message: '请输入Webhook URL' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input placeholder="请输入飞书机器人的Webhook URL" />
          </Form.Item>

          <Form.Item
            name="template_id"
            label="模板ID"
            rules={[
              { required: true, message: '请输入模板ID' },
              { max: 100, message: '模板ID不能超过100个字符' }
            ]}
          >
            <Input placeholder="请输入飞书卡片模板ID" />
          </Form.Item>

          <Form.Item
            name="template_version"
            label="模板版本"
            rules={[
              { max: 50, message: '模板版本不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入模板版本（可选）" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[
              { max: 255, message: '描述不能超过255个字符' }
            ]}
          >
            <Input.TextArea 
              placeholder="请输入配置描述（可选）" 
              rows={3}
            />
          </Form.Item>

          {editingStarGiveConfig && (
            <Form.Item
              name="is_active"
              label="启用状态"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setStarGiveModalVisible(false)
                setEditingStarGiveConfig(null)
                starGiveForm.resetFields()
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingStarGiveConfig ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试配置弹窗 */}
      <Modal
        title="测试配置"
        open={testModalVisible}
        onCancel={() => {
          setTestModalVisible(false)
          setTestConfig(null)
          testForm.resetFields()
        }}
        footer={null}
        width={400}
      >
        {testConfig && (
          <div>
            <Alert
              message="测试说明"
              description="将发送一条测试通知到配置的飞书群，用于验证配置是否正确"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <Form
              form={testForm}
              layout="vertical"
              onFinish={handleTestStarGiveConfig}
            >
              <Form.Item
                name="test_user_name"
                label="测试用户姓名"
                rules={[
                  { required: true, message: '请输入测试用户姓名' },
                  { max: 50, message: '测试用户姓名不能超过50个字符' }
                ]}
              >
                <Input placeholder="请输入测试用户姓名" />
              </Form.Item>

              <Divider />

              <div style={{ marginBottom: '16px' }}>
                <Text strong>配置信息：</Text>
                <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <div><Text code>模板ID: {testConfig.template_id}</Text></div>
                  <div><Text code>版本: {testConfig.template_version || '默认'}</Text></div>
                  <div><Text code>状态: {testConfig.is_active ? '启用' : '禁用'}</Text></div>
                </div>
              </div>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => {
                    setTestModalVisible(false)
                    setTestConfig(null)
                    testForm.resetFields()
                  }}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit">
                    发送测试
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 新增/编辑飞书配置弹窗 */}
      <Modal
        title={editingConfig ? '编辑飞书配置' : '新增飞书配置'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingConfig(null)
          configForm.resetFields()
        }}
        footer={null}
        width={isMobile ? '95%' : 600}
        style={isMobile ? { top: 20 } : {}}
        destroyOnHidden
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleSaveConfig}
        >
          <Form.Item
            name="threshold"
            label="阈值"
            rules={[
              { required: true, message: '请输入阈值' },
              { type: 'number', min: 1, max: 10000, message: '阈值必须是1-10000之间的整数' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="触发飞书通知的星数阈值"
              addonAfter="⭐"
              min={1}
              max={10000}
            />
          </Form.Item>

          <Form.Item
            name="webhook_url"
            label="Webhook URL"
            rules={[
              { required: true, message: '请输入Webhook URL' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          >
            <Input
              placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            name="template_id"
            label="模板ID"
            rules={[
              { required: true, message: '请输入模板ID' }
            ]}
          >
            <Input
              placeholder="AAqkGxxx"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            name="template_version"
            label="模板版本"
            initialValue="1.0.1"
          >
            <Input
              placeholder="1.0.1"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Alert
            message="配置说明"
            description={
              <ul style={{ 
                marginBottom: 0, 
                paddingLeft: 16, 
                fontSize: isMobile ? 11 : 12 
              }}>
                <li>阈值：当用户累计获得赞赞星数达到此值时触发飞书通知</li>
                <li>Webhook URL：飞书群机器人的Webhook地址</li>
                <li>模板ID：飞书消息卡片模板的ID</li>
                <li>模板版本：飞书消息卡片模板的版本号</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ 
            marginBottom: 0, 
            textAlign: isMobile ? 'center' : 'right' 
          }}>
            <Space direction={isMobile ? 'vertical' : 'horizontal'} size="middle" style={{ width: isMobile ? '100%' : 'auto' }}>
              <Button 
                onClick={() => {
                  setModalVisible(false)
                  setEditingConfig(null)
                  configForm.resetFields()
                }}
                style={isMobile ? { width: '100%' } : {}}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                icon={<SettingOutlined />}
                style={isMobile ? { width: '100%' } : {}}
              >
                {editingConfig ? '更新配置' : '创建配置'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminBulletScreen
