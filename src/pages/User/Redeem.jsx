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
  Image
} from 'antd'
import {
  GiftOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { mockGifts } from '../../data/mockData'

const { TextArea } = Input

const Redeem = () => {
  const [redeemForm] = Form.useForm()
  const [selectedGift, setSelectedGift] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // 过滤可用的礼品
  const availableGifts = mockGifts.filter(gift => gift.isActive && gift.stock > 0)

  const handleRedeem = (gift) => {
    if (gift.starsCost > user.availableToRedeem) {
      message.warning('您的赞赞星余额不足，无法兑换此礼品')
      return
    }
    setSelectedGift(gift)
    setModalVisible(true)
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      message.success('兑换成功！礼品将按您选择的方式进行配送')
      setModalVisible(false)
      redeemForm.resetFields()
      setSelectedGift(null)
    } catch (error) {
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
              prefix={<StarOutlined style={{ color: '#1890ff' }} />}
              suffix="⭐"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-shadow">
            <Statistic
              title="年度已兑换"
              value={user.redeemedThisYear}
              prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
              suffix="⭐"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="card-shadow">
            <Statistic
              title="年度累计获赠"
              value={user.receivedThisYear}
              prefix={<StarOutlined style={{ color: '#fa8c16' }} />}
              suffix="⭐"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 礼品库 */}
      <Card title="礼品库" className="card-shadow">
        {availableGifts.length > 0 ? (
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
                          objectFit: 'cover' 
                        }}
                        fallback="/images/gift-placeholder.jpg"
                        preview={false}
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
                      disabled={gift.starsCost > user.availableToRedeem}
                      size="small"
                    >
                      {gift.starsCost > user.availableToRedeem ? '余额不足' : '立即兑换'}
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
                          height: 32,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {gift.description}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Tag color="orange" style={{ margin: 0 }}>
                            {gift.starsCost} ⭐
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
                style={{ objectFit: 'cover', borderRadius: 8 }}
                fallback="/images/gift-placeholder.jpg"
              />
              <h3 style={{ margin: '12px 0 4px' }}>{selectedGift.name}</h3>
              <Tag color="orange" style={{ fontSize: 14 }}>
                需要 {selectedGift.starsCost} ⭐
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
                  <div>消耗赞赞星：{selectedGift.starsCost} ⭐</div>
                  <div>兑换后余额：{user.availableToRedeem - selectedGift.starsCost} ⭐</div>
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
