import { useId, useRef, useState } from 'react'
import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button, IconButton, Stack, Text } from '../index'
import { MorphIcon } from '../motion'
import { CodeBlock } from '../patterns/reader/CodeBlock'
import { ContactRail } from '../../features/contact/components/ContactRail'

const meta = {
  title: 'Design system/Motion/MorphIcon',
  component: MorphIcon,
  args: { name: 'copy', size: 24 },
  parameters: {
    docs: {
      description: {
        component:
          'Decorative SVG state feedback using the shared motion policy. Actions own labels, focus, and announcements. Use the theme toolbar for light/dark. Enable prefers-reduced-motion in your OS or browser rendering tools: icons change immediately, including when the preference changes during a transition. Clipboard stories inject an async writer into the actual production components; they do not write to your clipboard.',
      },
    },
  },
} satisfies Meta<typeof MorphIcon>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {}

function PairDemo() {
  const [checked, setChecked] = useState(false)
  return (
    <Stack gap={4} alignItems="flex-start">
      <Text>Toggle the preview repeatedly to reverse a transition in progress.</Text>
      <Button
        tone="secondary"
        aria-pressed={checked}
        iconStart={<MorphIcon name={checked ? 'check' : 'copy'} />}
        onClick={() => setChecked((value) => !value)}
      >
        Preview {checked ? 'copy' : 'check'} icon
      </Button>
    </Stack>
  )
}

export const CopyCheckPair: Story = { render: () => <PairDemo /> }

function MenuDemo() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  return (
    <Stack
      gap={4}
      alignItems="flex-start"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false)
          trigger.current?.focus()
        }
      }}
    >
      <IconButton
        ref={trigger}
        label={open ? 'Close menu' : 'Open menu'}
        icon={<MorphIcon name={open ? 'close' : 'menu'} />}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      />
      <Box id={panelId} hidden={!open}>
        <Text>Menu preview is open. Press Escape to close and return focus.</Text>
      </Box>
    </Stack>
  )
}

export const MenuToggle: Story = { render: () => <MenuDemo /> }

const successfulClipboard = async () => {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 350))
}
const failedClipboard = async () => {
  await successfulClipboard()
  throw new Error('Clipboard permission denied in this preview.')
}

export const ContactSuccess: Story = {
  render: () => (
    <Box maxW="md">
      <ContactRail writeToClipboard={successfulClipboard} />
    </Box>
  ),
}

export const ContactFailure: Story = {
  render: () => (
    <Box maxW="md">
      <ContactRail writeToClipboard={failedClipboard} />
    </Box>
  ),
}

const exampleCode = 'const message = "Hello, Horizon"\nconsole.info(message)'

export const ReaderSuccess: Story = {
  render: () => (
    <CodeBlock language="javascript" code={exampleCode} writeToClipboard={successfulClipboard}>
      {exampleCode}
    </CodeBlock>
  ),
}

export const ReaderFailure: Story = {
  render: () => (
    <CodeBlock language="javascript" code={exampleCode} writeToClipboard={failedClipboard}>
      {exampleCode}
    </CodeBlock>
  ),
}
