import apiClient from './api'

/**
 * 身份类型枚举
 */
export enum IdentityType {
  Phone = 1, // 手机号
  Email = 2, // 邮箱
  Username = 3, // 用户名
  Wechat = 4, // 微信
  Google = 5, // Google
  Facebook = 6, // Facebook
  Github = 7, // Github
}

/**
 * 发送邮箱验证码请求参数
 */
export interface SendEmailCodeRequest {
  email: string
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  identity_type: IdentityType
  identifier: string // 邮箱/手机号/用户名
  credential: string // 验证码/密码
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  identity_type: IdentityType
  identifier: string // 邮箱/手机号/用户名
  credential: string // 密码
  code?: string // 验证码（邮箱或手机号注册时需要）
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  refresh_token: string
}

/**
 * 刷新 Token 请求参数
 */
export interface RefreshTokenRequest {
  refresh_token: string
}

/**
 * 刷新 Token 响应
 */
export interface RefreshTokenResponse {
  token: string
}

/**
 * 认证服务
 */
class AuthService {
  /**
   * 发送邮箱验证码
   */
  async sendEmailCode(data: SendEmailCodeRequest): Promise<void> {
    await apiClient.post('/api/v1/gateway/auth/member/send-email-code', data)
  }

  /**
   * 邮箱验证码登录
   */
  async loginWithEmailCode(email: string, code: string): Promise<LoginResponse> {
    const data: LoginRequest = {
      identity_type: IdentityType.Email,
      identifier: email,
      credential: code,
    }
    return await apiClient.post('/api/v1/gateway/auth/member/login', data)
  }

  /**
   * 用户密码登录
   */
  async loginWithAccountPassword(username: string, password: string): Promise<LoginResponse> {
    const data: LoginRequest = {
      identity_type: IdentityType.Username,
      identifier: username,
      credential: password,
    }
    return await apiClient.post('/api/v1/gateway/auth/member/login', data)
  }

  /**
   * 邮箱验证码注册
   */
  async registerWithEmailCode(email: string, code: string): Promise<void> {
    const data: RegisterRequest = {
      identity_type: IdentityType.Email,
      identifier: email,
      credential: code,
      code: code,
    }
    await apiClient.post('/api/v1/gateway/auth/member/register', data)
  }

  /**
   * 邮箱验证码+密码注册
   */
  async registerWithEmailCodeAndPassword(
    email: string,
    code: string,
    password: string
  ): Promise<void> {
    const data: RegisterRequest = {
      identity_type: IdentityType.Email,
      identifier: email,
      credential: password,
      code: code,
    }
    await apiClient.post('/api/v1/gateway/auth/member/register', data)
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const data: RefreshTokenRequest = {
      refresh_token: refreshToken,
    }
    return await apiClient.post('/api/v1/gateway/auth/member/refresh', data)
  }

  /**
   * GitHub 登录
   * @param code GitHub OAuth 回调返回的 code
   */
  async loginWithGithub(code: string): Promise<LoginResponse> {
    const data: LoginRequest = {
      identity_type: IdentityType.Github,
      identifier: '', // GitHub 登录不需要 identifier
      credential: code, // 直接使用 OAuth code 作为 credential
    }
    return await apiClient.post('/api/v1/gateway/auth/member/login', data)
  }

  /**
   * GitHub 注册
   * @param code GitHub OAuth 回调返回的 code
   */
  async registerWithGithub(code: string): Promise<void> {
    const data: RegisterRequest = {
      identity_type: IdentityType.Github,
      identifier: '', // GitHub 注册不需要 identifier
      credential: code, // 直接使用 OAuth code 作为 credential
    }
    await apiClient.post('/api/v1/gateway/auth/member/register', data)
  }
}

export default new AuthService()

