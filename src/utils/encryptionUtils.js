/**
 * 安全的加密工具类
 * 使用AES-GCM算法进行加密/解密
 */

// 固定的密钥（实际项目中应该从环境变量或配置中获取）
const ENCRYPTION_KEY = 'starUpUp2024!@#Key'
const SALT = 'starUpUpSalt2024'

/**
 * 生成密钥
 * @param {string} password - 密码
 * @param {string} salt - 盐值
 * @returns {Promise<CryptoKey>} 加密密钥
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 加密文本
 * @param {string} text - 要加密的文本
 * @returns {Promise<string>} 加密后的Base64字符串
 */
export async function encryptText(text) {
  try {
    if (!text) return ''
    
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    
    // 生成随机IV
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    // 生成密钥
    const key = await deriveKey(ENCRYPTION_KEY, SALT)
    
    // 加密数据
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    )
    
    // 将IV和加密数据组合
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    // 转换为Base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('加密失败:', error)
    return ''
  }
}

/**
 * 解密文本
 * @param {string} encryptedText - 加密的Base64字符串
 * @returns {Promise<string>} 解密后的文本
 */
export async function decryptText(encryptedText) {
  try {
    if (!encryptedText) return ''
    
    // 从Base64解码
    const combined = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    )
    
    // 分离IV和加密数据
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    // 生成密钥
    const key = await deriveKey(ENCRYPTION_KEY, SALT)
    
    // 解密数据
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    )
    
    // 转换为文本
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('解密失败:', error)
    return ''
  }
}

/**
 * 简单的XOR加密（备用方案）
 * @param {string} text - 要加密的文本
 * @returns {string} 加密后的字符串
 */
export function simpleEncrypt(text) {
  if (!text) return ''
  
  const key = 'starUpUp2024!@#'
  let result = ''
  
  for (let i = 0; i < text.length; i++) {
    const textChar = text.charCodeAt(i)
    const keyChar = key.charCodeAt(i % key.length)
    result += String.fromCharCode(textChar ^ keyChar)
  }
  
  return btoa(result)
}

/**
 * 简单的XOR解密（备用方案）
 * @param {string} encryptedText - 加密的字符串
 * @returns {string} 解密后的文本
 */
export function simpleDecrypt(encryptedText) {
  if (!encryptedText) return ''
  
  try {
    const key = 'starUpUp2024!@#'
    const text = atob(encryptedText)
    let result = ''
    
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i)
      const keyChar = key.charCodeAt(i % key.length)
      result += String.fromCharCode(textChar ^ keyChar)
    }
    
    return result
  } catch (error) {
    console.error('解密失败:', error)
    return ''
  }
}

export default {
  encryptText,
  decryptText,
  simpleEncrypt,
  simpleDecrypt
}
