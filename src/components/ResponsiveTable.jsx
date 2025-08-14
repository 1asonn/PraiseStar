import React, { useState, useEffect } from 'react'
import { Table } from 'antd'

const ResponsiveTable = ({ columns, dataSource, ...props }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 在移动端隐藏某些列
  const responsiveColumns = columns.map(col => {
    if (col.mobileHide && isMobile) {
      return { ...col, className: 'mobile-hide' }
    }
    return col
  })

  const tableProps = {
    ...props,
    columns: responsiveColumns,
    dataSource,
    size: isMobile ? 'small' : 'default',
    scroll: isMobile ? { x: 'max-content' } : props.scroll,
    pagination: isMobile ? {
      ...props.pagination,
      simple: true,
      showSizeChanger: false,
      showQuickJumper: false
    } : props.pagination
  }

  return <Table {...tableProps} />
}

export default ResponsiveTable
