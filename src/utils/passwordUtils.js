import CryptoJS from 'crypto-js'

/**
 * 密码加密工具类
 */
export const passwordUtils = {
  /**
   * 盐值常量
   */
  SALT: 'starUpUp',

  /**
   * 使用MD5加密密码
   * @param {string} password - 原始密码
   * @returns {string} 加密后的密码
   */
  encryptPassword: (password) => {
    if (!password) {
      throw new Error('密码不能为空')
    }
    
    // 将密码与盐值组合后进行MD5加密
    const saltedPassword = password + passwordUtils.SALT
    return CryptoJS.MD5(saltedPassword).toString()
  },

  /**
   * 验证密码（比较加密后的密码）
   * @param {string} inputPassword - 输入的原始密码
   * @param {string} encryptedPassword - 存储的加密密码
   * @returns {boolean} 密码是否匹配
   */
  verifyPassword: (inputPassword, encryptedPassword) => {
    if (!inputPassword || !encryptedPassword) {
      return false
    }
    
    const inputEncrypted = passwordUtils.encryptPassword(inputPassword)
    return inputEncrypted === encryptedPassword
  }
}

export default passwordUtils
