import React, { useState, useEffect } from 'react'
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
  Tabs,
  Spin,
  Alert,
  List,
  Avatar
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  GiftOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons'
// 移除mockData导入，使用真实API
import { giftsService } from '../../services/giftsService'
import dayjs from 'dayjs'

const { TextArea } = Input
const { TabPane } = Tabs

const AdminGifts = () => {
  // 状态管理
  const [gifts, setGifts] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [redemptionsLoading, setRedemptionsLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingGift, setEditingGift] = useState(null)
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [statistics, setStatistics] = useState({
    totalGifts: 0,
    activeGifts: 0,
    lowStockGifts: 0,
    totalRedemptions: 0
  })

  // 获取礼品列表
  const fetchGifts = async () => {
    setLoading(true)
    try {
      const response = await giftsService.getGiftList()
      if (response.success) {
        // 适配API返回的数据结构
        const giftsData = response.data || []
        setGifts(giftsData)
        
        // 更新统计数据
        const totalGifts = giftsData.length || 0
        const activeGifts = giftsData.filter(g => g.is_active === 1)?.length || 0
        const lowStockGifts = giftsData.filter(g => g.stock <= 5)?.length || 0
        setStatistics(prev => ({
          ...prev,
          totalGifts,
          activeGifts,
          lowStockGifts
        }))
      } else {
        message.error(response.message || '获取礼品列表失败')
      }
    } catch (error) {
      console.error('获取礼品列表失败:', error)
      message.error('获取礼品列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取兑换记录
  const fetchRedemptions = async () => {
    setRedemptionsLoading(true)
    try {
      const response = await giftsService.getAllRedemptions()
      if (response.success) {
        setRedemptions(response.data.redemptions || [])
        setStatistics(prev => ({
          ...prev,
          totalRedemptions: response.data.redemptions?.length || 0
        }))
      } else {
        message.error(response.message || '获取兑换记录失败')
      }
    } catch (error) {
      console.error('获取兑换记录失败:', error)
      message.error('获取兑换记录失败')
    } finally {
      setRedemptionsLoading(false)
    }
  }

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await giftsService.getGiftStatistics()
      if (response.success) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
    }
  }

  // 初始化数据
  useEffect(() => {
    fetchGifts()
    fetchRedemptions()
    fetchStatistics()
  }, [])

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 添加/编辑礼品
  const handleAddEdit = (gift = null) => {
    setEditingGift(gift)
    setModalVisible(true)
    if (gift) {
      form.setFieldsValue({
        name: gift.name,
        description: gift.description,
        starsCost: gift.stars_cost,
        stock: gift.stock,
        sortOrder: gift.sort_order
      })
      setImageUrl(gift.image)
    } else {
      form.resetFields()
      setImageUrl('')
    }
  }

  // 删除礼品
  const handleDelete = async (giftId) => {
    try {
      const response = await giftsService.deleteGift(giftId)
      if (response.success) {
        message.success('删除成功')
        fetchGifts() // 重新获取列表
      } else {
        message.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除礼品失败:', error)
      message.error('删除失败')
    }
  }

  // 切换礼品状态
  const handleToggleStatus = async (giftId, currentStatus) => {
    try {
      const response = await giftsService.updateGift(giftId, {
        is_active: currentStatus === 1 ? 0 : 1
      })
      if (response.success) {
        message.success('状态更新成功')
        fetchGifts() // 重新获取列表
      } else {
        message.error(response.message || '状态更新失败')
      }
    } catch (error) {
      console.error('更新礼品状态失败:', error)
      message.error('状态更新失败')
    }
  }

  // 保存礼品
  const handleSave = async (values) => {
    try {
      const giftData = {
        name: values.name,
        description: values.description,
        stars_cost: values.starsCost,
        stock: values.stock,
        sort_order: values.sortOrder || 0,
        image: imageUrl || '/images/gift-placeholder.jpg'
      }

      let response
      if (editingGift) {
        // 编辑
        response = await giftsService.updateGift(editingGift.id, giftData)
      } else {
        // 新增
        response = await giftsService.addGift(giftData)
      }

      if (response.success) {
        message.success(editingGift ? '编辑成功' : '添加成功')
        setModalVisible(false)
        form.resetFields()
        setEditingGift(null)
        setImageUrl('')
        fetchGifts() // 重新获取列表
      } else {
        message.error(response.message || '操作失败')
      }
    } catch (error) {
      console.error('保存礼品失败:', error)
      message.error('操作失败')
    }
  }

  // 图片上传
  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true)
      return
    }
    
    if (info.file.status === 'done') {
      setUploading(false)
      try {
        const response = await giftsService.uploadGiftImage(info.file.originFileObj)
        if (response.success) {
          setImageUrl(response.data.url)
          message.success('图片上传成功')
        } else {
          message.error(response.message || '图片上传失败')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        message.error('图片上传失败')
      }
    } else if (info.file.status === 'error') {
      setUploading(false)
      message.error('图片上传失败')
    }
  }

  // 导出兑换明细
  const handleExportRedemptions = async () => {
    try {
      const response = await giftsService.exportGiftData({
        type: 'redemptions'
      })
      if (response.success) {
        // 创建下载链接
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = `兑换明细_${dayjs().format('YYYY-MM-DD')}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        message.success('兑换明细导出成功')
      } else {
        message.error(response.message || '导出失败')
      }
    } catch (error) {
      console.error('导出兑换明细失败:', error)
      message.error('导出失败')
    }
  }

  // 更新兑换记录状态
  const handleUpdateRedemptionStatus = async (redemptionId, newStatus) => {
    try {
      const response = await giftsService.updateRedemptionStatus(redemptionId, {
        status: newStatus
      })
      if (response.success) {
        message.success('状态更新成功')
        fetchRedemptions() // 重新获取兑换记录
      } else {
        message.error(response.message || '状态更新失败')
      }
    } catch (error) {
      console.error('更新兑换状态失败:', error)
      message.error('状态更新失败')
    }
  }

  // 移动端礼品卡片组件
  const GiftCard = ({ gift }) => (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Image
          width={60}
          height={60}
          src={gift.image}
          alt={gift.name}
          style={{ objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          fallback="/images/gift-placeholder.jpg"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: 16, 
            marginBottom: 4,
            color: '#262626'
          }}>
            {gift.name}
          </div>
          <div style={{ 
            fontSize: 12, 
            color: '#666', 
            marginBottom: 8,
            lineHeight: 1.4
          }}>
            {gift.description}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="small">
              <Tag color="orange">{gift.stars_cost} ⭐</Tag>
              <span style={{ 
                color: gift.stock <= 5 ? '#ff4d4f' : gift.stock <= 10 ? '#fa8c16' : '#52c41a',
                fontWeight: 'bold',
                fontSize: 14
              }}>
                库存: {gift.stock}
              </span>
            </Space>
            <Switch
              checked={gift.is_active === 1}
              onChange={() => handleToggleStatus(gift.id, gift.is_active)}
              size="small"
            />
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleAddEdit(gift)}
              size="small"
              style={{ padding: '4px 8px' }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除这个礼品吗？"
              onConfirm={() => handleDelete(gift.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                style={{ padding: '4px 8px' }}
              >
                删除
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    </Card>
  )

  const giftColumns = [
    {
      title: '礼品图片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      responsive: ['md'],
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
      width: 150,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#666', display: 'none' }} className="mobile-description">
            {record.description}
          </div>
        </div>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      responsive: ['lg']
    },
    {
      title: '兑换星数',
      dataIndex: 'stars_cost',
      key: 'stars_cost',
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
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      align: 'center',
      render: (isActive, record) => (
        <Switch
          checked={isActive === 1}
          onChange={() => handleToggleStatus(record.id, isActive)}
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
      dataIndex: 'createdAt',
      key: 'createdAt',
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
      width: 100,
      render: (status, record) => (
        <Popconfirm
          title="更新状态"
          onConfirm={() => {
            const newStatus = status === '待处理' ? '配送中' : 
                            status === '配送中' ? '已完成' : '待处理'
            handleUpdateRedemptionStatus(record.id, newStatus)
          }}
          okText="确定"
          cancelText="取消"
        >
          <Tag 
            color={status === '已完成' ? 'green' : status === '配送中' ? 'blue' : 'orange'}
            style={{ cursor: 'pointer' }}
          >
            {status}
          </Tag>
        </Popconfirm>
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
              title="礼品总数"
              value={statistics.totalGifts}
              prefix={<GiftOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="上架礼品"
              value={statistics.activeGifts}
              prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="库存不足"
              value={statistics.lowStockGifts}
              prefix={<GiftOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="总兑换次数"
              value={statistics.totalRedemptions}
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
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchGifts}
                  loading={loading}
                >
                  刷新
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddEdit()}
                >
                  添加礼品
                </Button>
              </Space>
            }
          >
            <Spin spinning={loading}>
              {isMobile ? (
                // 移动端卡片视图
                <div>
                  {gifts.map(gift => (
                    <GiftCard key={gift.id} gift={gift} />
                  ))}
                  {gifts.length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      color: '#999'
                    }}>
                      暂无礼品数据
                    </div>
                  )}
                </div>
              ) : (
                // 桌面端表格视图
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
                  scroll={{ x: 800 }}
                />
              )}
            </Spin>
          </Card>
        </TabPane>

        <TabPane tab="兑换记录" key="redemptions">
          <Card
            title="兑换记录"
            className="card-shadow"
            extra={
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchRedemptions}
                  loading={redemptionsLoading}
                >
                  刷新
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportRedemptions}
                >
                  导出明细
                </Button>
              </Space>
            }
          >
            <Spin spinning={redemptionsLoading}>
              <Table
                columns={redemptionColumns}
                dataSource={redemptions}
                rowKey="id"
                pagination={{
                  total: redemptions.length,
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
                size="small"
                scroll={{ x: 800 }}
              />
            </Spin>
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
                label="排序"
                name="sortOrder"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="数字越小越靠前"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
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
                      {uploading ? <Spin /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>
                        {uploading ? '上传中...' : '上传图片'}
                      </div>
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
        
        /* 移动端样式优化 */
        @media (max-width: 768px) {
          :global(.ant-card-body) {
            padding: 12px !important;
          }
          
          :global(.ant-table) {
            font-size: 12px;
          }
          
          :global(.ant-table-thead > tr > th) {
            padding: 8px 4px !important;
          }
          
          :global(.ant-table-tbody > tr > td) {
            padding: 8px 4px !important;
          }
          
          :global(.ant-btn) {
            font-size: 12px;
            padding: 4px 8px;
          }
          
          :global(.ant-tag) {
            font-size: 11px;
          }
          
          :global(.ant-statistic-title) {
            font-size: 12px !important;
          }
          
          :global(.ant-statistic-content) {
            font-size: 18px !important;
          }
        }
        
        /* 移动端描述显示 */
        @media (max-width: 768px) {
          :global(.mobile-description) {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminGifts
