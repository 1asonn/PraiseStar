import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AuthLoading from './components/AuthLoading'
import UserDashboard from './pages/User/Dashboard'
import UserGive from './pages/User/Give'
import UserRedeem from './pages/User/Redeem'
import UserRanking from './pages/User/Ranking'
import UserRecord from './pages/User/Record'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminUsers from './pages/Admin/Users'
import AdminStars from './pages/Admin/Stars'
import AdminGifts from './pages/Admin/Gifts'
import AdminBulletScreen from './pages/Admin/BulletScreen'
import ImportCenter from './pages/Admin/ImportCenter'
import ExportCenter from './pages/Admin/ExportCenter'
import KeywordRankings from './pages/Admin/KeywordRankings'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// 路由守卫组件
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useAuth()
  
  // 如果正在加载认证状态，显示加载中
  if (loading) {
    return <AuthLoading />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/user" replace />
  }
  
  return children
}

// 管理员路由守卫组件 - 允许管理员访问所有路由
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  
  // 如果正在加载认证状态，显示加载中
  if (loading) {
    return <AuthLoading />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!user?.isAdmin) {
    return <Navigate to="/user" replace />
  }
  
  return children
}

// 用户路由守卫组件 - 允许管理员和普通用户访问
const UserRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  
  // 如果正在加载认证状态，显示加载中
  if (loading) {
    return <AuthLoading />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/user" replace />} />
          
          {/* 普通用户路由 */}
          <Route path="/user" element={
            <UserRoute>
              <Layout userType="user" />
            </UserRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="give" element={<UserGive />} />
            <Route path="redeem" element={<UserRedeem />} />
            <Route path="ranking" element={<UserRanking />} />
            <Route path="record" element={<UserRecord />} />
          </Route>
          
          {/* 管理员路由 */}
          <Route path="/admin" element={
            <AdminRoute>
              <Layout userType="admin" />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="stars" element={<AdminStars />} />
            <Route path="gifts" element={<AdminGifts />} />
            <Route path="bullet-screen" element={<AdminBulletScreen />} />
            <Route path="import" element={<ImportCenter />} />
            <Route path="export" element={<ExportCenter />} />
            <Route path="keyword-rankings" element={<KeywordRankings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
