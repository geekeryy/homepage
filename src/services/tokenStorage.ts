/**
 * Token 存储服务
 * 管理 JWT Token 和 Refresh Token 的存储、获取和删除
 */

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USER_INFO_KEY = 'user_info'

class TokenStorage {
  /**
   * 存储 Token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  }

  /**
   * 获取 Token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  /**
   * 删除 Token
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  }

  /**
   * 存储 Refresh Token
   */
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  /**
   * 获取 Refresh Token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * 删除 Refresh Token
   */
  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  /**
   * 存储用户信息
   */
  setUserInfo(userInfo: any): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  }

  /**
   * 获取用户信息
   */
  getUserInfo(): any | null {
    const userInfo = localStorage.getItem(USER_INFO_KEY)
    if (userInfo) {
      try {
        return JSON.parse(userInfo)
      } catch (e) {
        return null
      }
    }
    return null
  }

  /**
   * 删除用户信息
   */
  removeUserInfo(): void {
    localStorage.removeItem(USER_INFO_KEY)
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * 清除所有认证信息
   */
  clearAll(): void {
    this.removeToken()
    this.removeRefreshToken()
    this.removeUserInfo()
  }

  /**
   * 存储登录响应数据
   */
  saveLoginResponse(token: string, refreshToken: string): void {
    this.setToken(token)
    this.setRefreshToken(refreshToken)
  }
}

export default new TokenStorage()

