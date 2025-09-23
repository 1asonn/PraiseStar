import React from 'react'
import { Button } from 'antd'

const ModernButton = ({ 
  children,
  type = 'primary',
  size = 'middle',
  variant = 'default',
  gradient = true,
  glow = false,
  ...props 
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: '12px',
      fontWeight: '600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: 'none',
      position: 'relative',
      overflow: 'hidden'
    }

    if (variant === 'gradient' && gradient) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        boxShadow: glow 
          ? '0 8px 24px rgba(102, 126, 234, 0.4)' 
          : '0 4px 16px rgba(102, 126, 234, 0.3)'
      }
    }

    if (variant === 'glass') {
      return {
        ...baseStyle,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#333',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }
    }

    return baseStyle
  }

  const getHoverStyle = () => {
    if (variant === 'gradient' && gradient) {
      return {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)'
      }
    }

    if (variant === 'glass') {
      return {
        transform: 'translateY(-2px)',
        background: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
      }
    }

    return {
      transform: 'translateY(-2px)'
    }
  }

  return (
    <Button
      type={type}
      size={size}
      style={getButtonStyle()}
      {...props}
    >
      {children}
      <style jsx>{`
        .ant-btn:hover {
          ${Object.entries(getHoverStyle()).map(([key, value]) => `${key}: ${value};`).join('')}
        }
        
        .ant-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .ant-btn:hover::before {
          left: 100%;
        }
      `}</style>
    </Button>
  )
}

export default ModernButton
