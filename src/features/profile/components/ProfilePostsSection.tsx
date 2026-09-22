/**
 * The author's three collections - published, scheduled, drafts - on one panel.
 *
 * Composed from `Surface`, `Stack`, the typography recipes, `EmptyState` and
 * `PanelLoading`. The one thing it still reaches to Chakra for is `Tabs`: the
 * design system has no tab primitive, and a hand-built one here would be a
 * `div` with a click handler pretending to be a tablist. Chakra's is a real
 * `role="tablist"` with arrow-key navigation, so it stays and it is dressed in
 * tokens - `componentTokens.control` for the pill, `minTouchTarget` for the
 * height that used to be a hand-written `44px`.
 *
 * The counts stay mutually exclusive: a scheduled post is counted as scheduled
 * and nowhere else, which is what the backend means by the three views.
 */

import { useState } from 'react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import {
  EmptyState,
  Eyebrow,
  Heading,
  PanelLoading,
  Stack,
  StatusBadge,
  Surface,
} from '../../../design-system'
import { componentTokens, radii, space } from '../../../theme/tokens'
import { transitionFor, useMotionPolicy } from '../../../design-system/motion'
import { ProfileBlogPost, ProfilePaginationState } from '../profile.types'
import ProfileBlogGrid from './ProfileBlogGrid'
import ProfileScheduledList from './ProfileScheduledList'

interface ProfilePostsSectionProps {
  postsLoading: boolean
  profileUsername: string
  publishedBlogs: ProfileBlogPost[]
  scheduledBlogs: ProfileBlogPost[]
  draftBlogs: ProfileBlogPost[]
  publishedPagination: ProfilePaginationState
  scheduledPagination: ProfilePaginationState
  draftPagination: ProfilePaginationState
  scheduleClock: Date
  onPublishedPageChange: (page: number) => void
  onScheduledPageChange: (page: number) => void
  onDraftPageChange: (page: number) => void
  onEdit: (blogId: string) => void
  onReschedule: (blogId: string) => void
  onPublishNow: (blogId: string) => void
  onCancelSchedule: (blog: ProfileBlogPost) => void
  onDelete: (blogId: string) => void
}

/*
 * One pill. Every value is a token: the control radius, the control padding,
 * the touch floor, the workspace ground and the two action roles for the
 * selected state.
 */
const tabStyle = {
  borderRadius: radii.tag,
  paddingInline: componentTokens.control.paddingX,
  minHeight: componentTokens.control.minTouchTarget,
  bg: componentTokens.workspace.bg,
  color: componentTokens.control.quietFg,
  transitionProperty: 'common',
  transitionDuration: componentTokens.control.transition,
  transitionTimingFunction: 'standard',
  _selected: {
    bg: componentTokens.control.quietHoverBg,
    color: componentTokens.control.solidBg,
  },
} as const

function EditorialTray({
  active,
  lane,
  children,
}: React.PropsWithChildren<{ active: boolean; lane: string }>) {
  const policy = useMotionPolicy()

  return (
    <motion.div
      data-profile-tray={lane}
      data-active={active ? 'true' : 'false'}
      initial={false}
      animate={{
        opacity: active ? 1 : 0.72,
        x: active || !policy.translation ? 0 : 18,
        rotate: active || !policy.translation ? 0 : 0.35,
      }}
      transition={transitionFor('navigation', policy)}
      style={{ transformOrigin: 'top left' }}
    >
      {children}
    </motion.div>
  )
}

const ProfilePostsSection = ({
  postsLoading,
  profileUsername,
  publishedBlogs,
  scheduledBlogs,
  draftBlogs,
  publishedPagination,
  scheduledPagination,
  draftPagination,
  scheduleClock,
  onPublishedPageChange,
  onScheduledPageChange,
  onDraftPageChange,
  onEdit,
  onReschedule,
  onPublishNow,
  onCancelSchedule,
  onDelete,
}: ProfilePostsSectionProps) => {
  const [activeTab, setActiveTab] = useState(0)
  const totalBlogs = publishedPagination.total + scheduledPagination.total + draftPagination.total

  return (
    <Surface as="section" depth="raised">
      <Stack gap={6}>
        <Stack
          direction="row"
          gap={4}
          collapseAt="sm"
          flexWrap="wrap"
          alignItems={{ base: 'flex-start', sm: 'flex-end' }}
          justifyContent="space-between"
        >
          <Stack gap={2}>
            <Eyebrow as="p">Blogs</Eyebrow>
            <Heading as="h2" recipe="sectionTitle">
              Your blogs and works in progress
            </Heading>
          </Stack>
          <StatusBadge tone="neutral">{totalBlogs} total blogs</StatusBadge>
        </Stack>

        {postsLoading ? (
          <PanelLoading task="your blogs" />
        ) : (
          <Tabs variant="unstyled" index={activeTab} onChange={setActiveTab}>
            <TabList gap={space[3]} flexWrap="wrap">
              <Tab {...tabStyle}>Published ({publishedPagination.total})</Tab>
              <Tab {...tabStyle}>Scheduled ({scheduledPagination.total})</Tab>
              <Tab {...tabStyle}>Drafts ({draftPagination.total})</Tab>
            </TabList>
            <TabPanels>
              <TabPanel paddingInline={0} paddingBlockStart={space[6]}>
                <EditorialTray active={activeTab === 0} lane="published">
                  {publishedBlogs.length === 0 ? (
                    <EmptyState
                      subject="published blogs"
                      nextAction="Publish a draft, and it will appear here."
                    />
                  ) : (
                    <ProfileBlogGrid
                      blogs={publishedBlogs}
                      totalCount={publishedPagination.total}
                      currentPage={publishedPagination.page}
                      pageSize={publishedPagination.limit}
                      label="Published blogs pagination"
                      onPageChange={onPublishedPageChange}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      profileUsername={profileUsername}
                    />
                  )}
                </EditorialTray>
              </TabPanel>
              <TabPanel paddingInline={0} paddingBlockStart={space[6]}>
                <EditorialTray active={activeTab === 1} lane="scheduled">
                  {scheduledBlogs.length === 0 ? (
                    <EmptyState
                      subject="scheduled publications"
                      nextAction="Schedule a draft from the editor, and it will wait here until its time."
                    />
                  ) : (
                    <ProfileScheduledList
                      blogs={scheduledBlogs}
                      pagination={scheduledPagination}
                      now={scheduleClock}
                      onPageChange={onScheduledPageChange}
                      onEdit={onEdit}
                      onReschedule={onReschedule}
                      onPublishNow={onPublishNow}
                      onCancelSchedule={onCancelSchedule}
                      onDelete={onDelete}
                    />
                  )}
                </EditorialTray>
              </TabPanel>
              <TabPanel paddingInline={0} paddingBlockStart={space[6]}>
                <EditorialTray active={activeTab === 2} lane="drafts">
                  {draftBlogs.length === 0 ? (
                    <EmptyState
                      subject="drafts"
                      nextAction="Start a blog in the editor, and it will be saved here."
                    />
                  ) : (
                    <ProfileBlogGrid
                      blogs={draftBlogs}
                      totalCount={draftPagination.total}
                      currentPage={draftPagination.page}
                      pageSize={draftPagination.limit}
                      label="Draft blogs pagination"
                      onPageChange={onDraftPageChange}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      profileUsername={profileUsername}
                    />
                  )}
                </EditorialTray>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Stack>
    </Surface>
  )
}

export default ProfilePostsSection
