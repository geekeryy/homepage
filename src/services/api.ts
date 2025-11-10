import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import tokenStorage from './tokenStorage'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 是否正在刷新 token
let isRefreshing = false
// 待重试的请求队列
let requestsQueue: Array<(token: string) => void> = []

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token 到请求头
    const token = tokenStorage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 如果是 401 错误且不是刷新 token 接口，尝试刷新 token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 刷新 token 的接口本身返回 401，说明 refresh token 也过期了，需要重新登录
      if (originalRequest.url?.includes('/auth/member/refresh')) {
        tokenStorage.clearAll()
        // 跳转到登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/auth'
        }
        return Promise.reject(error)
      }

      originalRequest._retry = true

      // 如果正在刷新 token，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestsQueue.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        // 获取 refresh token
        const refreshToken = tokenStorage.getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // 调用刷新 token 接口
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/api/v1/gateway/auth/member/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        const newToken = response.data.data?.token || response.data.token
        if (!newToken) {
          throw new Error('Invalid refresh token response')
        }

        // 保存新 token
        tokenStorage.setToken(newToken)

        // 更新原请求的 token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        // 重试所有队列中的请求
        requestsQueue.forEach((callback) => callback(newToken))
        requestsQueue = []

        // 重试原请求
        return apiClient(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // 刷新失败，清除所有认证信息
        tokenStorage.clearAll()
        // 清空队列
        requestsQueue = []
        // 跳转到登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/auth'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default apiClient

