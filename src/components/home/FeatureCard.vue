<template>
  <el-card class="feature-card card-hover" shadow="hover" @click="navigate">
    <div class="card-content">
      <div class="icon-wrapper">
        <el-icon :size="48" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-description">{{ description }}</p>
      <el-button type="primary" :icon="ArrowRight">
        {{ buttonText }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

interface Props {
  icon: any
  iconColor: string
  title: string
  description: string
  route: string
  buttonText: string
}

const props = defineProps<Props>()
const router = useRouter()

const navigate = () => {
  router.push(props.route)
}
</script>

<style scoped>
.feature-card {
  cursor: pointer;
  height: 100%;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, transparent 0%, transparent 100%) border-box;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: #f0f0f0;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
}

.feature-card:hover .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.feature-card:hover .card-title {
  background: linear-gradient(135deg, #d81e06 0%, #f56c6c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-content {
  text-align: center;
  padding: 32px 24px;
}

.icon-wrapper {
  margin-bottom: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(102, 177, 255, 0.05) 100%);
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.card-description {
  font-size: 15px;
  color: #606266;
  margin-bottom: 28px;
  line-height: 1.8;
  min-height: 54px;
}

.card-content :deep(.el-button) {
  border-radius: 20px;
  padding: 10px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.card-content :deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
}

.card-content :deep(.el-button--primary:hover) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}
</style>
