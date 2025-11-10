<template>
  <div class="hero-section">
    <div class="hero-content">
      <div class="hero-logo" :class="{ 'cursor-infected': cursorInfected }" @mouseenter="startVirusEffect"
        @mouseleave="stopVirusEffect" @click="triggerVirusExplosion">
        <div class="logo-container" :class="{
          'virus-active': virusActive,
          'virus-level-2': virusLevel >= 2,
          'virus-level-3': virusLevel >= 3,
          'virus-exploded': virusExploded,
          'virus-degrading': isDegrading,
        }">
          <img src="/images/logo.svg" alt="Logo" class="logo-image" />
          <!-- 病毒特效层 -->
          <div v-if="virusActive" class="virus-effects">
            <!-- 扫描线 -->
            <div class="scan-line" :style="{ animationDuration: getScanSpeed() }"></div>
            <!-- 红色警告闪烁 -->
            <div class="warning-flash" :style="{ animationDuration: getFlashSpeed() }"></div>
            <!-- 故障效果层 -->
            <div class="glitch-layer glitch-1">
              <img src="/images/logo.svg" alt="Logo" />
            </div>
            <div class="glitch-layer glitch-2">
              <img src="/images/logo.svg" alt="Logo" />
            </div>
            <!-- 病毒代码雨 -->
            <div class="virus-code">
              <span v-for="i in getCodeCount()" :key="`code-${i}-${codeKey}`" class="code-char"
                :style="getCodeStyle(i)">
                {{ getRandomChar() }}
              </span>
            </div>
            <!-- 警告文字 -->
            <div class="virus-warning" :class="[`warning-level-${virusLevel}`, { 'warning-degrading': isDegrading }]">
              {{ getWarningText() }}
            </div>
            <!-- 额外的警告圆环（等级2+） -->
            <div v-if="virusLevel >= 2" class="danger-ring" :class="{ 'ring-degrading': isDegrading }"></div>
            <div v-if="virusLevel >= 3" class="danger-ring danger-ring-2" :class="{ 'ring-degrading': isDegrading }">
            </div>
          </div>
          <!-- 爆炸效果 -->
          <div v-if="virusExploded" class="explosion-effects">
            <div v-for="i in 30" :key="`explosion-${i}`" class="explosion-particle" :style="getExplosionStyle(i)"></div>
            <div class="system-crash">SYSTEM CRASHED</div>
          </div>
        </div>
      </div>
      <h1 class="hero-title" :class="{ 'title-corrupted': corruptedTitle }">
        <span v-if="!corruptedTitle">{{ dailySentence || defaultTitle }}</span>
        <span v-else class="corrupted-text">{{ corruptedTitle }}</span>
      </h1>
      <p class="hero-subtitle" :class="{ 'subtitle-corrupted': corruptedSubtitle }">
        <span v-if="!corruptedSubtitle">软件开发工程师&nbsp;|&nbsp;技术爱好者&nbsp;|&nbsp;开源贡献者</span>
        <span v-else class="corrupted-text">{{ corruptedSubtitle }}</span>
      </p>
      <div class="hero-tags">
        <span class="tag">Golang</span>
        <span class="tag">Linux</span>
        <span class="tag">Cloud Native</span>
        <span class="tag">微服务</span>
      </div>
      <div class="hero-actions">
        <el-button type="primary" size="large" @click="explore" round>
          探索更多
          <el-icon class="el-icon--right">
            <ArrowRight />
          </el-icon>
        </el-button>
      </div>
    </div>
    <div class="hero-background">
      <div class="gradient-bg"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref, onBeforeUnmount, onMounted } from 'vue'
import apiClient from '@/services/api'

const router = useRouter()
const virusActive = ref(false)
const cursorInfected = ref(false) // 鼠标感染状态，单独控制
const virusLevel = ref(1) // 病毒等级：1-3
const virusExploded = ref(false) // 爆炸状态
const isDegrading = ref(false) // 衰减状态
const codeKey = ref(0) // 用于强制更新代码雨
const corruptedTitle = ref('') // 被破坏的标题文字
const corruptedSubtitle = ref('') // 被破坏的副标题文字
const dailySentence = ref('') // 每日句子
const defaultTitle = '欢迎来到我的个人主页' // 默认标题
let virusTimer: number | null = null
let explosionTimer: number | null = null
let cursorTimer: number | null = null
let degradeTimer: number | null = null
let textCorruptTimer: number | null = null

