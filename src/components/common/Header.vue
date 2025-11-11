<template>
  <header class="site-header">
    <div class="container">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <img src="/images/logo.svg" alt="Logo" class="logo-icon" />
          <span class="logo-text">Code & Coffee</span>
        </div>

        <!-- 桌面端菜单 -->
        <nav class="desktop-nav">
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
            background-color="transparent"
            text-color="#303133"
            active-text-color="#409eff"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/news">新闻</el-menu-item>
            <!-- <el-menu-item index="">博客</el-menu-item> -->
            <el-menu-item index="/projects">项目</el-menu-item>
            <el-menu-item index="/about">关于</el-menu-item>
          </el-menu>
        </nav>

        <!-- 用户区域 -->
        <div class="user-area">
          <!-- 未登录 -->
          <el-button v-if="!isAuthenticated" type="primary" @click="goToAuth">
            登录 / 注册
          </el-button>
          <!-- 已登录 -->
          <el-dropdown v-else @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :src="userInfo?.avatar" :icon="UserFilled" />
              <span class="username">{{ userInfo?.nickname || '用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn">
          <el-button :icon="Menu" @click="drawerVisible = true" />
        </div>
      </div>
    </div>

    <!-- 移动端抽屉菜单 -->
    <el-drawer v-model="drawerVisible" title="菜单" direction="rtl" size="60%">
      <el-menu :default-active="activeMenu" @select="handleMenuSelect">
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/news">
          <el-icon><Tickets /></el-icon>
          <span>新闻</span>
        </el-menu-item>
        <el-menu-item index="/">
          <el-icon><Document /></el-icon>
          <span>博客</span>
        </el-menu-item>
        <el-menu-item index="/projects">
          <el-icon><FolderOpened /></el-icon>
          <span>项目</span>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><User /></el-icon>
          <span>关于</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Menu,
  HomeFilled,
  Tickets,
  Document,
  FolderOpened,
  User,
  UserFilled,
  SwitchButton,
} from '@element-plus/icons-vue'
import tokenStorage from '@/services/tokenStorage'
import userService, { type UserInfo } from '@/services/user'

const router = useRouter()
const route = useRoute()
const drawerVisible = ref(false)
const isAuthenticated = ref(false)
const userInfo = ref<UserInfo | null>(null)

const activeMenu = computed(() => route.path)

const goHome = () => {
  router.push('/')
}

const goToAuth = () => {
  router.push('/auth')
}

const handleMenuSelect = (index: string) => {
  // 忽略外部链接的路由跳转
  if (index === 'external-blog') {
    return
  }
  router.push(index)
  drawerVisible.value = false
}

const handleUserCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'profile') {
    router.push('/profile')
  }
}

const handleLogout = () => {
  tokenStorage.clearAll()
  isAuthenticated.value = false
  userInfo.value = null
  ElMessage.success('已退出登录')
  router.push('/')
}

const checkAuthStatus = async () => {
  isAuthenticated.value = tokenStorage.isAuthenticated()
  if (isAuthenticated.value) {
    try {
      userInfo.value = await userService.getMemberInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除认证状态
      tokenStorage.clearAll()
      isAuthenticated.value = false
    }
  }
}

onMounted(() => {
  checkAuthStatus()
})
</script>

<style scoped>
.site-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  width: 40px;
  height: 40px;
  transition: transform 0.3s ease;
  background: transparent !important;
}

.logo:hover .logo-icon {
  transform: rotate(10deg);
}

.logo-text {
  font-size: 22px;
  font-weight: bold;
  background: linear-gradient(135deg, #d81e06 0%, #f56c6c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.desktop-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.mobile-menu-btn {
  display: none;
}

.user-area {
  margin-left: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

/* 移除 Element Plus Menu 的边框 */
:deep(.el-menu--horizontal) {
  border-bottom: none;
}

:deep(.el-menu-item) {
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .user-area {
    margin-left: 12px;
  }

  .username {
    display: none;
  }
}
</style>
