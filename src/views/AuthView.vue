<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo 和标题 -->
        <div class="auth-header">
          <img src="/images/logo.svg" alt="Logo" class="auth-logo" />
          <h1 class="auth-title">{{ isLogin ? '欢迎回来' : '加入我们' }}</h1>
          <p class="auth-subtitle">{{ isLogin ? '登录您的账户' : '创建您的账户' }}</p>
        </div>

        <!-- 表单 -->
        <el-form ref="formRef" :model="formData" :rules="rules" class="auth-form">
          <!-- 邮箱输入 -->
          <el-form-item prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" size="large" prefix-icon="Message" clearable
              @blur="handleEmailBlur" />
          </el-form-item>

          <!-- 验证码登录模式 -->
          <template v-if="!isPasswordLogin || !isLogin">
            <!-- 验证码输入 -->
            <el-form-item prop="code">
              <div class="code-input-wrapper">
                <el-input v-model="formData.code" placeholder="请输入验证码" size="large" prefix-icon="Lock" clearable
                  maxlength="6" class="code-input" />
                <el-button :disabled="countdown > 0 || !formData.email" :loading="sendingCode" size="large"
                  class="send-code-btn" @click="handleSendCode">
                  {{ countdown > 0 ? `${countdown}秒` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </template>

          <!-- 密码登录模式 -->
          <template v-if="isPasswordLogin && isLogin">
            <el-form-item prop="loginPassword">
              <el-input v-model="formData.loginPassword" type="password" placeholder="请输入密码" size="large"
                prefix-icon="Lock" show-password clearable />
            </el-form-item>
          </template>

          <!-- 注册时的密码输入（必填） -->
          <el-form-item v-if="!isLogin" prop="password">
            <el-input v-model="formData.password" type="password" placeholder="设置密码（6-20位）" size="large"
              prefix-icon="Lock" show-password clearable maxlength="20" />
          </el-form-item>

          <!-- 确认密码（注册时） -->
          <el-form-item v-if="!isLogin" prop="confirmPassword">
            <el-input v-model="formData.confirmPassword" type="password" placeholder="确认密码" size="large"
              prefix-icon="Lock" show-password clearable maxlength="20" />
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button type="primary" size="large" :loading="submitting" class="submit-btn" @click="handleSubmit">
              {{ isLogin ? '登录' : '注册' }}
            </el-button>
          </el-form-item>

          <!-- 登录方式切换（仅登录模式显示） -->
          <div v-if="isLogin" class="login-mode-switch">
            <el-button type="text" @click="toggleLoginMode">
              {{ isPasswordLogin ? '使用验证码登录' : '使用密码登录' }}
            </el-button>
          </div>

          <!-- 分隔线 -->
          <el-divider>
            <span class="divider-text">或</span>
          </el-divider>

          <!-- GitHub 登录 -->
          <el-button size="large" class="github-btn" @click="handleGithubLogin">
            <svg class="github-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor"
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            使用 GitHub {{ isLogin ? '登录' : '注册' }}
          </el-button>

          <!-- 切换登录/注册 -->
          <div class="auth-footer">
            <span class="footer-text">
              {{ isLogin ? '还没有账户？' : '已有账户？' }}
              <el-button type="primary" link @click="toggleMode">
                {{ isLogin ? '立即注册' : '立即登录' }}
              </el-button>
            </span>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import authService, { IdentityType } from '@/services/auth'
import tokenStorage from '@/services/tokenStorage'
import userService from '@/services/user'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const isLogin = ref(true) // true: 登录模式, false: 注册模式
const isPasswordLogin = ref(true) // true: 密码登录, false: 验证码登录（默认密码登录）
const countdown = ref(0) // 验证码倒计时
const sendingCode = ref(false) // 是否正在发送验证码
const submitting = ref(false) // 是否正在提交表单

// 表单数据
const formData = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  loginPassword: '', // 密码登录时使用
})

