/**
 * Search, topics and the filters currently in force.
 *
 * The design system's `FilterBar` owns all three, so this component is the
 * adapter between it and `useBlogArchive`: the bar is fully controlled and
 * holds no state, which is exactly what the archive needs - its filters live in
 * the query string, so the back button lands the reader on the filters they
 * left.
 *
 * The search field's value is the debounced local input rather than the
 * committed query, so typing stays responsive; the request still waits for the
 * hook's debounce.
 */

import type { ReactNode } from 'react'

import { FilterBar } from '../../../design-system'
import { BlogArchiveTag } from '../blog.types'

interface BlogFilterToolbarProps {
  popularTags: BlogArchiveTag[]
  activeTags: string[]
  searchInput: string
  onSearchChange: (value: string) => void
  loading: boolean
  /** Why the topic list could not be loaded. The chips are replaced, not hidden. */
  tagsError?: string | null
  onRetryTags?: () => void
  onToggleTag: (tagName: string) => void
  onClearQuery: () => void
  onRemoveTag: (tagName: string) => void
  onClearAll: () => void
  /** The result count line, when the page has one. */
  summary?: ReactNode
}

const BlogFilterToolbar = ({
  popularTags,
  activeTags,
  searchInput,
  onSearchChange,
  loading,
  tagsError = null,
  onRetryTags,
  onToggleTag,
  onClearQuery,
  onRemoveTag,
  onClearAll,
  summary,
}: BlogFilterToolbarProps) => (
  <FilterBar
    state={{ query: searchInput, selectedTags: activeTags }}
    tags={popularTags.map((tag) => ({
      id: String(tag.id),
      name: tag.name,
      count: tag.usage_count,
    }))}
    isLoading={loading}
    error={tagsError}
    onRetry={onRetryTags}
    onQueryChange={onSearchChange}
    onToggleTag={onToggleTag}
    onRemoveTag={onRemoveTag}
    onClearQuery={onClearQuery}
    onClearAll={onClearAll}
    searchLabel="Search blogs"
    searchPlaceholder="Search blogs and topics"
    summary={summary}
  />
)

export default BlogFilterToolbar
