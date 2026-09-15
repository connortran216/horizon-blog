import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { MediaFrame, MediaPlaceholder } from '../index'
import { samplePost } from '../patterns/posts/fixtures'

const meta = {
  title: 'Design system/Media/MediaFrame',
  component: MediaFrame,
  args: {
    aspectRatio: '16 / 9',
  },
  render: (args) => (
    <Box width="100%" maxW="36rem">
      <MediaFrame {...args} />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'The single owner of reserved media geometry, clipping, background, and corner treatment across loading, ready, absent, failed, and retrying states.',
      },
    },
  },
} satisfies Meta<typeof MediaFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithImage: Story = {
  render: (args) => (
    <Box width="100%" maxW="36rem">
      <MediaFrame {...args}>
        <Box
          as="img"
          src={samplePost.cover?.src ?? undefined}
          alt={samplePost.cover?.alt ?? undefined}
          position="absolute"
          inset={0}
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </MediaFrame>
    </Box>
  ),
}

export const Loading: Story = {
  render: (args) => (
    <Box width="100%" maxW="36rem">
      <MediaFrame {...args}>
        <MediaPlaceholder variant="loading" task="the sample cover image" />
      </MediaFrame>
    </Box>
  ),
}

export const ContainerOwnedCorners: Story = {
  args: { radius: 'container' },
}