// 邮箱验证规则（增强版）
const validateEmail = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (value.length > 100) {
    callback(new Error('邮箱长度不能超过100个字符'))
  } else {
    // 更严格的邮箱验证
    const emailRegex = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }
}

// 验证码验证规则（增强版）
const validateCode = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入验证码'))
  } else if (!/^\d{4,6}$/.test(value)) {
    callback(new Error('验证码应为4-6位数字'))
  } else {
    callback()
  }
}

// 密码验证规则（增强版）
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!isLogin.value) {
    // 注册时密码必填
    if (!value) {
      callback(new Error('请设置密码'))
    } else if (value.length < 6) {
      callback(new Error('密码长度至少6位'))
    } else if (value.length > 20) {
      callback(new Error('密码长度不能超过20位'))
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(value)) {
      callback(new Error('密码必须包含字母和数字'))
    } else if (/\s/.test(value)) {
      callback(new Error('密码不能包含空格'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 确认密码验证规则
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!isLogin.value) {
    if (!value) {
      callback(new Error('请确认密码'))
    } else if (value !== formData.password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 登录密码验证规则
const validateLoginPassword = (rule: any, value: string, callback: any) => {
  if (isLogin.value && isPasswordLogin.value) {
    if (!value) {
      callback(new Error('请输入密码'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 表单验证规则
const rules = reactive<FormRules>({
  email: [{ validator: validateEmail, trigger: 'blur' }],
  code: [{ validator: validateCode, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  loginPassword: [{ validator: validateLoginPassword, trigger: 'blur' }],
})

// 邮箱失焦时验证
const handleEmailBlur = () => {
  formRef.value?.validateField('email')
}

// 发送验证码
const handleSendCode = async () => {
  // 先验证邮箱
  if (!formData.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }

  // 验证邮箱格式
  try {
    await formRef.value?.validateField('email')
  } catch (error) {
    return
  }

  try {
    sendingCode.value = true
    await authService.sendEmailCode({ email: formData.email.trim() })
    ElMessage.success('验证码已发送至邮箱，请查收')

    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    const message = error.response?.data?.message || error.message || '发送验证码失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    sendingCode.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  // 额外的前置检查
  if (!formData.email.trim()) {
    ElMessage.warning('请输入邮箱')
    return
  }

  // 验证码登录模式或注册时检查验证码
  if (!isPasswordLogin.value || !isLogin.value) {
    if (!formData.code.trim()) {
      ElMessage.warning('请输入验证码')
      return
    }
  }

  // 密码登录模式检查密码
  if (isLogin.value && isPasswordLogin.value) {
    if (!formData.loginPassword) {
      ElMessage.warning('请输入密码')
      return
    }
  }

  // 注册时检查密码
  if (!isLogin.value && !formData.password) {
    ElMessage.warning('请设置密码')
    return
  }

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请检查输入信息')
      return
    }

    try {
      submitting.value = true

      if (isLogin.value) {
        // 登录
        let response: any
        if (isPasswordLogin.value) {
          // 密码登录
          response = await authService.loginWithAccountPassword(
            formData.email.trim(),
            formData.loginPassword
          )
        } else {
          // 验证码登录
          response = await authService.loginWithEmailCode(
            formData.email.trim(),
            formData.code.trim()
          )
        }

        // 保存 token
        tokenStorage.saveLoginResponse(response.token, response.refresh_token)

        // 获取用户信息
        try {
          const userInfo = await userService.getMemberInfo()
          // 保存用户信息到本地存储
          tokenStorage.setUserInfo(userInfo)
          console.log('用户信息获取成功:', userInfo)
        } catch (error) {
          console.error('获取用户信息失败:', error)
          // 即使获取用户信息失败也继续登录流程
        }

        ElMessage.success('登录成功')

        // 获取重定向路径
        const redirect = (route.query.redirect as string) || '/'
        router.push(redirect)
      } else {
        // 注册（必须提供密码）
        await authService.registerWithEmailCodeAndPassword(
          formData.email.trim(),
          formData.code.trim(),
          formData.password
        )

        ElMessage.success('注册成功，请登录')

        // 切换到登录模式
        isLogin.value = true
        formData.code = ''
        formData.password = ''
        formData.confirmPassword = ''
        formRef.value?.clearValidate()
      }
    } catch (error: any) {
      console.error(isLogin.value ? '登录失败:' : '注册失败:', error)
      const message = error.response?.data?.message || error.message || (isLogin.value ? '登录失败' : '注册失败')
      ElMessage.error(message)
    } finally {
      submitting.value = false
    }
  })
}

// GitHub 登录
const handleGithubLogin = () => {
  // GitHub OAuth 授权流程：
  // 1. 跳转到 GitHub OAuth 授权页面，携带 client_id 和 redirect_uri
  // 2. 用户授权后，GitHub 回调到 redirect_uri（当前域名 + /auth/callback）
  // 3. 回调页面获取 code 参数，使用 code 作为 credential 调用登录接口

  // 从环境变量获取 GitHub Client ID
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
  if (!clientId) {
    ElMessage.error('GitHub OAuth 未配置，请联系管理员')
    console.error('VITE_GITHUB_CLIENT_ID 环境变量未设置')
    return
  }

  // 保存重定向路径到 sessionStorage，以便回调后使用
  const redirect = (route.query.redirect as string) || '/'
  sessionStorage.setItem('auth_redirect', redirect)

  // 动态生成 redirect_uri：当前访问地址 + /auth/callback
  const redirectUri = `${window.location.origin}/auth/callback`
  console.log(redirectUri)

  // 构建 GitHub OAuth 授权 URL
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${Date.now()}`

  // 跳转到 GitHub OAuth 授权页面
  window.location.href = githubAuthUrl
}

// 切换登录/注册模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  // 切换到注册时，重置为验证码模式
  if (!isLogin.value) {
    isPasswordLogin.value = false
  }
  // 清空表单
  formData.code = ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.loginPassword = ''
  formRef.value?.clearValidate()
}

// 切换登录方式（验证码/密码）
const toggleLoginMode = () => {
  isPasswordLogin.value = !isPasswordLogin.value
  // 清空相关字段
  formData.code = ''
  formData.loginPassword = ''
  // 重置验证码倒计时
  countdown.value = 0
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 480px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 20px;
}

.auth-title {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.auth-subtitle {
  font-size: 15px;
  color: #909399;
  margin: 0;
}

.auth-form {
  margin-top: 32px;
}

.code-input-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  min-width: 120px;
  white-space: nowrap;
  height: 40px;
  flex-shrink: 0;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.divider-text {
  color: #909399;
  font-size: 13px;
  padding: 0 12px;
}

.github-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #24292e;
  color: white;
  border: none;
}

.github-btn:hover {
  background: #1b1f23;
  color: white;
}

.github-icon {
  display: block;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
}

.footer-text {
  font-size: 14px;
  color: #606266;
}

.login-mode-switch {
  text-align: center;
  margin-top: -8px;
  margin-bottom: 16px;
}

.login-mode-switch .el-button {
  font-size: 13px;
  color: #409eff;
}

/* Element Plus 组件样式覆盖 */
.auth-form :deep(.el-input__wrapper) {
  padding: 11px 15px;
  border-radius: 6px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.auth-form :deep(.el-divider) {
  margin: 24px 0;
}

/* 响应式 */
@media (max-width: 576px) {
  .auth-card {
    padding: 36px 24px;
  }

  .auth-container {
    max-width: 100%;
  }

  .auth-title {
    font-size: 24px;
  }

  .auth-subtitle {
    font-size: 14px;
  }

  .code-input-wrapper {
    flex-direction: column;
  }

  .send-code-btn {
    width: 100%;
    min-width: auto;
  }
}
</style>
