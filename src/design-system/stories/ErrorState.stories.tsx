import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ErrorState, RetryAction } from '../index'

const meta = {
  title: 'Design system/Feedback/ErrorState',
  component: ErrorState,
  args: {
    failedAction: 'load the sample article',
    detail: 'The Storybook catalog has no backend, so this failure is simulated.',
  },
  render: (args) => (
    <Box width="100%" maxW="42rem">
      <ErrorState {...args} />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Names the failed action and gives the caller control over whether recovery is available. Raw exception text does not belong here.',
      },
    },
  },
} satisfies Meta<typeof ErrorState>

export default meta
type Story = StoryObj<typeof meta>

export const WithoutRetry: Story = {}

export const WithRetry: Story = {
  args: {
    children: <RetryAction failedAction="load the sample article" onRetry={() => undefined} />,
  },
}

export const LongDetail: Story = {
  args: {
    detail:
      'The request reached the service, but the response could not be read. Try again after checking the connection. If the problem continues, return to the Blog index.',
  },
}
