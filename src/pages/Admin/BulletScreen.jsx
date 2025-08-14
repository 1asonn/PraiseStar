import React, { useState } from 'react'
import {
  Card,
  Form,
  InputNumber,
  Switch,
  Button,
  TimePicker,
  Select,
  Input,
  Space,
  Divider,
  Alert,
  message,
  Row,
  Col,
  List,
  Avatar,
  Tag
} from 'antd'
import {
  SettingOutlined,
  MessageOutlined,
  StarOutlined,
  TrophyOutlined,
  GiftOutlined,
  SendOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const AdminBulletScreen = () => {
  const [form] = Form.useForm()
  
  // 弹幕设置状态
  const [bulletSettings, setBulletSettings] = useState({
    // 赠送弹幕设置
    giveEnabled: true,
    giveThreshold: 10, // 赠送超过多少星数时弹幕
    giveTemplate: '{sender}因{reason}给{receiver}赠送{stars}赞赞星',
    
    // 排名弹幕设置
    rankingEnabled: true,
    rankingTime: dayjs('09:00', 'HH:mm'), // 每日发送时间
    rankingTemplate: '今日赞赞星排行榜前五：{ranking}',
    
    // 达标弹幕设置
    achievementEnabled: true,
    achievementThreshold: 66, // 累计获得多少星数时弹幕
    achievementTemplate: '{user}今日累计获赠{stars}赞赞星啦~',
    
    // 祝贺弹幕设置
    congratulationEnabled: true,
    congratulationTemplate: '{sender}给{receiver}送来{stars}赞赞星祝贺',
    
    // 飞书群设置
    feishuGroupId: 'oc_xxx', // 飞书群ID
    feishuBotToken: 'bot_xxx' // 飞书机器人token
  })

  // 模拟弹幕记录
  const bulletRecords = [
    {
      id: 1,
      type: 'give',
      content: '张三因工作表现好给李四赠送15赞赞星',
      time: '2024-12-15 10:30:00',
      status: '已发送'
    },
    {
      id: 2,
      type: 'ranking',
      content: '今日赞赞星排行榜前五：耿豪120⭐、超越98⭐、袁倩倩88⭐、王倩95⭐、李四68⭐',
      time: '2024-12-15 09:00:00',
      status: '已发送'
    },
    {
      id: 3,
      type: 'achievement',
      content: '李四今日累计获赠66赞赞星啦~',
      time: '2024-12-15 16:20:00',
      status: '已发送'
    },
    {
      id: 4,
      type: 'congratulation',
      content: '王倩给张三送来8赞赞星祝贺',
      time: '2024-12-15 14:15:00',
      status: '已发送'
    }
  ]

  // 保存设置
  const handleSave = async (values) => {
    try {
      setBulletSettings({ ...bulletSettings, ...values })
      message.success('弹幕设置保存成功')
    } catch (error) {
      message.error('保存失败')
    }
  }

  // 测试弹幕
  const handleTest = (type) => {
    let testContent = ''
    switch (type) {
      case 'give':
        testContent = '张三因工作表现好给李四赠送15赞赞星'
        break
      case 'ranking':
        testContent = '今日赞赞星排行榜前五：耿豪120⭐、超越98⭐、袁倩倩88⭐、王倩95⭐、李四68⭐'
        break
      case 'achievement':
        testContent = '李四今日累计获赠66赞赞星啦~'
        break
      case 'congratulation':
        testContent = '王倩给张三送来8赞赞星祝贺'
        break
    }
    
    message.success(`测试弹幕发送成功：${testContent}`)
  }

  // 获取弹幕类型图标和颜色
  const getBulletTypeInfo = (type) => {
    const typeMap = {
      give: { icon: <SendOutlined />, color: '#52c41a', text: '赠送弹幕' },
      ranking: { icon: <TrophyOutlined />, color: '#1890ff', text: '排名弹幕' },
      achievement: { icon: <StarOutlined />, color: '#fa8c16', text: '达标弹幕' },
      congratulation: { icon: <GiftOutlined />, color: '#eb2f96', text: '祝贺弹幕' }
    }
    return typeMap[type] || { icon: <MessageOutlined />, color: '#666', text: '未知类型' }
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 弹幕设置 */}
        <Col xs={24} lg={16}>
          <Card title="弹幕设置" className="card-shadow">
            <Form
              form={form}
              layout="vertical"
              initialValues={bulletSettings}
              onFinish={handleSave}
            >
              {/* 赠送弹幕设置 */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0 }}>
                    <SendOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    赠送弹幕
                  </h4>
                  <Form.Item name="giveEnabled" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="触发阈值"
                      name="giveThreshold"
                      rules={[{ required: true, message: '请输入触发阈值' }]}
                    >
                      <InputNumber
                        min={1}
                        style={{ width: '100%' }}
                        addonAfter="⭐"
                        placeholder="赠送超过多少星数时触发"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Button size="small" onClick={() => handleTest('give')}>
                        测试发送
                      </Button>
                    </Space>
                  </Col>
                </Row>
                
                <Form.Item
                  label="弹幕模板"
                  name="giveTemplate"
                  rules={[{ required: true, message: '请输入弹幕模板' }]}
                >
                  <Input placeholder="支持变量：{sender} {receiver} {reason} {stars}" />
                </Form.Item>
              </Card>

              {/* 排名弹幕设置 */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0 }}>
                    <TrophyOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    排名弹幕
                  </h4>
                  <Form.Item name="rankingEnabled" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="发送时间"
                      name="rankingTime"
                      rules={[{ required: true, message: '请选择发送时间' }]}
                    >
                      <TimePicker
                        style={{ width: '100%' }}
                        format="HH:mm"
                        placeholder="每日定时发送时间"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Button size="small" onClick={() => handleTest('ranking')}>
                        测试发送
                      </Button>
                    </Space>
                  </Col>
                </Row>
                
                <Form.Item
                  label="弹幕模板"
                  name="rankingTemplate"
                  rules={[{ required: true, message: '请输入弹幕模板' }]}
                >
                  <Input placeholder="支持变量：{ranking}" />
                </Form.Item>
              </Card>

              {/* 达标弹幕设置 */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0 }}>
                    <StarOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                    达标弹幕
                  </h4>
                  <Form.Item name="achievementEnabled" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="达标阈值"
                      name="achievementThreshold"
                      rules={[{ required: true, message: '请输入达标阈值' }]}
                    >
                      <InputNumber
                        min={1}
                        style={{ width: '100%' }}
                        addonAfter="⭐"
                        placeholder="累计获得多少星数时触发"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Button size="small" onClick={() => handleTest('achievement')}>
                        测试发送
                      </Button>
                    </Space>
                  </Col>
                </Row>
                
                <Form.Item
                  label="弹幕模板"
                  name="achievementTemplate"
                  rules={[{ required: true, message: '请输入弹幕模板' }]}
                >
                  <Input placeholder="支持变量：{user} {stars}" />
                </Form.Item>
              </Card>

              {/* 祝贺弹幕设置 */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ margin: 0 }}>
                    <GiftOutlined style={{ color: '#eb2f96', marginRight: 8 }} />
                    祝贺弹幕
                  </h4>
                  <Form.Item name="congratulationEnabled" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
                
                <Row gutter={16}>
                  <Col span={18}>
                    <Form.Item
                      label="弹幕模板"
                      name="congratulationTemplate"
                      rules={[{ required: true, message: '请输入弹幕模板' }]}
                    >
                      <Input placeholder="支持变量：{sender} {receiver} {stars}" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Space>
                      <Button size="small" onClick={() => handleTest('congratulation')}>
                        测试发送
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>

              <Divider />

              {/* 飞书配置 */}
              <h4>飞书群配置</h4>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="飞书群ID"
                    name="feishuGroupId"
                    rules={[{ required: true, message: '请输入飞书群ID' }]}
                  >
                    <Input placeholder="请输入飞书全员群ID" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="机器人Token"
                    name="feishuBotToken"
                    rules={[{ required: true, message: '请输入机器人Token' }]}
                  >
                    <Input placeholder="请输入飞书机器人Token" />
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

        {/* 弹幕记录 */}
        <Col xs={24} lg={8}>
          <Card title="最近弹幕记录" className="card-shadow">
            <List
              dataSource={bulletRecords}
              renderItem={item => {
                const typeInfo = getBulletTypeInfo(item.type)
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={typeInfo.icon} 
                          style={{ backgroundColor: typeInfo.color }} 
                        />
                      }
                      title={
                        <Space>
                          <Tag color={typeInfo.color} size="small">
                            {typeInfo.text}
                          </Tag>
                          <Tag color="green" size="small">
                            {item.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ fontSize: 12, marginBottom: 4 }}>
                            {item.content}
                          </div>
                          <div style={{ fontSize: 11, color: '#999' }}>
                            {item.time}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Card>

          {/* 设置说明 */}
          <Card title="设置说明" className="card-shadow" style={{ marginTop: 16 }}>
            <Alert
              message="弹幕功能说明"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 16, fontSize: 12 }}>
                  <li>赠送弹幕：当赠送超过设定数量时自动发送</li>
                  <li>排名弹幕：每日定时发送前五名排行榜</li>
                  <li>达标弹幕：当累计获赞达到阈值时发送</li>
                  <li>祝贺弹幕：选择祝贺理由赠送时发送</li>
                  <li>所有弹幕都会发送到指定的飞书群中</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminBulletScreen
