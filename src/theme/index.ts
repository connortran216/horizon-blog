/**
 * Obsidian-Inspired Dark Mode Theme for Chakra UI
 *
 * This theme provides an Obsidian-like experience with:
 * - Deep dark backgrounds with subtle variations
 * - Purple/blue accent colors
 * - Soft shadows and borders
 * - Excellent readability and contrast
 */

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Color mode configuration
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false, // We'll manage this manually with localStorage
};

// Obsidian-inspired color palette
const colors = {
  obsidian: {
    // Dark mode backgrounds
    dark: {
      bg: '#1e1e1e',           // Main background
      bgSecondary: '#252525',  // Secondary background (sidebar, cards)
      bgTertiary: '#2d2d2d',   // Tertiary background (hover states)
      bgElevated: '#333333',   // Elevated elements (modals, popovers)
      border: '#3a3a3a',       // Borders
      borderSubtle: '#2a2a2a', // Subtle borders
    },

    // Light mode backgrounds
    light: {
      bg: '#ffffff',           // Main background
      bgSecondary: '#f8f9fa',  // Secondary background
      bgTertiary: '#f0f1f3',   // Tertiary background
      bgElevated: '#ffffff',   // Elevated elements
      border: '#e2e4e9',       // Borders
      borderSubtle: '#ebedf0', // Subtle borders
    },

    // Text colors
    text: {
      primary: '#dcddde',      // Primary text (dark mode)
      secondary: '#b9bbbe',    // Secondary text (dark mode)
      tertiary: '#8e9297',     // Tertiary text (dark mode)

      lightPrimary: '#2c3e50',     // Primary text (light mode)
      lightSecondary: '#5a6c7d',   // Secondary text (light mode)
      lightTertiary: '#8896a4',    // Tertiary text (light mode)
    },

    // Accent colors (Obsidian purple/blue)
    accent: {
      primary: '#8b7fc7',      // Main accent
      secondary: '#7aa2f7',    // Secondary accent (blue)
      hover: '#9d8fd9',        // Hover state
      active: '#7a6eb5',       // Active state
    },

    // Semantic colors
    link: '#5b9cf6',           // Link color
    linkHover: '#74aff7',      // Link hover
    codeBlock: '#0d1117',      // Code block background
    selection: '#3d4451',      // Text selection
  },
};

// Semantic tokens that switch based on color mode
const semanticTokens = {
  colors: {
    // Backgrounds
    'bg.page': {
      default: 'obsidian.light.bg',
      _dark: 'obsidian.dark.bg',
    },
    'bg.secondary': {
      default: 'obsidian.light.bgSecondary',
      _dark: 'obsidian.dark.bgSecondary',
    },
    'bg.tertiary': {
      default: 'obsidian.light.bgTertiary',
      _dark: 'obsidian.dark.bgTertiary',
    },
    'bg.elevated': {
      default: 'obsidian.light.bgElevated',
      _dark: 'obsidian.dark.bgElevated',
    },

    // Borders
    'border.default': {
      default: 'obsidian.light.border',
      _dark: 'obsidian.dark.border',
    },
    'border.subtle': {
      default: 'obsidian.light.borderSubtle',
      _dark: 'obsidian.dark.borderSubtle',
    },

    // Text
    'text.primary': {
      default: 'obsidian.text.lightPrimary',
      _dark: 'obsidian.text.primary',
    },
    'text.secondary': {
      default: 'obsidian.text.lightSecondary',
      _dark: 'obsidian.text.secondary',
    },
    'text.tertiary': {
      default: 'obsidian.text.lightTertiary',
      _dark: 'obsidian.text.tertiary',
    },

    // Accents
    'accent.primary': {
      default: 'obsidian.accent.primary',
      _dark: 'obsidian.accent.primary',
    },
    'accent.hover': {
      default: 'obsidian.accent.hover',
      _dark: 'obsidian.accent.hover',
    },

    // Links
    'link.default': {
      default: 'obsidian.link',
      _dark: 'obsidian.link',
    },
    'link.hover': {
      default: 'obsidian.linkHover',
      _dark: 'obsidian.linkHover',
    },
  },
};

