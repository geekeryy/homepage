import type { CacheConfig } from '@/types'

/**
 * 新闻缓存配置
 */
export const NEWS_CACHE_CONFIG: CacheConfig = {
  // 缓存时长：30分钟（单位：毫秒）
  duration: 30 * 60 * 1000,
  // 是否启用缓存
  enabled: true,
}

/**
 * 获取缓存时长（毫秒）
 */
export const getCacheDuration = (): number => {
  return NEWS_CACHE_CONFIG.duration
}

/**
 * 设置缓存时长
 * @param minutes 缓存时长（分钟）
 */
export const setCacheDuration = (minutes: number): void => {
  NEWS_CACHE_CONFIG.duration = minutes * 60 * 1000
  console.log(`📝 缓存时长已设置为 ${minutes} 分钟`)
}

/**
 * 是否启用缓存
 */
export const isCacheEnabled = (): boolean => {
  return NEWS_CACHE_CONFIG.enabled
}

/**
 * 启用/禁用缓存
 */
export const setCacheEnabled = (enabled: boolean): void => {
  NEWS_CACHE_CONFIG.enabled = enabled
  console.log(`📝 缓存已${enabled ? '启用' : '禁用'}`)
}

