import type { StorybookConfig } from '@storybook/react-vite'

const addonDocsPreset = new URL(import.meta.resolve('@storybook/addon-docs/preset')).pathname
const addonMcpPreset = new URL(import.meta.resolve('@storybook/addon-mcp/preset')).pathname

const config = {
  stories: ['../src/design-system/**/*.stories.@(ts|tsx)'],
  addons: [
    addonDocsPreset,
    {
      // Yarn PnP cannot resolve addon-mcp's package root because it intentionally
      // exports only subpaths. Point Storybook at the public preset entry.
      name: addonMcpPreset,
      options: {
        toolsets: {
          dev: false,
          docs: true,
          test: false,
        },
      },
    },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: {
    componentsManifest: true,
  },
} satisfies StorybookConfig

export default config