const explore = () => {
  // 平滑滚动到功能卡片区域
  const element = document.querySelector('.feature-cards')
  if (element) {
    const y = element.getBoundingClientRect().top + window.scrollY
    // 这里手动减去菜单高度，比如 64px，可根据实际调整
    const menuHeight = 64 + 10
    window.scrollTo({
      top: y - menuHeight,
      behavior: 'smooth',
    })
  }
}

const goToContact = () => {
  // 滚动到联系区域
  const element = document.querySelector('.quick-contact')
  if (element) {
    const y = element.getBoundingClientRect().top + window.scrollY
    const menuHeight = 64 + 10
    window.scrollTo({
      top: y - menuHeight,
      behavior: 'smooth',
    })
  }
}

// 病毒特效相关
const startVirusEffect = () => {
  virusActive.value = true
  cursorInfected.value = true
  isDegrading.value = false
  virusLevel.value = 1
  codeKey.value++

  // 清除之前的所有定时器（如果用户再次悬停）
  if (cursorTimer) {
    clearTimeout(cursorTimer)
    cursorTimer = null
  }
  if (degradeTimer) {
    clearTimeout(degradeTimer)
    degradeTimer = null
  }
  if (virusTimer) {
    clearTimeout(virusTimer)
    virusTimer = null
  }

  // 不再在这里启动文字破坏效果，改为点击触发

  // 逐渐增强效果
  virusTimer = window.setTimeout(() => {
    if (!isDegrading.value) {
      virusLevel.value = 2
      codeKey.value++

      virusTimer = window.setTimeout(() => {
        if (!isDegrading.value) {
          virusLevel.value = 3
          codeKey.value++
        }
      }, 1500) // 1.5秒后到达等级3
    }
  }, 1000) // 1秒后到达等级2
}

const stopVirusEffect = () => {
  // 进入衰减模式
  isDegrading.value = true
  virusExploded.value = false

  // 清理增强定时器
  if (virusTimer) {
    clearTimeout(virusTimer)
    virusTimer = null
  }
  if (explosionTimer) {
    clearTimeout(explosionTimer)
    explosionTimer = null
  }

  // 开始衰减过程 - 逐步降低等级
  const currentLevel = virusLevel.value
  let degradeSteps: number[] = []

  // 根据当前等级设置衰减步骤
  if (currentLevel === 3) {
    // 等级3 -> 2 -> 1 -> 0 (停止)
    degradeSteps = [1500, 1500, 1500] // 总共4.5秒
  } else if (currentLevel === 2) {
    // 等级2 -> 1 -> 0 (停止)
    degradeSteps = [1500, 1500] // 总共3秒
  } else {
    // 等级1 -> 0 (停止)
    degradeSteps = [2000] // 2秒
  }

  // 执行衰减
  const degrade = (steps: number[], currentStep: number = 0) => {
    if (currentStep >= steps.length) {
      // 衰减完成，完全停止
      virusActive.value = false
      virusLevel.value = 1
      isDegrading.value = false
      cursorInfected.value = false // 鼠标恢复正常
      stopTextCorruption() // 停止文字破坏
      codeKey.value++
      return
    }

    degradeTimer = window.setTimeout(() => {
      // 降低一级
      virusLevel.value = Math.max(1, virusLevel.value - 1)
      codeKey.value++

      if (virusLevel.value === 1 && currentStep === steps.length - 1) {
        // 最后一步，准备完全停止
        degradeTimer = window.setTimeout(() => {
          virusActive.value = false
          isDegrading.value = false
          cursorInfected.value = false
          stopTextCorruption() // 停止文字破坏
        }, steps[currentStep])
      } else {
        // 继续衰减
        degrade(steps, currentStep + 1)
      }
    }, steps[currentStep])
  }

  degrade(degradeSteps)
}

// 触发病毒爆炸效果
const triggerVirusExplosion = () => {
  if (!virusActive.value) return

  virusExploded.value = true

  // 启动文字破坏效果
  startTextCorruption()

  // 3秒后恢复
  explosionTimer = window.setTimeout(() => {
    virusExploded.value = false
  }, 3000)
}

// 生成随机字符（病毒代码）
const getRandomChar = () => {
  const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]()!@#$%^&*'
  return chars[Math.floor(Math.random() * chars.length)]
}

