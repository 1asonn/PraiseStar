import axios from 'axios'
import { API_CONFIG } from './config'

// API基础配置 - 使用webpack定义的环境变量
// const API_BASE_URL = 'http://39.105.117.48:3000/api'
const API_BASE_URL = API_CONFIG.BASE_URL

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应和错误
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response
      
      // 处理特定HTTP状态码
      switch (status) {
        case 401:
          // Token过期或无效，清除本地存储
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // 不直接跳转，让React Router处理路由
          console.warn('Token已过期，请重新登录')
          break
        case 403:
          console.error('权限不足:', data.message)
          break
        case 404:
          console.error('资源不存在:', data.message)
          break
        case 500:
          console.error('服务器内部错误:', data.message)
          break
        default:
          console.error('API错误:', data.message || '未知错误')
      }
      
      // 返回统一的错误格式
      return Promise.reject({
        success: false,
        message: data.message || '请求失败',
        errors: data.errors || [],
        status: status
      })
    } else if (error.request) {
      // 网络错误或CORS错误
      console.error('网络错误:', error.message)
      
      // 检查是否是CORS错误
      const isCorsError = error.message.includes('CORS') || 
                         error.code === 'ERR_NETWORK' ||
                         !error.request.status
      
      const errorMessage = isCorsError 
        ? '跨域请求被阻止，请检查后端CORS配置或重启开发服务器'
        : '网络连接失败，请检查网络设置'
        
      return Promise.reject({
        success: false,
        message: errorMessage,
        errors: [],
        status: 0,
        isCorsError
      })
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message)
      return Promise.reject({
        success: false,
        message: error.message || '请求失败',
        errors: [],
        status: 0
      })
    }
  }
)

// 通用API请求方法
export const api = {
  // GET请求
  get: (url, params = {}) => {
    return apiClient.get(url, { params })
  },

  // POST请求
  post: (url, data = {}) => {
    return apiClient.post(url, data)
  },

  // PUT请求
  put: (url, data = {}) => {
    return apiClient.put(url, data)
  },

  // DELETE请求
  delete: (url) => {
    return apiClient.delete(url)
  },

  // 文件上传
  upload: (url, formData, onUploadProgress = null) => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
  },
}

// 导出axios实例，供特殊情况使用
export default apiClient
