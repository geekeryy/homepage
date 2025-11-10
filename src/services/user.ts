import apiClient from './api'

/**
 * 用户信息接口
 */
export interface UserInfo {
  avatar?: string
  birthday?: string
  email?: string
  gender?: number
  nickname?: string
  phone?: string
}

/**
 * 用户服务
 */
class UserService {
  /**
   * 获取当前登录用户信息
   */
  async getMemberInfo(): Promise<UserInfo> {
    return await apiClient.get('/api/v1/gateway/user/member/info')
  }

  /**
   * 更新用户信息
   */
  async updateMemberInfo(data: Partial<UserInfo>): Promise<void> {
    await apiClient.put('/api/v1/gateway/user/member/update-info', data)
  }
}

export default new UserService()