// 生成随机被破坏的文字
const generateCorruptedText = (length: number): string => {
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
  const hexChars = '0123456789ABCDEF'
  const symbols = '░▒▓█▄▀■□●◆★☆♠♣♥♦'
  const allChars = specialChars + hexChars + symbols

  let result = ''
  for (let i = 0; i < length; i++) {
    // 偶尔加入一些空格，使其看起来像是代码片段
    if (Math.random() < 0.15) {
      result += ' '
    } else if (Math.random() < 0.3) {
      // 生成类似十六进制的模式
      result +=
        '0x' +
        hexChars[Math.floor(Math.random() * hexChars.length)] +
        hexChars[Math.floor(Math.random() * hexChars.length)]
      i += 3 // 跳过已生成的字符
    } else if (Math.random() < 0.2) {
      // 添加一些特殊符号块
      result += symbols[Math.floor(Math.random() * symbols.length)]
    } else {
      result += allChars[Math.floor(Math.random() * allChars.length)]
    }
  }
  return result
}

// 启动文字破坏效果
const startTextCorruption = () => {
  // 如果已经在运行，先停止
  if (textCorruptTimer) {
    clearTimeout(textCorruptTimer)
    textCorruptTimer = null
  }

  const updateCorruptedText = () => {
    // 根据病毒等级调整文字长度和更新速度
    const titleLength = 20 + virusLevel.value * 10
    const subtitleLength = 30 + virusLevel.value * 15

    corruptedTitle.value = generateCorruptedText(titleLength)
    corruptedSubtitle.value = generateCorruptedText(subtitleLength)
  }

  // 立即更新一次
  updateCorruptedText()

  // 根据病毒等级设置更新频率
  const getUpdateSpeed = () => {
    if (isDegrading.value) {
      return 300 + (3 - virusLevel.value) * 100 // 衰减时逐渐变慢
    }
    return 150 - virusLevel.value * 30 // 等级越高，滚动越快
  }

  // 持续更新
  const scheduleNextUpdate = () => {
    if (textCorruptTimer) {
      clearTimeout(textCorruptTimer)
    }
    textCorruptTimer = window.setTimeout(() => {
      if (virusActive.value && (corruptedTitle.value || corruptedSubtitle.value)) {
        updateCorruptedText()
        scheduleNextUpdate()
      }
    }, getUpdateSpeed())
  }

  scheduleNextUpdate()
}

// 停止文字破坏效果
const stopTextCorruption = () => {
  if (textCorruptTimer) {
    clearTimeout(textCorruptTimer)
    textCorruptTimer = null
  }
  corruptedTitle.value = ''
  corruptedSubtitle.value = ''
}

// 根据病毒等级获取代码数量
const getCodeCount = () => {
  return virusLevel.value * 20 // 等级1=20, 等级2=40, 等级3=60
}

