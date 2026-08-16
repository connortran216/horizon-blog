import { describe, expect, it } from 'vitest'
import { markSeriesPostVisited, readSeriesProgress, visibleSeriesProgress } from './series.progress'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('series progress', () => {
  it('stores unique visited blogs per series in browser-local storage', () => {
    const storage = new MemoryStorage()

    markSeriesPostVisited(7, 42, storage)
    markSeriesPostVisited(7, 42, storage)
    markSeriesPostVisited(7, 43, storage)

    expect(readSeriesProgress(7, storage)).toEqual([42, 43])
    expect(readSeriesProgress(8, storage)).toEqual([])
  })

  it('ignores corrupt storage and hides progress for unpublished members', () => {
    const storage = new MemoryStorage()
    storage.setItem('horizon_series_progress_v1', '{broken')

    expect(readSeriesProgress(7, storage)).toEqual([])
    expect(visibleSeriesProgress([42, 43, 99], [42, 43])).toEqual([42, 43])
  })
})
