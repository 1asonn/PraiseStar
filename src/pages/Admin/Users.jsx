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
  Spin,
  Alert
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
import { userService } from '../../services/userService'

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
  
  // 搜索和分页相关状态
  const [searchName, setSearchName] = useState('')
  const [searchDepartment, setSearchDepartment] = useState('')
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(10)
  const [tableLoading, setTableLoading] = useState(false)
  const [allDepartments] = useState([
    '研发中心', '市场部', '人力行政部', '总经理办', '财务部'
  ])
  
  // 导入导出相关状态
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    defaultPassword: '123456',
    includeStats: false
  })
  const [validationResult, setValidationResult] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  
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

  // 加载用户数据
  const loadUsers = async (currentPage = 1, search = searchName, department = searchDepartment) => {
    try {
      setTableLoading(true)
      const params = {
        page: currentPage,
        limit: pageSize
      }
      
      // 添加搜索参数
      if (search) {
        params.search = search
      }
      if (department) {
        params.department = department
      }
      
      const response = await getAllUsers(params)
      
      if (response.success) {
        setUsers(response.data)
        setTotal(response.total || response.pagination?.total || 0)
        setPage(currentPage)
        
        // 设置显示用户数据（移动端和桌面端都需要）
        if (currentPage === 1) {
          setDisplayedUsers(response.data)
        } else {
          // 只有移动端才追加数据（懒加载）
          if (isMobile) {
            setDisplayedUsers(prev => [...prev, ...response.data])
          } else {
            setDisplayedUsers(response.data)
          }
        }
        
        // 移动端懒加载控制
        if (isMobile) {
          setHasMore(response.data.length === pageSize)
        }
      } else {
        message.error(response.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      message.error('加载用户数据失败')
    } finally {
      setTableLoading(false)
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadUsers()
  }, [])

  // 懒加载更多数据
  const loadMore = () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    loadUsers(page + 1)
  }

  // 搜索处理
  const handleSearch = () => {
    setPage(1)
    setDisplayedUsers([])
    loadUsers(1, searchName, searchDepartment)
  }

  // 重置搜索
  const handleReset = () => {
    setSearchName('')
    setSearchDepartment('')
    setPage(1)
    setDisplayedUsers([])
    loadUsers(1, '', '')
  }

  // 分页变化处理（桌面端）
  const handlePageChange = (newPage, newPageSize) => {
    loadUsers(newPage)
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


  // 处理文件导入
  const handleFileImport = async (file) => {
    try {
      setImportLoading(true)
      
      // 先验证文件
      const validationResponse = await userService.validateImportFile(file)
      
      if (validationResponse.success) {
        const result = validationResponse.data
        setValidationResult(result)
        
        if (!result.isValid) {
          message.error(`文件验证失败：发现 ${result.invalidRows} 行错误数据`)
          setImportModalVisible(true)
          return false // 阻止上传
        }
        
        if (result.warnings.length > 0) {
          // 有警告，显示确认对话框
          setImportModalVisible(true)
          return false // 阻止自动上传，等待用户确认
        }
        
        // 验证通过，直接导入
        await performImport(file)
        return false // 阻止默认上传行为
      }
    } catch (error) {
      console.error('文件验证失败:', error)
      message.error('文件验证失败，请检查文件格式')
      return false
    } finally {
      setImportLoading(false)
    }
  }

  // 自定义文件上传处理
  const customRequest = async (options) => {
    const { file, onSuccess, onError } = options
    
    try {
      setImportLoading(true)
      
      // 获取真正的文件对象
      const actualFile = file.originFileObj || file
      
      // 调试信息
      console.log('Upload file object:', file)
      console.log('Actual file object:', actualFile)
      console.log('File type:', typeof actualFile)
      console.log('Is File instance:', actualFile instanceof File)
      
      // 先验证文件
      const validationResponse = await userService.validateImportFile(actualFile)
      
      if (validationResponse.success) {
        const result = validationResponse.data
        setValidationResult(result)
        
        if (!result.isValid) {
          message.error(`文件验证失败：发现 ${result.invalidRows} 行错误数据`)
          setImportModalVisible(true)
          onError(new Error('文件验证失败'))
          return
        }
        
        if (result.warnings.length > 0) {
          // 有警告，显示确认对话框
          setPendingFile(actualFile) // 保存文件引用
          setImportModalVisible(true)
          onSuccess('验证完成，等待用户确认')
          return
        }
        
        // 验证通过，直接导入
        await performImport(actualFile)
        onSuccess('导入完成')
      } else {
        onError(new Error(validationResponse.message || '文件验证失败'))
      }
    } catch (error) {
      console.error('文件处理失败:', error)
      message.error('文件处理失败，请检查文件格式')
      onError(error)
    } finally {
      setImportLoading(false)
    }
  }

  // 执行导入
  const performImport = async (file) => {
    try {
      setImportLoading(true)
      const response = await userService.importUsers(file, importOptions)
      
      if (response.success) {
        const result = response.data
        message.success(
          `导入完成！总计 ${result.total} 条，成功 ${result.success} 条，失败 ${result.failed} 条，创建 ${result.created} 条，更新 ${result.updated} 条`
        )
        
        if (result.errors.length > 0) {
          console.warn('导入警告:', result.errors)
        }
        
        // 刷新用户列表
        loadUsers()
        setImportModalVisible(false)
      }
    } catch (error) {
      console.error('导入失败:', error)
      message.error('导入失败，请稍后重试')
    } finally {
      setImportLoading(false)
    }
  }

  // 确认导入
  const handleConfirmImport = () => {
    if (pendingFile) {
      performImport(pendingFile)
      setPendingFile(null)
    }
  }

  // 导出数据
  const handleExport = async (format = 'csv', includeStats = false) => {
    try {
      setExportLoading(true)
      const response = await userService.exportUsers({ format, includeStats })
      
      if (response.success) {
        message.success(response.message || '数据导出成功')
      }
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败，请稍后重试')
    } finally {
      setExportLoading(false)
    }
  }

  // 下载导入模板
  const handleDownloadTemplate = async () => {
    try {
      const response = await userService.downloadImportTemplate()
      if (response.success) {
        message.success(response.message || '模板下载成功')
      }
    } catch (error) {
      console.error('下载模板失败:', error)
      message.error('下载模板失败，请稍后重试')
    }
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
      width: 150,
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
    // {
    //   title: '排名',
    //   dataIndex: 'ranking',
    //   key: 'ranking',
    //   width: 70,
    //   align: 'center',
    //   render: (ranking) => (
    //     <Tag color={ranking <= 3 ? 'gold' : ranking <= 10 ? 'green' : 'default'}>
    //       {ranking}
    //     </Tag>
    //   )
    // },
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
               value={total}
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
                 <Button 
                   icon={<DownloadOutlined />} 
                   onClick={handleDownloadTemplate}
                   size="small"
                 >
                   下载模板
                 </Button>
                 <Upload
                   accept=".csv"
                   showUploadList={false}
                   customRequest={customRequest}
                 >
                   <Button 
                     icon={<UploadOutlined />} 
                     size="small"
                     loading={importLoading}
                   >
                     批量导入
                   </Button>
                 </Upload>
                 <Button 
                   icon={<DownloadOutlined />} 
                   onClick={() => handleExport('csv', importOptions.includeStats)}
                   loading={exportLoading}
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
        {/* 搜索区域 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Input
                placeholder="搜索用户姓名"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="选择部门"
                value={searchDepartment}
                onChange={setSearchDepartment}
                allowClear
                style={{ width: '100%' }}
              >
                {/* 使用固定部门列表 */}
                {allDepartments.map(dept => (
                  <Option key={dept} value={dept}>{dept}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Space>
                <Button type="primary" onClick={handleSearch} loading={tableLoading}>
                  搜索
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
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
             loading={tableLoading}
             pagination={{
               total: total,
               current: page,
               pageSize: pageSize,
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
               onChange: handlePageChange,
               onShowSizeChange: handlePageChange
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

      {/* 导入确认对话框 */}
      <Modal
        title="导入确认"
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false)
          setValidationResult(null)
        }}
        footer={null}
        width={800}
      >
        {validationResult && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4>文件验证结果</h4>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Tag color="blue">总行数: {validationResult.totalRows}</Tag>
                  <Tag color="green">有效行数: {validationResult.validRows}</Tag>
                  <Tag color="red">无效行数: {validationResult.invalidRows}</Tag>
                </div>
                
                {validationResult.errors.length > 0 && (
                  <div>
                    <Alert
                      type="error"
                      message="发现错误"
                      description={
                        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                          {validationResult.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {validationResult.errors.length > 5 && (
                            <li>... 还有 {validationResult.errors.length - 5} 个错误</li>
                          )}
                        </ul>
                      }
                    />
                  </div>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <div>
                    <Alert
                      type="warning"
                      message="发现警告"
                      description={
                        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                          {validationResult.warnings.slice(0, 5).map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                          {validationResult.warnings.length > 5 && (
                            <li>... 还有 {validationResult.warnings.length - 5} 个警告</li>
                          )}
                        </ul>
                      }
                    />
                  </div>
                )}
              </Space>
            </div>
            
            {validationResult.sampleData.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>数据预览（前3行）</h4>
                <Table
                  dataSource={validationResult.sampleData}
                  columns={[
                    { title: '姓名', dataIndex: 'name', width: 80 },
                    { title: '手机号', dataIndex: 'phone', width: 120 },
                    { title: '部门', dataIndex: 'department', width: 100 },
                    { title: '职位', dataIndex: 'position', width: 100 },
                    { title: '是否管理员', dataIndex: 'isAdmin', width: 80 },
                    { title: '月度分配', dataIndex: 'monthlyAllocation', width: 80 }
                  ]}
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                />
              </div>
            )}
            
            {validationResult.isValid && (
              <div style={{ marginBottom: 16 }}>
                <h4>导入选项</h4>
                <Space direction="vertical">
                  <label>
                    <input
                      type="checkbox"
                      checked={importOptions.updateExisting}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        updateExisting: e.target.checked 
                      }))}
                    />
                    <span style={{ marginLeft: 8 }}>更新已存在的用户</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={importOptions.includeStats}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        includeStats: e.target.checked 
                      }))}
                    />
                    <span style={{ marginLeft: 8 }}>包含统计信息</span>
                  </label>
                  <div>
                    <span>默认密码: </span>
                    <Input
                      value={importOptions.defaultPassword}
                      onChange={(e) => setImportOptions(prev => ({ 
                        ...prev, 
                        defaultPassword: e.target.value 
                      }))}
                      style={{ width: 120 }}
                      placeholder="默认密码"
                    />
                  </div>
                </Space>
              </div>
            )}
            
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setImportModalVisible(false)
                  setValidationResult(null)
                }}>
                  取消
                </Button>
                {validationResult.isValid && (
                  <Button 
                    type="primary" 
                    loading={importLoading}
                    onClick={handleConfirmImport}
                  >
                    确认导入
                  </Button>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminUsers
