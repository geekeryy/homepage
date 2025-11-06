<template>
  <div class="news-view">
    <div class="container">
      <div class="page-header">
        <h1>每日新闻</h1>
        <p>获取最新的科技资讯和行业动态</p>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-container">
          <!-- 未读筛选 -->
          <el-checkbox
            v-model="showUnreadOnly"
            @change="handleUnreadFilterChange"
            size="large"
            class="unread-filter"
          >
            只看未读
          </el-checkbox>

          <!-- 分类筛选 -->
          <div class="category-filter">
            <el-radio-group v-model="selectedCategory" @change="handleFilterChange" size="default">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>

      <!-- 新闻列表 -->
      <div v-loading="loading" class="news-list">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" v-for="news in newsList" :key="news.id">
            <NewsCard :news="news" />
          </el-col>
        </el-row>

        <el-empty v-if="!loading && newsList.length === 0" description="暂无新闻" />
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[9, 18, 27, 36]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getNews, getNewsCategories } from '@/services/news'
import NewsCard from '@/components/news/NewsCard.vue'
import type { News } from '@/types'

const UNREAD_FILTER_KEY = 'news_show_unread_only'

const loading = ref(false)
const newsList = ref<News[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref('')
const showUnreadOnly = ref(false)
const currentPage = ref(1)
const pageSize = ref(9)
const total = ref(0)

// 从本地存储加载未读筛选状态
const loadUnreadFilterState = () => {
  try {
    const saved = localStorage.getItem(UNREAD_FILTER_KEY)
    if (saved !== null) {
      showUnreadOnly.value = saved === 'true'
    }
  } catch (error) {
    console.error('加载未读筛选状态失败:', error)
  }
}

// 保存未读筛选状态到本地存储
const saveUnreadFilterState = () => {
  try {
    localStorage.setItem(UNREAD_FILTER_KEY, showUnreadOnly.value.toString())
  } catch (error) {
    console.error('保存未读筛选状态失败:', error)
  }
}

const fetchNews = async () => {
  loading.value = true
  try {
    const result = await getNews({
      category: selectedCategory.value || undefined,
      readStatus: showUnreadOnly.value ? 'unread' : 'all',
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    newsList.value = result.data
    total.value = result.total
  } catch (error) {
    console.error('Failed to fetch news:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await getNewsCategories()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const handleUnreadFilterChange = () => {
  saveUnreadFilterState()
  currentPage.value = 1
  fetchNews()
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchNews()
}

const handlePageChange = () => {
  fetchNews()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = () => {
  currentPage.value = 1
  fetchNews()
}

onMounted(() => {
  loadUnreadFilterState()
  fetchCategories()
  fetchNews()
})
</script>

<style scoped>
.news-view {
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
  margin-bottom: 30px;
}

.filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.unread-filter {
  font-size: 15px;
  font-weight: 500;
}

.unread-filter :deep(.el-checkbox__label) {
  font-size: 15px;
  font-weight: 500;
  color: #909399;
}

.unread-filter:hover :deep(.el-checkbox__label) {
  color: #606266;
}

.unread-filter :deep(.el-checkbox__inner) {
  border-color: #dcdfe6;
}

.unread-filter:hover :deep(.el-checkbox__inner) {
  border-color: #909399;
}

.category-filter {
  display: flex;
  align-items: center;
}

.news-list {
  min-height: 400px;
  margin-bottom: 40px;
}

.news-list :deep(.el-col) {
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 28px;
  }

  .filter-container {
    flex-direction: column;
    gap: 16px;
  }

  .category-filter {
    width: 100%;
    overflow-x: auto;
  }

  .category-filter .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
