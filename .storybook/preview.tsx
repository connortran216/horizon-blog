import { useEffect, type ReactNode } from 'react'
import { Box, ChakraProvider, useColorMode, type ColorMode } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import type { Preview } from '@storybook/react-vite'

import '../src/index.css'
import horizonTheme from '../src/theme/horizon'

function ColorModeSync({
  mode,
  children,
}: {
  readonly mode: ColorMode
  readonly children: ReactNode
}) {
  const { colorMode, setColorMode } = useColorMode()

  useEffect(() => {
    if (colorMode !== mode) {
      setColorMode(mode)
    }
  }, [colorMode, mode, setColorMode])

  return (
    <Box minH="100vh" bg="bg.page" color="text.primary" p={{ base: 4, md: 8 }}>
      {children}
    </Box>
  )
}

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const mode: ColorMode = context.globals.theme === 'dark' ? 'dark' : 'light'

      return (
        <ChakraProvider theme={horizonTheme}>
          <MemoryRouter initialEntries={['/storybook']}>
            <ColorModeSync mode={mode}>
              <Story />
            </ColorModeSync>
          </MemoryRouter>
        </ChakraProvider>
      )
    },
  ],
  globalTypes: {
    theme: {
      description: 'Horizon color mode',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    controls: { expanded: true },
    docs: { toc: true },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default preview
