<template>
  <div class="skills-cloud-wrapper" @click="onWrapperClick">
    <div
      class="skills-cloud-3d"
      ref="cloudContainer"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      @click.stop
    >
      <span
        v-for="(skill, index) in skillsWithPosition"
        :key="skill.name"
        class="skill-tag-3d"
        :style="getTagStyle(skill, index)"
        @mouseenter="onTagMouseEnter(index)"
        @mouseleave="onTagMouseLeave"
        @click="onTagClick(skill, index)"
      >
        {{ skill.name }}
      </span>
    </div>

    <!-- 技能描述提示框 -->
    <transition name="tooltip-fade">
      <div v-if="selectedSkill" class="skill-tooltip" @click.stop>
        <div class="tooltip-header">
          <h3 :style="{ color: selectedSkill.color }">{{ selectedSkill.name }}</h3>
          <button class="close-btn" @click="closeTooltip">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <div class="tooltip-level">
          <div class="level-bar">
            <div
              class="level-fill"
              :style="{
                width: selectedSkill.level + '%',
                backgroundColor: selectedSkill.color,
              }"
            ></div>
          </div>
          <span class="level-text">熟练度: {{ selectedSkill.level }}%</span>
        </div>
        <p class="tooltip-description">{{ selectedSkill.description }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Skill } from '@/types'

interface Props {
  skills: Skill[]
}

const props = defineProps<Props>()

interface SkillWithPosition extends Skill {
  x: number
  y: number
  z: number
  scale: number
  color: string
}

const cloudContainer = ref<HTMLElement>()
const rotation = ref({ x: 0, y: 0 })
const autoRotate = ref(true)
const hoveredIndex = ref<number | null>(null)
const selectedSkill = ref<SkillWithPosition | null>(null)
const selectedIndex = ref<number | null>(null)
const animationFrameId = ref<number>()

// 炫彩颜色数组
const colors = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B500',
  '#FF69B4',
  '#20B2AA',
  '#FF6347',
  '#9370DB',
  '#3CB371',
  '#FF7F50',
  '#6495ED',
  '#FFD700',
  '#DA70D6',
  '#40E0D0',
  '#FF4500',
]

// 生成带有3D位置的技能数据
const skillsWithPosition = computed(() => {
  const skills: SkillWithPosition[] = []
  // 椭圆形半径设置
  const radiusX = 400 // 水平方向更宽
  const radiusY = 200 // 垂直方向适中
  const radiusZ = 240 // 深度方向
  const count = props.skills.length

  props.skills.forEach((skill, index) => {
    // 使用斐波那契球面均匀分布算法，并应用椭圆形变换
    const phi = Math.acos(-1 + (2 * index + 1) / count)
    const theta = Math.sqrt(count * Math.PI) * phi

    // 分别应用不同的半径，创造椭圆形效果
    const x = radiusX * Math.cos(theta) * Math.sin(phi)
    const y = radiusY * Math.sin(theta) * Math.sin(phi)
    const z = radiusZ * Math.cos(phi)

    // 根据技能等级计算大小
    const scale = 0.8 + (skill.level / 100) * 0.8

    skills.push({
      ...skill,
      x,
      y,
      z,
      scale,
      color: colors[index % colors.length] || '#409eff',
    })
  })

  return skills
})

// 计算标签样式
const getTagStyle = (skill: SkillWithPosition, index: number) => {
  const { x, y, z } = skill

  // 应用旋转
  const angleX = (rotation.value.x * Math.PI) / 180
  const angleY = (rotation.value.y * Math.PI) / 180

  // 3D 旋转变换
  const rotatedX = x * Math.cos(angleY) - z * Math.sin(angleY)
  const rotatedZ = x * Math.sin(angleY) + z * Math.cos(angleY)
  const rotatedY = y * Math.cos(angleX) - rotatedZ * Math.sin(angleX)
  const finalZ = y * Math.sin(angleX) + rotatedZ * Math.cos(angleX)

  // 透视效果
  const perspective = 1000
  const scale = perspective / (perspective + finalZ)
  const finalScale = scale * skill.scale

  // 透明度基于z轴位置
  const opacity = 0.3 + (finalZ + 200) / 600

  const isHovered = hoveredIndex.value === index
  const hoverScale = isHovered ? 1.35 : 1

  return {
    transform: `translate(-50%, -50%) translate3d(${rotatedX}px, ${rotatedY}px, 0) scale(${finalScale * hoverScale})`,
    opacity: isHovered ? Math.min(1, opacity + 0.2) : opacity,
    zIndex: Math.round(finalZ + 200),
    color: isHovered ? '#ffffff' : skill.color,
    backgroundColor: isHovered ? skill.color : `${skill.color}15`,
    textShadow: isHovered
      ? `0 0 20px ${skill.color}, 0 0 30px ${skill.color}80, 0 2px 4px rgba(0,0,0,0.3)`
      : `0 2px 8px rgba(0,0,0,0.1)`,
    boxShadow: isHovered
      ? `0 0 40px ${skill.color}cc, 0 0 80px ${skill.color}66, 0 8px 32px rgba(0,0,0,0.2)`
      : `0 4px 16px ${skill.color}20`,
  }
}

