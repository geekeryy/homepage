import type { News, RSSConfig } from '@/types'
import rssConfig from '@/data/rss.json'
import { getCacheDuration, isCacheEnabled } from '@/config/news.config'
import { generateNewsUniqueId, getReadStates, cleanupExpiredReadStates } from './newsStorage'

// 缓存新闻数据和获取时间
interface NewsCache {
  data: News[]
  fetchedAt: number
}

const NEWS_CACHE_KEY = 'news_cache'

let newsCache: NewsCache | null = null

// 从 localStorage 加载缓存
const loadCacheFromStorage = (): NewsCache | null => {
  try {
    const cached = localStorage.getItem(NEWS_CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached) as NewsCache
    return parsed
  } catch (error) {
    console.error('加载新闻缓存失败:', error)
    return null
  }
}

// 保存缓存到 localStorage
const saveCacheToStorage = (cache: NewsCache): void => {
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('保存新闻缓存失败:', error)
  }
}

// 清除 localStorage 中的缓存
const clearCacheFromStorage = (): void => {
  try {
    localStorage.removeItem(NEWS_CACHE_KEY)
  } catch (error) {
    console.error('清除新闻缓存失败:', error)
  }
}

// 初始化时从 localStorage 恢复缓存
newsCache = loadCacheFromStorage()

// 使用本地代理API（开发环境）或直接访问（如果RSS源支持CORS）
const getProxiedUrl = (url: string): string => {
  // 在开发环境使用本地代理
  if (import.meta.env.DEV) {
    return `/api/rss?url=${encodeURIComponent(url)}`
  }
  // 生产环境直接尝试访问（某些RSS源支持CORS）
  // 如果不支持，后续需要配置生产环境的代理
  return url
}

// 浏览器兼容的 RSS 解析器
const parseRSSFromXML = (xmlText: string, sourceName: string, sourceCategory: string): News[] => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

  // 检查是否有解析错误
  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    throw new Error('XML 解析失败')
  }

  const items: News[] = []

  // 尝试解析 RSS 2.0 格式
  let itemElements = xmlDoc.querySelectorAll('item')

  // 如果没有找到，尝试解析 Atom 格式
  if (itemElements.length === 0) {
    itemElements = xmlDoc.querySelectorAll('entry')
  }

  itemElements.forEach((item, index) => {
    // 获取标题
    const titleEl = item.querySelector('title')
    const title = titleEl?.textContent || '无标题'

    // 获取链接
    let link = ''
    const linkEl = item.querySelector('link')
    if (linkEl) {
      // RSS 格式
      link = linkEl.textContent || linkEl.getAttribute('href') || ''
    }

    // 获取描述/摘要
    let summary = ''
    const descEl = item.querySelector('description')
    const summaryEl = item.querySelector('summary')
    const contentEl = item.querySelector('content\\:encoded, encoded')

    if (descEl?.textContent) {
      summary = descEl.textContent
    } else if (summaryEl?.textContent) {
      summary = summaryEl.textContent
    } else if (contentEl?.textContent) {
      summary = contentEl.textContent
    }

    // 清理 HTML 标签和 CDATA
    summary = summary
      .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()

    // 限制摘要长度
    if (summary.length > 200) {
      summary = summary.substring(0, 200) + '...'
    }

    // 获取发布日期
    const pubDateEl = item.querySelector('pubDate, published, updated')
    const publishedAt = pubDateEl?.textContent || new Date().toISOString()

    // 获取作者
    const authorEl = item.querySelector('author, creator, dc\\:creator')
    const author = authorEl?.textContent || undefined

    // 尝试获取图片
    let imageUrl: string | undefined
    const thumbnailEl = item.querySelector('media\\:thumbnail, thumbnail')
    const mediaContentEl = item.querySelector('media\\:content, content')
    const enclosureEl = item.querySelector('enclosure[type^="image"]')

    if (thumbnailEl) {
      imageUrl = thumbnailEl.getAttribute('url') || undefined
    } else if (mediaContentEl) {
      imageUrl = mediaContentEl.getAttribute('url') || undefined
    } else if (enclosureEl) {
      imageUrl = enclosureEl.getAttribute('url') || undefined
    }

    // 生成唯一 ID
    const guid = item.querySelector('guid, id')?.textContent || link || `${index}`
    const id = `${sourceName}-${guid}`.replace(/[^a-zA-Z0-9-]/g, '-')

    // 生成唯一标识符（用于阅读状态追踪）
    const uniqueId = generateNewsUniqueId(sourceName, title)

    if (title && link) {
      items.push({
        id,
        title,
        summary: summary || '暂无摘要',
        source: sourceName,
        url: link,
        category: sourceCategory,
        publishedAt,
        author,
        imageUrl,
        uniqueId,
        isRead: false, // 初始状态，后续会更新
      })
    }
  })

  return items
}

