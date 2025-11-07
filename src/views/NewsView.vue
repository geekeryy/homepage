<template>
  <div class="news-view">
    <div class="container">
      <div class="page-header">
        <div class="header-title">
          <h1>每日新闻</h1>
          <el-button
            :icon="Refresh"
            :loading="refreshing"
            circle
            size="large"
            class="refresh-btn"
            @click="handleRefresh"
            title="刷新新闻"
          />
        </div>
        <p>获取最新的科技资讯和行业动态</p>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-container">
          <div class="left-filters">
            <!-- 未读筛选 -->
            <el-checkbox
              v-model="showUnreadOnly"
              @change="handleUnreadFilterChange"
              size="large"
              class="unread-filter"
            >
              只看未读
            </el-checkbox>

            <!-- 一级分类筛选 -->
            <div class="category-filter">
              <el-radio-group
                v-model="selectedCategory"
                @change="handleFilterChange"
                size="default"
              >
                <el-radio-button value="">全部</el-radio-button>
                <el-radio-button v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </el-radio-button>
              </el-radio-group>
            </div>

            <!-- 二级分类筛选（源名称） -->
            <div v-if="availableSources.length > 0" class="source-filter">
              <el-select
                v-model="selectedSource"
                @change="handleSourceFilterChange"
                placeholder="选择来源"
                clearable
                size="default"
              >
                <el-option
                  v-for="source in availableSources"
                  :key="source"
                  :label="source"
                  :value="source"
                />
              </el-select>
            </div>
          </div>

          <!-- 视图切换 -->
          <div class="view-toggle">
            <el-radio-group v-model="viewMode" @change="handleViewModeChange" size="default">
              <el-radio-button value="grid">
                <el-icon><Grid /></el-icon>
                <!-- <span class="view-label">网格</span> -->
              </el-radio-button>
              <el-radio-button value="list">
                <el-icon><List /></el-icon>
                <!-- <span class="view-label">列表</span> -->
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>

      <!-- 新闻列表 -->
      <div v-loading="loading" class="news-list" :class="{ 'list-view': viewMode === 'list' }">
        <!-- 网格视图 -->
        <el-row v-if="viewMode === 'grid'" :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" v-for="news in newsList" :key="news.id">
            <NewsCard :news="news" @read-status-changed="fetchNews" />
          </el-col>
        </el-row>

        <!-- 列表视图 -->
        <div v-else class="list-container">
          <NewsCard 
            v-for="news in newsList" 
            :key="news.id" 
            :news="news" 
            class="list-item"
            @read-status-changed="fetchNews"
          />
        </div>

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
import { ref, onMounted, computed } from 'vue'
import { getNews, getNewsCategories, getCategoriesWithSources, refreshNews } from '@/services/news'
import NewsCard from '@/components/news/NewsCard.vue'
import type { News } from '@/types'
import { Refresh, Grid, List } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const UNREAD_FILTER_KEY = 'news_show_unread_only'
const VIEW_MODE_KEY = 'news_view_mode'

const loading = ref(false)
const refreshing = ref(false)
const newsList = ref<News[]>([])
const categories = ref<string[]>([])
const categoriesWithSources = ref<Record<string, string[]>>({})
const selectedCategory = ref('')
const selectedSource = ref('')
const showUnreadOnly = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const pageSize = ref(9)
const total = ref(0)

// 计算当前分类下的源列表（二级分类）
const availableSources = computed(() => {
  if (!selectedCategory.value) {
    // 如果没有选择分类，返回所有源
    return Object.values(categoriesWithSources.value).flat()
  }
  return categoriesWithSources.value[selectedCategory.value] || []
})

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

// 从本地存储加载视图模式
const loadViewMode = () => {
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY)
    if (saved && (saved === 'grid' || saved === 'list')) {
      viewMode.value = saved as 'grid' | 'list'
    }
  } catch (error) {
    console.error('加载视图模式失败:', error)
  }
}

// 保存视图模式到本地存储
const saveViewMode = () => {
  try {
    localStorage.setItem(VIEW_MODE_KEY, viewMode.value)
  } catch (error) {
    console.error('保存视图模式失败:', error)
  }
}

const fetchNews = async () => {
  loading.value = true
  try {
    const result = await getNews({
      category: selectedCategory.value || undefined,
      source: selectedSource.value || undefined,
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
    categoriesWithSources.value = getCategoriesWithSources()
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
  // 切换一级分类时，清空二级分类选择
  selectedSource.value = ''
  currentPage.value = 1
  fetchNews()
}

const handleSourceFilterChange = () => {
  currentPage.value = 1
  fetchNews()
}

const handleViewModeChange = () => {
  saveViewMode()
}

const handlePageChange = () => {
  fetchNews()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = () => {
  currentPage.value = 1
  fetchNews()
}

const handleRefresh = async () => {
  try {
    refreshing.value = true
    ElMessage.info('正在刷新新闻...')

    // 调用刷新函数重新获取RSS数据
    await refreshNews()

    // 刷新完成后重新加载新闻列表
    currentPage.value = 1
    await fetchNews()

    ElMessage.success('新闻刷新成功！')
  } catch (error) {
    console.error('刷新新闻失败:', error)
    ElMessage.error('刷新新闻失败，请稍后再试')
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadUnreadFilterState()
  loadViewMode()
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

.header-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 10px;
}

.page-header h1 {
  font-size: 36px;
  color: #303133;
  margin: 0;
}

.refresh-btn {
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: rotate(180deg);
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

.left-filters {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  flex: 1;
}

.view-toggle {
  display: flex;
  align-items: center;
}

.view-toggle :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-label {
  display: inline-block;
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

.source-filter {
  display: flex;
  align-items: center;
}

.source-filter .el-select {
  min-width: 200px;
}

.news-list {
  min-height: 400px;
  margin-bottom: 40px;
}

.news-list :deep(.el-col) {
  margin-bottom: 24px;
}

/* 列表视图样式 */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-container .list-item {
  width: 100%;
}

.list-container :deep(.el-card) {
  border-radius: 8px;
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

  .left-filters {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .view-toggle {
    width: 100%;
    justify-content: center;
  }

  .view-toggle .el-radio-group {
    width: 100%;
  }

  .view-label {
    display: none;
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

  .source-filter {
    width: 100%;
  }

  .source-filter .el-select {
    width: 100%;
  }

  .pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
