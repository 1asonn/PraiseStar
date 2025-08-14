import React from 'react'
import { Empty, Button } from 'antd'
import { StarOutlined, PlusOutlined } from '@ant-design/icons'

const EmptyState = ({ 
  description = '暂无数据',
  image,
  actionText,
  onAction,
  type = 'default' // default, stars, gifts, users
}) => {
  const getEmptyConfig = () => {
    switch (type) {
      case 'stars':
        return {
          image: <StarOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
          description: '还没有赞赞星记录'
        }
      case 'gifts':
        return {
          image: Empty.PRESENTED_IMAGE_SIMPLE,
          description: '暂无可兑换的礼品'
        }
      case 'users':
        return {
          image: Empty.PRESENTED_IMAGE_SIMPLE,
          description: '暂无用户数据'
        }
      default:
        return {
          image: image || Empty.PRESENTED_IMAGE_SIMPLE,
          description
        }
    }
  }

  const config = getEmptyConfig()

  return (
    <div className="empty-state">
      <Empty
        image={config.image}
        description={config.description}
      >
        {actionText && onAction && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onAction}
          >
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
