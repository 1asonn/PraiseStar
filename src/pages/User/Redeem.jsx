import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Tag,
  Modal,
  Form,
  Radio,
  Input,
  message,
  Statistic,
  Empty,
  Image,
  Spin
} from 'antd'
import {
  GiftOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  ReloadOutlined,
  WalletOutlined,
  TrophyOutlined,
  RiseOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { giftsService } from '../../services/giftsService'
import { userService } from '../../services/userService'

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

const { TextArea } = Input

const Redeem = () => {
  const [redeemForm] = Form.useForm()
  const [selectedGift, setSelectedGift] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [giftsLoading, setGiftsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [availableGifts, setAvailableGifts] = useState([])
  const { user, refreshUser } = useAuth()

  // 获取可兑换礼品
  const fetchAvailableGifts = async () => {
    setGiftsLoading(true)
    try {
      const response = await giftsService.getAvailableGifts()
      if (response.success) {
        setAvailableGifts(response.data || [])
      } else {
        message.error(response.message || '获取礼品列表失败')
      }
    } catch (error) {
      console.error('获取礼品列表失败:', error)
      message.error('获取礼品列表失败')
    } finally {
      setGiftsLoading(false)
    }
  }

  // 初始化加载礼品
  React.useEffect(() => {
    fetchAvailableGifts()
  }, [])

  const handleRedeem = (gift) => {
    if (gift.stars_cost > user.availableToRedeem) {
      message.warning('您的赞赞星余额不足，无法兑换此礼品')
      return
    }
    setSelectedGift(gift)
    setModalVisible(true)
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const deliveryInfo = {
        deliveryMethod: values.deliveryMethod,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        address: values.address
      }
      
      const response = await giftsService.redeemGift(selectedGift.id, deliveryInfo)
      
      if (response.success) {
        message.success('兑换成功！礼品将按您选择的方式进行配送')
        setModalVisible(false)
        redeemForm.resetFields()
        setSelectedGift(null)
        
        // 刷新所有相关数据
        setRefreshing(true)
        try {
          // 并行刷新用户信息和礼品列表，提高响应速度
          await Promise.all([
            refreshUser(), // 刷新用户信息（包括余额和统计数据）
            fetchAvailableGifts() // 重新获取礼品列表，更新库存
          ])
        } catch (error) {
          console.error('刷新数据失败:', error)
          // 即使刷新失败，也不影响兑换成功的提示
          // 可以给用户一个提示，建议手动刷新
          message.info('兑换成功，但数据刷新失败，建议手动刷新页面')
        } finally {
          setRefreshing(false)
        }
      } else {
        message.error(response.message || '兑换失败，请稍后重试')
      }
    } catch (error) {
      console.error('兑换失败:', error)
      message.error('兑换失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setModalVisible(false)
    redeemForm.resetFields()
    setSelectedGift(null)
  }

  return (
    <div>
      {/* 个人兑换余额 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="card-shadow">
            <Statistic
              title="可兑换余额"
              value={user.availableToRedeem}
              prefix={<WalletOutlined style={{ color: '#1890ff' }} />}
              suffix={<StarIcon color="#1890ff" />}
              valueStyle={{ color: '#1890ff' }}
              loading={refreshing}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-shadow">
            <Statistic
              title="年度已兑换"
              value={user.redeemedThisYear}
              prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
              suffix={<StarIcon color="#52c41a" />}
              valueStyle={{ color: '#52c41a' }}
              loading={refreshing}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-shadow">
            <Statistic
              title="年度累计获赠"
              value={user.receivedThisYear}
              prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
              suffix={<StarIcon color="#fa8c16" />}
              valueStyle={{ color: '#fa8c16' }}
              loading={refreshing}
            />
          </Card>
        </Col>
      </Row>

      {/* 礼品库 */}
      <Card 
        title="礼品库" 
        className="card-shadow"
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchAvailableGifts}
            loading={giftsLoading}
            size="small"
          >
            刷新
          </Button>
        }
      >
        {giftsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>加载中...</div>
          </div>
        ) : (refreshing || giftsLoading) ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>
              {refreshing ? '正在更新数据...' : '加载中...'}
            </div>
          </div>
        ) : availableGifts.length > 0 ? (
          <Row gutter={[16, 16]}>
            {availableGifts.map(gift => (
              <Col xs={24} sm={12} md={8} lg={6} key={gift.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                      <Image
                        alt={gift.name}
                        src={gift.image}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        preview={{
                          mask: '点击预览',
                          maskClassName: 'gift-preview-mask'
                        }}
                      />
                      {gift.stock <= 5 && (
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(255, 77, 79, 0.9)',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12
                        }}>
                          仅剩{gift.stock}件
                        </div>
                      )}
                    </div>
                  }
                  actions={[
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleRedeem(gift)}
                      disabled={gift.stars_cost > user.availableToRedeem}
                      size="small"
                    >
                      {gift.stars_cost > user.availableToRedeem ? '余额不足' : '立即兑换'}
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ fontSize: 14, height: 40, overflow: 'hidden' }}>
                        {gift.name}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#666', 
                          marginBottom: 8,

                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {gift.description}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Tag color="orange" style={{ margin: 0 }}>
                            {gift.stars_cost} <StarIcon color="#fa8c16" size="12px" />
                          </Tag>
                          <span style={{ fontSize: 12, color: '#999' }}>
                            库存 {gift.stock}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="暂无可兑换的礼品"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* 兑换确认弹窗 */}
      <Modal
        title="确认兑换"
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        {selectedGift && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Image
                src={selectedGift.image}
                alt={selectedGift.name}
                width={120}
                height={120}
                style={{ 
                  objectFit: 'cover', 
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
                fallback="/images/gift-placeholder.jpg"
                preview={{
                  mask: '点击预览',
                  maskClassName: 'gift-preview-mask'
                }}
              />
              <h3 style={{ margin: '12px 0 4px' }}>{selectedGift.name}</h3>
              <Tag color="orange" style={{ fontSize: 14 }}>
                需要 {selectedGift.stars_cost} <StarIcon color="#fa8c16" size="14px" />
              </Tag>
            </div>

            <Form
              form={redeemForm}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                deliveryMethod: 'pickup'
              }}
            >
              <Form.Item
                label="领取方式"
                name="deliveryMethod"
                rules={[{ required: true, message: '请选择领取方式' }]}
              >
                <Radio.Group>
                  <Radio value="pickup">现场领取</Radio>
                  <Radio value="mail">邮寄</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                  prevValues.deliveryMethod !== currentValues.deliveryMethod
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue('deliveryMethod') === 'mail' ? (
                    <>
                      <Form.Item
                        label="收件人姓名"
                        name="recipientName"
                        rules={[{ required: true, message: '请输入收件人姓名' }]}
                      >
                        <Input
                          placeholder="请输入收件人姓名"
                          prefix={<UserOutlined />}
                        />
                      </Form.Item>

                      <Form.Item
                        label="收件人手机号"
                        name="recipientPhone"
                        rules={[
                          { required: true, message: '请输入收件人手机号' },
                          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                        ]}
                      >
                        <Input
                          placeholder="请输入收件人手机号"
                          prefix={<PhoneOutlined />}
                          maxLength={11}
                        />
                      </Form.Item>

                      <Form.Item
                        label="收件地址"
                        name="address"
                        rules={[{ required: true, message: '请输入收件地址' }]}
                      >
                        <TextArea
                          placeholder="请输入详细的收件地址"
                          rows={3}
                          maxLength={200}
                          showCount
                        />
                      </Form.Item>

                      <div style={{ 
                        background: '#fff7e6', 
                        border: '1px solid #ffd591', 
                        borderRadius: 6, 
                        padding: 12, 
                        marginBottom: 16,
                        fontSize: 12,
                        color: '#d46b08'
                      }}>
                        💡 提示：选择邮寄方式需要您自行承担邮费
                      </div>
                    </>
                  ) : null
                }
              </Form.Item>

              <div style={{ 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f', 
                borderRadius: 6, 
                padding: 16, 
                marginBottom: 16 
              }}>
                <h4 style={{ margin: '0 0 8px', color: '#389e0d' }}>兑换确认</h4>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <div>礼品名称：{selectedGift.name}</div>
                  <div>消耗赞赞星：{selectedGift.stars_cost} <StarIcon color="#fa8c16" size="12px" /></div>
                  <div>兑换后余额：{user.availableToRedeem - selectedGift.stars_cost} <StarIcon color="#1890ff" size="12px" /></div>
                </div>
              </div>

              <Form.Item>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button onClick={handleCancel} style={{ flex: 1 }}>
                    取消
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{ flex: 1 }}
                  >
                    确认兑换
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Redeem
