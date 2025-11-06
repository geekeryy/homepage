import type { NewsReadState } from '@/types'

const READ_STATE_KEY = 'news_read_state'

/**
 * 生成新闻的唯一标识符
 * 使用 RSS源名称 + 新闻标题 的组合
 */
export const generateNewsUniqueId = (source: string, title: string): string => {
  // 清理并规范化字符串
  const cleanSource = source.trim().toLowerCase().replace(/\s+/g, '-')
  const cleanTitle = title.trim()
  // 使用简单哈希生成更短的ID
  return `${cleanSource}::${hashString(cleanTitle)}`
}

/**
 * 简单的字符串哈希函数
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash).toString(36)
}

/**
 * 获取所有已读新闻状态
 */
export const getReadStates = (): Map<string, NewsReadState> => {
  try {
    const data = localStorage.getItem(READ_STATE_KEY)
    if (!data) return new Map()

    const states: Record<string, NewsReadState> = JSON.parse(data)
    return new Map(Object.entries(states))
  } catch (error) {
    console.error('读取新闻阅读状态失败:', error)
    return new Map()
  }
}

/**
 * 标记新闻为已读
 */
export const markNewsAsRead = (uniqueId: string, newsTitle: string): void => {
  try {
    const states = getReadStates()
    states.set(uniqueId, {
      uniqueId,
      readAt: Date.now(),
      newsTitle,
    })

    const statesObj = Object.fromEntries(states)
    localStorage.setItem(READ_STATE_KEY, JSON.stringify(statesObj))
    console.log(`✅ 标记新闻为已读: ${newsTitle}`)
  } catch (error) {
    console.error('保存新闻阅读状态失败:', error)
  }
}

/**
 * 检查新闻是否已读
 */
export const isNewsRead = (uniqueId: string): boolean => {
  const states = getReadStates()
  return states.has(uniqueId)
}

/**
 * 清理过期的阅读记录
 * @param validUniqueIds 当前有效的新闻ID列表
 */
export const cleanupExpiredReadStates = (validUniqueIds: Set<string>): void => {
  try {
    const states = getReadStates()
    let cleanedCount = 0

    // 删除不在有效列表中的记录
    for (const [uniqueId] of states) {
      if (!validUniqueIds.has(uniqueId)) {
        states.delete(uniqueId)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      const statesObj = Object.fromEntries(states)
      localStorage.setItem(READ_STATE_KEY, JSON.stringify(statesObj))
      console.log(`🧹 清理了 ${cleanedCount} 条过期的阅读记录`)
    }
  } catch (error) {
    console.error('清理阅读记录失败:', error)
  }
}

/**
 * 清空所有阅读记录
 */
export const clearAllReadStates = (): void => {
  try {
    localStorage.removeItem(READ_STATE_KEY)
    console.log('🧹 已清空所有阅读记录')
  } catch (error) {
    console.error('清空阅读记录失败:', error)
  }
}

/**
 * 获取阅读统计
 */
export const getReadStatistics = (): {
  totalRead: number
  oldestRead: number | null
  newestRead: number | null
} => {
  const states = getReadStates()
  const readTimes = Array.from(states.values()).map((s) => s.readAt)

  return {
    totalRead: states.size,
    oldestRead: readTimes.length > 0 ? Math.min(...readTimes) : null,
    newestRead: readTimes.length > 0 ? Math.max(...readTimes) : null,
  }
}

