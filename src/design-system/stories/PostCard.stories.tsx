import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { PostCard } from '../index'
import {
  sampleLongPost,
  samplePost,
  samplePostWithBrokenCover,
  samplePostWithManyTags,
  samplePostWithoutMedia,
} from '../patterns/posts/fixtures'

const meta = {
  title: 'Design system/Editorial/PostCard',
  component: PostCard,
  args: {
    post: samplePost,
  },
  render: (args) => (
    <Box width="100%" maxW="24rem">
      <PostCard {...args} />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Ordinary discovery card for Blog, author archives, and related writing. It is intentionally quieter than SignatureStory and FeaturedStory.',
      },
    },
  },
} satisfies Meta<typeof PostCard>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {}

export const LongContent: Story = {
  args: { post: sampleLongPost },
}

export const WithoutMedia: Story = {
  args: { post: samplePostWithoutMedia },
}

export const ManyTopics: Story = {
  args: { post: samplePostWithManyTags },
}

export const BrokenMedia: Story = {
  args: { post: samplePostWithBrokenCover },
}
