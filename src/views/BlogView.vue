<template>
  <div class="blog-view">
    <div class="container">
      <div class="page-header">
        <h1>技术博客</h1>
        <p>分享技术心得和开发经验</p>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章..."
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
          style="max-width: 400px; margin-right: 20px"
        />
        <el-select
          v-model="selectedTag"
          placeholder="选择标签"
          clearable
          @change="handleTagChange"
          style="width: 150px"
        >
          <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </div>

      <!-- 文章列表 -->
      <div v-loading="loading" class="articles-list">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" v-for="article in filteredArticles" :key="article.id">
            <ArticleCard :article="article" />
          </el-col>
        </el-row>

        <el-empty v-if="!loading && filteredArticles.length === 0" description="暂无文章" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getArticles, getAllTags, searchArticles, getArticlesByTag } from '@/services/data'
import ArticleCard from '@/components/blog/ArticleCard.vue'
import type { Article } from '@/types'

const loading = ref(false)
const articles = ref<Article[]>([])
const allTags = ref<string[]>([])
const searchKeyword = ref('')
const selectedTag = ref('')

const filteredArticles = computed(() => {
  return articles.value
})

const fetchArticles = async () => {
  loading.value = true
  try {
    articles.value = await getArticles()
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

const fetchTags = async () => {
  try {
    allTags.value = await getAllTags()
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

const handleSearch = async () => {
  if (searchKeyword.value) {
    loading.value = true
    try {
      articles.value = await searchArticles(searchKeyword.value)
      selectedTag.value = ''
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      loading.value = false
    }
  } else {
    fetchArticles()
  }
}

const handleTagChange = async () => {
  if (selectedTag.value) {
    loading.value = true
    try {
      articles.value = await getArticlesByTag(selectedTag.value)
      searchKeyword.value = ''
    } catch (error) {
      console.error('Filter by tag failed:', error)
    } finally {
      loading.value = false
    }
  } else {
    fetchArticles()
  }
}

onMounted(() => {
  fetchArticles()
  fetchTags()
})
</script>

<style scoped>
.blog-view {
  min-height: calc(100vh - 144px);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 36px;
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 16px;
  color: #606266;
}

.filter-section {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
}

.articles-list {
  min-height: 400px;
  margin-bottom: 40px;
}

.articles-list :deep(.el-col) {
  margin-bottom: 24px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 28px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section :deep(.el-input),
  .filter-section :deep(.el-select) {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }
}
</style>
