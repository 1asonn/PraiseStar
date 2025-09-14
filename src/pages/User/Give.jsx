import React, { useState, useEffect } from 'react'
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
  Tag,
  Spin,
  Cascader
} from 'antd'
import {
  SendOutlined,
  StarOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  GiftOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { giveReasonAPI } from '../../services/apiClient'
import { starsService } from '../../services/starsService'

const { Option } = Select
const { TextArea } = Input

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

const Give = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [availableUsers, setAvailableUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [giveReasons, setGiveReasons] = useState([])
  const [loadingReasons, setLoadingReasons] = useState(false)
  const [formValues, setFormValues] = useState({})
  const { user, refreshUser } = useAuth()

  // 获取可用用户列表
  const fetchAvailableUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await starsService.getAvailableUsers()
      if (response.success) {
        setAvailableUsers(response.data.departments || [])
      } else {
        message.error('获取用户列表失败')
      }
    } catch (error) {
      console.error('获取可用用户失败:', error)
      message.error('获取用户列表失败，请稍后重试')
    } finally {
      setLoadingUsers(false)
    }
  }

  // 获取赠送理由列表
  const fetchGiveReasons = async () => {
    setLoadingReasons(true)
    try {
      const response = await giveReasonAPI.getReasons()
      if (response.success) {
        setGiveReasons(response.data || [])
      } else {
        message.error('获取赠送理由失败')
      }
    } catch (error) {
      console.error('获取赠送理由失败:', error)
      message.error('获取赠送理由失败，请稍后重试')
    } finally {
      setLoadingReasons(false)
    }
  }

  // 组件加载时获取可用用户和赠送理由
  useEffect(() => {
    fetchAvailableUsers()
    fetchGiveReasons()
  }, [])

  // 将部门用户数据转换为Cascader需要的格式
  const cascaderOptions = availableUsers.map(dept => ({
    value: dept.department,
    label: dept.department,
    children: dept.users.map(user => ({
      value: user.id,
      label: (
        <Space>
          <span>{user.name}</span>
          <Tag size="small" color="blue">{user.position}</Tag>
        </Space>
      ),
      user: user // 保存完整的用户信息
    }))
  }))

  const handleUserSelect = (value, selectedOptions) => {
    if (selectedOptions && selectedOptions.length === 2) {
      // 选择了用户（第二级）
      const selectedUserData = selectedOptions[1].user
      setSelectedUser(selectedUserData)
    } else {
      setSelectedUser(null)
    }
  }

  // 监听表单值变化
  const handleFormValuesChange = (changedValues, allValues) => {
    setFormValues(allValues)
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // Cascader的值是一个数组，第二个元素是用户ID
      const toUserId = Array.isArray(values.toUserId) ? values.toUserId[1] : values.toUserId
      
      const giveData = {
        toUserId: toUserId,
        stars: values.stars,
        reason: {
          keyword: values.reasonKeyword,
          reason: values.reasonText
        },
        customReason: values.customReason || ''
      }
      
      const response = await starsService.giveStars(giveData)
      
      if (response.success) {
        Modal.success({
          title: '赠送成功！',
          content: (
            <div>
              <p>您成功向 <strong>{selectedUser.name}</strong> 赠送了 <strong>{values.stars}</strong> 颗赞赞星！</p>
              <p>赠送词条：<strong>{values.reasonKeyword}</strong></p>
              <p>具体理由：{values.reasonText}</p>
            </div>
          ),
          onOk: async () => {
            form.resetFields()
            setSelectedUser(null)
            // 刷新用户信息和可用用户列表
            await fetchAvailableUsers()
            // 刷新当前用户信息
            await refreshUser()
          }
        })
        
        message.success('赞赞星赠送成功！')
      } else {
        message.error(response.message || '赠送失败，请稍后重试')
      }
    } catch (error) {
      console.error('赠送赞赞星失败:', error)
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
                  suffix={<StarIcon color="#52c41a" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="本月已赠送"
                  value={user.monthlyAllocation - user.availableToGive}
                  prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                  suffix={<StarIcon color="#1890ff" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="本月分配总数"
                  value={user.monthlyAllocation}
                  prefix={<GiftOutlined style={{ color: '#fa8c16' }} />}
                  suffix={<StarIcon color="#fa8c16" />}
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
              onValuesChange={handleFormValuesChange}
              disabled={user.availableToGive === 0}
            >
              <Form.Item
                label="选择赠送对象"
                name="toUserId"
                rules={[{ required: true, message: '请选择赠送对象' }]}
              >
                <Cascader
                  placeholder="请选择部门和同事"
                  size="large"
                  expandTrigger="hover"
                  options={cascaderOptions}
                  onChange={handleUserSelect}
                  loading={loadingUsers}
                  notFoundContent={loadingUsers ? <Spin size="small" /> : '暂无可用用户'}
                  showSearch={{
                    filter: (inputValue, path) => {
                      return path.some(option => 
                        option.label && 
                        (typeof option.label === 'string' ? 
                          option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1 :
                          option.user && option.user.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                        )
                      )
                    }
                  }}
                  displayRender={(labels, selectedOptions) => {
                    if (selectedOptions && selectedOptions.length === 2) {
                      const user = selectedOptions[1].user
                      return (
                        <Space>
                          <span>{labels[0]}</span>
                          <span>/</span>
                          <span>{user.name}</span>
                        </Space>
                      )
                    }
                    return labels.join(' / ')
                  }}
                />
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
                  addonAfter={<StarIcon color="#52c41a" size="14px" />}
                />
              </Form.Item>

              <Form.Item
                label="赠送词条"
                name="reasonKeyword"
                rules={[{ required: true, message: '请选择赠送词条' }]}
              >
                <Select 
                  placeholder="请选择赠送词条" 
                  size="large"
                  loading={loadingReasons}
                >
                  {giveReasons.map(reasonItem => (
                    <Option key={reasonItem.id} value={reasonItem.reason}>
                      {reasonItem.reason}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="具体理由"
                name="reasonText"
                rules={[
                  { required: true, message: '请填写具体理由' },
                  { min: 5, message: '理由不少于5个字符' },
                  { max: 100, message: '理由不能超过100个字符' }
                ]}
              >
                <TextArea
                  placeholder="请详细描述赠送理由..."
                  rows={3}
                  maxLength={100}
                  showCount
                />
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

        {/* 赠送信息确认 */}
        <Col xs={24} lg={8}>
          <Card title="赠送信息确认" className="card-shadow">
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
                
                <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 6 }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>赠送数量</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }}>
                      {formValues.stars || 0} <StarIcon color="#52c41a" size="16px" />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>赠送词条</div>
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}>
                      {formValues.reasonKeyword || '请选择赠送词条'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>具体理由</div>
                    <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1890ff' }}>
                      {formValues.reasonText || '请填写具体理由'}
                    </div>
                  </div>
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
