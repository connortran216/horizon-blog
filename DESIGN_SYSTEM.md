# Horizon Blog Design System

## Overview

The Horizon Blog Design System provides a comprehensive set of reusable components, utilities, and design tokens that ensure consistency across the application. This system is built on top of Chakra UI with custom Obsidian-inspired theming.

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Architecture](#component-architecture)
3. [Core Components](#core-components)
4. [Animation Components](#animation-components)
5. [Layout Components](#layout-components)
6. [Editor Components](#editor-components)
7. [Usage Patterns](#usage-patterns)
8. [Best Practices](#best-practices)

## Design Tokens

### Color System

The design system uses semantic color tokens that automatically switch between light and dark modes:

```typescript
// Background colors
'bg.page'           // Main page background
'bg.secondary'      // Card/sidebar backgrounds
'bg.tertiary'       // Hover states
'bg.elevated'       // Modals/popovers

// Borders
'border.default'    // Standard borders
'border.subtle'     // Soft borders

// Text
'text.primary'      // Main text color
'text.secondary'    // Supporting text
'text.tertiary'     // Metadata/placeholder text

// Accents
'accent.primary'    // Primary actions
'accent.hover'      // Hover states for accents
```

### Typography

```typescript
fontSizes: {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  md: '1rem',      // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
}
```

### Spacing & Layout

- Container max-width: `container.xl` (80rem/1280px)
- Standard padding: 4 (1rem), 6 (1.5rem), 8 (2rem)
- Border radius: sm (0.25rem), md (0.375rem), lg (0.5rem), full (9999px)

## Component Architecture

### Organization Structure

```
src/components/
├── core/              # Infrastructure components
│   ├── components/    # ErrorBoundary, etc.
│   └── animations/    # Animation components
├── layout/            # Layout components (Navbar, Footer)
├── editor/            # Editor-specific components
├── reader/            # Reader-specific components
└── [feature]/         # Feature-specific components
```

### Component Patterns

All components follow these patterns:
- **TypeScript first**: Full type safety with interfaces
- **Chakra UI integration**: Use design tokens, not hardcoded values
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive design**: Mobile-first approach
- **Error boundaries**: Graceful error handling

## Core Components

### ErrorBoundary

A React error boundary component that catches JavaScript errors in the component tree.

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode          // Custom error UI
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void  // Error handler
}
```

**Usage:**
```tsx
import { ErrorBoundary } from '../core/components/ErrorBoundary'

<ErrorBoundary fallback={<CustomErrorUI />}>
  <ComponentThatMightError />
</ErrorBoundary>
```

**Features:**
- Automatic error logging
- Retry functionality
- Custom fallback UI
- Development error overlay

### useErrorHandler Hook

Functional component error handling hook.

```typescript
const { handleError } = useErrorHandler()

// Usage
try {
  await riskyOperation()
} catch (error) {
  handleError(error, 'Failed to save post')
}
```

## Animation Components

### AnimatedButton

Enhanced button component with ripple effects and smooth animations.

**Props:**
```typescript
interface AnimatedButtonProps extends ButtonProps {
  enableRipple?: boolean  // Enable/disable ripple effect (default: true)
}
```

**Variants:**
```tsx
import {
  AnimatedPrimaryButton,    // Solid with accent background
  AnimatedGhostButton,      // Transparent with hover effects
  AnimatedOutlineButton     // Bordered button
} from '../core/animations/AnimatedButton'

// Primary action
<AnimatedPrimaryButton onClick={handleSave}>
  Save Changes
</AnimatedPrimaryButton>

// Secondary action
<AnimatedGhostButton onClick={handleCancel}>
  Cancel
</AnimatedGhostButton>
```

**Features:**
- Ripple effect on click
- Smooth hover animations
- Automatic theme integration
- RouterLink support (passes all props)

### MotionWrapper

General-purpose animation wrapper using Framer Motion.

**Props:**
```typescript
interface MotionWrapperProps {
  children: ReactNode
  variant?: 'fade' | 'slideUp' | 'scale' | 'bounce'
  delay?: number
  duration?: number
  easing?: string
}
```

**Usage:**
```tsx
import { MotionWrapper } from '../core/animations/MotionWrapper'

<MotionWrapper variant="fade" delay={0.2}>
  <Card>...</Card>
</MotionWrapper>
```

### ShimmerLoader

Skeleton loading component with shimmer effects.

**Props:**
```typescript
interface ShimmerLoaderProps {
  height?: string | number          // Loader height
  width?: string | number           // Loader width
  borderRadius?: string | number    // Border radius
  lines?: number                    // Number of shimmer lines
}
```

**Usage:**
```tsx
import { ShimmerLoader } from '../core/animations/ShimmerLoader'

// Single line loader
<ShimmerLoader height="20px" width="200px" />

// Multiple line loader (e.g., for blog post)
<ShimmerLoader lines={3} height="16px" />
```

## Layout Components

### Layout

Main application layout wrapper with responsive sidebar.

**Props:**
```typescript
interface LayoutProps {
  children: ReactNode
  showSidebar?: boolean          // Show/hide sidebar (default: true)
  sidebarContent?: ReactNode     // Custom sidebar content
  headerContent?: ReactNode      // Custom header content
}
```

**Usage:**
```tsx
import { Layout } from '../components/layout/Layout'

<Layout showSidebar={true}>
  <BlogContent />
</Layout>
```

**Features:**
- Responsive design (collapsible on mobile)
- Theme-aware background colors
- Accessible navigation
- SEO-friendly structure

### Navbar

Application navigation bar with user authentication state.

**Props:**
```typescript
// No explicit props - reads from AuthContext
```

**Features:**
- **Authentication state**: Shows login/signup or user menu
- **Theme toggle**: Light/dark mode switcher
- **Editor integration**: Publish button when in editor
- **Responsive design**: Mobile hamburger menu
- **Global editor state**: Accesses window.editorState for publish functionality

**Navigation Links:**
- Home (/)
- Blog (/blog)
- About (/about)
- Contact (/contact)
- Write (/blog-editor) - authenticated users only

### Footer

Application footer with links and information.

**Props:**
```typescript
interface FooterProps {
  showLinks?: boolean    // Show navigation links (default: true)
  showCopyright?: boolean // Show copyright (default: true)
}
```

## Editor Components

### MilkdownEditor

Rich text editor with Markdown support and live preview.

**Props:**
```typescript
interface MilkdownEditorProps {
  initialContent?: string                              // Initial markdown content
  onChange?: (markdown: string, json: string) => void  // Content change handler
  placeholder?: string                                  // Placeholder text
  readOnly?: boolean                                    // View-only mode
}
```

**Usage:**
```tsx
import { MilkdownEditor } from '../components/editor/MilkdownEditor'

const [title, setTitle] = useState('')
const [content, setContent] = useState('')
const [json, setJson] = useState('')

<MilkdownEditor
  initialContent={content}
  onChange={(markdown, prosemirrorJson) => {
    setContent(markdown)
    setJson(prosemirrorJson)
  }}
  placeholder="Start writing your blog post..."
/>
```

**Features:**
- **Dual modes**: Raw markdown editing and live preview
- **Syntax highlighting**: Code blocks with Prism
- **Wiki links**: `[[link]]` support
- **Keyboard shortcuts**: Ctrl+Shift+E to toggle modes
- **Theme integration**: Automatic light/dark mode switching
- **Line numbers**: In raw markdown mode
- **Error handling**: Graceful degradation on initialization failure

**Configuration:**
The editor is configured via `src/config/editor.config.ts`:

```typescript
export const EDITOR_CONFIG = {
  ui: {
    minHeight: 500,           // Minimum editor height
    placeholder: 'Start writing...'
  },
  behavior: {
    preservePosition: true,   // Preserve scroll position
    toggleMode: 'global'      // Tab-based mode switching
  },
  features: {
    gfm: true,               // GitHub Flavored Markdown
    history: true,           // Undo/redo
    clipboard: true,         // Rich clipboard support
    codeBlockHighlighting: true
  }
}
```

### MilkdownReader

Read-only component for displaying rendered Markdown content.

**Props:**
```typescript
interface MilkdownReaderProps {
  content: string            // Markdown content to display
  title?: string            // Optional title
  author?: BlogAuthor       // Author information
}
```

**Usage:**
```tsx
import { MilkdownReader } from '../components/reader/MilkdownReader'

<MilkdownReader
  content={post.content_markdown}
  title={post.title}
  author={post.author}
/>
```

## Usage Patterns

### Component Composition

**Preferred pattern:**
```tsx
// ✅ Good: Use semantic variants
<AnimatedPrimaryButton onClick={handleSave}>
  Save Post
</AnimatedPrimaryButton>

// ❌ Avoid: Override with conflicting styles
<Button bg="red.500" _hover={{ bg: "blue.500" }}>
  Save Post
</Button>
```

### Theme Integration

**Always use semantic tokens:**
```tsx
// ✅ Good: Theme-aware
<Box bg="bg.secondary" color="text.primary">
  Content
</Box>

// ❌ Avoid: Hardcoded colors
<Box bg="#2d2d2d" color="#ffffff">
  Content
</Box>
```

### Error Handling

**Consistent error pattern:**
```tsx
import { ErrorBoundary, useErrorHandler } from '../core'

function BlogEditor() {
  const { handleError } = useErrorHandler()

  const handleSave = async () => {
    try {
      await saveBlogPost(data)
    } catch (error) {
      handleError(error, 'Failed to save blog post')
    }
  }

  return (
    <ErrorBoundary>
      <EditorContent onSave={handleSave} />
    </ErrorBoundary>
  )
}
```

### Responsive Design

**Mobile-first approach:**
```tsx
<Box>
  {/* Desktop layout */}
  <Flex display={{ base: 'none', md: 'flex' }} gap={6}>
    <Sidebar />
    <Content />
  </Flex>

  {/* Mobile layout */}
  <VStack display={{ base: 'flex', md: 'none' }} spacing={4}>
    <Content />
    <Sidebar />
  </VStack>
</Box>
```

## Best Practices

### Component Development

1. **Type Safety First**: Always define TypeScript interfaces
2. **Design Token Usage**: Never use hardcoded colors/spacing
3. **Accessibility**: Include ARIA labels and keyboard navigation
4. **Error Boundaries**: Wrap complex components in ErrorBoundary
5. **Performance**: Use React.memo for expensive components

### Styling Guidelines

1. **Semantic Colors**: Use `text.primary`, `bg.secondary`, etc.
2. **Consistent Spacing**: Use theme space values (4, 6, 8, etc.)
3. **Responsive Design**: Mobile-first with responsive utilities
4. **Animation**: Keep animations subtle and purposeful
5. **Typography**: Use design system font sizes and weights

### Component Organization

```typescript
// ✅ Good: Clear component structure
export interface ComponentNameProps {
  // Props interface
}

export function ComponentName({ /* props */ }: ComponentNameProps) {
  // Implementation
}

// ✅ Good: Export variants
export const ComponentNameVariant = (props: ComponentNameProps) => (
  <ComponentName {...props} variant="specific" />
)
```

### Testing

All components should be tested for:
- **Rendering**: Correct display and styling
- **Interaction**: Click handlers, form inputs
- **Accessibility**: Keyboard navigation, screen readers
- **Error states**: Graceful error handling
- **Responsive**: Different screen sizes

### Documentation

Each component should document:
- **Props interface**: TypeScript definition
- **Usage examples**: Basic and advanced usage
- **Variants**: Different visual styles
- **Accessibility**: ARIA considerations
- **Browser support**: Compatibility notes

---

This design system ensures that Horizon Blog maintains visual consistency, accessibility standards, and excellent user experience across all components and features.
