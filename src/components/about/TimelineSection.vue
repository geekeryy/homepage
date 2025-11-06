<template>
  <div class="timeline-section">
    <div class="timeline-horizontal">
      <div
        v-for="(item, index) in sortedTimeline"
        :key="item.id"
        class="timeline-item"
        :class="{ hovered: activeIndex === index }"
        :style="{ animationDelay: `${index * 0.15}s` }"
        @mouseenter="activeIndex = index"
        @mouseleave="activeIndex = null"
      >
        <!-- 时间点和连接线 -->
        <div class="timeline-line-wrapper">
          <div class="timeline-dot" :class="`dot-${item.type}`">
            <el-icon :size="18">
              <Briefcase v-if="item.type === 'work'" />
              <Reading v-else />
            </el-icon>
          </div>
          <div
            v-if="index < sortedTimeline.length - 1"
            class="timeline-line"
            :class="getLineClass(index)"
          ></div>
        </div>

        <!-- 内容卡片 -->
        <div class="content-card" :class="`card-${item.type}`">
          <!-- 时间范围 -->
          <div class="time-range">
            {{ item.startYear }} - {{ item.endYear === '至今' ? '至今' : item.endYear }}
          </div>

          <!-- 机构名称 -->
          <div class="organization">
            <el-icon :size="14"><Location /></el-icon>
            <span>{{ item.organization }}</span>
          </div>

          <!-- 描述信息 - 始终显示 -->
          <div class="description-wrapper">
            <p class="description">{{ item.description }}</p>
            <div v-if="item.tags" class="tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Briefcase, Reading, Location } from '@element-plus/icons-vue'
import type { TimelineItem } from '@/types'

interface Props {
  timeline: TimelineItem[]
}

const props = defineProps<Props>()
const activeIndex = ref<number | null>(null)

// 按时间排序（最早的在前，时间从上到下）
const sortedTimeline = computed(() => {
  return [...props.timeline].sort((a, b) => {
    const aStart = parseInt(a.startYear) * 12 + parseInt(a.startMonth)
    const bStart = parseInt(b.startYear) * 12 + parseInt(b.startMonth)
    return aStart - bStart
  })
})

// 计算每个时间段的样式
const getSegmentStyle = (item: TimelineItem, index: number) => {
  return {
    animationDelay: `${index * 0.2}s`,
  }
}

// 计算时长
const getDuration = (item: TimelineItem) => {
  const startDate = new Date(parseInt(item.startYear), parseInt(item.startMonth) - 1)
  const endDate =
    item.endYear === '至今'
      ? new Date()
      : new Date(parseInt(item.endYear), parseInt(item.endMonth) - 1)

  const years = endDate.getFullYear() - startDate.getFullYear()
  const months = endDate.getMonth() - startDate.getMonth()
  const totalMonths = years * 12 + months

  if (totalMonths < 12) {
    return `${totalMonths} 个月`
  } else {
    const y = Math.floor(totalMonths / 12)
    const m = totalMonths % 12
    return m > 0 ? `${y} 年 ${m} 个月` : `${y} 年`
  }
}

// 获取连接线的样式类
const getLineClass = (index: number) => {
  const currentType = sortedTimeline.value[index]?.type
  const nextType = sortedTimeline.value[index + 1]?.type

  // 根据前后节点类型决定渐变颜色
  if (currentType === 'education' && nextType === 'work') {
    return 'line-education-to-work'
  } else if (currentType === 'work' && nextType === 'work') {
    return 'line-work-to-work'
  } else if (currentType === 'work' && nextType === 'education') {
    return 'line-work-to-education'
  } else {
    return 'line-education-to-education'
  }
}
</script>

<style scoped>
.timeline-section {
  padding: 40px 0;
}

.timeline-horizontal {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  padding: 20px;
  /* overflow-x: auto; */
}

