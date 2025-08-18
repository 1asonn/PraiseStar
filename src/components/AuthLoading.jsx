import React from 'react'
import { Spin } from 'antd'

const AuthLoading = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Spin size="large" />
      <div style={{
        marginTop: '16px',
        fontSize: '16px',
        color: '#666'
      }}>
        正在加载用户信息...
      </div>
    </div>
  )
}

export default AuthLoading
