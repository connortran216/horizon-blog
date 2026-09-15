import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '../index'

const meta = {
  title: 'Design system/Actions/Button',
  component: Button,
  args: {
    children: 'Publish blog',
    size: 'md',
    tone: 'primary',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Native button for in-page actions. Use ActionLink when navigation should look like an action.',
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { tone: 'secondary' },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    loadingLabel: 'Publishing blog',
  },
}

export const Disabled: Story = {
  args: { isDisabled: true },
}

export const Danger: Story = {
  args: {
    children: 'Delete draft',
    tone: 'danger',
  },
}
