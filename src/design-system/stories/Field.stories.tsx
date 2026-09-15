import type { Meta, StoryObj } from '@storybook/react-vite'

import { Field, Input } from '../index'

const meta = {
  title: 'Design system/Forms/Field',
  component: Field,
  args: {
    id: 'storybook-email',
    label: 'Email address',
    children: <Input placeholder="sample.author@example.com" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Owns the accessible relationship between a label, one control, hint text, validation, and status messages.',
      },
    },
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {}

export const RequiredWithHint: Story = {
  args: {
    id: 'storybook-email-required',
    hint: 'We only use this to send the confirmation link.',
    isRequired: true,
  },
}

export const Invalid: Story = {
  args: {
    id: 'storybook-email-invalid',
    hint: 'We only use this to send the confirmation link.',
    error: 'That address is missing an @ sign.',
    children: <Input defaultValue="sample.author" />,
  },
}

export const Disabled: Story = {
  args: {
    id: 'storybook-email-disabled',
    isDisabled: true,
    children: <Input defaultValue="sample.author@example.com" />,
  },
}
