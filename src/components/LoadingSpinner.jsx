import React from 'react'
import { Spin } from 'antd'
import { StarOutlined } from '@ant-design/icons'

const LoadingSpinner = ({ 
  size = 'default', 
  tip = '加载中...', 
  spinning = true,
  children 
}) => {
  const customIcon = (
    <StarOutlined 
      style={{ 
        fontSize: size === 'large' ? 32 : size === 'small' ? 16 : 24,
        color: '#1890ff'
      }} 
      className="star-animation" 
    />
  )

  if (children) {
    return (
      <Spin 
        spinning={spinning} 
        indicator={customIcon} 
        tip={tip}
        size={size}
      >
        {children}
      </Spin>
    )
  }

  return (
    <div className="loading-spin">
      <Spin 
        indicator={customIcon} 
        tip={tip}
        size={size}
      />
    </div>
  )
}

export default LoadingSpinner
