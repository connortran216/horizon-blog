/**
 * One scheduled publication, as the author sees it in their workspace.
 *
 * A scheduled publication is a draft with a timestamp on it, and nothing here
 * may say otherwise. `schedule-display.utils.ts` holds the real rules - the
 * five-minute grace window, and what "overdue" means - and this row only asks
 * them which of the three states it is in and paints the answer.
 *
 * The badge is a `StatusBadge`, which carries the state in words as well as in
 * a tone. The legacy row used a Chakra `Badge` with `colorScheme="blue"`,
 * `"purple"` and `"orange"`: three hues off the Chakra palette, carrying part of
 * the meaning in colour alone.
 */

import { Box, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'

import {
  Button,
  Heading,
  ResponsiveImage,
  Stack,
  StatusBadge,
  Surface,
  Text,
} from '../../../design-system'
import { componentTokens, space } from '../../../theme/tokens'
import { useResolvedCoverMedia } from '../../media/useResolvedCoverImage'
import { postCoverFrom } from '../../blog/postSummary.presentation'
import { ProfileBlogPost } from '../profile.types'
import { scheduleStatusPresentation } from '../profile.presentation'
import {
  formatLastUpdated,
  formatScheduleExact,
  formatScheduleRelative,
  formatScheduleTimezone,
  getScheduleDisplayState,
} from '../schedule-display.utils'

interface ProfileScheduledRowProps {
  blog: ProfileBlogPost
  now: Date
  onEdit: (blogId: string) => void
  onReschedule: (blogId: string) => void
  onPublishNow: (blogId: string) => void
  onCancelSchedule: (blog: ProfileBlogPost) => void
  onDelete: (blogId: string) => void
}

const ProfileScheduledRow = ({
  blog,
  now,
  onEdit,
  onReschedule,
  onPublishNow,
  onCancelSchedule,
  onDelete,
}: ProfileScheduledRowProps) => {
  const scheduledAt = blog.scheduledPublishAt || ''
  const status = scheduleStatusPresentation(getScheduleDisplayState(scheduledAt, now))
  const coverMedia = useResolvedCoverMedia(blog.featuredImage)
  // The row itself is decorative below - see `decorative` on `ResponsiveImage`
  // - so `alt` is never read. `postCoverFrom` still needs one to build the
  // rest of the cover, which is the point of calling it here: `src` becomes
  // the narrowest resized variant rather than `coverMedia.url`, which can be
  // the original, un-resized upload - see `articleCover.presentation.ts` for
  // the measured cost of shipping that upload to a 180px frame.
  const cover = postCoverFrom(coverMedia, blog.title)

  return (
    <Surface as="article" depth="raised">
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '180px minmax(0, 1fr)' }}
        gap={{ base: space[4], md: space[6] }}
        alignItems="start"
      >
        <ResponsiveImage
          aspectRatio="16 / 9"
          src={cover?.src}
          sources={cover?.sources}
          sizes="(max-width: 768px) 100vw, 180px"
          /*
           * Decorative. The heading beside it names the same post, and this row
           * already asks a screen reader to hear a status, a date, a timezone
           * and four controls.
           */
          decorative
          task="the cover image"
        />

        <Stack gap={4}>
          <Stack gap={3}>
            <Stack
              direction="row"
              gap={3}
              collapseAt={undefined}
              flexWrap="wrap"
              alignItems="center"
              justifyContent="space-between"
            >
              {/*
                `isLive` because this one changes while the page is open: the
                workspace ticks a clock every fifteen seconds, so a row can move
                from Scheduled to Publishing under a reader who is not looking.
              */}
              <StatusBadge tone={status.tone} isLive>
                {status.label}
              </StatusBadge>
              <Text recipe="metadata">{formatLastUpdated(blog.updatedAt)}</Text>
            </Stack>

            <Heading as="h3" recipe="cardTitle">
              {blog.title}
            </Heading>

            <Box>
              <Text recipe="body" fontWeight="semibold">
                {formatScheduleExact(scheduledAt)}
              </Text>
              <Text recipe="metadata" marginBlockStart={space[1]}>
                {formatScheduleTimezone(scheduledAt)} · {formatScheduleRelative(scheduledAt, now)}
              </Text>
              <Text recipe="metadata" marginBlockStart={space[1]}>
                Still a draft. It becomes readable only once the server publishes it.
              </Text>
            </Box>
          </Stack>

          <Stack
            direction="row"
            gap={3}
            collapseAt="sm"
            flexWrap="wrap"
            justifyContent={{ base: 'stretch', sm: 'flex-end' }}
          >
            <Button tone="secondary" onClick={() => onEdit(blog.id)}>
              Edit
            </Button>
            <Menu placement="bottom-end" isLazy>
              <MenuButton
                as={Button}
                tone="primary"
                iconEnd={<ChevronDownIcon aria-hidden="true" />}
                aria-label={`Manage the schedule for ${blog.title}`}
              >
                Manage
              </MenuButton>
              <MenuList zIndex="tooltip">
                <MenuItem onClick={() => onReschedule(blog.id)}>Reschedule</MenuItem>
                <MenuItem onClick={() => onPublishNow(blog.id)}>Publish now</MenuItem>
                <MenuItem onClick={() => onCancelSchedule(blog)}>Cancel schedule</MenuItem>
                <MenuItem
                  color={componentTokens.control.dangerFg}
                  onClick={() => onDelete(blog.id)}
                >
                  Delete blog
                </MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Stack>
      </Box>
    </Surface>
  )
}

export default ProfileScheduledRow
