import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Table,
  Tag,
  Modal,
  message,
  Space,
  Tabs,
  List,
  Avatar,
  Statistic,
  Popconfirm,
  Tooltip,
  Alert,
  Transfer,
  Divider,
  Empty,
  Typography
} from 'antd'
import {
  SettingOutlined,
  StarOutlined,
  GiftOutlined,
  SendOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  SwapOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { systemAPI, giveReasonAPI } from '../../services/apiClient'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs
const { Title, Text } = Typography

const AdminStars = () => {
  const [settingsForm] = Form.useForm()
  const [awardForm] = Form.useForm()
  const [reasonForm] = Form.useForm()
  const [awardModalVisible, setAwardModalVisible] = useState(false)
  const [reasonModalVisible, setReasonModalVisible] = useState(false)
  const [editingReason, setEditingReason] = useState(null)
  const [loading, setLoading] = useState(false)

  // 用户分配规则相关状态
  const [allocationModalVisible, setAllocationModalVisible] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState({
    executive: [],
    manager: [],
    employee: []
  })
  const [levelSettings, setLevelSettings] = useState({
    executive: { name: '高管', stars: 300, description: '总经理、副总经理' },
    manager: { name: '部门负责人', stars: 200, description: '各部门负责人' },
    employee: { name: '普通员工', stars: 100, description: '其他所有员工' }
  })

  // 系统数据状态
  const [systemSettings, setSystemSettings] = useState({
    star_reset_day: 1,
    executive_stars_allocation: 300,
    manager_stars_allocation: 200,
    employee_stars_allocation: 100,
    star_validity_period: 'month'
  })
  const [giveReasons, setGiveReasons] = useState([])
  const [allocationRules, setAllocationRules] = useState([])
  const [users, setUsers] = useState([])
  const [giveRecords, setGiveRecords] = useState([])
  const [statistics, setStatistics] = useState({
    monthlyAwards: 0,
    totalUsers: 0,
    adminCount: 0,
    activeUsers: 0,
    period: ''
  })

  // 组件挂载时加载数据
  useEffect(() => {
    loadAllData()
  }, [])

  // 加载所有数据
  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadSystemSettings(),
        loadGiveReasons(),
        loadAllocationRules(),
        loadUsers(),
        loadStatistics(),
        loadGiveRecords()
      ])
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载系统设置
  const loadSystemSettings = async () => {
    try {
      const response = await systemAPI.getSettings()
      if (response.success) {
        setSystemSettings(response.data)
        settingsForm.setFieldsValue({
          resetDay: response.data.star_reset_day,
          executiveStars: response.data.executive_stars_allocation,
          managerStars: response.data.manager_stars_allocation,
          employeeStars: response.data.employee_stars_allocation,
          validityPeriod: response.data.star_validity_period
        })
        
        // 根据系统设置更新级别设置
        setLevelSettings({
          executive: { 
            name: '高管', 
            stars: response.data.executive_stars_allocation || 300, 
            description: '总经理、副总经理' 
          },
          manager: { 
            name: '部门负责人', 
            stars: response.data.manager_stars_allocation || 200, 
            description: '各部门负责人' 
          },
          employee: { 
            name: '普通员工', 
            stars: response.data.employee_stars_allocation || 100, 
            description: '其他所有员工' 
          }
        })
      }
    } catch (error) {
      console.error('加载系统设置失败:', error)
    }
  }

  // 加载赠送理由
  const loadGiveReasons = async () => {
    try {
      const response = await giveReasonAPI.getReasons()
      if (response.success) {
        setGiveReasons(response.data || [])
      }
    } catch (error) {
      console.error('加载赠送理由失败:', error)
    }
  }

  // 加载分配规则
  const loadAllocationRules = async () => {
    try {
      const response = await systemAPI.getAllocationRules()
      if (response.success) {
        setAllocationRules(response.data || [])
      }
    } catch (error) {
      console.error('加载分配规则失败:', error)
    }
  }

  // 加载用户列表
  const loadUsers = async () => {
    try {
      const response = await systemAPI.getUsers()
      if (response.success) {
        setUsers(response.data || [])
      }
    } catch (error) {
      console.error('加载用户列表失败:', error)
    }
  }

  // 加载统计信息
  const loadStatistics = async () => {
    try {
      const response = await systemAPI.getStatistics()
      if (response.success) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('加载统计信息失败:', error)
    }
  }

  // 加载赠送记录
  const loadGiveRecords = async () => {
    try {
      // TODO: 实现赠送记录API调用
      // const response = await systemAPI.getGiveRecords()
      // if (response.success) {
      //   setGiveRecords(response.data || [])
      // }
      
      // 暂时使用模拟数据
      setGiveRecords([
        {
          id: 1,
          createTime: '2024-12-15 10:30:00',
          fromUserName: '张三',
          toUserName: '李四',
          stars: 15,
          reason: '工作表现好',
          customReason: null
        },
        {
          id: 2,
          createTime: '2024-12-15 09:00:00',
          fromUserName: '王倩',
          toUserName: '张三',
          stars: 8,
          reason: '其他',
          customReason: '协助完成项目'
        }
      ])
    } catch (error) {
      console.error('加载赠送记录失败:', error)
    }
  }

  // 打开用户分配规则管理弹窗
  const handleOpenAllocationModal = () => {
    setAllocationModalVisible(true)
    loadUsersForAllocation()
  }

  // 加载用户分配数据
  const loadUsersForAllocation = async () => {
    try {
      setLoading(true)
      
      // 加载所有用户和当前分配规则
      const [usersResponse, rulesResponse] = await Promise.all([
        systemAPI.getUsers(),
        systemAPI.getAllocationRules()
      ])

      if (usersResponse.success && rulesResponse.success) {
        // 根据当前分配规则初始化选中的用户
        const newSelectedUsers = {
          executive: [],
          manager: [],
          employee: []
        }

        rulesResponse.data.forEach(rule => {
          if (newSelectedUsers[rule.id]) {
            newSelectedUsers[rule.id] = rule.users.map(user => user.id)
          }
        })

        setSelectedUsers(newSelectedUsers)
      }
    } catch (error) {
      console.error('加载用户分配数据失败:', error)
      message.error('加载用户分配数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 保存用户分配规则
  const handleSaveAllocationRules = async () => {
    try {
      setLoading(true)
      
      // 构建规则数据
      const rules = Object.entries(selectedUsers).map(([levelKey, userIds]) => ({
        level_key: levelKey,
        level_name: levelSettings[levelKey].name,
        stars_allocation: levelSettings[levelKey].stars,
        description: levelSettings[levelKey].description,
        user_ids: userIds
      })).filter(rule => rule.user_ids.length > 0) // 只保存有用户的规则

      const response = await systemAPI.setAllocationRules(rules)
      
      if (response.success) {
        message.success('用户分配规则保存成功')
        setAllocationModalVisible(false)
        await loadAllocationRules() // 重新加载分配规则列表
      } else {
        message.error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('保存用户分配规则失败:', error)
      message.error(error.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理用户级别变更
  const handleUserLevelChange = (userId, fromLevel, toLevel) => {
    setSelectedUsers(prev => {
      const newSelected = { ...prev }
      
      // 从原级别中移除
      if (fromLevel) {
        newSelected[fromLevel] = newSelected[fromLevel].filter(id => id !== userId)
      }
      
      // 添加到新级别
      if (toLevel && !newSelected[toLevel].includes(userId)) {
        newSelected[toLevel] = [...newSelected[toLevel], userId]
      }
      
      return newSelected
    })
  }

  // 获取用户当前所在级别
  const getUserCurrentLevel = (userId) => {
    for (const [level, userIds] of Object.entries(selectedUsers)) {
      if (userIds.includes(userId)) {
        return level
      }
    }
    return null
  }

  const allocationColumns = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Tag color="blue">{level}</Tag>
    },
    {
      title: '适用人员',
      dataIndex: 'users',
      key: 'users',
      render: (users) => (
        <div>
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <Tag key={index} color="geekblue" style={{ marginBottom: 4 }}>
                {user.name} ({user.department})
              </Tag>
            ))
          ) : (
            <span style={{ color: '#999' }}>未分配用户</span>
          )}
        </div>
      )
    },
    {
      title: '分配数量',
      dataIndex: 'stars',
      key: 'stars',
      render: (stars) => (
        <Space>
          <StarOutlined style={{ color: '#fadb14' }} />
          <span style={{ fontWeight: 'bold' }}>{stars}</span>
        </Space>
      )
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="text" icon={<EditOutlined />} size="small">
          编辑
        </Button>
      )
    }
  ]

  // 保存系统设置
  const handleSaveSettings = async (values) => {
    try {
      setLoading(true)
      const response = await systemAPI.updateSettings({
        resetDay: values.resetDay,
        executiveStars: values.executiveStars,
        managerStars: values.managerStars,
        employeeStars: values.employeeStars,
        validityPeriod: values.validityPeriod
      })
      
      if (response.success) {
        message.success('设置保存成功')
        await loadSystemSettings() // 重新加载设置，这会同时更新levelSettings
      } else {
        message.error(response.message || '设置保存失败')
      }
    } catch (error) {
      console.error('保存系统设置失败:', error)
      message.error(error.message || '设置保存失败')
    } finally {
      setLoading(false)
    }
  }

  // 奖励赞赞星
  const handleAward = async (values) => {
    try {
      setLoading(true)
      // TODO: 实现奖励API调用
      message.success(`成功向 ${values.userIds.length} 名用户奖励赞赞星`)
      setAwardModalVisible(false)
      awardForm.resetFields()
      await loadStatistics() // 重新加载统计信息
    } catch (error) {
      console.error('奖励失败:', error)
      message.error('奖励失败')
    } finally {
      setLoading(false)
    }
  }

  // 打开理由编辑弹窗
  const handleOpenReasonModal = (reason = null) => {
    setEditingReason(reason)
    setReasonModalVisible(true)
    if (reason) {
      reasonForm.setFieldsValue({
        reason: reason.reason
      })
    } else {
      reasonForm.resetFields()
    }
  }

  // 保存赠送理由
  const handleSaveReason = async (values) => {
    try {
      setLoading(true)
      let response
      
      if (editingReason) {
        // 编辑理由
        response = await giveReasonAPI.updateReason(editingReason.id, values.reason)
      } else {
        // 新增理由
        response = await giveReasonAPI.addReason(values.reason)
      }
      
      if (response.success) {
        message.success(editingReason ? '理由编辑成功' : '理由添加成功')
        setReasonModalVisible(false)
        reasonForm.resetFields()
        setEditingReason(null)
        await loadGiveReasons() // 重新加载理由列表
      } else {
        message.error(response.message || '操作失败')
      }
    } catch (error) {
      console.error('保存理由失败:', error)
      message.error(error.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除赠送理由
  const handleDeleteReason = async (reason) => {
    if (reason.is_default) {
      message.warning('默认理由不能删除')
      return
    }
    
    try {
      setLoading(true)
      const response = await giveReasonAPI.deleteReason(reason.id)
      if (response.success) {
        message.success('删除成功')
        await loadGiveReasons() // 重新加载理由列表
      } else {
        message.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除理由失败:', error)
      message.error(error.message || '删除失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Tabs defaultActiveKey="settings">
        <TabPane tab="系统设置" key="settings">
          <Row gutter={[16, 16]}>
            {/* 分配设置 */}
            <Col xs={24} lg={12}>
              <Card title="分配设置" className="card-shadow">
                <Form
                  form={settingsForm}
                  layout="vertical"
                  initialValues={systemSettings}
                  onFinish={handleSaveSettings}
                >
                  <Form.Item
                    label="重置发放时间"
                    name="resetDay"
                    rules={[{ required: true, message: '请选择重置时间' }]}
                  >
                    <Select placeholder="请选择每月重置时间">
                      {Array.from({ length: 28 }, (_, i) => (
                        <Option key={i + 1} value={i + 1}>
                          每月{i + 1}日
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label="高管赞赞星"
                        name="executiveStars"
                        rules={[{ required: true, message: '请输入数量' }]}
                      >
                        <InputNumber
                          min={0}
                          max={1000}
                          style={{ width: '100%' }}
                          addonAfter="⭐"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="部门负责人"
                        name="managerStars"
                        rules={[{ required: true, message: '请输入数量' }]}
                      >
                        <InputNumber
                          min={0}
                          max={1000}
                          style={{ width: '100%' }}
                          addonAfter="⭐"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="普通员工"
                        name="employeeStars"
                        rules={[{ required: true, message: '请输入数量' }]}
                      >
                        <InputNumber
                          min={0}
                          max={1000}
                          style={{ width: '100%' }}
                          addonAfter="⭐"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="赞赞星有效期"
                    name="validityPeriod"
                    rules={[{ required: true, message: '请选择有效期类型' }]}
                  >
                    <Select placeholder="请选择赞赞星有效期类型">
                      <Option value="month">月度（每月重置）</Option>
                      <Option value="quarter">季度（每季度重置）</Option>
                      <Option value="year">年度（每年重置）</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SettingOutlined />}>
                      保存设置
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* 奖励赞赞星 */}
            <Col xs={24} lg={12}>
              <Card 
                title="奖励赞赞星" 
                className="card-shadow"
                extra={
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setAwardModalVisible(true)}
                    size="small"
                  >
                    奖励
                  </Button>
                }
              >
                <div style={{ marginBottom: 16 }}>
                  <Statistic
                    title={`${statistics.period || '本月'}已奖励`}
                    value={statistics.monthlyAwards}
                    prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
                    suffix="⭐"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </div>
                <div style={{ marginBottom: 16, fontSize: 12, color: '#666' }}>
                  <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                    <span><UserOutlined /> 总用户: {statistics.totalUsers}</span>
                    <span><StarOutlined /> 活跃用户: {statistics.activeUsers}</span>
                    <span><SettingOutlined /> 管理员: {statistics.adminCount}</span>
                  </Space>
                </div>
                <div style={{ fontSize: 12, color: '#666', lineHeight: '20px' }}>
                  💡 管理员可以向员工发放额外的奖励赞赞星<br/>
                  💡 奖励赞赞星有效期为奖励当自然年度内<br/>
                  💡 奖励赞赞星可用于兑换礼品
                </div>
              </Card>
            </Col>
          </Row>

          {/* 分配规则表格 */}
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card 
                title="分配规则" 
                className="card-shadow"
                extra={
                  <Button 
                    type="primary" 
                    icon={<TeamOutlined />}
                    onClick={handleOpenAllocationModal}
                  >
                    管理用户分配
                  </Button>
                }
              >
                <Alert
                  message="分配规则说明"
                  description="分配规则决定了不同级别用户每月可获得的赞赞星数量，可以为特定用户设置个性化的分配规则。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16, fontSize: 12 }}
                />
                <Table
                  loading={loading}
                  dataSource={allocationRules}
                  columns={allocationColumns}
                  pagination={false}
                  size="small"
                  rowKey="id"
                  locale={{
                    emptyText: allocationRules.length === 0 ? (
                      <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <div style={{ marginBottom: 16 }}>
                          <StarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        </div>
                        <div style={{ color: '#999', marginBottom: 16 }}>
                          暂无分配规则配置
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          系统将使用默认的分配规则
                        </div>
                      </div>
                    ) : '暂无数据'
                  }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="赠送理由管理" key="reasons">
          <Card 
            title="赠送理由管理"
            className="card-shadow"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => handleOpenReasonModal()}
              >
                添加理由
              </Button>
            }
          >
            <List
              loading={loading}
              dataSource={giveReasons}
              renderItem={(reason) => (
                <List.Item
                  actions={[
                    <Tooltip title="编辑理由">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenReasonModal(reason)}
                        disabled={reason.is_default}
                      >
                        编辑
                      </Button>
                    </Tooltip>,
                    !reason.is_default && (
                      <Popconfirm
                        title="确定要删除这个理由吗？"
                        onConfirm={() => handleDeleteReason(reason)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Tooltip title="删除理由">
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                          >
                            删除
                          </Button>
                        </Tooltip>
                      </Popconfirm>
                    )
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<StarOutlined />} 
                        style={{ 
                          backgroundColor: reason.is_default ? '#52c41a' : '#1890ff' 
                        }} 
                      />
                    }
                    title={
                      <Space>
                        {reason.reason}
                        {reason.is_default && <Tag color="green" size="small">默认</Tag>}
                      </Space>
                    }
                    description={
                      reason.is_default 
                        ? '系统默认理由，不可修改或删除' 
                        : '自定义赠送理由'
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="赠送记录" key="records">
          <Card title="赠送记录" className="card-shadow">
            <Table
              loading={loading}
              dataSource={giveRecords}
              columns={[
                {
                  title: '时间',
                  dataIndex: 'createTime',
                  key: 'createTime',
                  width: 150,
                  render: (time) => dayjs(time).format('MM-DD HH:mm')
                },
                {
                  title: '赠送人',
                  dataIndex: 'fromUserName',
                  key: 'fromUserName'
                },
                {
                  title: '接收人',
                  dataIndex: 'toUserName',
                  key: 'toUserName'
                },
                {
                  title: '数量',
                  dataIndex: 'stars',
                  key: 'stars',
                  align: 'center',
                  render: (stars) => (
                    <Tag color="blue">{stars} ⭐</Tag>
                  )
                },
                {
                  title: '理由',
                  key: 'reason',
                  render: (_, record) => (
                    <span>
                      {record.reason === '其他' ? record.customReason : record.reason}
                    </span>
                  )
                }
              ]}
              pagination={{
                total: giveRecords.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }}
              size="small"
              rowKey="id"
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 奖励赞赞星弹窗 */}
      <Modal
        title="奖励赞赞星"
        open={awardModalVisible}
        onCancel={() => {
          setAwardModalVisible(false)
          awardForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={awardForm}
          layout="vertical"
          onFinish={handleAward}
        >
          <Form.Item
            label="选择用户"
            name="userIds"
            rules={[{ required: true, message: '请选择要奖励的用户' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择用户"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name} - {user.department} ({user.position})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="奖励数量"
            name="stars"
            rules={[{ required: true, message: '请输入奖励数量' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              addonAfter="⭐"
              placeholder="请输入奖励的赞赞星数量"
            />
          </Form.Item>

          <Form.Item
            label="奖励原因"
            name="reason"
            rules={[{ required: true, message: '请输入奖励原因' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入奖励原因..."
              maxLength={100}
              showCount
            />
          </Form.Item>

          <div style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: 6, 
            padding: 12, 
            marginBottom: 16,
            fontSize: 12,
            color: '#389e0d'
          }}>
            💡 奖励的赞赞星有效期为当自然年度内，可用于兑换礼品
          </div>

          <Form.Item>
            <Space>
              <Button onClick={() => setAwardModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认奖励
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加/编辑理由弹窗 */}
      <Modal
        title={editingReason ? '编辑理由' : '添加理由'}
        open={reasonModalVisible}
        onCancel={() => {
          setReasonModalVisible(false)
          reasonForm.resetFields()
        }}
        footer={null}
        width={400}
      >
        <Form
          form={reasonForm}
          layout="vertical"
          onFinish={handleSaveReason}
        >
          <Form.Item
            label="理由名称"
            name="reason"
            rules={[
              { required: true, message: '请输入理由名称' },
              { max: 50, message: '理由名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入赠送理由" />
          </Form.Item>


          <Form.Item>
            <Space>
              <Button onClick={() => setReasonModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户分配规则管理弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            用户分配规则管理
          </div>
        }
        open={allocationModalVisible}
        onCancel={() => {
          setAllocationModalVisible(false)
        }}
        width={1000}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAllocationModalVisible(false)}>
                取消
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleSaveAllocationRules}
              >
                保存分配规则
              </Button>
            </Space>
          </div>
        }
      >
        <Alert
          message="用户分配规则说明"
          description="将用户分配到不同级别，每个级别对应不同的赞赞星分配数量。每个用户只能属于一个级别。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          {/* 用户列表 */}
          <Col span={10}>
            <Card title="所有用户" size="small">
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    加载中...
                  </div>
                ) : (
                  <List
                    size="small"
                    dataSource={users}
                    renderItem={user => {
                      const currentLevel = getUserCurrentLevel(user.id)
                      return (
                        <List.Item
                          style={{ 
                            padding: '8px 12px',
                            backgroundColor: currentLevel ? '#f6ffed' : 'transparent'
                          }}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                style={{ 
                                  backgroundColor: currentLevel ? '#52c41a' : '#d9d9d9' 
                                }}
                              >
                                {user.name[0]}
                              </Avatar>
                            }
                            title={
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{user.name}</span>
                                {currentLevel && (
                                  <Tag color="green" size="small">
                                    {levelSettings[currentLevel]?.name}
                                  </Tag>
                                )}
                              </div>
                            }
                            description={`${user.department} - ${user.position}`}
                          />
                          <Select
                            size="small"
                            style={{ width: 100 }}
                            placeholder="选择级别"
                            value={currentLevel}
                            onChange={(newLevel) => handleUserLevelChange(user.id, currentLevel, newLevel)}
                            allowClear
                          >
                            <Option value="executive">高管</Option>
                            <Option value="manager">负责人</Option>
                            <Option value="employee">员工</Option>
                          </Select>
                        </List.Item>
                      )
                    }}
                  />
                )}
              </div>
            </Card>
          </Col>

          {/* 级别分组 */}
          <Col span={14}>
            <Row gutter={[16, 16]}>
              {Object.entries(levelSettings).map(([levelKey, levelInfo]) => (
                <Col span={24} key={levelKey}>
                  <Card 
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <StarOutlined style={{ color: '#fadb14' }} />
                          {levelInfo.name}
                          <Tag color="blue">{levelInfo.stars}⭐</Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          已分配: {selectedUsers[levelKey]?.length || 0} 人
                        </Text>
                      </div>
                    }
                    size="small"
                    style={{ 
                      border: selectedUsers[levelKey]?.length > 0 ? '2px solid #52c41a' : '1px solid #d9d9d9'
                    }}
                  >
                    <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                      {levelInfo.description}
                    </div>
                    
                    {selectedUsers[levelKey]?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {selectedUsers[levelKey].map(userId => {
                          const user = users.find(u => u.id === userId)
                          return user ? (
                            <Tag 
                              key={userId}
                              closable
                              onClose={() => handleUserLevelChange(userId, levelKey, null)}
                              style={{ marginBottom: 4 }}
                            >
                              {user.name}
                            </Tag>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="暂无用户"
                        style={{ margin: '16px 0' }}
                      />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        <Divider />
        
        <div style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>
          💡 提示：在左侧选择用户级别，右侧会显示各级别的用户分配情况
        </div>
      </Modal>
    </div>
  )
}

export default AdminStars
