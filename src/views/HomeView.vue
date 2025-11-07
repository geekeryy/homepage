<template>
  <div class="home-view">
    <!-- Hero 区域 -->
    <HeroSection />

    <!-- 功能导航卡片 -->
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">探索内容</h2>
        <p class="section-subtitle">发现更多精彩内容和项目</p>
      </div>
      <div class="feature-cards">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="6" v-for="card in featureCards" :key="card.id">
            <FeatureCard
              :icon="card.icon"
              :icon-color="card.iconColor"
              :title="card.title"
              :description="card.description"
              :route="card.route"
              :button-text="card.buttonText"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 快速联系区 -->
      <div class="quick-contact">
        <h2>让我们保持联系</h2>
        <p>欢迎通过以下方式与我交流</p>
        <div class="social-links">
          <a href="https://github.com/geekeryy" target="_blank" class="social-link">
            <el-icon :size="32"
              ><svg viewBox="0 0 1024 1024">
                <path
                  d="M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-121.173333s39.68-12.373333 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.306667 128-46.933333 128-46.933333a161.28 161.28 0 0 1 4.693334 121.173333A177.066667 177.066667 0 0 1 810.666667 477.866667c0 176.64-110.08 215.466667-213.333334 226.986666a106.666667 106.666667 0 0 1 32 85.333334v126.293333c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667"
                  fill="currentColor"
                /></svg
            ></el-icon>
          </a>
          <a href="https://www.jiangyang.com" target="_blank" class="social-link">
            <el-icon :size="32"><Link /></el-icon>
          </a>
          <a href="mailto:jiangyang.me@gmail.com" class="social-link">
            <el-icon :size="32"><Message /></el-icon>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tickets, Document, FolderOpened, User, Link, Message } from '@element-plus/icons-vue'
import HeroSection from '@/components/home/HeroSection.vue'
import FeatureCard from '@/components/home/FeatureCard.vue'

const featureCards = [
  {
    id: 'news',
    icon: Tickets,
    iconColor: '#409eff',
    title: '每日新闻',
    description: '获取最新的科技资讯和行业动态，了解技术前沿趋势',
    route: '/news',
    buttonText: '查看新闻',
  },
  {
    id: 'blog',
    icon: Document,
    iconColor: '#67c23a',
    title: '技术博客',
    description: '阅读技术文章和开发经验分享，探索编程的乐趣',
    route: '/',
    buttonText: '阅读博客',
  },
  {
    id: 'projects',
    icon: FolderOpened,
    iconColor: '#e6a23c',
    title: '项目作品',
    description: '浏览我的开源项目和实战作品，见证技术成长历程',
    route: '/projects',
    buttonText: '查看项目',
  },
  {
    id: 'about',
    icon: User,
    iconColor: '#f56c6c',
    title: '关于我',
    description: '了解我的技能、经验和行业背景，期待与你交流',
    route: '/about',
    buttonText: '了解更多',
  },
]
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 144px);
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
  animation: fadeIn 1s ease-out;
}

.section-title {
  font-size: 42px;
  font-weight: 800;
  color: #303133;
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 50%, #e6a23c 100%);
  border-radius: 2px;
}

.section-subtitle {
  font-size: 18px;
  color: #909399;
  margin-top: 20px;
}

.feature-cards {
  margin-bottom: 100px;
}

.feature-cards :deep(.el-col) {
  margin-bottom: 24px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.quick-contact {
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(135deg, #409eff15 0%, #67c23a15 50%, #e6a23c15 100%);
  border-radius: 24px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.quick-contact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 33%, #e6a23c 66%, #409eff 100%);
}

.quick-contact h2 {
  font-size: 36px;
  font-weight: 800;
  color: #303133;
  margin-bottom: 16px;
}

.quick-contact p {
  font-size: 18px;
  color: #606266;
  margin-bottom: 40px;
}

.social-links {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 30px;
}

.social-link {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
}

.social-link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  opacity: 0;
  transition: opacity 0.4s;
}

.social-link:hover::before {
  opacity: 1;
}

.social-link:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 24px rgba(64, 158, 255, 0.3);
  color: white;
}

.social-link :deep(.el-icon) {
  position: relative;
  z-index: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .quick-contact h2 {
    font-size: 24px;
  }

  .social-links {
    gap: 15px;
  }

  .social-link {
    width: 50px;
    height: 50px;
  }
}
</style>
