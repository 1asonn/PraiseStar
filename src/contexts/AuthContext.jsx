import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
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

  useEffect(() => {
    // 初始化认证状态
    initializeAuth()
  }, [])

  // 初始化认证状态
  const initializeAuth = async () => {
    try {
      // 检查本地存储中的token和用户信息
      const token = authService.getCurrentToken()
      const savedUser = authService.getCurrentUser()

      if (token && savedUser) {
        // 先设置用户状态，避免页面刷新跳转到登录页
        setUser(savedUser)
        setIsAuthenticated(true)
        
        // 异步验证token有效性，但不阻塞用户界面
        try {
          await authService.verifyToken()
          // Token有效，保持当前状态
        } catch (error) {
          // Token无效时才清除状态
          console.warn('Token验证失败，但保持当前会话:', error.message)
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
      const response = await authService.login(phone,password)
      
      if (response.success) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        message.success('登录成功')
        return { success: true, user: response.data.user }
      } else {
        message.error(response.message || '登录失败')
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      const errorMessage = error.message || '登录失败，请稍后重试'
      message.error(errorMessage)
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
    return user?.isAdmin === true
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
    updateUser,
    isAdmin
  }

  return (
    // 提供鉴权上下文
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
