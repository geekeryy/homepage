<template>
  <el-card class="article-card card-hover" shadow="hover" @click="goToDetail">
    <div v-if="article.coverImage" class="article-cover">
      <img :src="article.coverImage" :alt="article.title" />
    </div>
    <div class="article-content">
      <h3 class="article-title">{{ article.title }}</h3>
      <p class="article-summary">{{ article.summary }}</p>
      <div class="article-meta">
        <div class="tags">
          <el-tag
            v-for="tag in article.tags"
            :key="tag"
            size="small"
            type="info"
          >
            {{ tag }}
          </el-tag>
        </div>
        <div class="meta-info">
          <span class="date">{{ formatDate(article.createdAt) }}</span>
          <span class="reading-time">
            <el-icon><Clock /></el-icon>
            {{ article.readingTime }}
          </span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Clock } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import type { Article } from '@/types'

interface Props {
  article: Article
}

const props = defineProps<Props>()
const router = useRouter()

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const goToDetail = () => {
  router.push(`/blog/${props.article.id}`)
}
</script>

<style scoped>
.article-card {
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.article-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  margin: -20px -20px 20px;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.reading-time {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>

