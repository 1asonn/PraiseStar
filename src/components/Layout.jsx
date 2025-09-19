import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout as AntLayout,
  Menu,
  Button,
  Drawer,
  Avatar,
  Dropdown,
  Space
} from 'antd'
import {
  DashboardOutlined,
  GiftOutlined,
  TrophyOutlined,
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  StarOutlined,
  SettingOutlined,
  MenuOutlined,
  LogoutOutlined,
  MessageOutlined,
  HistoryOutlined,
  SwapOutlined,
  ImportOutlined,
  ExportOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import ProfileModal from './ProfileModal'

const { Header, Sider, Content } = AntLayout

const Layout = ({ userType }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [currentView, setCurrentView] = useState(userType) // 当前视图状态
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  // 用户菜单项
  const userMenuItems = [
    {
      key: '/user',
      icon: <DashboardOutlined />,
      label: '个人中心'
    },
    {
      key: '/user/give',
      icon: <SendOutlined />,
      label: '赠送赞赞星'
    },
    {
      key: '/user/redeem',
      icon: <GiftOutlined />,
      label: '兑换礼品'
    },
    {
      key: '/user/ranking',
      icon: <TrophyOutlined />,
      label: '排行榜'
    },
    {
      key: '/user/record',
      icon: <HistoryOutlined />,
      label: '历史记录'
    }
  ]

  // 管理员菜单项
  const adminMenuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: '管理概览'
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: '员工管理'
    },
    {
      key: '/admin/stars',
      icon: <StarOutlined />,
      label: '赞赞星管理'
    },
    {
      key: '/admin/gifts',
      icon: <GiftOutlined />,
      label: '礼品库管理'
    },
    {
      key: '/admin/bullet-screen',
      icon: <MessageOutlined />,
      label: '弹幕设置'
    },
    {
      key: '/admin/import',
      icon: <ImportOutlined />,
      label: '导入中心'
    },
    {
      key: '/admin/export',
      icon: <ExportOutlined />,
      label: '导出中心'
    },
    {
      key: '/admin/keyword-rankings',
      icon: <TrophyOutlined />,
      label: '词条排行榜'
    },
  ]

  const menuItems = currentView === 'admin' ? adminMenuItems : userMenuItems

  const handleMenuClick = ({ key }) => {
    navigate(key)
    setMobileMenuVisible(false)
  }

  // 切换视图（管理员/用户界面）
  const handleViewToggle = () => {
    const newView = currentView === 'admin' ? 'user' : 'admin'
    setCurrentView(newView)
    
    // 根据新视图跳转到对应的首页
    if (newView === 'admin') {
      navigate('/admin')
    } else {
      navigate('/user')
    }
    
    setMobileMenuVisible(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userDropdownItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ]

  // 处理用户下拉菜单点击
  const handleUserMenuClick = ({ key }) => {
    if (key === 'profile') {
      setProfileModalVisible(true)
    } else if (key === 'logout') {
      handleLogout()
    }
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 监听currentView变化，确保菜单正确更新
  useEffect(() => {
    // 根据当前路径设置正确的视图
    if (location.pathname.startsWith('/admin')) {
      setCurrentView('admin')
    } else if (location.pathname.startsWith('/user')) {
      setCurrentView('user')
    }
  }, [location.pathname])

  // 初始化currentView
  useEffect(() => {
    // 根据当前路径初始化视图
    if (location.pathname.startsWith('/admin')) {
      setCurrentView('admin')
    } else if (location.pathname.startsWith('/user')) {
      setCurrentView('user')
    }
  }, [])

  const siderContent = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  )

  return (
    <AntLayout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth="0"
          className="desktop-sider"
          theme="light"
          style={{ height: '100%', overflow: 'hidden' }}
        >
          <div style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'black',
            fontWeight: 'bold'
          }}>
            {collapsed ? '⭐' : '⭐ 赞赞星'}
          </div>
          {siderContent}
        </Sider>
      )}

      {/* 移动端抽屉菜单 */}
      <Drawer
        title="⭐ 赞赞星"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={isMobile ? Math.min(250, window.innerWidth * 0.8) : 250}
        className="mobile-drawer"
        styles={{body:{padding:0}}}
      >
        {siderContent}
      </Drawer>

      <AntLayout style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header style={{
          background: '#fff',
          padding: isMobile ? '0 12px' : '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: isMobile ? 70 : 80,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          flexShrink: 0
        }}>
          {/* 移动端菜单按钮 */}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="mobile-menu-button"
            />
          )}

          {/* 页面标题 */}
          <div style={{ 
            flex: 1, 
            paddingLeft: isMobile ? 8 : 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#1890ff',
              fontSize: isMobile ? 16 : 20,
              fontWeight: 'bold',
              lineHeight: 1.2
            }}>
              {currentView === 'admin' ? '赞赞星后台管理' : '赞赞星'}
            </h2>
            {currentView !== 'admin' && (
              <div style={{
                fontSize: isMobile ? 10 : 12,
                color: '#666',
                marginTop: 2,
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Recognize & Shine Together • Rewards for Every Achievement
              </div>
            )}
          </div>

          {/* 管理员视图切换按钮 */}
          {user?.isAdmin && (
            <Button
              type="primary"
              icon={<SwapOutlined />}
              onClick={handleViewToggle}
              size={isMobile ? 'small' : 'middle'}
              style={{
                marginRight: isMobile ? 8 : 12,
                background: currentView === 'admin' ? '#52c41a' : '#1890ff',
                borderColor: currentView === 'admin' ? '#52c41a' : '#1890ff'
              }}
            >
              {!isMobile && (currentView === 'admin' ? '用户界面' : '管理界面')}
            </Button>
          )}

          {/* 用户信息 */}
          <Space size={isMobile ? 8 : 12}>
            <Dropdown
              menu={{
                items: userDropdownItems,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }} size={isMobile ? 4 : 8}>
                <Avatar 
                  icon={<UserOutlined />} 
                  size={isMobile ? 'small' : 'default'}
                />
                {!isMobile && (
                  <span style={{ 
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.name}
                  </span>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{
          margin: isMobile ? '12px 8px' : '16px',
          padding: isMobile ? '12px' : '16px',
          background: '#fff',
          borderRadius: 8,
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Outlet />
        </Content>
      </AntLayout>

      {/* 个人信息弹窗 */}
      <ProfileModal
        visible={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
      />
    </AntLayout>
  )
}

export default Layout