// 鼠标移动控制旋转
const onMouseMove = (e: MouseEvent) => {
  if (!cloudContainer.value) return

  const rect = cloudContainer.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const deltaX = e.clientX - centerX
  const deltaY = e.clientY - centerY

  rotation.value.y = (deltaX / rect.width) * 60
  rotation.value.x = -(deltaY / rect.height) * 60

  autoRotate.value = false
}

const onMouseLeave = () => {
  autoRotate.value = true
}

// 鼠标悬停效果（仅用于标签放大效果）
const onTagMouseEnter = (index: number) => {
  hoveredIndex.value = index
}

const onTagMouseLeave = () => {
  hoveredIndex.value = null

  // 如果有选中的技能描述正在显示，鼠标离开标签时自动关闭
  if (selectedSkill.value) {
    setTimeout(() => {
      // 延迟200ms关闭，避免太突兀，提供更好的用户体验
      selectedSkill.value = null
      selectedIndex.value = null
    }, 200)
  }
}

// 点击标签显示描述
const onTagClick = (skill: SkillWithPosition, index: number) => {
  selectedSkill.value = skill
  selectedIndex.value = index
}

// 关闭提示框
const closeTooltip = () => {
  selectedSkill.value = null
  selectedIndex.value = null
}

// 点击容器外部关闭提示框
const onWrapperClick = () => {
  if (selectedSkill.value) {
    selectedSkill.value = null
    selectedIndex.value = null
  }
}

// 自动旋转动画
const animate = () => {
  if (autoRotate.value) {
    rotation.value.y += 0.3
    rotation.value.x = Math.sin(Date.now() / 2000) * 10
  }

  animationFrameId.value = requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<style scoped>
.skills-cloud-wrapper {
  width: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.skills-cloud-wrapper::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate-bg 20s linear infinite;
}

@keyframes rotate-bg {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.skills-cloud-3d {
  position: relative;
  width: 600px;
  height: 500px;
  transform-style: preserve-3d;
  perspective: 1000px;
  cursor: grab;
}

.skills-cloud-3d:active {
  cursor: grabbing;
}

.skill-tag-3d {
  position: absolute;
  left: 50%;
  top: 50%;
  white-space: nowrap;
  padding: 14px 28px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transform-origin: center;
  will-change: transform, opacity, background-color, box-shadow;
}

.skill-tag-3d:hover {
  font-weight: 700;
  letter-spacing: 0.8px;
}

/* 技能描述提示框 */
.skill-tooltip {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 500px;
  width: 90%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  z-index: 1000;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.tooltip-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-left: 12px;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
  transform: rotate(90deg);
}

.tooltip-level {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.level-text {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
}

.tooltip-description {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

/* 提示框淡入淡出动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skills-cloud-wrapper {
    min-height: 400px;
  }

  .skills-cloud-3d {
    width: 100%;
    max-width: 400px;
    height: 400px;
  }

  .skill-tag-3d {
    padding: 8px 16px;
    font-size: 14px;
  }

  .skill-tooltip {
    max-width: 90%;
    padding: 20px;
    top: 15px;
  }

  .tooltip-header h3 {
    font-size: 18px;
  }

  .close-btn {
    padding: 2px;
  }

  .tooltip-description {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .skills-cloud-wrapper {
    min-height: 350px;
  }

  .skills-cloud-3d {
    max-width: 300px;
    height: 350px;
  }

  .skill-tag-3d {
    padding: 6px 12px;
    font-size: 12px;
  }

  .skill-tooltip {
    padding: 16px;
    top: 10px;
  }

  .tooltip-header h3 {
    font-size: 16px;
  }

  .close-btn svg {
    width: 18px;
    height: 18px;
  }

  .level-text {
    font-size: 12px;
  }

  .tooltip-description {
    font-size: 13px;
  }
}
</style>
