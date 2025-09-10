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
  Empty
} from 'antd'
import {
  SettingOutlined,
  MessageOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { feishuConfigAPI } from '../../services/apiClient'

const { Title, Text } = Typography

const AdminBulletScreen = () => {
  const [configForm] = Form.useForm()
  
  // 飞书配置状态
  const [feishuConfigs, setFeishuConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [testingThreshold, setTestingThreshold] = useState(null)
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
  

  // 组件挂载时加载飞书配置
  useEffect(() => {
    loadFeishuConfigs()
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

  return (
    <div>
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
        destroyOnClose
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
