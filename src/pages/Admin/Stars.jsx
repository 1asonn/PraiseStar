import React, { useState } from 'react'
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
  Statistic
} from 'antd'
import {
  SettingOutlined,
  StarOutlined,
  GiftOutlined,
  SendOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons'
import { mockUsers, giveReasons, mockGiveRecords } from '../../data/mockData'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const AdminStars = () => {
  const [settingsForm] = Form.useForm()
  const [awardForm] = Form.useForm()
  const [reasonForm] = Form.useForm()
  const [awardModalVisible, setAwardModalVisible] = useState(false)
  const [reasonModalVisible, setReasonModalVisible] = useState(false)
  const [customReasons, setCustomReasons] = useState(giveReasons)

  // 系统设置
  const [systemSettings, setSystemSettings] = useState({
    resetDay: 1, // 重置发放时间（每月1日）
    executiveStars: 300, // 高管（耿豪、超越）赞赞星数量
    managerStars: 200, // 部门负责人赞赞星数量
    employeeStars: 100, // 其他员工赞赞星数量
    validityPeriod: 'month' // 有效期类型
  })

  // 分配规则数据
  const allocationRules = [
    { level: '高管', users: ['耿豪', '超越'], stars: 300, description: '总经理、副总经理' },
    { level: '部门负责人', users: ['袁倩倩', '王倩', '李婷'], stars: 200, description: '各部门负责人' },
    { level: '普通员工', users: ['其他员工'], stars: 100, description: '其他所有员工' }
  ]

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
      render: (users) => users.join('、')
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
      setSystemSettings({ ...systemSettings, ...values })
      message.success('设置保存成功')
    } catch (error) {
      message.error('设置保存失败')
    }
  }

  // 奖励赞赞星
  const handleAward = async (values) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success(`成功向 ${values.userIds.length} 名用户奖励赞赞星`)
      setAwardModalVisible(false)
      awardForm.resetFields()
    } catch (error) {
      message.error('奖励失败')
    }
  }

  // 添加/编辑赠送理由
  const handleSaveReason = async (values) => {
    try {
      if (values.id) {
        // 编辑
        setCustomReasons(customReasons.map(reason => 
          reason === values.oldReason ? values.reason : reason
        ))
        message.success('理由编辑成功')
      } else {
        // 新增
        setCustomReasons([...customReasons, values.reason])
        message.success('理由添加成功')
      }
      setReasonModalVisible(false)
      reasonForm.resetFields()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 删除赠送理由
  const handleDeleteReason = (reason) => {
    if (reason === '其他') {
      message.warning('默认理由不能删除')
      return
    }
    setCustomReasons(customReasons.filter(r => r !== reason))
    message.success('删除成功')
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
                          style={{ width: '100%' }}
                          addonAfter="⭐"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

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
                    title="本月已奖励"
                    value={156}
                    prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
                    suffix="⭐"
                    valueStyle={{ color: '#52c41a' }}
                  />
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
              <Card title="分配规则" className="card-shadow">
                <Table
                  dataSource={allocationRules}
                  columns={allocationColumns}
                  pagination={false}
                  size="small"
                  rowKey="level"
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
                onClick={() => {
                  reasonForm.resetFields()
                  setReasonModalVisible(true)
                }}
              >
                添加理由
              </Button>
            }
          >
            <List
              dataSource={customReasons}
              renderItem={(reason, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      size="small"
                      onClick={() => {
                        reasonForm.setFieldsValue({ reason, oldReason: reason, id: index })
                        setReasonModalVisible(true)
                      }}
                    >
                      编辑
                    </Button>,
                    reason !== '其他' && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => handleDeleteReason(reason)}
                      >
                        删除
                      </Button>
                    )
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<StarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={reason}
                    description={reason === '其他' ? '自定义理由（系统默认）' : '自定义赠送理由'}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="赠送记录" key="records">
          <Card title="赠送记录" className="card-shadow">
            <Table
              dataSource={mockGiveRecords}
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
                total: mockGiveRecords.length,
                pageSize: 10,
                showSizeChanger: true
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
              {mockUsers.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name} - {user.department}
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
        title={reasonForm.getFieldValue('id') !== undefined ? '编辑理由' : '添加理由'}
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
              { max: 20, message: '理由名称不能超过20个字符' }
            ]}
          >
            <Input placeholder="请输入赠送理由" />
          </Form.Item>

          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="oldReason" hidden>
            <Input />
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
    </div>
  )
}

export default AdminStars
