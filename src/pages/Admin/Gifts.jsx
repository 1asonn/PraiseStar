import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Switch,
  Space,
  Popconfirm,
  message,
  Image,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  GiftOutlined,
  ShoppingCartOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { mockGifts, mockRedemptions } from '../../data/mockData'
import dayjs from 'dayjs'

const { TextArea } = Input
const { TabPane } = Tabs

const AdminGifts = () => {
  const [gifts, setGifts] = useState(mockGifts)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingGift, setEditingGift] = useState(null)
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState('')

  // 添加/编辑礼品
  const handleAddEdit = (gift = null) => {
    setEditingGift(gift)
    setModalVisible(true)
    if (gift) {
      form.setFieldsValue(gift)
      setImageUrl(gift.image)
    } else {
      form.resetFields()
      setImageUrl('')
    }
  }

  // 删除礼品
  const handleDelete = (giftId) => {
    setGifts(gifts.filter(gift => gift.id !== giftId))
    message.success('删除成功')
  }

  // 切换礼品状态
  const handleToggleStatus = (giftId) => {
    setGifts(gifts.map(gift =>
      gift.id === giftId
        ? { ...gift, isActive: !gift.isActive }
        : gift
    ))
    message.success('状态更新成功')
  }

  // 保存礼品
  const handleSave = async (values) => {
    try {
      if (editingGift) {
        // 编辑
        setGifts(gifts.map(gift =>
          gift.id === editingGift.id
            ? { ...gift, ...values, image: imageUrl }
            : gift
        ))
        message.success('编辑成功')
      } else {
        // 新增
        const newGift = {
          ...values,
          id: Date.now(),
          image: imageUrl || '/images/gift-placeholder.jpg',
          isActive: true
        }
        setGifts([...gifts, newGift])
        message.success('添加成功')
      }
      setModalVisible(false)
      form.resetFields()
      setEditingGift(null)
      setImageUrl('')
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 图片上传
  const handleImageUpload = (info) => {
    if (info.file.status === 'done') {
      // 这里应该是真实的图片URL
      setImageUrl(info.file.response?.url || '/images/gift-placeholder.jpg')
      message.success('图片上传成功')
    } else if (info.file.status === 'error') {
      message.error('图片上传失败')
    }
  }

  // 导出兑换明细
  const handleExportRedemptions = () => {
    const data = mockRedemptions.map(item => ({
      员工姓名: item.userName,
      兑换品类: item.giftName,
      兑换赞赞星值: item.starsCost,
      领取方式: item.deliveryMethod === 'pickup' ? '现场领取' : '邮寄',
      收件地址: item.address || '-',
      收件人姓名: item.recipientName || '-',
      收件人手机号: item.recipientPhone || '-',
      兑换时间: item.createTime,
      状态: item.status
    }))
    
    console.log('导出兑换明细:', data)
    message.success('兑换明细导出成功')
  }

  const giftColumns = [
    {
      title: '礼品图片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image, record) => (
        <Image
          width={50}
          height={50}
          src={image}
          alt={record.name}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="/images/gift-placeholder.jpg"
        />
      )
    },
    {
      title: '礼品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true
    },
    {
      title: '兑换星数',
      dataIndex: 'starsCost',
      key: 'starsCost',
      width: 100,
      align: 'center',
      render: (starsCost) => (
        <Tag color="orange">{starsCost} ⭐</Tag>
      )
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'center',
      render: (stock) => (
        <span style={{ 
          color: stock <= 5 ? '#ff4d4f' : stock <= 10 ? '#fa8c16' : '#52c41a',
          fontWeight: 'bold'
        }}>
          {stock}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      align: 'center',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id)}
          size="small"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleAddEdit(record)}
            size="small"
          />
          <Popconfirm
            title="确定删除这个礼品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  const redemptionColumns = [
    {
      title: '兑换时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '员工姓名',
      dataIndex: 'userName',
      key: 'userName',
      width: 100
    },
    {
      title: '礼品名称',
      dataIndex: 'giftName',
      key: 'giftName',
      width: 150
    },
    {
      title: '消耗星数',
      dataIndex: 'starsCost',
      key: 'starsCost',
      width: 100,
      align: 'center',
      render: (starsCost) => (
        <Tag color="red">-{starsCost} ⭐</Tag>
      )
    },
    {
      title: '领取方式',
      dataIndex: 'deliveryMethod',
      key: 'deliveryMethod',
      width: 100,
      render: (method) => (
        <Tag color={method === 'pickup' ? 'green' : 'blue'}>
          {method === 'pickup' ? '现场领取' : '邮寄'}
        </Tag>
      )
    },
    {
      title: '联系信息',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          {record.deliveryMethod === 'mail' ? (
            <>
              <div style={{ fontSize: 12 }}>{record.recipientName}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{record.recipientPhone}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{record.address}</div>
            </>
          ) : (
            <span style={{ color: '#999' }}>-</span>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === '已完成' ? 'green' : status === '配送中' ? 'blue' : 'orange'}>
          {status}
        </Tag>
      )
    }
  ]

  // 统计数据
  const totalGifts = gifts.length
  const activeGifts = gifts.filter(g => g.isActive).length
  const lowStockGifts = gifts.filter(g => g.stock <= 5).length
  const totalRedemptions = mockRedemptions.length

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="礼品总数"
              value={totalGifts}
              prefix={<GiftOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="上架礼品"
              value={activeGifts}
              prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="库存不足"
              value={lowStockGifts}
              prefix={<GiftOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="总兑换次数"
              value={totalRedemptions}
              prefix={<ShoppingCartOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="gifts">
        <TabPane tab="礼品管理" key="gifts">
          <Card
            title="礼品库管理"
            className="card-shadow"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleAddEdit()}
              >
                添加礼品
              </Button>
            }
          >
            <Table
              columns={giftColumns}
              dataSource={gifts}
              rowKey="id"
              pagination={{
                total: gifts.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 件礼品`
              }}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane tab="兑换记录" key="redemptions">
          <Card
            title="兑换记录"
            className="card-shadow"
            extra={
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportRedemptions}
              >
                导出明细
              </Button>
            }
          >
            <Table
              columns={redemptionColumns}
              dataSource={mockRedemptions}
              rowKey="id"
              pagination={{
                total: mockRedemptions.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 添加/编辑礼品弹窗 */}
      <Modal
        title={editingGift ? '编辑礼品' : '添加礼品'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingGift(null)
          setImageUrl('')
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
                label="礼品名称"
                name="name"
                rules={[{ required: true, message: '请输入礼品名称' }]}
              >
                <Input placeholder="请输入礼品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="兑换星数"
                name="starsCost"
                rules={[{ required: true, message: '请输入兑换星数' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  addonAfter="⭐"
                  placeholder="请输入兑换所需星数"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="库存数量"
                name="stock"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="请输入库存数量"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="礼品图片"
                name="image"
              >
                <Upload
                  listType="picture-card"
                  className="gift-uploader"
                  showUploadList={false}
                  onChange={handleImageUpload}
                  beforeUpload={() => false} // 阻止自动上传
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="礼品图片"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="礼品描述"
            name="description"
            rules={[{ required: true, message: '请输入礼品描述' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入礼品描述..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingGift ? '保存' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        :global(.gift-uploader .ant-upload) {
          width: 100px !important;
          height: 100px !important;
        }
      `}</style>
    </div>
  )
}

export default AdminGifts
