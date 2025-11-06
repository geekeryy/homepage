import type { Article, Project, Profile } from '@/types'
import articlesData from '@/data/articles.json'
import projectsData from '@/data/projects.json'
import profileData from '@/data/profile.json'

// 获取所有文章
export const getArticles = async (): Promise<Article[]> => {
  // 模拟异步请求
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(articlesData as Article[])
    }, 300)
  })
}

// 根据 ID 获取文章
export const getArticleById = async (id: number): Promise<Article | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const article = articlesData.find((a) => a.id === id)
      resolve(article as Article | undefined)
    }, 300)
  })
}

// 根据标签筛选文章
export const getArticlesByTag = async (tag: string): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = articlesData.filter((a) => a.tags.includes(tag))
      resolve(filtered as Article[])
    }, 300)
  })
}

// 搜索文章
export const searchArticles = async (keyword: string): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = articlesData.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword.toLowerCase()) ||
          a.summary.toLowerCase().includes(keyword.toLowerCase())
      )
      resolve(filtered as Article[])
    }, 300)
  })
}

// 获取所有项目
export const getProjects = async (): Promise<Project[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(projectsData as Project[])
    }, 300)
  })
}

// 获取个人信息
export const getProfile = async (): Promise<Profile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(profileData as Profile)
    }, 300)
  })
}

// 获取所有标签
export const getAllTags = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tags = new Set<string>()
      articlesData.forEach((article) => {
        article.tags.forEach((tag) => tags.add(tag))
      })
      resolve(Array.from(tags))
    }, 300)
  })
}

