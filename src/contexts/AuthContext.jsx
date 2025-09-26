import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { superAdminService } from '../services/superAdminService'
import { message } from 'antd'

// 创建鉴权上下文
const AuthContext = createContext()

// 自定义hook，用于在组件中获取鉴权上下文
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth必须在AuthProvider中使用')
  }
  return context
}

// 鉴权提供者组件，用于在应用顶层提供鉴权上下文
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [superAdmin, setSuperAdmin] = useState(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // 初始化认证状态
    initializeAuth()
  }, [])

  // 初始化认证状态
  const initializeAuth = async () => {
    try {
      // 检查普通用户认证状态
      const token = authService.getCurrentToken()
      const savedUser = authService.getCurrentUser()

      if (token && savedUser) {
        // 设置用户状态，避免页面刷新跳转到登录页
        setUser(savedUser)
        setIsAuthenticated(true)
        
        // 异步验证token有效性，但不阻塞用户界面
        try {
          await authService.verifyToken()
          // Token有效，保持当前状态
        } catch (error) {
          // Token无效时才清除状态
          console.warn('Token验证失败:', error.message)
          // 只在确实是认证错误时才清除
          if (error.status === 401 || error.status === 403) {
            console.warn('认证失败，清除本地存储')
            authService.logout()
            setUser(null)
            setIsAuthenticated(false)
          }
          // 网络错误等其他情况保持当前状态
        }
      }

      // 检查超级管理员认证状态
      const superAdminToken = superAdminService.getCurrentToken()
      const savedSuperAdmin = superAdminService.getCurrentSuperAdmin()

      if (superAdminToken && savedSuperAdmin) {
        // 检查是否为超级管理员（通过用户信息中的标识）
        if (savedSuperAdmin.isSuperAdmin === true) {
          setSuperAdmin(savedSuperAdmin)
          setIsSuperAdmin(true)
          
          // 异步验证超级管理员token有效性
          try {
            await superAdminService.verifyToken()
          } catch (error) {
            console.warn('超级管理员Token验证失败:', error.message)
            if (error.status === 401 || error.status === 403) {
              console.warn('超级管理员认证失败，清除本地存储')
              superAdminService.logout()
              setSuperAdmin(null)
              setIsSuperAdmin(false)
            }
          }
        }
      } else {
        // 如果没有找到超级管理员信息，检查普通用户信息中是否有超级管理员标识
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user.isSuperAdmin === true) {
              setSuperAdmin(user)
              setIsSuperAdmin(true)
            }
          } catch (error) {
            console.error('解析用户信息失败:', error)
          }
        }
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 用户登录
  const login = async (phone, password) => {
    try {
      setLoading(true)
      const response = await authService.login(phone, password)
      
      if (response.success) {
        // 批量更新状态，减少重渲染次数
        setUser(response.data.user)
        setIsAuthenticated(true)
        
        // 显示成功消息
        message.success('登录成功')
        
        return { success: true, user: response.data.user }
      } else {
        // 不在这里显示错误消息，让调用方处理
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录失败:', error)
      const errorMessage = error.message || '登录失败，请稍后重试'
      // 不在这里显示错误消息，让调用方处理
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // 用户登出
  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      message.success('已安全退出')
    } catch (error) {
      console.error('登出失败:', error)
      // 即使后端登出失败，也要清除前端状态
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  // 超级管理员登录
  const loginSuperAdmin = async (username, password) => {
    try {
      setLoading(true)
      const response = await superAdminService.login(username, password)
      
      if (response.success) {
        // 为超级管理员信息添加标识
        const superAdminWithFlag = {
          ...response.data.superAdmin,
          isSuperAdmin: true,
          isAdmin: true // 超级管理员也拥有管理员权限
        }
        
        // 将带有标识的超级管理员信息保存到localStorage
        localStorage.setItem('user', JSON.stringify(superAdminWithFlag))
        
        setSuperAdmin(superAdminWithFlag)
        setIsSuperAdmin(true)
        message.success('超级管理员登录成功')
        return { success: true, superAdmin: superAdminWithFlag }
      } else {
        message.error(response.message || '超级管理员登录失败')
        return { success: false, message: response.message || '超级管理员登录失败' }
      }
    } catch (error) {
      console.error('超级管理员登录失败:', error)
      const errorMessage = error.message || '超级管理员登录失败，请稍后重试'
      message.error(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // 超级管理员登出
  const logoutSuperAdmin = async () => {
    try {
      // 清除超级管理员状态
      setSuperAdmin(null)
      setIsSuperAdmin(false)
      
      // 清除本地存储
      await superAdminService.logout()
      
      message.success('超级管理员已安全退出')
      
      // 跳转到登录页面
      window.location.href = '/login'
    } catch (error) {
      console.error('超级管理员登出失败:', error)
      // 即使后端登出失败，也要清除前端状态
      setSuperAdmin(null)
      setIsSuperAdmin(false)
      
      // 强制跳转到登录页面
      window.location.href = '/login'
    }
  }

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      const response = await authService.verifyToken()
      if (response.success && response.data.user) {
        const updatedUser = response.data.user
        setUser(updatedUser)
        authService.updateLocalUserInfo(updatedUser)
        return updatedUser
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      // 如果刷新失败，可能是token过期，执行登出
      logout()
    }
  }

  // 更新用户信息
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    authService.updateLocalUserInfo(updatedUser)
  }

  // 检查是否为管理员
  const isAdmin = () => {
    return user?.isAdmin === true || isSuperAdmin
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
    updateUser,
    isAdmin,
    superAdmin,
    isSuperAdmin,
    loginSuperAdmin,
    logoutSuperAdmin
  }

  return (
    // 提供鉴权上下文
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
