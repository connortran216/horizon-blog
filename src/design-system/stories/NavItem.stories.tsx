import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { NavItem } from '../index'

const meta = {
  title: 'Design system/Navigation/NavItem',
  component: NavItem,
  args: {
    children: 'Blog',
    to: '/blog',
  },
  render: (args) => (
    <Box as="nav" aria-label="Sample navigation">
      <NavItem {...args} />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'One accessible navigation entry. It renders a router link, anchor, or button according to intent and keeps the visual current state aligned with aria-current.',
      },
    },
  },
} satisfies Meta<typeof NavItem>

export default meta
type Story = StoryObj<typeof meta>

export const RouterLink: Story = {}

export const ExternalLink: Story = {
  args: {
    href: 'https://example.com/sample-destination',
    to: undefined,
  },
}

export const CurrentCommand: Story = {
  args: {
    isCurrent: true,
    to: undefined,
  },
}

export const DisabledCommand: Story = {
  args: {
    isDisabled: true,
    to: undefined,
  },
}