// Component style overrides for Obsidian feel
const components = {
  // Global styles
  global: {
    body: {
      bg: 'bg.page',
      color: 'text.primary',
      transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    },
  },

  // Card component
  Card: {
    baseStyle: {
      container: {
        bg: 'bg.secondary',
        borderColor: 'border.subtle',
        boxShadow: 'sm',
        transition: 'all 0.2s ease-in-out',
        _hover: {
          bg: 'bg.tertiary',
          boxShadow: 'md',
        },
      },
    },
  },

  // Button component
  Button: {
    baseStyle: {
      transition: 'all 0.2s ease-in-out',
    },
    variants: {
      ghost: {
        color: 'text.secondary',
        _hover: {
          bg: 'bg.tertiary',
          color: 'text.primary',
        },
      },
      solid: {
        bg: 'accent.primary',
        color: 'white',
        _hover: {
          bg: 'accent.hover',
        },
        _active: {
          bg: 'accent.active',
        },
      },
    },
  },

  // Input component
  Input: {
    variants: {
      outline: {
        field: {
          bg: 'bg.secondary',
          borderColor: 'border.default',
          color: 'text.primary',
          _hover: {
            borderColor: 'border.subtle',
          },
          _focus: {
            borderColor: 'accent.primary',
            boxShadow: '0 0 0 1px var(--chakra-colors-accent-primary)',
          },
          _placeholder: {
            color: 'text.tertiary',
          },
        },
      },
    },
  },

  // Textarea component
  Textarea: {
    variants: {
      outline: {
        bg: 'bg.secondary',
        borderColor: 'border.default',
        color: 'text.primary',
        _hover: {
          borderColor: 'border.subtle',
        },
        _focus: {
          borderColor: 'accent.primary',
          boxShadow: '0 0 0 1px var(--chakra-colors-accent-primary)',
        },
        _placeholder: {
          color: 'text.tertiary',
        },
      },
    },
  },

  // Menu component
  Menu: {
    baseStyle: {
      list: {
        bg: 'bg.elevated',
        borderColor: 'border.default',
        boxShadow: 'lg',
      },
      item: {
        bg: 'transparent',
        color: 'text.primary',
        _hover: {
          bg: 'bg.tertiary',
        },
        _focus: {
          bg: 'bg.tertiary',
        },
      },
    },
  },

  // Modal component
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'bg.elevated',
      },
      header: {
        color: 'text.primary',
        borderBottomColor: 'border.subtle',
      },
      body: {
        color: 'text.primary',
      },
      footer: {
        borderTopColor: 'border.subtle',
      },
    },
  },

  // Link component
  Link: {
    baseStyle: {
      color: 'link.default',
      _hover: {
        color: 'link.hover',
        textDecoration: 'underline',
      },
    },
  },
};

// Softer shadows for Obsidian feel
const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  md: '0 4px 8px 0 rgba(0, 0, 0, 0.25)',
  lg: '0 8px 16px 0 rgba(0, 0, 0, 0.3)',
  xl: '0 12px 24px 0 rgba(0, 0, 0, 0.35)',
  '2xl': '0 16px 32px 0 rgba(0, 0, 0, 0.4)',
  outline: '0 0 0 3px rgba(139, 127, 199, 0.4)', // Purple outline
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
};

// Border radius for smoother appearance
const radii = {
  none: '0',
  sm: '0.25rem',
  base: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
};

// Typography enhancements
const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  mono: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
};

// Font sizes
const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
};

// Line heights for readability
const lineHeights = {
  normal: 'normal',
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.625,
  taller: 2,
};

// Create and export the theme
const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  components,
  shadows,
  radii,
  fonts,
  fontSizes,
  lineHeights,
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'obsidian.dark.bg' : 'obsidian.light.bg',
        color: props.colorMode === 'dark' ? 'obsidian.text.primary' : 'obsidian.text.lightPrimary',
      },
    }),
  },
});

export default theme;