// 从单个RSS源获取新闻
const fetchFromRSSSource = async (
  sourceId: string,
  sourceUrl: string,
  sourceName: string,
  sourceCategory: string,
): Promise<News[]> => {
  try {
    console.log(`正在从 ${sourceName} 获取RSS新闻...`)

    // 使用代理URL
    const proxiedUrl = getProxiedUrl(sourceUrl)
    const response = await fetch(proxiedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const xmlText = await response.text()
    const items = parseRSSFromXML(xmlText, sourceName, sourceCategory)
    console.log(`✅ 从 ${sourceName} 获取了 ${items.length} 条新闻`)
    return items
  } catch (error) {
    console.error(`❌ 获取 ${sourceName} RSS失败:`, error)
    return []
  }
}

// 从所有已启用的RSS源获取新闻
const fetchAllRSSNews = async (): Promise<News[]> => {
  const config = rssConfig as RSSConfig
  const enabledSources = config.sources.filter((source) => source.enabled)

  console.log(`正在从 ${enabledSources.length} 个RSS源获取新闻...`)

  // 并行获取所有RSS源的新闻
  const newsPromises = enabledSources.map((source) =>
    fetchFromRSSSource(source.id, source.url, source.name, source.category),
  )

  const newsArrays = await Promise.all(newsPromises)

  // 合并所有新闻并按发布时间排序
  const allNews = newsArrays.flat()
  allNews.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  // 更新新闻的阅读状态
  const readStates = getReadStates()
  allNews.forEach((news) => {
    if (news.uniqueId) {
      news.isRead = readStates.has(news.uniqueId)
    }
  })

  // 清理过期的阅读记录
  const validUniqueIds = new Set(
    allNews.map((news) => news.uniqueId).filter((id): id is string => !!id),
  )
  cleanupExpiredReadStates(validUniqueIds)

  console.log(`✅ 总共获取 ${allNews.length} 条新闻`)
  return allNews
}

// 获取新闻列表（带缓存）
export const getNews = async (params?: {
  category?: string
  readStatus?: string // 'all' | 'unread' | 'read'
  page?: number
  pageSize?: number
}): Promise<{ data: News[]; total: number }> => {
  // 检查缓存
  const now = Date.now()
  const cacheDuration = getCacheDuration()
  const cacheEnabled = isCacheEnabled()

  if (cacheEnabled && newsCache && now - newsCache.fetchedAt < cacheDuration) {
    console.log(
      `使用缓存的新闻数据（缓存剩余 ${Math.floor((cacheDuration - (now - newsCache.fetchedAt)) / 1000 / 60)} 分钟）`,
    )

    // 即使使用缓存，也要更新阅读状态
    const readStates = getReadStates()
    newsCache.data.forEach((news) => {
      if (news.uniqueId) {
        news.isRead = readStates.has(news.uniqueId)
      }
    })
  } else {
    // 获取新数据并更新缓存
    try {
      const allNews = await fetchAllRSSNews()
      newsCache = {
        data: allNews,
        fetchedAt: now,
      }
      // 保存到 localStorage
      saveCacheToStorage(newsCache)
      console.log(`✅ 新闻缓存已更新，有效期 ${cacheDuration / 1000 / 60} 分钟`)
    } catch (error) {
      console.error('获取RSS新闻失败:', error)
      // 如果有旧缓存，继续使用
      if (!newsCache) {
        return { data: [], total: 0 }
      }
    }
  }

  let filtered = [...newsCache.data]

  // 按分类筛选
  if (params?.category) {
    filtered = filtered.filter((news) => news.category === params.category)
  }

  // 按阅读状态筛选
  if (params?.readStatus && params.readStatus !== 'all') {
    if (params.readStatus === 'unread') {
      filtered = filtered.filter((news) => !news.isRead)
    } else if (params.readStatus === 'read') {
      filtered = filtered.filter((news) => news.isRead)
    }
  }

  // 分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paged = filtered.slice(start, end)

  return {
    data: paged,
    total: filtered.length,
  }
}

// 获取新闻分类
export const getNewsCategories = async (): Promise<string[]> => {
  // 从RSS配置中获取所有启用源的分类
  const config = rssConfig as RSSConfig
  const categories = new Set(
    config.sources.filter((source) => source.enabled).map((source) => source.category),
  )
  return Array.from(categories)
}

// 获取RSS源配置
export const getRSSSources = (): RSSConfig => {
  return rssConfig as RSSConfig
}

// 手动刷新新闻缓存
export const refreshNews = async (): Promise<void> => {
  console.log('手动刷新新闻...')
  const allNews = await fetchAllRSSNews()
  newsCache = {
    data: allNews,
    fetchedAt: Date.now(),
  }
  // 保存到 localStorage
  saveCacheToStorage(newsCache)
  console.log('✅ 新闻缓存已刷新并保存')
}

// 清除新闻缓存
export const clearNewsCache = (): void => {
  newsCache = null
  clearCacheFromStorage()
  console.log('🧹 新闻缓存已清除')
}
