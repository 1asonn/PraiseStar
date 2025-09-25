import React from 'react'
import { Card } from 'antd'

const ModernCard = ({ 
  children, 
  className = '', 
  hoverable = true,
  glassEffect = true,
  ...props 
}) => {
  const cardStyle = {
    background: glassEffect 
      ? 'rgba(255, 255, 255, 0.95)' 
      : '#fff',
    backdropFilter: glassEffect ? 'blur(20px)' : 'none',
    border: glassEffect 
      ? '1px solid rgba(255, 255, 255, 0.2)' 
      : '1px solid #f0f0f0',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(hoverable && {
      cursor: 'pointer'
    })
  }

  const hoverStyle = hoverable ? {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
    }
  } : {}

  return (
    <Card
      className={`modern-card ${className}`}
      style={cardStyle}
      {...props}
    >
      {children}
      <style jsx>{`
        .modern-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </Card>
  )
}

export default ModernCard
