<template>
  <el-card 
    class="news-card card-hover" 
    :class="{ 'is-read': news.isRead }"
    shadow="hover"
  >
    <div class="news-header">
      <el-tag :type="getCategoryType(news.category)">{{ news.category || '其他' }}</el-tag>
      <div class="news-meta">
        <span class="news-source">{{ news.source }}</span>
        <el-tag v-if="news.isRead" type="info" size="small" class="read-tag">
          已读
        </el-tag>
      </div>
    </div>
    <h3 class="news-title">
      <a :href="news.url" target="_blank" rel="noopener" @click="handleLinkClick">
        {{ news.title }}
      </a>
    </h3>
    <p class="news-summary">{{ news.summary }}</p>
    <div class="news-footer">
      <span class="news-date">{{ formatDate(news.publishedAt) }}</span>
      <el-button type="primary" link :icon="ArrowRight" @click="openNews">
        阅读原文
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { News } from '@/types'
import { markNewsAsRead } from '@/services/newsStorage'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Props {
  news: News
}

interface Emits {
  (e: 'update:isRead', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatDate = (date: string) => {
  return dayjs(date).fromNow()
}

const getCategoryType = (category?: string) => {
  const types: Record<string, any> = {
    '科技': 'primary',
    'AI': 'success',
    'DevOps': 'warning',
    '财经': 'danger',
    '技术周刊': 'warning',
    '技术讨论': 'success',
  }
  return types[category || ''] || 'info'
}

const markAsRead = () => {
  if (!props.news.isRead && props.news.uniqueId) {
    markNewsAsRead(props.news.uniqueId, props.news.title)
    // 更新组件状态
    props.news.isRead = true
    emit('update:isRead', true)
  }
}

const handleLinkClick = (e: MouseEvent) => {
  markAsRead()
  // 允许默认的打开新窗口行为
}

const openNews = () => {
  markAsRead()
  window.open(props.news.url, '_blank')
}
</script>

<style scoped>
.news-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* 已读状态的置灰样式 */
.news-card.is-read {
  opacity: 0.6;
  background-color: #f5f7fa;
}

.news-card.is-read:hover {
  opacity: 0.75;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.news-source {
  font-size: 12px;
  color: #909399;
}

.read-tag {
  font-size: 10px;
}

.news-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  line-height: 1.4;
}

.news-title a {
  color: #303133;
  transition: color 0.3s;
  text-decoration: none;
}

.news-title a:hover {
  color: #409eff;
}

/* 已读新闻标题样式 */
.news-card.is-read .news-title a {
  color: #909399;
}

.news-card.is-read .news-title a:hover {
  color: #606266;
}

.news-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
  flex: 1;
}

/* 已读新闻摘要样式 */
.news-card.is-read .news-summary {
  color: #a8abb2;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.news-date {
  font-size: 12px;
  color: #909399;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .news-title {
    font-size: 16px;
  }
  
  .news-summary {
    font-size: 13px;
  }
}
</style>

