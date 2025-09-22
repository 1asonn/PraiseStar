// API配置文件

// API基础配置
export const API_CONFIG = {
  // 基础URL - 根据环境自动切换
  BASE_URL: 'http://39.105.117.48:3000/api',     // 生产API地址
  // BASE_URL: 'http://localhost:3000/api',     // 开发API地址
  
  // 请求超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 重试配置
  RETRY: {
    times: 3,           // 重试次数
    delay: 1000,        // 重试延迟（毫秒）
    exponential: true   // 是否使用指数退避
  },
  
  // 分页配置
  PAGINATION: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100
  },
  
  // 文件上传配置
  UPLOAD: {
    maxSize: 5 * 1024 * 1024,  // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  
  // Token配置
  TOKEN: {
    key: 'token',                    // localStorage中的key
    refreshThreshold: 5 * 60 * 1000, // 5分钟内过期时自动刷新
    maxRetries: 3                    // 刷新重试次数
  }
}

// 错误码映射
export const ERROR_CODES = {
  // 通用错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  
  // 认证错误
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',
  
  // 业务错误
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INSUFFICIENT_STARS: 'INSUFFICIENT_STARS',
  GIFT_OUT_OF_STOCK: 'GIFT_OUT_OF_STOCK',
  
  // 验证错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PARAMETER_ERROR: 'PARAMETER_ERROR'
}

// 错误消息映射
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ERROR_CODES.TIMEOUT_ERROR]: '请求超时，请稍后重试',
  [ERROR_CODES.UNKNOWN_ERROR]: '未知错误，请稍后重试',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: '登录状态无效，请重新登录',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ERROR_CODES.AUTH_PERMISSION_DENIED]: '权限不足，无法执行此操作',
  [ERROR_CODES.USER_NOT_FOUND]: '用户不存在',
  [ERROR_CODES.INSUFFICIENT_STARS]: '赞赞星不足',
  [ERROR_CODES.GIFT_OUT_OF_STOCK]: '礼品库存不足',
  [ERROR_CODES.VALIDATION_ERROR]: '参数验证失败',
  [ERROR_CODES.PARAMETER_ERROR]: '参数错误'
}

// API端点常量
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  
  // 用户管理
  USERS: {
    PROFILE: '/users/profile',
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    ADJUST_STARS: (id) => `/users/${id}/adjust-stars`,
    DEPARTMENTS: '/users/departments',
    STATISTICS: '/users/statistics',
    EXPORT: '/users/export',
    IMPORT_TEMPLATE: '/user-data/import-template',
    VALIDATE_IMPORT: '/user-data/validate-import',
    IMPORT: '/user-data/import'
  },
  
  // 赞赞星管理
  STARS: {
    GIVE: '/stars/give',
    GIVE_RECORDS: '/stars/give-records',
    ALL_GIVE_RECORDS: '/stars/give-records/all',
    AWARD: '/stars/award',
    STATISTICS: '/stars/statistics',
    REASONS: '/stars/reasons',
    BALANCE: '/stars/balance',
    FLOW: '/stars/flow',
    EXPORT: '/stars/export'
  },
  
  // 礼品管理
  GIFTS: {
    LIST: '/gifts',
    AVAILABLE: '/gifts/available',
    DETAIL: (id) => `/gifts/${id}`,
    CREATE: '/gifts',
    UPDATE: (id) => `/gifts/${id}`,
    DELETE: (id) => `/gifts/${id}`,
    REDEEM: (id) => `/gifts/${id}/redeem`,
    REDEMPTIONS: '/gifts/redemptions',
    ALL_REDEMPTIONS: '/gifts/redemptions/all',
    UPDATE_REDEMPTION_STATUS: (id) => `/gifts/redemptions/${id}/status`,
    STATISTICS: '/gifts/stats',
    EXPORT: '/gifts/export'
  },
  
  // 排行榜
  RANKINGS: {
    LIST: '/rankings',
    TOP: '/rankings/top',
    USER: (id) => `/rankings/user/${id}`,
    DEPARTMENTS: '/rankings/departments',
    STATISTICS: '/rankings/statistics',
    MY_RANKING: '/rankings/my',
    TREND: '/rankings/trend',
    EXPORT: '/rankings/export'
  },
  
  // 弹幕设置
  BULLETS: {
    SETTINGS: '/bullets/settings',
    UPDATE_SETTING: (type) => `/bullets/settings/${type}`,
    BATCH_UPDATE: '/bullets/settings/batch',
    TEST: '/bullets/test',
    TEMPLATES: '/bullets/templates',
    SEND: '/bullets/send',
    HISTORY: '/bullets/history',
    STATISTICS: '/bullets/statistics'
  },
  
  // 文件上传
  UPLOAD: {
    IMAGE: '/upload/image',
    EXCEL: '/upload/excel',
    FILES: '/upload/files'
  }
}

// 请求方法常量
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
}

// 内容类型常量
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded'
}

// 响应状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

export default API_CONFIG