// 获取代码字符的随机位置和动画延迟
const getCodeStyle = (index: number) => {
  const speed = 3 - virusLevel.value * 0.5 // 等级越高，速度越快
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${speed + Math.random()}s`,
  }
}

// 获取扫描速度（等级越高越快）
const getScanSpeed = () => {
  return `${1.8 - virusLevel.value * 0.3}s`
}

// 获取闪烁速度（等级越高越快）
const getFlashSpeed = () => {
  return `${0.4 - virusLevel.value * 0.05}s`
}

// 获取警告文字
const getWarningText = () => {
  if (isDegrading.value) {
    const degradeWarnings = ['✓ STABILIZING...', '🔧 CLEANING...', '⏳ RECOVERING...']
    return degradeWarnings[virusLevel.value - 1] || degradeWarnings[0]
  }
  const warnings = ['⚠ VIRUS DETECTED', '⚠ CRITICAL WARNING', '☠ SYSTEM CORRUPTED']
  return warnings[virusLevel.value - 1] || warnings[0]
}

// 获取爆炸粒子样式
const getExplosionStyle = (index: number) => {
  const angle = (index / 30) * 360
  const distance = 100 + Math.random() * 100
  const duration = 0.6 + Math.random() * 0.4

  return {
    '--angle': `${angle}deg`,
    '--distance': `${distance}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${Math.random() * 0.1}s`,
  }
}

// 获取每日句子
const fetchDailySentence = async () => {
  try {
    console.log('开始请求每日句子...')
    const response = await apiClient.get('/api/v1/gateway/ai/daily-sentence', {
      params: {
        lang: 'zh', // 语言类型：中文
        use: '个人主页展示', // 用途说明
      },
    })
    console.log('API 响应数据:', response)

    // 响应拦截器已返回 response.data，所以这里 response 就是实际的响应数据
    // 根据 swagger 文档，返回格式为 { sentence: "..." }
    if (response && typeof response === 'object' && 'data' in response) {
      dailySentence.value = String(response.data.sentence)
    } 
  } catch (error) {
    console.error('获取每日句子失败:', error)
    // 失败时使用默认标题
    dailySentence.value = ''
  }
}

// 组件挂载时获取每日句子
onMounted(() => {
  fetchDailySentence()
})

// 清理定时器
onBeforeUnmount(() => {
  if (virusTimer) clearTimeout(virusTimer)
  if (explosionTimer) clearTimeout(explosionTimer)
  if (cursorTimer) clearTimeout(cursorTimer)
  if (degradeTimer) clearTimeout(degradeTimer)
  if (textCorruptTimer) clearTimeout(textCorruptTimer)
})
</script>

<style scoped>
.hero-section {
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 80px;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.gradient-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%, #f093fb15 100%);
  position: relative;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #d81e06 0%, #f56c6c 100%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  top: 60%;
  right: 10%;
  animation-delay: 7s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  bottom: 20%;
  left: 60%;
  animation-delay: 14s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(50px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 60px 20px;
  max-width: 900px;
}

.hero-logo {
  margin-bottom: 30px;
  animation: fadeInDown 0.8s ease-out;
  cursor: pointer;
}

/* 感染状态的鼠标样式 */
.hero-logo.cursor-infected {
  cursor:
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24" fill="red">☠</text></svg>') 16 16,
    crosshair;
}

.logo-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.logo-image {
  width: 120px;
  height: 120px;
  animation: pulse 2s infinite ease-in-out;
  filter: drop-shadow(0 4px 12px rgba(216, 30, 6, 0.3));
  transition: filter 0.3s ease;
}

/* 病毒特效激活状态 */
.logo-container.virus-active {
  animation: virus-shake 0.3s infinite;
}

.logo-container.virus-active .logo-image {
  filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 0, 0, 0.6)) hue-rotate(180deg) saturate(2);
}

/* 病毒等级2 - 更剧烈的效果 */
.logo-container.virus-level-2 {
  animation: virus-shake-2 0.2s infinite;
}

.logo-container.virus-level-2 .logo-image {
  filter: drop-shadow(0 0 30px rgba(255, 0, 0, 1)) drop-shadow(0 0 60px rgba(255, 0, 0, 0.8)) hue-rotate(180deg) saturate(3) contrast(1.2);
}

/* 病毒等级3 - 极度剧烈 */
.logo-container.virus-level-3 {
  animation: virus-shake-3 0.15s infinite;
  transform-origin: center;
}

.logo-container.virus-level-3 .logo-image {
  filter: drop-shadow(0 0 40px rgba(255, 0, 0, 1)) drop-shadow(0 0 80px rgba(255, 0, 0, 1)) hue-rotate(180deg) saturate(4) contrast(1.5) brightness(1.2);
}

/* 爆炸状态 */
.logo-container.virus-exploded {
  animation: explode-shake 0.1s infinite !important;
}

/* 衰减状态 - 视觉效果逐渐减弱 */
.logo-container.virus-degrading {
  transition: all 0.5s ease-out;
}

.logo-container.virus-degrading .logo-image {
  transition: filter 0.8s ease-out;
}

/* 病毒特效容器 */
.virus-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  border-radius: 50%;
}

/* 扫描线效果 */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, transparent 0%, rgba(255, 0, 0, 0.8) 50%, transparent 100%);
  animation: scan 1.5s infinite linear;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
}

/* 红色警告闪烁 */
.warning-flash {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 0, 0, 0.3);
  animation: flash 0.3s infinite;
  border-radius: 50%;
}

/* 故障效果层 */
.glitch-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.glitch-layer img {
  width: 100%;
  height: 100%;
}

.glitch-1 {
  animation: glitch-1 0.5s infinite;
  filter: hue-rotate(90deg);
  mix-blend-mode: screen;
}

.glitch-2 {
  animation: glitch-2 0.4s infinite;
  filter: hue-rotate(270deg);
  mix-blend-mode: screen;
}

/* 病毒代码雨 */
.virus-code {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.code-char {
  position: absolute;
  top: -20px;
  color: #ff0000;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 0 5px #ff0000;
  animation: code-fall linear infinite;
  opacity: 0.8;
}

/* 警告文字 */
.virus-warning {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  color: #ff0000;
  font-size: 12px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 5px #ff0000;
  animation: blink 0.5s infinite;
  white-space: nowrap;
  letter-spacing: 2px;
}

.virus-warning.warning-level-2 {
  font-size: 13px;
  text-shadow:
    0 0 8px #ff0000,
    0 0 15px #ff0000;
}

.virus-warning.warning-level-3 {
  font-size: 14px;
  text-shadow:
    0 0 10px #ff0000,
    0 0 20px #ff0000,
    0 0 30px #ff0000;
  animation:
    blink 0.3s infinite,
    warning-pulse 0.5s infinite;
}

/* 衰减状态的警告文字 - 变为蓝绿色表示恢复 */
.virus-warning.warning-degrading {
  color: #67c23a !important;
  text-shadow:
    0 0 5px #67c23a,
    0 0 10px #67c23a !important;
  animation: degrade-pulse 0.8s ease-in-out infinite !important;
}

.virus-warning.warning-degrading.warning-level-2 {
  color: #409eff !important;
  text-shadow:
    0 0 8px #409eff,
    0 0 15px #409eff !important;
}

.virus-warning.warning-degrading.warning-level-3 {
  color: #e6a23c !important;
  text-shadow:
    0 0 10px #e6a23c,
    0 0 20px #e6a23c !important;
}

/* 危险圆环 */
.danger-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  margin: -70px 0 0 -70px;
  border: 3px solid rgba(255, 0, 0, 0.8);
  border-radius: 50%;
  animation: ring-expand 1.5s infinite;
  box-shadow:
    0 0 10px rgba(255, 0, 0, 0.8),
    inset 0 0 10px rgba(255, 0, 0, 0.5);
}

.danger-ring-2 {
  animation-delay: 0.75s;
}

/* 衰减状态的圆环 - 变为蓝绿色 */
.danger-ring.ring-degrading {
  border-color: rgba(103, 194, 58, 0.6);
  box-shadow:
    0 0 10px rgba(103, 194, 58, 0.6),
    inset 0 0 10px rgba(103, 194, 58, 0.3);
  animation: ring-expand-slow 2s infinite;
}

/* 爆炸效果容器 */
.explosion-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

/* 爆炸粒子 */
.explosion-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ff0000, #ff6600, #ffff00);
  border-radius: 50%;
  animation: particle-explode ease-out forwards;
  box-shadow: 0 0 10px rgba(255, 0, 0, 1);
}

/* 系统崩溃文字 */
.system-crash {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff0000;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow:
    0 0 10px #ff0000,
    0 0 20px #ff0000;
  animation:
    crash-appear 0.3s ease-out,
    blink 0.2s infinite;
  white-space: nowrap;
  letter-spacing: 3px;
  z-index: 11;
}

/* 动画定义 */
@keyframes virus-shake {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  10% {
    transform: translate(-2px, -2px) rotate(-1deg);
  }

  20% {
    transform: translate(2px, 2px) rotate(1deg);
  }

  30% {
    transform: translate(-2px, 2px) rotate(-1deg);
  }

  40% {
    transform: translate(2px, -2px) rotate(1deg);
  }

  50% {
    transform: translate(-2px, -2px) rotate(-1deg);
  }

  60% {
    transform: translate(2px, 2px) rotate(1deg);
  }

  70% {
    transform: translate(-2px, 2px) rotate(-1deg);
  }

  80% {
    transform: translate(2px, -2px) rotate(1deg);
  }

  90% {
    transform: translate(-2px, -2px) rotate(-1deg);
  }
}

@keyframes scan {
  0% {
    top: 0;
  }

  100% {
    top: 100%;
  }
}

@keyframes flash {

  0%,
  100% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }
}

@keyframes glitch-1 {
  0% {
    transform: translate(0);
  }

  20% {
    transform: translate(-3px, 3px);
  }

  40% {
    transform: translate(-3px, -3px);
  }

  60% {
    transform: translate(3px, 3px);
  }

  80% {
    transform: translate(3px, -3px);
  }

  100% {
    transform: translate(0);
  }
}

@keyframes glitch-2 {
  0% {
    transform: translate(0);
  }

  20% {
    transform: translate(2px, -2px);
  }

  40% {
    transform: translate(2px, 2px);
  }

  60% {
    transform: translate(-2px, -2px);
  }

  80% {
    transform: translate(-2px, 2px);
  }

  100% {
    transform: translate(0);
  }
}

@keyframes code-fall {
  0% {
    top: -20px;
    opacity: 0;
  }

  10% {
    opacity: 0.8;
  }

  90% {
    opacity: 0.8;
  }

  100% {
    top: 140px;
    opacity: 0;
  }
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

/* 更剧烈的震动动画 - 等级2 */
@keyframes virus-shake-2 {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  10% {
    transform: translate(-4px, -4px) rotate(-2deg);
  }

  20% {
    transform: translate(4px, 4px) rotate(2deg);
  }

  30% {
    transform: translate(-4px, 4px) rotate(-2deg);
  }

  40% {
    transform: translate(4px, -4px) rotate(2deg);
  }

  50% {
    transform: translate(-4px, -4px) rotate(-2deg);
  }

  60% {
    transform: translate(4px, 4px) rotate(2deg);
  }

  70% {
    transform: translate(-4px, 4px) rotate(-2deg);
  }

  80% {
    transform: translate(4px, -4px) rotate(2deg);
  }

  90% {
    transform: translate(-4px, -4px) rotate(-2deg);
  }
}

/* 极度剧烈的震动 - 等级3 */
@keyframes virus-shake-3 {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }

  10% {
    transform: translate(-6px, -6px) rotate(-3deg) scale(1.02);
  }

  20% {
    transform: translate(6px, 6px) rotate(3deg) scale(0.98);
  }

  30% {
    transform: translate(-6px, 6px) rotate(-3deg) scale(1.02);
  }

  40% {
    transform: translate(6px, -6px) rotate(3deg) scale(0.98);
  }

  50% {
    transform: translate(-6px, -6px) rotate(-3deg) scale(1.02);
  }

  60% {
    transform: translate(6px, 6px) rotate(3deg) scale(0.98);
  }

  70% {
    transform: translate(-6px, 6px) rotate(-3deg) scale(1.02);
  }

  80% {
    transform: translate(6px, -6px) rotate(3deg) scale(0.98);
  }

  90% {
    transform: translate(-6px, -6px) rotate(-3deg) scale(1.02);
  }
}

/* 爆炸震动 */
@keyframes explode-shake {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }

  25% {
    transform: translate(-8px, 8px) rotate(-5deg) scale(1.05);
  }

  50% {
    transform: translate(8px, -8px) rotate(5deg) scale(0.95);
  }

  75% {
    transform: translate(-8px, -8px) rotate(-5deg) scale(1.05);
  }

  100% {
    transform: translate(8px, 8px) rotate(5deg) scale(0.95);
  }
}

/* 警告文字脉冲 */
@keyframes warning-pulse {

  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }

  50% {
    transform: translateX(-50%) scale(1.1);
  }
}

/* 衰减状态的脉冲动画 - 更平缓 */
@keyframes degrade-pulse {

  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: translateX(-50%) scale(1.05);
    opacity: 1;
  }
}

/* 危险圆环扩散 */
@keyframes ring-expand {
  0% {
    width: 140px;
    height: 140px;
    margin: -70px 0 0 -70px;
    opacity: 1;
    border-width: 3px;
  }

  100% {
    width: 220px;
    height: 220px;
    margin: -110px 0 0 -110px;
    opacity: 0;
    border-width: 1px;
  }
}

/* 衰减状态的圆环扩散 - 更慢更平缓 */
@keyframes ring-expand-slow {
  0% {
    width: 140px;
    height: 140px;
    margin: -70px 0 0 -70px;
    opacity: 0.8;
    border-width: 3px;
  }

  100% {
    width: 200px;
    height: 200px;
    margin: -100px 0 0 -100px;
    opacity: 0;
    border-width: 1px;
  }
}

/* 爆炸粒子飞散 */
@keyframes particle-explode {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translate(calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))) scale(0);
    opacity: 0;
  }
}

/* 崩溃文字出现 */
@keyframes crash-appear {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* 文字故障效果 */
@keyframes text-glitch {
  0% {
    transform: translate(0);
  }

  20% {
    transform: translate(-2px, 2px);
  }

  40% {
    transform: translate(-2px, -2px);
  }

  60% {
    transform: translate(2px, 2px);
  }

  80% {
    transform: translate(2px, -2px);
  }

  100% {
    transform: translate(0);
  }
}

/* 文字闪烁腐化效果 */
@keyframes corrupt-flicker {

  0%,
  100% {
    opacity: 1;
    filter: brightness(1);
  }

  25% {
    opacity: 0.8;
    filter: brightness(1.2);
  }

  50% {
    opacity: 0.9;
    filter: brightness(0.8);
  }

  75% {
    opacity: 1;
    filter: brightness(1.1);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  color: #303133;
  margin-bottom: 20px;
  animation: fadeInUp 0.8s ease-out;
  letter-spacing: -1px;
  line-height: 1.2;
  transition: all 0.3s ease;
  min-height: 62px;
}

.hero-title.title-corrupted {
  color: #ff0000;
  font-family: 'Courier New', monospace;
  text-shadow:
    0 0 5px rgba(255, 0, 0, 0.8),
    0 0 10px rgba(255, 0, 0, 0.6),
    2px 2px 0 rgba(0, 255, 0, 0.3),
    -2px -2px 0 rgba(0, 0, 255, 0.3);
  animation: text-glitch 0.3s infinite;
  letter-spacing: 2px;
}

.hero-title .corrupted-text {
  display: inline-block;
  animation: corrupt-flicker 0.15s infinite;
}

.hero-subtitle {
  font-size: 22px;
  color: #606266;
  margin-bottom: 30px;
  animation: fadeInUp 1s ease-out;
  font-weight: 400;
  transition: all 0.3s ease;
  min-height: 28px;
}

.hero-subtitle.subtitle-corrupted {
  color: #ff6600;
  font-family: 'Courier New', monospace;
  text-shadow:
    0 0 3px rgba(255, 102, 0, 0.8),
    0 0 8px rgba(255, 102, 0, 0.5),
    1px 1px 0 rgba(0, 255, 255, 0.3),
    -1px -1px 0 rgba(255, 0, 255, 0.3);
  animation: text-glitch 0.4s infinite;
  letter-spacing: 1px;
}

.hero-subtitle .corrupted-text {
  display: inline-block;
  animation: corrupt-flicker 0.2s infinite;
}

.hero-tags {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
  animation: fadeInUp 1.2s ease-out;
}

.tag {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  color: #d81e06;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  animation: fadeInUp 1.4s ease-out;
}

.hero-actions :deep(.el-button) {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.hero-actions :deep(.el-button--primary) {
  background: linear-gradient(135deg, #d81e06 0%, #f56c6c 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(216, 30, 6, 0.3);
}

.hero-actions :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(216, 30, 6, 0.4);
}

.hero-actions :deep(.el-button.is-plain) {
  border: 2px solid #d81e06;
  color: #d81e06;
}

.hero-actions :deep(.el-button.is-plain:hover) {
  background: #d81e06;
  color: white;
  transform: translateY(-2px);
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

/* 响应式 */
@media (max-width: 768px) {
  .hero-section {
    min-height: 500px;
  }

  .logo-container {
    width: 80px;
    height: 80px;
  }

  .logo-image {
    width: 80px;
    height: 80px;
  }

  .code-char {
    font-size: 10px;
  }

  .virus-warning {
    font-size: 10px;
    bottom: -30px;
  }

  .hero-title {
    font-size: 36px;
    min-height: 43px;
  }

  .hero-title.title-corrupted {
    font-size: 28px;
    letter-spacing: 1px;
  }

  .hero-subtitle {
    font-size: 18px;
    min-height: 22px;
  }

  .hero-subtitle.subtitle-corrupted {
    font-size: 14px;
  }

  .hero-tags {
    gap: 8px;
  }

  .tag {
    padding: 6px 16px;
    font-size: 13px;
  }

  .hero-actions {
    flex-direction: column;
    padding: 0 20px;
  }

  .hero-actions :deep(.el-button) {
    width: 100%;
  }

  .shape {
    opacity: 0.05;
  }
}
</style>
