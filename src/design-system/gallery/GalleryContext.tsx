/**
 * Horizon Design System v2 - gallery control context.
 *
 * One value carries the global controls plus everything derived from them, so
 * an entry renderer reads `gallery.post` rather than re-deriving the content and
 * media selection for the fortieth time.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { selectImage, selectPost, selectPosts, selectSeries, selectSeriesShelf } from './content'
import type { GalleryControls } from './types'
import type { PostSummary } from '../patterns/posts/content.logic'
import type { SeriesSummary } from '../patterns/series/series.logic'

export interface GalleryContextValue extends GalleryControls {
  /** The post fixture under the current content and media controls. */
  readonly post: PostSummary
  readonly posts: readonly PostSummary[]
  readonly series: SeriesSummary
  readonly seriesShelf: readonly SeriesSummary[]
  /** `null` when the media control is set to missing. */
  readonly image: string | null
  readonly isLong: boolean
  /** Pick between the ordinary string and the deliberately overlong one. */
  copy(normal: string, long: string): string
}

const GalleryContextObject = createContext<GalleryContextValue | undefined>(undefined)

export function useGallery(): GalleryContextValue {
  const value = useContext(GalleryContextObject)

  if (!value) {
    throw new Error('A gallery entry was rendered outside GalleryProvider.')
  }

  return value
}

export interface GalleryProviderProps {
  readonly controls: GalleryControls
  readonly children: ReactNode
}

export function GalleryProvider({ controls, children }: GalleryProviderProps) {
  const value = useMemo<GalleryContextValue>(() => {
    const isLong = controls.content === 'long'

    return {
      ...controls,
      isLong,
      post: selectPost(controls.content, controls.media),
      posts: selectPosts(controls.content, controls.media),
      series: selectSeries(controls.content, controls.media),
      seriesShelf: selectSeriesShelf(controls.content, controls.media),
      image: selectImage(controls.media),
      copy: (normal: string, long: string) => (isLong ? long : normal),
    }
  }, [controls])

  return <GalleryContextObject.Provider value={value}>{children}</GalleryContextObject.Provider>
}
