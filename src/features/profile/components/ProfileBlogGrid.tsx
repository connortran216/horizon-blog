/**
 * The owner's published and draft blogs, as cards.
 *
 * `PostCard` draws the card and `Pagination` draws the pager, so what is left
 * here is the two things the design system deliberately does not know: that a
 * cover has to be resolved through `useResolvedCoverMedia` before it is a URL,
 * and that an owner gets an Edit/Delete menu the public never sees.
 *
 * The menu sits above the card's own link overlay rather than inside it. A
 * `PostCard` is one anchor covering the whole card - `cardLinkOverlayStyle` -
 * so a control drawn inside it would be unreachable by pointer; it is a sibling
 * in a positioned wrapper instead, which also keeps it in the tab order right
 * after the title it belongs to.
 */

import { useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { FiMoreVertical } from 'react-icons/fi'

import { Grid, IconButton, Pagination, PostCard, Stack } from '../../../design-system'
import { componentTokens, space } from '../../../theme/tokens'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'
import { ProfileBlogPost } from '../profile.types'
import { ownerPostLabel, toOwnerPostSummary } from '../profile.presentation'

/** Three columns from `lg`, the same rhythm as the Blog archive. */
const COVER_SIZES = '(min-width: 1024px) 33vw, 100vw'

interface ProfileBlogGridProps {
  blogs: ProfileBlogPost[]
  totalCount: number
  currentPage: number
  pageSize: number
  label: string
  onPageChange: (page: number) => void
  onEdit: (blogId: string) => void
  onDelete: (blogId: string) => void
  profileUsername: string
}

interface ProfileBlogCardProps {
  blog: ProfileBlogPost
  profileUsername: string
  onEdit: (blogId: string) => void
  onDelete: (blogId: string) => void
}

const ProfileBlogCard = ({ blog, profileUsername, onEdit, onDelete }: ProfileBlogCardProps) => {
  const coverMedia = useResolvedCoverMedia(blog.featuredImage)
  const post = toOwnerPostSummary(blog, coverMedia, profileUsername, COVER_SIZES)

  return (
    <Box position="relative">
      <PostCard post={post} label={ownerPostLabel(blog.status)} coverSizes={COVER_SIZES} />

      <Box position="absolute" insetBlockStart={space[2]} insetInlineEnd={space[2]} zIndex={2}>
        {/*
          `fixed`: a closed menu's popper still sits in the layout, and on an
          unboxed page nothing clips it - absolute, it widened the document at
          375px. Fixed poppers never count towards the page's scroll width.
        */}
        <Menu isLazy lazyBehavior="unmount" placement="bottom-end" strategy="fixed">
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical />}
            tone="quiet"
            size="sm"
            label={`Manage ${blog.title}`}
          />
          <MenuList zIndex="tooltip">
            <MenuItem onClick={() => onEdit(blog.id)}>Edit blog</MenuItem>
            <MenuItem color={componentTokens.control.dangerFg} onClick={() => onDelete(blog.id)}>
              Delete blog
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  )
}

const ProfileBlogGrid = ({
  blogs,
  totalCount,
  currentPage,
  pageSize,
  label,
  onPageChange,
  onEdit,
  onDelete,
  profileUsername,
}: ProfileBlogGridProps) => {
  // The block the pager pages: the grid and the pager together, so changing
  // page puts the top of the tab's cards back on screen and moves focus there.
  const regionRef = useRef<HTMLElement>(null)

  return (
    <Stack ref={regionRef} gap={6}>
      <Grid as="ul" columns={3} gap={6} collapseAt="lg">
        {blogs.map((blog) => (
          <Box as="li" key={blog.id} listStyleType="none" display="flex">
            <Box flex="1" minW={0}>
              <ProfileBlogCard
                blog={blog}
                profileUsername={profileUsername}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </Box>
          </Box>
        ))}
      </Grid>

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        totalItems={totalCount}
        onPageChange={onPageChange}
        regionRef={regionRef}
        label={label}
      />
    </Stack>
  )
}

export default ProfileBlogGrid
