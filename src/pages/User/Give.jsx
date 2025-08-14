import React, { useState } from 'react'
import {
  Card,
  Form,
  Select,
  InputNumber,
  Input,
  Button,
  Alert,
  message,
  Row,
  Col,
  Statistic,
  Modal,
  Avatar,
  Space,
  Tag
} from 'antd'
import {
  SendOutlined,
  StarOutlined,
  UserOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { mockUsers, giveReasons } from '../../data/mockData'

const { Option } = Select
const { TextArea } = Input

const Give = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const { user } = useAuth()

  // 获取可以赠送的用户列表（排除自己）
  const availableUsers = mockUsers.filter(u => u.id !== user.id)

  const handleUserSelect = (userId) => {
    const selected = availableUsers.find(u => u.id === userId)
    setSelectedUser(selected)
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      Modal.success({
        title: '赠送成功！',
        content: (
          <div>
            <p>您成功向 <strong>{selectedUser.name}</strong> 赠送了 <strong>{values.stars}</strong> 颗赞赞星！</p>
            <p>赠送理由：{values.reason === '其他' ? values.customReason : values.reason}</p>
          </div>
        ),
        onOk: () => {
          form.resetFields()
          setSelectedUser(null)
        }
      })
      
      message.success('赞赞星赠送成功！')
    } catch (error) {
      message.error('赠送失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const validateStars = (_, value) => {
    if (!value) {
      return Promise.reject('请输入赠送数量')
    }
    if (value < 1) {
      return Promise.reject('赠送数量不能少于1颗')
    }
    if (value > user.availableToGive) {
      return Promise.reject(`赠送数量不能超过可用余额${user.availableToGive}颗`)
    }
    return Promise.resolve()
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 个人余额信息 */}
        <Col span={24}>
          <Card className="card-shadow">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="本月可赠送"
                  value={user.availableToGive}
                  prefix={<SendOutlined style={{ color: '#52c41a' }} />}
                  suffix="⭐"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="本月已赠送"
                  value={user.monthlyAllocation - user.availableToGive}
                  prefix={<StarOutlined style={{ color: '#1890ff' }} />}
                  suffix="⭐"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="本月分配总数"
                  value={user.monthlyAllocation}
                  prefix={<StarOutlined style={{ color: '#fa8c16' }} />}
                  suffix="⭐"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 赠送表单 */}
        <Col xs={24} lg={16}>
          <Card title="赠送赞赞星" className="card-shadow">
            <Alert
              message="赠送说明"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>每月分配的赞赞星仅可用于赠送他人</li>
                  <li>本月可赠送额度：{user.availableToGive} 颗赞赞星</li>
                  <li>使用有效期：本自然月内，月底未送出自动清零</li>
                  <li>获赠的赞赞星可用于兑换礼品，有效期至年底</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              disabled={user.availableToGive === 0}
            >
              <Form.Item
                label="选择赠送对象"
                name="toUserId"
                rules={[{ required: true, message: '请选择赠送对象' }]}
              >
                <Select
                  placeholder="请选择要赠送的同事"
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={handleUserSelect}
                >
                  {availableUsers.map(u => (
                    <Option key={u.id} value={u.id}>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <span>{u.name}</span>
                        <Tag size="small">{u.department}</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="赠送数量"
                name="stars"
                rules={[{ validator: validateStars }]}
              >
                <InputNumber
                  placeholder="请输入赠送的赞赞星数量"
                  size="large"
                  min={1}
                  max={user.availableToGive}
                  style={{ width: '100%' }}
                  addonAfter="⭐"
                />
              </Form.Item>

              <Form.Item
                label="赠送理由"
                name="reason"
                rules={[{ required: true, message: '请选择赠送理由' }]}
              >
                <Select placeholder="请选择赠送理由" size="large">
                  {giveReasons.map(reason => (
                    <Option key={reason} value={reason}>{reason}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                  prevValues.reason !== currentValues.reason
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue('reason') === '其他' ? (
                    <Form.Item
                      label="具体理由"
                      name="customReason"
                      rules={[
                        { required: true, message: '请填写具体理由' },
                        { min: 5, message: '理由不少于5个字符' }
                      ]}
                    >
                      <TextArea
                        placeholder="请详细描述赠送理由..."
                        rows={3}
                        maxLength={100}
                        showCount
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  icon={<SendOutlined />}
                  block
                  disabled={user.availableToGive === 0}
                >
                  {user.availableToGive === 0 ? '本月赠送额度已用完' : '确认赠送'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 选中用户信息 */}
        <Col xs={24} lg={8}>
          <Card title="赠送对象信息" className="card-shadow">
            {selectedUser ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Avatar size={64} icon={<UserOutlined />} />
                  <h3 style={{ margin: '8px 0 4px' }}>{selectedUser.name}</h3>
                  <Tag color="blue">{selectedUser.department}</Tag>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                    {selectedUser.position}
                  </div>
                </div>
                
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                          {selectedUser.receivedThisMonth}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>本月获赠</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }}>
                          {selectedUser.ranking}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>当前排名</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <InfoCircleOutlined style={{ fontSize: 32, marginBottom: 16 }} />
                <div>请先选择赠送对象</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Give
