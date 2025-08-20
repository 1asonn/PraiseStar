import React, { useState, useEffect, useRef } from 'react'
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
  Statistic,
  List,
  Avatar,
  Divider,
  Spin
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  UserOutlined,
  StarOutlined,
  KeyOutlined
} from '@ant-design/icons'
// import { mockUsers } from '../../data/mockData'
import { userApi } from '../../services/api'

const { Option } = Select

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [adjustModalVisible, setAdjustModalVisible] = useState(false)
  const [adjustingUser, setAdjustingUser] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [displayedUsers, setDisplayedUsers] = useState([])
  const [form] = Form.useForm()
  const [adjustForm] = Form.useForm()
  const { getAllUsers,updateUser,addUser } = userApi
  const listRef = useRef(null)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 生成随机密码
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    form.setFieldsValue({ password })
    message.success('已生成随机密码')
  }

  useEffect(() => {
    getAllUsers().then(res => {
      setUsers(res.data)
      // 初始化显示前10条数据
      setDisplayedUsers(res.data.slice(0, 10))
    })
  }, [])

  // 懒加载更多数据
  const loadMore = () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    const nextPage = page + 1
    const pageSize = 10
    const startIndex = (nextPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    // 模拟异步加载
    setTimeout(() => {
      const newUsers = users.slice(startIndex, endIndex)
      if (newUsers.length > 0) {
        setDisplayedUsers(prev => [...prev, ...newUsers])
        setPage(nextPage)
      } else {
        setHasMore(false)
      }
      setLoading(false)
    }, 500)
  }

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile || !listRef.current) return
      
      const { scrollTop, scrollHeight, clientHeight } = listRef.current
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMore()
      }
    }

    const listElement = listRef.current
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll)
      return () => listElement.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile, loading, hasMore, users, page])

  // 添加/编辑用户
  const handleAddEdit = (user = null) => {
    setEditingUser(user)
    setModalVisible(true)
    if (user) {
      // 编辑用户时，不设置密码字段
      const { password, ...userData } = user
      form.setFieldsValue(userData)
    } else {
      // 新增用户时，重置所有字段
      form.resetFields()
    }
  }

  // 删除用户
  const handleDelete = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId)
    setUsers(updatedUsers)
    // 更新显示的列表
    setDisplayedUsers(prev => prev.filter(user => user.id !== userId))
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
        // 编辑用户 - 不包含密码字段
        const { password, ...editData } = values
        const newUser = { ...editingUser, ...editData }
        
        const res = await updateUser(newUser.id, newUser)
        if (res.success) {
          message.success('编辑成功')
          // 刷新用户列表
          const usersRes = await getAllUsers()
          if (usersRes.success) {
            setUsers(usersRes.data)
            // 重置懒加载状态
            setDisplayedUsers(usersRes.data.slice(0, 10))
            setPage(1)
            setHasMore(usersRes.data.length > 10)
          }
        } else {
          message.error(res.message || '编辑失败')
        }
      } else {
        // 新增用户 - 包含密码字段
        const newUser = { ...values }
        
        const res = await addUser(newUser)
        if (res.success) {
          message.success('添加成功')
          // 刷新用户列表
          const usersRes = await getAllUsers()
          if (usersRes.success) {
            setUsers(usersRes.data)
            // 重置懒加载状态
            setDisplayedUsers(usersRes.data.slice(0, 10))
            setPage(1)
            setHasMore(usersRes.data.length > 10)
          }
        } else {
          message.error(res.message || '添加失败')
        }
      }
      setModalVisible(false)
      form.resetFields()
      setEditingUser(null)
    } catch (error) {
      console.error('保存用户失败:', error)
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

  // 移动端用户列表项渲染
  const renderMobileUserItem = (user) => (
    <List.Item
      key={user.id}
      style={{
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0'
      }}
      actions={[
        <Tooltip title="编辑用户" key="edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleAddEdit(user)}
            size="small"
            style={{ color: '#1890ff' }}
          />
        </Tooltip>,
        <Tooltip title="调整赞赞星" key="adjust">
          <Button
            type="text"
            icon={<StarOutlined />}
            onClick={() => handleAdjust(user)}
            size="small"
            style={{ color: '#fa8c16' }}
          />
        </Tooltip>,
        <Popconfirm
          title="确定删除这个用户吗？"
          onConfirm={() => handleDelete(user.id)}
          okText="确定"
          cancelText="取消"
          key="delete"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      ]}
    >
      <div style={{ width: '100%' }}>
        {/* 用户基本信息 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px',
          gap: '12px'
        }}>
          <Avatar 
            size={48}
            style={{ 
              backgroundColor: user.isAdmin ? '#ff4d4f' : '#1890ff',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '4px'
            }}>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#262626'
              }}>
                {user.name}
              </span>
              {user.isAdmin && (
                <Tag color="red" size="small" style={{ margin: 0 }}>
                  管理员
                </Tag>
              )}
              <Tag 
                color={user.ranking <= 3 ? 'gold' : user.ranking <= 10 ? 'green' : 'default'}
                size="small"
                style={{ margin: 0 }}
              >
                排名 {user.ranking}
              </Tag>
            </div>
            <div style={{ fontSize: '13px', color: '#8c8c8c', lineHeight: '1.4' }}>
              <div>📱 {user.phone}</div>
              <div>🏢 {user.department} · {user.position}</div>
            </div>
          </div>
        </div>

        {/* 赞赞星统计 */}
        <div style={{ 
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            color: '#262626',
            marginBottom: '12px'
          }}>
            赞赞星统计
          </div>
          <Row gutter={[16, 12]}>
            <Col span={12}>
              <div style={{ 
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                  本月可赠送
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#1890ff'
                }}>
                  {user.availableToGive} ⭐
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                  本月获赠
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#52c41a'
                }}>
                  {user.receivedThisMonth} ⭐
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                  季度累计
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#fa8c16'
                }}>
                  {user.receivedThisQuarter} ⭐
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                  年度累计
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#722ed1'
                }}>
                  {user.receivedThisYear} ⭐
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                  年度已兑换
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#eb2f96'
                }}>
                  {user.redeemedThisYear} ⭐
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                  剩余可兑换
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: '#13c2c2'
                }}>
                  {user.availableToRedeem} ⭐
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </List.Item>
  )

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
          {!!record.isAdmin && <Tag color="red" size="small">管理员</Tag>}
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
           <Card className="card-shadow" size={isMobile ? "small" : "default"}>
             <Statistic
               title={isMobile ? "用户数" : "总用户数"}
               value={users.length}
               prefix={<UserOutlined style={{ color: '#1890ff' }} />}
               valueStyle={{ color: '#1890ff', fontSize: isMobile ? '16px' : '24px' }}
             />
           </Card>
         </Col>
         <Col xs={12} sm={6}>
           <Card className="card-shadow" size={isMobile ? "small" : "default"}>
             <Statistic
               title={isMobile ? "管理员" : "管理员数"}
               value={users.filter(u => u.isAdmin).length}
               prefix={<UserOutlined style={{ color: '#52c41a' }} />}
               valueStyle={{ color: '#52c41a', fontSize: isMobile ? '16px' : '24px' }}
             />
           </Card>
         </Col>
         <Col xs={12} sm={6}>
           <Card className="card-shadow" size={isMobile ? "small" : "default"}>
             <Statistic
               title={isMobile ? "活跃用户" : "活跃用户"}
               value={users.filter(u => u.receivedThisMonth > 0).length}
               prefix={<StarOutlined style={{ color: '#fa8c16' }} />}
               valueStyle={{ color: '#fa8c16', fontSize: isMobile ? '16px' : '24px' }}
             />
           </Card>
         </Col>
         <Col xs={12} sm={6}>
           <Card className="card-shadow" size={isMobile ? "small" : "default"}>
             <Statistic
               title={isMobile ? "部门数" : "部门数量"}
               value={new Set(users.map(u => u.department)).size}
               prefix={<UserOutlined style={{ color: '#eb2f96' }} />}
               valueStyle={{ color: '#eb2f96', fontSize: isMobile ? '16px' : '24px' }}
             />
           </Card>
         </Col>
       </Row>

             {/* 员工管理 */}
       <Card 
         title="员工管理"
         className="card-shadow"
         extra={
           <Space size={isMobile ? "small" : "middle"}>
             {!isMobile && (
               <>
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
               </>
             )}
             <Button 
               type="primary" 
               icon={<PlusOutlined />}
               onClick={() => handleAddEdit()}
               size={isMobile ? "small" : "small"}
             >
               {isMobile ? "添加" : "添加用户"}
             </Button>
           </Space>
         }
       >
                   {isMobile ? (
            // 移动端列表视图 - 懒加载
            <div 
              ref={listRef}
              style={{ 
                height: 'calc(100vh - 300px)', 
                overflowY: 'auto',
                padding: '8px'
              }}
            >
              <List
                dataSource={displayedUsers}
                renderItem={renderMobileUserItem}
                size="small"
                locale={{
                  emptyText: (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      color: '#8c8c8c'
                    }}>
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                        暂无用户数据
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        点击上方"添加"按钮创建新用户
                      </div>
                    </div>
                  )
                }}
              />
              {loading && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  color: '#8c8c8c'
                }}>
                  <Spin size="small" />
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    加载中...
                  </div>
                </div>
              )}
              {!hasMore && displayedUsers.length > 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  color: '#8c8c8c',
                  fontSize: '14px'
                }}>
                  已加载全部数据
                </div>
              )}
            </div>
          ) : (
           // 桌面端表格视图
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
         )}
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
         width={isMobile ? '95%' : 600}
         style={{ top: isMobile ? 20 : 100 }}
       >
                 <Form
           form={form}
           layout="vertical"
           onFinish={handleSave}
         >
           <Row gutter={isMobile ? 8 : 16}>
             <Col span={isMobile ? 24 : 12}>
               <Form.Item
                 label="姓名"
                 name="name"
                 rules={[{ required: true, message: '请输入姓名' }]}
               >
                 <Input placeholder="请输入姓名" />
               </Form.Item>
             </Col>
             <Col span={isMobile ? 24 : 12}>
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
           
           <Row gutter={isMobile ? 8 : 16}>
             <Col span={isMobile ? 24 : 12}>
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
             <Col span={isMobile ? 24 : 12}>
               <Form.Item
                 label="职位"
                 name="position"
                 rules={[{ required: true, message: '请输入职位' }]}
               >
                 <Input placeholder="请输入职位" />
               </Form.Item>
             </Col>
           </Row>

           <Row gutter={isMobile ? 8 : 16}>
             <Col span={isMobile ? 24 : 12}>
               <Form.Item
                 label="用户类型"
                 name="isAdmin"
                 rules={[{ required: true, message: '请选择用户类型' }]}
               >
                 <Select placeholder="请选择用户类型">
                   <Option value={false}>普通用户</Option>
                   <Option value={true}>管理员</Option>
                 </Select>
               </Form.Item>
             </Col>
             <Col span={isMobile ? 24 : 12}>
               {!editingUser && (
                 <Form.Item
                   label="初始密码"
                   name="password"
                   rules={[
                     { required: true, message: '请输入初始密码' },
                     { min: 6, message: '密码长度至少6位' },
                     { max: 20, message: '密码长度不能超过20位' }
                   ]}
                   extra="用户首次登录时使用此密码"
                 >
                   <Input.Password 
                     placeholder="请输入初始密码" 
                     maxLength={20}
                     showCount
                     suffix={
                       <Tooltip title="生成随机密码">
                         <Button
                           type="text"
                           icon={<KeyOutlined />}
                           onClick={generatePassword}
                           size="small"
                         />
                       </Tooltip>
                     }
                   />
                 </Form.Item>
               )}
             </Col>
           </Row>

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
         width={isMobile ? '95%' : 500}
         style={{ top: isMobile ? 20 : 100 }}
       >
                 <Form
           form={adjustForm}
           layout="vertical"
           onFinish={handleSaveAdjust}
         >
           <Row gutter={isMobile ? 8 : 16}>
             <Col span={isMobile ? 24 : 12}>
               <Form.Item
                 label="本月可赠送"
                 name="availableToGive"
                 rules={[{ required: true, message: '请输入数量' }]}
               >
                 <InputNumber
                   min={0}
                   style={{ width: '100%' }}
                   addonAfter="⭐"
                 />
               </Form.Item>
             </Col>
             <Col span={isMobile ? 24 : 12}>
               <Form.Item
                 label="本月获赠"
                 name="receivedThisMonth"
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

           <Row gutter={isMobile ? 8 : 16}>
             <Col span={isMobile ? 24 : 12}>
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
             </Col>
             <Col span={isMobile ? 24 : 12}>
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
             </Col>
           </Row>

           <Row gutter={isMobile ? 8 : 16}>
             <Col span={isMobile ? 24 : 12}>
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
             </Col>
             <Col span={isMobile ? 24 : 12}>
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
             </Col>
           </Row>

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
