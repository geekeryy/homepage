<template>
  <div class="blog-detail-view">
    <div class="container">
      <div v-if="loading" v-loading="true" style="min-height: 400px;"></div>
      
      <div v-else-if="article" class="article-detail">
        <!-- 返回按钮 -->
        <el-button
          :icon="ArrowLeft"
          @click="$router.back()"
          style="margin-bottom: 20px;"
        >
          返回列表
        </el-button>

        <!-- 文章头部 -->
        <div class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <span class="date">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(article.createdAt) }}
            </span>
            <span class="reading-time">
              <el-icon><Clock /></el-icon>
              {{ article.readingTime }}
            </span>
          </div>
          <div class="tags">
            <el-tag
              v-for="tag in article.tags"
              :key="tag"
              type="primary"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 文章封面 -->
        <div v-if="article.coverImage" class="article-cover">
          <img :src="article.coverImage" :alt="article.title" />
        </div>

        <!-- 文章内容 -->
        <el-card class="article-content" shadow="never">
          <div v-html="renderedContent"></div>
        </el-card>

        <!-- 导航按钮 -->
        <div class="article-navigation">
          <el-button
            v-if="prevArticle"
            :icon="ArrowLeft"
            @click="goToArticle(prevArticle.id)"
          >
            上一篇: {{ prevArticle.title }}
          </el-button>
          <el-button
            v-if="nextArticle"
            @click="goToArticle(nextArticle.id)"
          >
            下一篇: {{ nextArticle.title }}
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <el-empty v-else description="文章不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Calendar, Clock } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import dayjs from 'dayjs'
import { getArticleById, getArticles } from '@/services/data'
import type { Article } from '@/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const article = ref<Article | null>(null)
const allArticles = ref<Article[]>([])

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

const renderedContent = computed(() => {
  if (!article.value) return ''
  return md.render(article.value.content)
})

const currentIndex = computed(() => {
  if (!article.value) return -1
  return allArticles.value.findIndex(a => a.id === article.value!.id)
})

const prevArticle = computed(() => {
  if (currentIndex.value > 0) {
    return allArticles.value[currentIndex.value - 1]
  }
  return null
})

const nextArticle = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < allArticles.value.length - 1) {
    return allArticles.value[currentIndex.value + 1]
  }
  return null
})

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

const fetchArticle = async (id: number) => {
  loading.value = true
  try {
    const result = await getArticleById(id)
    article.value = result || null
  } catch (error) {
    console.error('Failed to fetch article:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

const fetchAllArticles = async () => {
  try {
    allArticles.value = await getArticles()
  } catch (error) {
    console.error('Failed to fetch all articles:', error)
  }
}

const goToArticle = (id: number) => {
  router.push(`/blog/${id}`)
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchArticle(Number(newId))
  }
})

onMounted(() => {
  const id = Number(route.params.id)
  if (id) {
    fetchArticle(id)
    fetchAllArticles()
  }
})
</script>

<style scoped>
.blog-detail-view {
  min-height: calc(100vh - 144px);
  padding-bottom: 40px;
}

.article-detail {
  max-width: 900px;
  margin: 0 auto;
}

.article-header {
  text-align: center;
  margin-bottom: 30px;
}

.article-title {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.article-cover {
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 30px;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  margin-bottom: 40px;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: bold;
  color: #303133;
}

.article-content :deep(h1) {
  font-size: 28px;
}

.article-content :deep(h2) {
  font-size: 24px;
}

.article-content :deep(h3) {
  font-size: 20px;
}

.article-content :deep(p) {
  margin-bottom: 16px;
  line-height: 1.8;
  color: #606266;
}

.article-content :deep(code) {
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #e96900;
}

.article-content :deep(pre) {
  background: #282c34;
  color: #abb2bf;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.article-content :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 16px 0;
  color: #606266;
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
}

.article-content :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

.article-navigation {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.article-navigation :deep(.el-button) {
  flex: 1;
  max-width: 400px;
}

/* 响应式 */
@media (max-width: 768px) {
  .article-title {
    font-size: 28px;
  }

  .article-meta {
    flex-direction: column;
    gap: 10px;
  }

  .article-navigation {
    flex-direction: column;
  }

  .article-navigation :deep(.el-button) {
    max-width: 100%;
  }
}
</style>

