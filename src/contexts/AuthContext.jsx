import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockUsers } from '../data/mockData'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth必须在AuthProvider中使用')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储中的用户信息
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (phone) => {
    try {
      // 模拟API调用
      const foundUser = mockUsers.find(u => u.phone === phone)
      if (foundUser) {
        setUser(foundUser)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(foundUser))
        return { success: true, user: foundUser }
      } else {
        return { success: false, message: '用户不存在' }
      }
    } catch (error) {
      return { success: false, message: '登录失败' }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
