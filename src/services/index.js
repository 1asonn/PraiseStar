// 导入所有服务
import { authService } from './authService'
import { userService } from './userService'
import { starsService } from './starsService'
import { giftsService } from './giftsService'
import { rankingsService } from './rankingsService'
import { bulletsService } from './bulletsService'

// 统一导出所有API服务
export { api, default as apiClient } from './apiClient'
export { authService }
export { userService }
export { starsService }
export { giftsService }
export { rankingsService }
export { bulletsService }

// 创建一个统一的服务对象，方便使用
export const services = {
  auth: authService,
  user: userService,
  stars: starsService,
  gifts: giftsService,
  rankings: rankingsService,
  bullets: bulletsService
}

// 默认导出服务对象
export default services
