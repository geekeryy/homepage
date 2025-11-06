<template>
  <el-card class="project-card card-hover" shadow="hover">
    <div class="project-image" :style="imageContainerStyle">
      <img
        v-if="project.imageUrl && !imageError"
        :src="project.imageUrl"
        :alt="project.name"
        @error="handleImageError"
      />
      <div v-else class="project-name-display" :style="nameDisplayStyle">
        <span class="project-full-name">{{ project.name }}</span>
      </div>
    </div>
    <div class="project-content">
      <h3 class="project-name">{{ project.name }}</h3>
      <div class="description-wrapper">
        <p
          ref="descriptionRef"
          class="project-description"
          :class="{
            'is-expanded': isExpanded,
            'is-clamped': !isExpanded,
            'has-more': showExpandButton,
          }"
        >
          {{ project.description }}
        </p>
        <span
          v-if="showExpandButton && !isExpanded"
          class="expand-icon"
          @click="toggleExpand"
          title="点击展开"
        >
          ▼
        </span>
        <span
          v-if="showExpandButton && isExpanded"
          class="expand-icon collapse-icon"
          @click="toggleExpand"
          title="点击收起"
        >
          ▲
        </span>
      </div>

      <div class="tech-stack">
        <el-tag v-for="tech in project.techStack" :key="tech" size="small" effect="plain">
          {{ tech }}
        </el-tag>
      </div>

      <div class="project-links">
        <el-button
          v-if="project.githubUrl"
          type="primary"
          :icon="Link"
          @click="openLink(project.githubUrl)"
        >
          GitHub
        </el-button>
        <el-button
          v-if="project.demoUrl"
          type="success"
          :icon="View"
          @click="openLink(project.demoUrl)"
        >
          在线演示
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Link, View } from '@element-plus/icons-vue'
import type { Project } from '@/types'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const imageError = ref(false)
const isExpanded = ref(false)
const showExpandButton = ref(false)
const descriptionRef = ref<HTMLElement | null>(null)

// 处理图片加载错误
const handleImageError = () => {
  imageError.value = true
}

// 检查描述是否超出3行
const checkOverflow = () => {
  if (!descriptionRef.value) return

  // 临时移除line-clamp限制以获取完整高度
  const element = descriptionRef.value
  const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
  const maxHeight = lineHeight * 3 // 3行的高度

  // 获取实际内容高度
  const actualHeight = element.scrollHeight

  // 如果实际高度大于3行高度，显示展开按钮
  showExpandButton.value = actualHeight > maxHeight
}

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 组件挂载后检查是否需要展开按钮
onMounted(() => {
  nextTick(() => {
    checkOverflow()
  })
})

// 根据项目ID生成不同的渐变色
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
]

// 根据项目ID选择渐变色
const imageContainerStyle = computed(() => {
  if (props.project.imageUrl && !imageError.value) {
    return {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
    }
  }
  const gradientIndex = props.project.id % gradients.length
  return {
    background: gradients[gradientIndex],
  }
})

// 名称显示样式
const nameDisplayStyle = computed(() => {
  return {
    color: '#ffffff',
    textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  }
})

const openLink = (url: string) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
.project-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  border-radius: 8px;
  margin: 0px 0px 20px 0px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.05);
}

/* 艺术字体显示样式 */
.project-name-display {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  transition: transform 0.3s ease;
}

.project-card:hover .project-name-display {
  transform: scale(1.05);
}

.project-full-name {
  font-size: 36px;
  font-weight: 900;
  text-align: center;
  line-height: 1.3;
  letter-spacing: 2px;
  opacity: 0.98;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
  max-width: 100%;
  word-wrap: break-word;
  background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

.project-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.project-name {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.description-wrapper {
  position: relative;
  margin-bottom: 15px;
}

.project-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.project-description.is-clamped {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-description.is-clamped.has-more {
  padding-right: 24px;
}

.project-description.is-expanded {
  display: block;
}

.expand-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  color: #409eff;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  background: linear-gradient(to right, transparent 0%, #fff 20%, #fff 100%);
  transition: all 0.3s;
  user-select: none;
}

.expand-icon:hover {
  color: #66b1ff;
  transform: scale(1.2);
}

.collapse-icon {
  position: static;
  display: inline-block;
  margin-left: 8px;
  background: none;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.project-links {
  display: flex;
  gap: 12px;
}

.project-links :deep(.el-button) {
  flex: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .project-full-name {
    font-size: 24px;
    letter-spacing: 1px;
  }
}
</style>
