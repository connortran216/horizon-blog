/**
 * Centralized Milkdown Editor Configuration
 *
 * This file contains all configuration settings for the blog editor.
 * Modify these settings to customize the editor behavior without touching component code.
 */

export const EDITOR_CONFIG = {
  /**
   * BEHAVIOR SETTINGS
   * Controls how the editor behaves and responds to user interactions
   */
  behavior: {
    // Render timing: 'instant' (as you type) or 'blur' (on unfocus/line change)
    renderTiming: 'blur' as 'instant' | 'blur',

    // Edit granularity: 'block' (click paragraph to edit), 'line', or 'document' (edit all at once)
    editGranularity: 'block' as 'block' | 'line' | 'document',

    // Toggle mode behavior: 'global' (switch entire doc), 'live' (live render + toggle), or 'none'
    toggleMode: 'global' as 'global' | 'live' | 'none',

    // Preserve cursor and scroll position when switching modes
    preservePosition: true,

    // Auto-save delays (in milliseconds)
    autoSave: {
      localStorage: 1000,  // Local backup delay
      backend: 5000,       // Backend API delay
    },
  },

  /**
   * FEATURE FLAGS
   * Enable or disable specific editor features
   */
  features: {
    // Markdown syntax highlighting in edit mode
    syntaxHighlighting: true,

    // Wiki-style links: [[post-title]] for internal linking
    wikiLinks: true,

    // Hashtag support: #tag detection in content
    hashtags: true,

    // Code block syntax highlighting by language
    codeBlockHighlighting: true,

    // GitHub Flavored Markdown (tables, strikethrough, task lists, etc.)
    gfm: true,

    // Undo/redo history
    history: true,

    // Clipboard support (copy/paste)
    clipboard: true,

    // Image upload and embedding
    imageSupport: true,
  },

  /**
   * UI PREFERENCES
   * Visual appearance and interface settings
   */
  ui: {
    // Toolbar type: 'floating' (on selection), 'fixed' (always visible), or 'none'
    toolbarType: 'floating' as 'floating' | 'fixed' | 'none',

    // Toolbar buttons to show (when toolbar is enabled)
    toolbarButtons: [
      'bold',
      'italic',
      'strikethrough',
      'code',
      'link',
      'heading',
      'bulletList',
      'orderedList',
      'blockquote',
      'codeBlock',
    ],

    // Editor theme: 'nord' (default), 'light', 'dark', or 'custom'
    theme: 'nord' as 'nord' | 'light' | 'dark' | 'custom',

    // Minimum editor height (in pixels)
    minHeight: 500,

    // Placeholder text when editor is empty
    placeholder: 'Start writing your blog post...',

    // Show line numbers in code blocks
    showLineNumbers: true,

    // View mode styling: 'blog' (current styles) or 'obsidian' (minimal)
    viewStyle: 'blog' as 'blog' | 'obsidian',
  },

  /**
   * PLUGIN CONFIGURATIONS
   * Settings specific to individual Milkdown plugins
   */
  plugins: {
    // Prism configuration for code syntax highlighting
    prism: {
      theme: 'okaidia', // Prism theme name
      languages: ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'html', 'css', 'json', 'markdown'],
    },

    // Block plugin configuration
    block: {
      // Show block handles (drag/drop indicators)
      showHandles: true,

      // Allow drag and drop reordering
      dragDrop: true,
    },

    // Tooltip/floating toolbar configuration
    tooltip: {
      // Show tooltip delay (ms)
      delay: 100,

      // Tooltip position
      position: 'top' as 'top' | 'bottom',
    },
  },

  /**
   * CUSTOM SYNTAX CONFIGURATIONS
   * Settings for custom markdown extensions
   */
  customSyntax: {
    // Wiki link configuration
    wikiLink: {
      // Pattern to match: [[link text]] or [[link|display text]]
      pattern: /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,

      // URL template for linking to posts (will replace {slug} with the link text)
      urlTemplate: '/blog/{slug}',

      // CSS class for wiki links
      className: 'wiki-link',
    },

    // Hashtag configuration
    hashtag: {
      // Pattern to match: #tag (but not ##heading or inside code)
      pattern: /(^|\s)#([a-zA-Z0-9_-]+)/g,

      // URL template for tag pages
      urlTemplate: '/blog?tag={tag}',

      // CSS class for hashtags
      className: 'hashtag',
    },
  },

  /**
   * KEYBOARD SHORTCUTS
   * Custom keyboard shortcuts for common actions
   */
  shortcuts: {
    bold: 'Mod-b',
    italic: 'Mod-i',
    strikethrough: 'Mod-Shift-x',
    code: 'Mod-e',
    link: 'Mod-k',
    toggleMode: 'Mod-Shift-e', // Toggle between edit and view mode
  },
};

/**
 * TYPE EXPORTS
 * TypeScript types derived from the config for type safety
 */
export type EditorConfig = typeof EDITOR_CONFIG;
export type RenderTiming = EditorConfig['behavior']['renderTiming'];
export type EditGranularity = EditorConfig['behavior']['editGranularity'];
export type ToolbarType = EditorConfig['ui']['toolbarType'];
export type EditorTheme = EditorConfig['ui']['theme'];
export type ViewStyle = EditorConfig['ui']['viewStyle'];
