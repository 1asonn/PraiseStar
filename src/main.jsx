import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App'
import './index.css'

// 开发环境下加载调试工具
if (process.env.NODE_ENV === 'development') {
  import('./utils/apiTest')
  import('./utils/authDebug')
  import('./utils/dashboardTest')
  import('./utils/recordTest') // Added for Record page testing
  import('./utils/giveTest') // Added for Give page testing
  import('./utils/cascaderTest') // Added for Cascader component testing
  import('./utils/layoutTest') // Added for Layout component testing
  import('./utils/giftsTest') // Added for Gifts page testing
}

dayjs.locale('zh-cn')

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>
)
