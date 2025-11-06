<template>
  <div class="about-view">
    <div class="container">
      <div v-loading="loading" class="about-content">
        <!-- 个人信息卡片 -->
        <el-card class="profile-card" shadow="hover">
          <div class="profile-header">
            <el-avatar :size="120" :src="profile?.avatar" />
            <h1 class="profile-name">{{ profile?.name }}</h1>
            <p class="profile-title">{{ profile?.title }}</p>
            <el-tag type="primary" size="large">{{ profile?.industry }}</el-tag>
          </div>
        </el-card>

        <!-- 个人简介 -->
        <el-card class="bio-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>关于我</span>
            </div>
          </template>
          <p class="bio-text">{{ profile?.bio }}</p>
        </el-card>

        <!-- 行业和教育背景时间线 -->
        <el-card
          v-if="profile?.timeline && profile.timeline.length > 0"
          class="timeline-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <el-icon><Clock /></el-icon>
              <span>行业与教育背景</span>
            </div>
          </template>
          <TimelineSection :timeline="profile.timeline" />
        </el-card>

        <!-- 技能清单 - 3D标签云 -->
        <el-card class="skills-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>技能清单</span>
            </div>
          </template>
          <SkillsCloud v-if="profile?.skills" :skills="profile.skills" />
        </el-card>

        <!-- 正在探索 -->
        <el-card
          v-if="profile?.exploring && profile.exploring.length > 0"
          class="exploring-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <el-icon><Compass /></el-icon>
              <span>正在探索</span>
            </div>
          </template>
          <div class="exploring-list">
            <div v-for="item in profile.exploring" :key="item.id" class="exploring-item">
              <div class="exploring-header">
                <div class="exploring-title">
                  <span class="exploring-icon">{{ item.icon }}</span>
                  <span class="exploring-name">{{ item.name }}</span>
                  <el-tag :type="getStatusType(item.status)" size="small" effect="plain">
                    {{ getStatusText(item.status) }}
                  </el-tag>
                </div>
                <span class="exploring-progress-text">{{ item.progress }}%</span>
              </div>
              <p class="exploring-description">{{ item.description }}</p>
              <el-progress
                :percentage="item.progress"
                :stroke-width="6"
                :color="getProgressColor(item.progress)"
                :show-text="false"
              />
              <div class="exploring-meta">
                <span class="exploring-date">开始于 {{ item.startDate }}</span>
                <span v-if="item.reason" class="exploring-reason">{{ item.reason }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, Clock, TrendCharts, Compass } from '@element-plus/icons-vue'
import TimelineSection from '@/components/about/TimelineSection.vue'
import SkillsCloud from '@/components/about/SkillsCloud.vue'
import { getProfile } from '@/services/data'
import type { Profile } from '@/types'

const loading = ref(false)
const profile = ref<Profile | null>(null)

const fetchProfile = async () => {
  loading.value = true
  try {
    profile.value = await getProfile()
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, 'primary' | 'success' | 'warning'> = {
    exploring: 'primary',
    researching: 'warning',
    practicing: 'success',
  }
  return statusMap[status] || 'primary'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    exploring: '探索中',
    researching: '深入研究',
    practicing: '实践中',
  }
  return textMap[status] || status
}

// 获取进度条颜色
const getProgressColor = (progress: number) => {
  if (progress < 30) return '#909399'
  if (progress < 60) return '#409eff'
  return '#67c23a'
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.about-view {
  min-height: calc(100vh - 144px);
}

.about-content {
  max-width: 900px;
  margin: 0 auto;
}

.profile-card {
  margin-bottom: 24px;
}

.profile-header {
  text-align: center;
  padding: 20px;
}

.profile-header :deep(.el-avatar) {
  margin-bottom: 20px;
  border: 4px solid #409eff;
}

.profile-name {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.profile-title {
  font-size: 18px;
  color: #606266;
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 18px;
}

.bio-card,
.timeline-card,
.skills-card,
.exploring-card {
  margin-bottom: 24px;
}

.bio-text {
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
}

/* 技能卡片样式调整 */
.skills-card :deep(.el-card__body) {
  padding: 0;
}

/* 正在探索样式 */
.exploring-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.exploring-item {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.exploring-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #409eff;
}

.exploring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exploring-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.exploring-icon {
  font-size: 24px;
  line-height: 1;
}

.exploring-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.exploring-progress-text {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.exploring-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.exploring-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
}

.exploring-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.exploring-reason {
  font-style: italic;
  color: #67c23a;
}

/* 响应式 */
@media (max-width: 768px) {
  .profile-name {
    font-size: 24px;
  }

  .exploring-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .exploring-progress-text {
    align-self: flex-end;
  }

  .exploring-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
