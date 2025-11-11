<template>
  <div class="auth-callback">
    <div class="callback-container">
      <el-icon class="loading-icon" :size="48">
        <Loading />
      </el-icon>
      <p class="callback-text">{{ statusText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import authService from '@/services/auth'
import tokenStorage from '@/services/tokenStorage'
import userService from '@/services/user'

const router = useRouter()
const route = useRoute()
const statusText = ref('正在处理登录...')

onMounted(async () => {
  try {
    // 从 URL 参数中获取 GitHub OAuth 返回的 code
    const code = route.query.code as string
    const error = route.query.error as string
    const errorDescription = route.query.error_description as string

    // 处理用户拒绝授权的情况
    if (error) {
      throw new Error(errorDescription || error)
    }

    // 检查是否获取到 code
    if (!code) {
      throw new Error('未获取到授权码')
    }

    statusText.value = '正在登录...'

    // 直接使用 code 作为 credential 调用登录接口
    const response = await authService.loginWithGithub(code)

    // 保存 token（apiClient 已经解包了数据，直接使用 response）
    tokenStorage.saveLoginResponse(response.token, response.refresh_token)

    // 获取用户信息
    statusText.value = '正在获取用户信息...'
    try {
      const userInfo = await userService.getMemberInfo()
      // 保存用户信息到本地存储
      tokenStorage.setUserInfo(userInfo)
      console.log('用户信息获取成功:', userInfo)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 即使获取用户信息失败也继续登录流程
    }

    statusText.value = '登录成功，正在跳转...'

    setTimeout(() => {
      ElMessage.success('GitHub 登录成功')

      // 获取并清除保存的重定向路径
      const redirect = sessionStorage.getItem('auth_redirect') || '/'
      sessionStorage.removeItem('auth_redirect')

      router.push(redirect)
    }, 500)
  } catch (error: any) {
    console.error('GitHub 登录失败:', error)
    const message = error.response?.data?.message || error.message || 'GitHub 登录失败，请重试'
    ElMessage.error(message)

    setTimeout(() => {
      router.push('/auth')
    }, 2000)
  }
})
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.callback-container {
  text-align: center;
}

.loading-icon {
  color: #409eff;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.callback-text {
  margin-top: 24px;
  font-size: 16px;
  color: #606266;
}
</style>
