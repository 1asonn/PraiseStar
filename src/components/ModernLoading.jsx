import React from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const ModernLoading = ({ 
  size = 'large', 
  text = '加载中...', 
  type = 'default' 
}) => {
  const getSpinnerIcon = () => {
    const iconSize = size === 'large' ? 24 : size === 'small' ? 14 : 20
    return <LoadingOutlined style={{ fontSize: iconSize, color: '#667eea' }} spin />
  }

  const getSpinnerStyle = () => {
    const baseStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px 20px'
    }

    switch (type) {
      case 'card':
        return {
          ...baseStyle,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }
      case 'overlay':
        return {
          ...baseStyle,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999
        }
      default:
        return baseStyle
    }
  }

  return (
    <div style={getSpinnerStyle()}>
      <Spin 
        indicator={getSpinnerIcon()} 
        size={size}
      />
      {text && (
        <div style={{
          color: type === 'overlay' ? '#fff' : '#666',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {text}
        </div>
      )}
    </div>
  )
}

export default ModernLoading