/* 时间线项目 */
.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  flex-shrink: 0;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 时间线和节点 */
.timeline-line-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.timeline-dot {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.dot-work {
  border-color: #409eff;
  color: #409eff;
}

.dot-education {
  border-color: #67c23a;
  color: #67c23a;
}

.timeline-item.hovered .timeline-dot {
  transform: scale(1.15);
  box-shadow: 0 6px 24px rgba(64, 158, 255, 0.3);
}

.timeline-item.hovered .dot-work {
  box-shadow: 0 6px 24px rgba(64, 158, 255, 0.4);
}

.timeline-item.hovered .dot-education {
  box-shadow: 0 6px 24px rgba(103, 194, 58, 0.4);
}

/* 连接线 - 增强渐变效果 */
.timeline-line {
  width: 300px;
  height: 5px;
  position: absolute;
  left: 56px;
  z-index: 1;
  border-radius: 3px;
  transition: all 0.3s ease;
  animation: lineGlow 2s ease-in-out infinite alternate;
}

@keyframes lineGlow {
  0% {
    filter: brightness(1);
  }
  100% {
    filter: brightness(1.2);
  }
}

/* 不同类型节点之间的渐变线 - 更鲜明的渐变 */
.line-education-to-work {
  background: linear-gradient(
    90deg,
    #67c23a 0%,
    #5db332 15%,
    #4da3d4 40%,
    #4599e8 60%,
    #409eff 85%,
    #3b8eef 100%
  );
  box-shadow:
    0 3px 12px rgba(64, 158, 255, 0.4),
    0 0 20px rgba(103, 194, 58, 0.2);
}

.line-work-to-work {
  background: linear-gradient(
    90deg,
    #409eff 0%,
    #5ca9ff 25%,
    #73b5ff 50%,
    #5ca9ff 75%,
    #409eff 100%
  );
  box-shadow:
    0 3px 12px rgba(64, 158, 255, 0.5),
    0 0 20px rgba(64, 158, 255, 0.3);
}

.line-work-to-education {
  background: linear-gradient(
    90deg,
    #409eff 0%,
    #3b8eef 15%,
    #4599e8 40%,
    #4da3d4 60%,
    #5db332 85%,
    #67c23a 100%
  );
  box-shadow:
    0 3px 12px rgba(103, 194, 58, 0.4),
    0 0 20px rgba(64, 158, 255, 0.2);
}

.line-education-to-education {
  background: linear-gradient(
    90deg,
    #67c23a 0%,
    #7acc4d 25%,
    #8dd661 50%,
    #7acc4d 75%,
    #67c23a 100%
  );
  box-shadow:
    0 3px 12px rgba(103, 194, 58, 0.5),
    0 0 20px rgba(103, 194, 58, 0.3);
}

.timeline-item.hovered + .timeline-item .timeline-line {
  height: 6px;
  box-shadow:
    0 4px 16px rgba(64, 158, 255, 0.6),
    0 0 24px rgba(64, 158, 255, 0.4);
  filter: brightness(1.3);
}

/* 内容卡片 */
.content-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 85%;
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  transition: height 0.3s ease;
}

.card-work::before {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
}

.card-education::before {
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
}

.timeline-item.hovered .content-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-8px);
}

.timeline-item.hovered .content-card::before {
  height: 6px;
}

/* 时间范围 */
.time-range {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  letter-spacing: 0.5px;
}

/* 机构名称 */
.organization {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 15px;
  color: #606266;
  font-weight: 600;
  margin-bottom: 16px;
}

.organization .el-icon {
  color: #909399;
}

/* 描述区域 - 始终显示 */
.description-wrapper {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item.hovered .description-wrapper {
  border-top-color: #409eff;
}

.description {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  margin: 0 0 16px 0;
  text-align: left;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.tag {
  padding: 6px 12px;
  background: #f5f7fa;
  color: #606266;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid #e4e7ed;
}

.tag:hover {
  background: #ecf5ff;
  color: #409eff;
  border-color: #b3d8ff;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .timeline-horizontal {
    gap: 0;
  }

  .timeline-item {
    width: 220px;
  }

  .timeline-line {
    width: 164px;
  }
}

@media (max-width: 768px) {
  .timeline-horizontal {
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .timeline-item {
    width: 100%;
    max-width: 400px;
  }

  .timeline-line-wrapper {
    flex-direction: column;
    margin-bottom: 0;
    height: auto;
  }

  .timeline-line {
    width: 5px;
    height: 60px;
    left: 50%;
    top: 56px;
    transform: translateX(-50%);
    border-radius: 3px;
  }

  /* 移动端渐变线 - 垂直方向 */
  .line-education-to-work {
    background: linear-gradient(
      180deg,
      #67c23a 0%,
      #5db332 15%,
      #4da3d4 40%,
      #4599e8 60%,
      #409eff 85%,
      #3b8eef 100%
    );
    box-shadow:
      3px 0 12px rgba(64, 158, 255, 0.4),
      0 0 20px rgba(103, 194, 58, 0.2);
  }

  .line-work-to-work {
    background: linear-gradient(
      180deg,
      #409eff 0%,
      #5ca9ff 25%,
      #73b5ff 50%,
      #5ca9ff 75%,
      #409eff 100%
    );
    box-shadow:
      3px 0 12px rgba(64, 158, 255, 0.5),
      0 0 20px rgba(64, 158, 255, 0.3);
  }

  .line-work-to-education {
    background: linear-gradient(
      180deg,
      #409eff 0%,
      #3b8eef 15%,
      #4599e8 40%,
      #4da3d4 60%,
      #5db332 85%,
      #67c23a 100%
    );
    box-shadow:
      3px 0 12px rgba(103, 194, 58, 0.4),
      0 0 20px rgba(64, 158, 255, 0.2);
  }

  .line-education-to-education {
    background: linear-gradient(
      180deg,
      #67c23a 0%,
      #7acc4d 25%,
      #8dd661 50%,
      #7acc4d 75%,
      #67c23a 100%
    );
    box-shadow:
      3px 0 12px rgba(103, 194, 58, 0.5),
      0 0 20px rgba(103, 194, 58, 0.3);
  }

  .timeline-dot {
    width: 48px;
    height: 48px;
  }

  .content-card {
    padding: 20px;
    margin-bottom: 60px;
  }

  .timeline-item:last-child .content-card {
    margin-bottom: 0;
  }

  .timeline-item.hovered .content-card {
    transform: translateY(-4px);
  }
}
</style>
