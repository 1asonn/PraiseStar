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
  Avatar,
  Radio
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

// 状态颜色映射
const getStatusColor = (status) => {
  switch (status) {
    case 'processing':
      return '#1890ff'
    case 'shipping':
      return '#52c41a'
    case 'completed':
      return '#722ed1'
    case 'cancelled':
      return '#ff4d4f'
    default:
      return '#d9d9d9'
  }
}

// 状态文本映射
const getStatusText = (status) => {
  switch (status) {
    case 'processing':
      return '待处理'
    case 'shipping':
      return '配送中'
    case 'completed':
      return '已完成'
    case 'cancelled':
      return '已取消'
    default:
      return '未知状态'
  }
}

const AdminGifts = () => {
  // 状态管理
  const [gifts, setGifts] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [redemptionsLoading, setRedemptionsLoading] = useState(false)
  const [redemptionPagination, setRedemptionPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingGift, setEditingGift] = useState(null)
  const [redemptionDetailVisible, setRedemptionDetailVisible] = useState(false)
  const [selectedRedemption, setSelectedRedemption] = useState(null)
  const [processingModalVisible, setProcessingModalVisible] = useState(false)
  const [processingForm] = Form.useForm()
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [statistics, setStatistics] = useState({
    overview: {
      totalGifts: 0,
      activeGifts: 0,
      lowStockGifts: 0,
      totalRedemptions: 0,
      currentMonthRedemptions: 0
    },
    details: {
      lowStockDetails: [],
      recentRedemptions: [],
      redemptionStatusStats: []
    }
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
        
        // 更新统计数据（保留从API获取的统计数据，这里只更新基础数据）
        const totalGifts = giftsData.length || 0
        const activeGifts = giftsData.filter(g => g.is_active === 1)?.length || 0
        const lowStockGifts = giftsData.filter(g => g.stock <= 5)?.length || 0
        setStatistics(prev => ({
          ...prev,
          overview: {
            ...prev.overview,
            totalGifts,
            activeGifts,
            lowStockGifts
          }
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
  const fetchRedemptions = async (page = 1, pageSize = 10) => {
    setRedemptionsLoading(true)
    try {
      const response = await giftsService.getAllRedemptions({ page, limit: pageSize })
      if (response.success) {
        // 适配新的API返回结构
        const redemptionsData = response.data || []
        setRedemptions(redemptionsData)
        
        // 更新分页信息
        if (response.pagination) {
          setRedemptionPagination({
            current: response.pagination.current || 1,
            pageSize: response.pagination.limit || 10,
            total: response.pagination.total || 0
          })
        }
        
        setStatistics(prev => ({
          ...prev,
          overview: {
            ...prev.overview,
            totalRedemptions: response.pagination?.total || redemptionsData.length || 0
          }
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
    fetchRedemptions(1, 10)
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

  // 查看兑换记录详情
  const handleViewRedemptionDetail = (redemption) => {
    setSelectedRedemption(redemption)
    setRedemptionDetailVisible(true)
  }

  // 处理兑换记录
  const handleProcessRedemption = (redemption) => {
    setSelectedRedemption(redemption)
    processingForm.setFieldsValue({
      status: redemption.status,
      adminNote: redemption.admin_note || ''
    })
    setProcessingModalVisible(true)
  }

  // 更新兑换记录状态
  const handleUpdateRedemptionStatus = async (redemptionId, newStatus) => {
    try {
      const response = await giftsService.updateRedemptionStatus(redemptionId, {
        status: newStatus
      })
      if (response.success) {
        message.success('状态更新成功')
        // 重新获取当前页的兑换记录
        fetchRedemptions(redemptionPagination.current, redemptionPagination.pageSize)
      } else {
        message.error(response.message || '状态更新失败')
      }
    } catch (error) {
      console.error('更新兑换状态失败:', error)
      message.error('状态更新失败')
    }
  }

  // 处理兑换记录表单提交
  const handleProcessSubmit = async (values) => {
    try {
      const response = await giftsService.updateRedemptionStatus(selectedRedemption.id, {
        status: values.status,
        adminNote: values.adminNote
      })
      if (response.success) {
        message.success('处理成功')
        setProcessingModalVisible(false)
        processingForm.resetFields()
        setSelectedRedemption(null)
        // 重新获取当前页的兑换记录
        fetchRedemptions(redemptionPagination.current, redemptionPagination.pageSize)
      } else {
        message.error(response.message || '处理失败')
      }
    } catch (error) {
      console.error('处理兑换记录失败:', error)
      message.error('处理失败')
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
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '员工姓名',
      dataIndex: ['user', 'name'],
      key: 'userName',
      width: 100,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.user?.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.user?.department}</div>
        </div>
      )
    },
    {
      title: '礼品名称',
      dataIndex: ['gift', 'name'],
      key: 'giftName',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.gift?.image && (
            <Image
              width={30}
              height={30}
              src={record.gift.image}
              alt={record.gift.name}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="/images/gift-placeholder.jpg"
            />
          )}
          <span>{record.gift?.name}</span>
        </div>
      )
    },
    {
      title: '消耗星数',
      dataIndex: 'stars_cost',
      key: 'starsCost',
      width: 100,
      align: 'center',
      render: (starsCost) => (
        <Tag color="red">-{starsCost} ⭐</Tag>
      )
    },
    {
      title: '领取方式',
      dataIndex: 'delivery_method',
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
          {record.delivery_method === 'mail' ? (
            <>
              <div style={{ fontSize: 12 }}>{record.recipient_name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{record.recipient_phone}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{record.address}</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: '#666' }}>
              收件人：{record.recipient_name}
            </div>
          )}
        </div>
      )
    },
    {
      title: '管理员备注',
      dataIndex: 'admin_note',
      key: 'adminNote',
      width: 150,
      render: (note, record) => (
        <div>
          {note ? (
            <div style={{ fontSize: 12, color: '#666' }}>{note}</div>
          ) : (
            <span style={{ color: '#999', fontSize: 12 }}>无备注</span>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewRedemptionDetail(record)}
            size="small"
            title="查看详情"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleProcessRedemption(record)}
            size="small"
            title="处理"
          />
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
              title="礼品总数"
              value={statistics.overview?.totalGifts || 0}
              prefix={<GiftOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="上架礼品"
              value={statistics.overview?.activeGifts || 0}
              prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="库存不足"
              value={statistics.overview?.lowStockGifts || 0}
              prefix={<GiftOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="card-shadow">
            <Statistic
              title="总兑换次数"
              value={statistics.overview?.totalRedemptions || 0}
              prefix={<ShoppingCartOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 本月兑换统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card className="card-shadow">
            <Statistic
              title="本月兑换次数"
              value={statistics.overview?.currentMonthRedemptions || 0}
              prefix={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="card-shadow">
            <Statistic
              title="兑换状态分布"
              value={statistics.details?.redemptionStatusStats?.length || 0}
              prefix={<GiftOutlined style={{ color: '#13c2c2' }} />}
              suffix="种状态"
              valueStyle={{ color: '#13c2c2' }}
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

        <TabPane tab="统计详情" key="statistics">
          <Row gutter={[16, 16]}>
            {/* 最近兑换记录 */}
            <Col xs={24} lg={12}>
              <Card 
                title="最近兑换记录" 
                className="card-shadow"
                extra={
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchStatistics}
                    size="small"
                  >
                    刷新
                  </Button>
                }
              >
                {statistics.details?.recentRedemptions?.length > 0 ? (
                  <List
                    size="small"
                    dataSource={statistics.details.recentRedemptions}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              style={{ backgroundColor: '#1890ff' }}
                              icon={<GiftOutlined />}
                            />
                          }
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{item.gift?.name}</span>
                              <Tag color="red">-{item.stars_cost} ⭐</Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                {item.user?.name} ({item.user?.department})
                              </div>
                              <div style={{ fontSize: 11, color: '#999' }}>
                                {new Date(item.created_at).toLocaleString('zh-CN')}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    暂无最近兑换记录
                  </div>
                )}
              </Card>
            </Col>

            {/* 兑换状态分布 */}
            <Col xs={24} lg={12}>
              <Card 
                title="兑换状态分布" 
                className="card-shadow"
              >
                {statistics.details?.redemptionStatusStats?.length > 0 ? (
                  <div>
                    {statistics.details.redemptionStatusStats.map((status, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: index < statistics.details.redemptionStatusStats.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div 
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(status.status),
                              marginRight: 8
                            }}
                          />
                          <span>{getStatusText(status.status)}</span>
                        </div>
                        <Tag color={getStatusColor(status.status)}>
                          {status.count} 条
                        </Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    暂无状态数据
                  </div>
                )}
              </Card>
            </Col>

            {/* 库存预警 */}
            <Col xs={24}>
              <Card 
                title="库存预警" 
                className="card-shadow"
              >
                {statistics.details?.lowStockDetails?.length > 0 ? (
                  <List
                    size="small"
                    dataSource={statistics.details.lowStockDetails}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              style={{ backgroundColor: '#fa8c16' }}
                              icon={<GiftOutlined />}
                            />
                          }
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{item.name}</span>
                              <Tag color="orange">库存: {item.stock}</Tag>
                            </div>
                          }
                          description={
                            <div style={{ fontSize: 12, color: '#666' }}>
                              当前库存不足，建议及时补充
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    暂无库存预警
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="兑换记录" key="redemptions">
          <Card
            title="兑换记录"
            className="card-shadow"
            extra={
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchRedemptions(redemptionPagination.current, redemptionPagination.pageSize)}
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
                  current: redemptionPagination.current,
                  pageSize: redemptionPagination.pageSize,
                  total: redemptionPagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                  onChange: (page, pageSize) => {
                    fetchRedemptions(page, pageSize)
                  },
                  onShowSizeChange: (current, size) => {
                    fetchRedemptions(1, size)
                  }
                }}
                size="small"
                scroll={{ x: 1200 }}
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

       {/* 兑换记录详情弹窗 */}
       <Modal
         title="兑换记录详情"
         open={redemptionDetailVisible}
         onCancel={() => {
           setRedemptionDetailVisible(false)
           setSelectedRedemption(null)
         }}
         footer={[
           <Button key="close" onClick={() => setRedemptionDetailVisible(false)}>
             关闭
           </Button>
         ]}
         width={600}
       >
         {selectedRedemption && (
           <div>
             <Row gutter={[16, 16]}>
               <Col span={12}>
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontWeight: 'bold', marginBottom: 4 }}>兑换时间</div>
                   <div>{dayjs(selectedRedemption.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
                 </div>
               </Col>
               <Col span={12}>
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontWeight: 'bold', marginBottom: 4 }}>状态</div>
                   <Tag color={getStatusColor(selectedRedemption.status)}>
                     {getStatusText(selectedRedemption.status)}
                   </Tag>
                 </div>
               </Col>
             </Row>

             <Row gutter={[16, 16]}>
               <Col span={12}>
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontWeight: 'bold', marginBottom: 4 }}>员工姓名</div>
                   <div>{selectedRedemption.user?.name}</div>
                 </div>
               </Col>
               <Col span={12}>
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontWeight: 'bold', marginBottom: 4 }}>部门</div>
                   <div>{selectedRedemption.user?.department}</div>
                 </div>
               </Col>
             </Row>

             <Row gutter={[16, 16]}>
               <Col span={12}>
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontWeight: 'bold', marginBottom: 4 }}>礼品名称</div>
                   <div>{selectedRedemption.gift?.name}</div>
                 </div>
               </Col>
               <Col span={12}>
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontWeight: 'bold', marginBottom: 4 }}>消耗星数</div>
                   <div><Tag color="red">-{selectedRedemption.stars_cost} ⭐</Tag></div>
                 </div>
               </Col>
             </Row>

             <Row gutter={[16, 16]}>
               <Col span={12}>
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontWeight: 'bold', marginBottom: 4 }}>领取方式</div>
                   <Tag color={selectedRedemption.delivery_method === 'pickup' ? 'green' : 'blue'}>
                     {selectedRedemption.delivery_method === 'pickup' ? '现场领取' : '邮寄'}
                   </Tag>
                 </div>
               </Col>
               <Col span={12}>
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontWeight: 'bold', marginBottom: 4 }}>收件人</div>
                   <div>{selectedRedemption.recipient_name}</div>
                 </div>
               </Col>
             </Row>

             {selectedRedemption.delivery_method === 'mail' && (
               <>
                 <Row gutter={[16, 16]}>
                   <Col span={12}>
                     <div style={{ marginBottom: 16 }}>
                       <div style={{ fontWeight: 'bold', marginBottom: 4 }}>联系电话</div>
                       <div>{selectedRedemption.recipient_phone}</div>
                     </div>
                   </Col>
                   <Col span={12}>
                     <div style={{ marginBottom: 16 }}>
                       <div style={{ fontWeight: 'bold', marginBottom: 4 }}>收件地址</div>
                       <div>{selectedRedemption.address}</div>
                     </div>
                   </Col>
                 </Row>
               </>
             )}

             <div style={{ marginBottom: 16 }}>
               <div style={{ fontWeight: 'bold', marginBottom: 4 }}>管理员备注</div>
               <div style={{ 
                 padding: 12, 
                 background: '#f5f5f5', 
                 borderRadius: 4,
                 minHeight: 60
               }}>
                 {selectedRedemption.admin_note || '暂无备注'}
               </div>
             </div>
           </div>
         )}
       </Modal>

       {/* 处理兑换记录弹窗 */}
       <Modal
         title="处理兑换记录"
         open={processingModalVisible}
         onCancel={() => {
           setProcessingModalVisible(false)
           processingForm.resetFields()
           setSelectedRedemption(null)
         }}
         footer={null}
         width={500}
       >
         <Form
           form={processingForm}
           layout="vertical"
           onFinish={handleProcessSubmit}
         >
           <Form.Item
             label="状态"
             name="status"
             rules={[{ required: true, message: '请选择状态' }]}
           >
             <Radio.Group>
               <Radio value="processing">待处理</Radio>
               <Radio value="shipping">配送中</Radio>
               <Radio value="completed">已完成</Radio>
               <Radio value="cancelled">已取消</Radio>
             </Radio.Group>
           </Form.Item>

           <Form.Item
             label="管理员备注"
             name="adminNote"
             rules={[{ max: 500, message: '备注不能超过500个字符' }]}
           >
             <TextArea
               rows={4}
               placeholder="请输入处理备注..."
               maxLength={500}
               showCount
             />
           </Form.Item>

           <Form.Item>
             <Space>
               <Button onClick={() => setProcessingModalVisible(false)}>
                 取消
               </Button>
               <Button type="primary" htmlType="submit">
                 确认处理
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
