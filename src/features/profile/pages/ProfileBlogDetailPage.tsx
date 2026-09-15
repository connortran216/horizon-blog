/**
 * An author reading their own blog, draft or published.
 *
 * The same `BlogReaderFrame` the public page uses, so a draft is read in the
 * frame it will be published in. `useOwnerBlogPostDetail` still owns the
 * ownership check and the redirect; nothing about permissions moved.
 *
 * The two hand-rolled Framer Motion entrances are gone. Their `y: 30` and
 * `y: 10` translations moved the title and the notice on every visit, which is
 * the document movement `DESIGN.md` rules out on a reading surface - and both
 * ran regardless of the reader's motion preference.
 */

import { useNavigate, useParams } from 'react-router-dom'
import { Box } from '@chakra-ui/react'

import { Heading, StatusBadge, Text } from '../../../design-system'
import { space } from '../../../theme/tokens'
import { useAuth } from '../../../context/AuthContext'
import { useResolvedMarkdownMedia } from '../../media/useResolvedMarkdown'
import BlogReaderFrame from '../../blog/components/BlogReaderFrame'
import { useOwnerBlogPostDetail } from '../useOwnerBlogPostDetail'

const ProfileBlogDetailPage = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const redirectPath = user?.username ? `/profile/${user.username}` : `/profile/${username}`

  const { post, loading } = useOwnerBlogPostDetail({
    redirectPath,
    routeUsername: username,
    authenticatedUserId: user?.id,
    authenticatedUsername: user?.username,
  })

  const resolvedMedia = useResolvedMarkdownMedia(post?.content_markdown || '')

  const isOwnProfile = user && username === user.username

  return (
    <BlogReaderFrame
      post={post}
      loading={loading}
      isMissing={!loading && !post}
      resolvedContent={resolvedMedia.content}
      resolvedMedia={resolvedMedia.sources}
      onBack={() => navigate(redirectPath)}
      backLabel="Back to Profile"
      titleSection={
        post ? (
          <Box display="flex" flexWrap="wrap" alignItems="center" gap={space[3]}>
            <Heading as="h1" recipe="pageTitle" minW={0}>
              {post.title}
            </Heading>
            {post.status === 'draft' ? <StatusBadge tone="warning">Draft</StatusBadge> : null}
          </Box>
        ) : null
      }
      helperSection={
        isOwnProfile ? (
          <Text as="p" recipe="metadata">
            This is a read-only view. To edit this blog, go back to your profile and use the Edit
            option from the menu.
          </Text>
        ) : null
      }
    />
  )
}

export default ProfileBlogDetailPage
