/**
 * Horizon Design System v2 - post discovery entries.
 */

import { useState } from 'react'
import { Box } from '@chakra-ui/react'

import {
  AuthorIdentity,
  FeaturedStory,
  FilterBar,
  Pagination,
  PostCard,
  PostMetadata,
  PostRow,
  SignatureStory,
  clearQuery,
  emptyFilterState,
  removeFilterTag,
  toggleTag,
  type FilterState,
} from '../../index'
import { space } from '../../../theme/tokens'
import {
  sampleAuthor,
  sampleAuthorWithoutAvatar,
  sampleFilterTags,
  sampleSortOptions,
} from '../../patterns/posts/fixtures'
import { useGallery } from '../GalleryContext'
import { samplePostInSeries, samplePostWithManyTags, samplePostWithoutMedia } from '../content'
import { type EntryRenderer } from './support'

function AuthorIdentityEntry({ state }: { readonly state: string }) {
  if (state === 'initials only') {
    return <AuthorIdentity author={sampleAuthorWithoutAvatar} size="md" />
  }

  if (state === 'unknown author') {
    return <AuthorIdentity author={null} size="md" />
  }

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      <AuthorIdentity author={sampleAuthor} size="sm" />
      <AuthorIdentity author={sampleAuthor} size="md" />
    </Box>
  )
}

function PostMetadataEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()
  const post = state === 'inside a Series' ? samplePostInSeries : gallery.post

  return <PostMetadata metadata={post.metadata} withAuthorAvatar showSeries />
}

function SignatureStoryEntry() {
  const gallery = useGallery()

  return <SignatureStory post={gallery.post} label="Latest" />
}

function FeaturedStoryEntry() {
  const gallery = useGallery()

  return <FeaturedStory post={gallery.post} label="Featured" />
}

function PostCardEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()

  if (state === 'no artwork') {
    return <PostCard post={samplePostWithoutMedia} />
  }

  if (state === 'many topics') {
    return <PostCard post={samplePostWithManyTags} />
  }

  return <PostCard post={gallery.post} />
}

function PostRowEntry({ state }: { readonly state: string }) {
  const gallery = useGallery()

  return (
    <Box display="flex" flexDirection="column" gap={space[3]}>
      {gallery.posts.slice(0, 3).map((post) => (
        <PostRow key={post.id} post={post} compact={state === 'compact'} />
      ))}
    </Box>
  )
}

function FilterBarEntry({ state }: { readonly state: string }) {
  const [filters, setFilters] = useState<FilterState>(
    state === 'filters active'
      ? { query: 'sample', selectedTags: ['networking'] }
      : emptyFilterState,
  )
  const [sort, setSort] = useState<string>('newest')

  return (
    <FilterBar
      state={filters}
      tags={state === 'loading tags' || state === 'tags failed' ? [] : sampleFilterTags}
      isLoading={state === 'loading tags'}
      error={state === 'tags failed' ? 'The sample topic list could not be loaded.' : null}
      onRetry={() => undefined}
      onQueryChange={(query) => setFilters((current) => ({ ...current, query }))}
      onToggleTag={(tag) => setFilters((current) => toggleTag(current, tag))}
      onRemoveTag={(tag) => setFilters((current) => removeFilterTag(current, tag))}
      onClearQuery={() => setFilters((current) => clearQuery(current))}
      onClearAll={() => setFilters(emptyFilterState)}
      sortOptions={sampleSortOptions}
      sortValue={sort}
      onSortChange={setSort}
    />
  )
}

function PaginationEntry({ state }: { readonly state: string }) {
  const [page, setPage] = useState(state === 'first page' ? 1 : 4)

  return (
    <Pagination
      page={page}
      pageSize={10}
      totalItems={94}
      onPageChange={setPage}
      compact={state === 'compact'}
    />
  )
}

export const postEntries = {
  AuthorIdentity: AuthorIdentityEntry,
  PostMetadata: PostMetadataEntry,
  SignatureStory: SignatureStoryEntry,
  FeaturedStory: FeaturedStoryEntry,
  PostCard: PostCardEntry,
  PostRow: PostRowEntry,
  FilterBar: FilterBarEntry,
  Pagination: PaginationEntry,
} satisfies Record<string, EntryRenderer>
