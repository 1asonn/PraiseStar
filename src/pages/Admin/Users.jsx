import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Upload,
  Tag,
  InputNumber,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  UserOutlined,
  StarOutlined
} from '@ant-design/icons'
import { mockUsers } from '../../data/mockData'
import { userApi } from '../../services/api'

const { Option } = Select

const AdminUsers = () => {
  const [users, setUsers] = useState(mockUsers)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [adjustModalVisible, setAdjustModalVisible] = useState(false)
  const [adjustingUser, setAdjustingUser] = useState(null)
  const [form] = Form.useForm()
  const [adjustForm] = Form.useForm()
  const { getAllUsers } = userApi

  useEffect(() => {
    getAllUsers().then(res => {
      console.log(res)
    })
  }, [])

  // 添加/编辑用户
  const handleAddEdit = (user = null) => {
    setEditingUser(user)
    setModalVisible(true)
    if (user) {
      form.setFieldsValue(user)
    } else {
      form.resetFields()
    }
  }

  // 删除用户
  const handleDelete = (userId) => {
    setUsers(users.filter(user => user.id !== userId))
    message.success('删除成功')
  }

  // 调整赞赞星
  const handleAdjust = (user) => {
    setAdjustingUser(user)
    setAdjustModalVisible(true)
    adjustForm.setFieldsValue({
      availableToGive: user.availableToGive,
      receivedThisMonth: user.receivedThisMonth,
      receivedThisQuarter: user.receivedThisQuarter,
      receivedThisYear: user.receivedThisYear,
      redeemedThisYear: user.redeemedThisYear,
      availableToRedeem: user.availableToRedeem
    })
  }

  // 保存用户
  const handleSave = async (values) => {
    try {
      if (editingUser) {
        // 编辑
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...values }
            : user
        ))
        message.success('编辑成功')
      } else {
        // 新增
        const newUser = {
          ...values,
          id: Date.now(),
          isAdmin: false,
          monthlyAllocation: 100,
          availableToGive: 100,
          receivedThisMonth: 0,
          receivedThisQuarter: 0,
          receivedThisYear: 0,
          redeemedThisYear: 0,
          availableToRedeem: 0,
          ranking: users.length + 1
        }
        setUsers([...users, newUser])
        message.success('添加成功')
      }
      setModalVisible(false)
      form.resetFields()
      setEditingUser(null)
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 保存赞赞星调整
  const handleSaveAdjust = async (values) => {
    try {
      setUsers(users.map(user => 
        user.id === adjustingUser.id 
          ? { ...user, ...values }
          : user
      ))
      message.success('调整成功')
      setAdjustModalVisible(false)
      adjustForm.resetFields()
      setAdjustingUser(null)
    } catch (error) {
      message.error('调整失败')
    }
  }

  // 批量导入
  const handleBatchImport = (info) => {
    if (info.file.status === 'done') {
      message.success('批量导入成功')
    } else if (info.file.status === 'error') {
      message.error('批量导入失败')
    }
  }

  // 导出数据
  const handleExport = () => {
    // 模拟导出功能
    const data = users.map(user => ({
      姓名: user.name,
      手机号: user.phone,
      部门: user.department,
      职位: user.position,
      本月可赠送: user.availableToGive,
      本月获赠: user.receivedThisMonth,
      季度累计获赠: user.receivedThisQuarter,
      年度累计获赠: user.receivedThisYear,
      年度已兑换: user.redeemedThisYear,
      剩余可兑换: user.availableToRedeem,
      当前排名: user.ranking
    }))
    
    // 这里应该实现真正的导出功能
    console.log('导出数据:', data)
    message.success('数据导出成功')
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 100,
      render: (name, record) => (
        <Space>
          <span>{name}</span>
          {record.isAdmin && <Tag color="red" size="small">管理员</Tag>}
        </Space>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: (department) => <Tag color="blue">{department}</Tag>
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      width: 120
    },
    {
      title: '本月可赠送',
      dataIndex: 'availableToGive',
      key: 'availableToGive',
      width: 100,
      align: 'center',
      render: (value) => <span>{value} ⭐</span>
    },
    {
      title: '本月获赠',
      dataIndex: 'receivedThisMonth',
      key: 'receivedThisMonth',
      width: 90,
      align: 'center',
      render: (value) => <span style={{ color: '#1890ff' }}>{value} ⭐</span>
    },
    {
      title: '季度累计获赠',
      dataIndex: 'receivedThisQuarter',
      key: 'receivedThisQuarter',
      width: 110,
      align: 'center',
      render: (value) => <span style={{ color: '#52c41a' }}>{value} ⭐</span>
    },
    {
      title: '年度累计获赠',
      dataIndex: 'receivedThisYear',
      key: 'receivedThisYear',
      width: 110,
      align: 'center',
      render: (value) => <span style={{ color: '#fa8c16' }}>{value} ⭐</span>
    },
    {
      title: '年度已兑换',
      dataIndex: 'redeemedThisYear',
      key: 'redeemedThisYear',
      width: 100,
      align: 'center',
      render: (value) => <span style={{ color: '#eb2f96' }}>{value} ⭐</span>
    },
    {
      title: '剩余可兑换',
      dataIndex: 'availableToRedeem',
      key: 'availableToRedeem',
      width: 100,
      align: 'center',
      render: (value) => <span style={{ color: '#722ed1' }}>{value} ⭐</span>
    },
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 70,
      align: 'center',
      render: (ranking) => (
        <Tag color={ranking <= 3 ? 'gold' : ranking <= 10 ? 'green' : 'default'}>
          {ranking}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑用户">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleAddEdit(record)}
            />
          </Tooltip>
          <Tooltip title="调整赞赞星">
            <Button
              type="text"
              icon={<StarOutlined />}
              onClick={() => handleAdjust(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除用户">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="总用户数"
              value={users.length}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="管理员数"
              value={users.filter(u => u.isAdmin).length}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="活跃用户"
              value={users.filter(u => u.receivedThisMonth > 0).length}
              prefix={<StarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="部门数量"
              value={new Set(users.map(u => u.department)).size}
              prefix={<UserOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 员工管理表格 */}
      <Card 
        title="员工管理"
        className="card-shadow"
        extra={
          <Space>
            <Upload
              accept=".xlsx,.xls,.csv"
              showUploadList={false}
              onChange={handleBatchImport}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />} size="small">
                批量导入
              </Button>
            </Upload>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              size="small"
            >
              导出数据
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => handleAddEdit()}
              size="small"
            >
              添加用户
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            total: users.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          size="small"
        />
      </Card>

      {/* 添加/编辑用户弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingUser(null)
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="姓名"
                name="name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="手机号"
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入手机号" maxLength={11} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="部门"
                name="department"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select placeholder="请选择部门">
                  <Option value="研发中心">研发中心</Option>
                  <Option value="市场部">市场部</Option>
                  <Option value="人力行政部">人力行政部</Option>
                  <Option value="总经理办">总经理办</Option>
                  <Option value="财务部">财务部</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="职位"
                name="position"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="用户类型"
            name="isAdmin"
            valuePropName="checked"
          >
            <Select placeholder="请选择用户类型">
              <Option value={false}>普通用户</Option>
              <Option value={true}>管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? '保存' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 调整赞赞星弹窗 */}
      <Modal
        title={`调整赞赞星 - ${adjustingUser?.name}`}
        open={adjustModalVisible}
        onCancel={() => {
          setAdjustModalVisible(false)
          adjustForm.resetFields()
          setAdjustingUser(null)
        }}
        footer={null}
        width={500}
      >
        <Form
          form={adjustForm}
          layout="vertical"
          onFinish={handleSaveAdjust}
        >
          <Form.Item
            label="本月可赠送赞赞星"
            name="availableToGive"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              addonAfter="⭐"
            />
          </Form.Item>

          <Form.Item
            label="本月获赠赞赞星"
            name="receivedThisMonth"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              addonAfter="⭐"
            />
          </Form.Item>

          <Form.Item
            label="季度累计获赠"
            name="receivedThisQuarter"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              addonAfter="⭐"
            />
          </Form.Item>

          <Form.Item
            label="年度累计获赠"
            name="receivedThisYear"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              addonAfter="⭐"
            />
          </Form.Item>

          <Form.Item
            label="年度已兑换"
            name="redeemedThisYear"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              addonAfter="⭐"
            />
          </Form.Item>

          <Form.Item
            label="剩余可兑换"
            name="availableToRedeem"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              addonAfter="⭐"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setAdjustModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存调整
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminUsers
