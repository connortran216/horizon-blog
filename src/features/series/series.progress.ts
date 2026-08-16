const SERIES_PROGRESS_KEY = 'horizon_series_progress_v1'

interface StoredSeriesProgress {
  visitedPostIds: number[]
  updatedAt: string
}

type StoredSeriesProgressMap = Record<string, StoredSeriesProgress>

const resolveStorage = (storage?: Storage): Storage | null => {
  if (storage) return storage
  return typeof window === 'undefined' ? null : window.localStorage
}

const readProgressMap = (storage?: Storage): StoredSeriesProgressMap => {
  const target = resolveStorage(storage)
  if (!target) return {}
  try {
    const parsed = JSON.parse(target.getItem(SERIES_PROGRESS_KEY) || '{}') as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as StoredSeriesProgressMap
  } catch {
    return {}
  }
}

export const readSeriesProgress = (seriesId: number, storage?: Storage): number[] => {
  const record = readProgressMap(storage)[String(seriesId)]
  if (!record || !Array.isArray(record.visitedPostIds)) return []
  return Array.from(
    new Set(record.visitedPostIds.filter((postId) => Number.isInteger(postId) && postId > 0)),
  )
}

export const markSeriesPostVisited = (
  seriesId: number,
  postId: number,
  storage?: Storage,
): void => {
  const target = resolveStorage(storage)
  if (!target || seriesId <= 0 || postId <= 0) return
  try {
    const progress = readProgressMap(target)
    progress[String(seriesId)] = {
      visitedPostIds: Array.from(new Set([...readSeriesProgress(seriesId, target), postId])),
      updatedAt: new Date().toISOString(),
    }
    target.setItem(SERIES_PROGRESS_KEY, JSON.stringify(progress))
  } catch {
    // Progress is optional and must never block reading.
  }
}

export const visibleSeriesProgress = (
  visitedPostIds: number[],
  visiblePostIds: number[],
): number[] => {
  const visible = new Set(visiblePostIds)
  return visitedPostIds.filter((postId) => visible.has(postId))
}
