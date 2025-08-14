import React from 'react'
import { Space, Tag } from 'antd'
import { StarOutlined } from '@ant-design/icons'

const StarDisplay = ({ 
  value, 
  showIcon = true, 
  color = '#fadb14',
  size = 'default',
  animated = false 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: 12, iconSize: 12 }
      case 'large':
        return { fontSize: 18, iconSize: 16 }
      default:
        return { fontSize: 14, iconSize: 14 }
    }
  }

  const { fontSize, iconSize } = getSize()

  if (typeof value === 'number' && value >= 0) {
    return (
      <Space size={4}>
        {showIcon && (
          <StarOutlined 
            style={{ 
              color, 
              fontSize: iconSize,
              animation: animated ? 'starTwinkle 2s ease-in-out infinite' : 'none'
            }} 
          />
        )}
        <span style={{ 
          fontSize, 
          fontWeight: size === 'large' ? 'bold' : 'normal',
          color: size === 'large' ? color : 'inherit'
        }}>
          {value} ⭐
        </span>
      </Space>
    )
  }

  return (
    <Tag color={color} style={{ fontSize }}>
      {showIcon && <StarOutlined />} {value} ⭐
    </Tag>
  )
}

export default StarDisplay
