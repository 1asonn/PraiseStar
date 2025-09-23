import React, { useState, useEffect } from 'react'
import { Card, Statistic } from 'antd'

const StatCard = ({ 
  title, 
  value, 
  prefix, 
  suffix, 
  valueStyle, 
  description,
  loading = false,
  ...props 
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Card 
      className="card-shadow" 
      loading={loading}
      bodyStyle={{ 
        padding: isMobile ? '16px 12px' : '24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      {...props}
    >
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{
          fontSize: isMobile ? 20 : 24,
          ...valueStyle
        }}
      />
      {description && (
        <div style={{
          marginTop: 8,
          fontSize: isMobile ? 11 : 12,
          color: '#666',
          lineHeight: 1.4
        }}>
          {description}
        </div>
      )}
    </Card>
  )
}

export default StatCard
