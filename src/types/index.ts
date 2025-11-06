// RSS源配置接口
export interface RSSSource {
  id: string
  name: string
  url: string
  category: string
  enabled: boolean
  description: string
}

// RSS源配置文件接口
export interface RSSConfig {
  sources: RSSSource[]
}

// 新闻接口
export interface News {
  id: number | string
  title: string
  summary: string
  source: string
  url: string
  category?: string
  publishedAt: string
  createdAt?: string
  imageUrl?: string
  author?: string
  uniqueId?: string // RSS源+title的唯一标识
  isRead?: boolean // 是否已读
}

// 新闻阅读状态
export interface NewsReadState {
  uniqueId: string
  readAt: number // 阅读时间戳
  newsTitle: string // 新闻标题（用于调试）
}

// 缓存配置
export interface CacheConfig {
  duration: number // 缓存时长（毫秒）
  enabled: boolean // 是否启用缓存
}

// 博客文章接口
export interface Article {
  id: number
  title: string
  summary: string
  content: string
  coverImage?: string
  tags: string[]
  createdAt: string
  readingTime: string
}

// 项目接口
export interface Project {
  id: number
  name: string
  description: string
  techStack: string[]
  imageUrl?: string
  githubUrl?: string
  demoUrl?: string
}

// 个人信息接口
export interface Profile {
  name: string
  title: string
  industry: string
  bio: string
  avatar: string
  skills: Skill[]
  education?: string
  timeline?: TimelineItem[]
  social: Social
  exploring?: Exploring[]
}

// 技能接口
export interface Skill {
  name: string
  level: number
  description?: string
}

// 社交媒体接口
export interface Social {
  github?: string
  linkedin?: string
  twitter?: string
  email: string
  wechat?: string
}

// 正在探索的技术接口
export interface Exploring {
  id: string
  name: string
  icon: string
  progress: number
  status: 'exploring' | 'researching' | 'practicing'
  description: string
  startDate: string
  reason?: string
}

// 功能卡片接口（首页用）
export interface FeatureCard {
  id: string
  icon: string
  title: string
  description: string
  route: string
  buttonText: string
}

// 时间线项接口
export interface TimelineItem {
  id: string
  type: 'work' | 'education'
  title: string
  organization: string
  description: string
  startYear: string
  startMonth: string
  endYear: string
  endMonth: string
  tags?: string[]
}
