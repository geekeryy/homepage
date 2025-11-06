<template>
  <div class="projects-view">
    <div class="container">
      <div class="page-header">
        <h1>项目作品集</h1>
        <p>探索我的开源项目和实战作品</p>
      </div>

      <!-- 项目列表 -->
      <div v-loading="loading" class="projects-list">
        <el-row :gutter="24">
          <el-col
            :xs="24"
            :sm="12"
            :md="8"
            v-for="project in projects"
            :key="project.id"
          >
            <ProjectCard :project="project" />
          </el-col>
        </el-row>

        <el-empty
          v-if="!loading && projects.length === 0"
          description="暂无项目"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getProjects } from '@/services/data'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import type { Project } from '@/types'

const loading = ref(false)
const projects = ref<Project[]>([])

const uniqueTechs = computed(() => {
  const techs = new Set<string>()
  projects.value.forEach(project => {
    project.techStack.forEach(tech => techs.add(tech))
  })
  return Array.from(techs)
})

const githubCount = computed(() => {
  return projects.value.filter(p => p.githubUrl).length
})

const demoCount = computed(() => {
  return projects.value.filter(p => p.demoUrl).length
})

const fetchProjects = async () => {
  loading.value = true
  try {
    projects.value = await getProjects()
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.projects-view {
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

.projects-list {
  min-height: 400px;
  margin-bottom: 60px;
}

.projects-list :deep(.el-col) {
  margin-bottom: 24px;
}

.project-stats {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 40px;
  border-radius: 16px;
  margin-bottom: 40px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 28px;
  }

  .project-stats {
    padding: 20px;
  }

  .stat-value {
    font-size: 28px;
  }
}
</style>

