/**
 * Crepe Editor Configuration
 *
 * Centralized configuration for the Crepe WYSIWYG editor.
 * Phase 1: Core features (basic formatting, code, tables)
 * Phase 2: Image upload enabled on top of phase 1 baseline
 * Future phases: advanced features (colors, alignment, videos, LaTeX)
 */

export interface CrepeConfig {
  features: {
    // Core features (Phase 1)
    toolbar: boolean
    imageBlock: boolean
    codeBlocks: boolean
    tables: boolean

    // Advanced features (Phase 2 - deferred)
    latex: boolean
    textColor: boolean
    highlight: boolean
    alignment: boolean
    videoEmbed: boolean
  }

  upload: {
    endpoint: string
    maxFileSize: number // MB
    allowedTypes: string[]
  }

  theme: {
    accentColor: string
    useFrame: boolean
  }

  behavior: {
    placeholder: string
    readOnly: boolean
    spellCheck: boolean
  }
}

/**
 * Default Crepe configuration for Phase 1
 *
 * Enabled features:
 * - Basic formatting (bold, italic, headings, lists, links, block quotes)
 * - Code blocks with syntax highlighting
 * - Tables
 * - Theme integration with Obsidian purple accent
 */
export const CREPE_CONFIG: CrepeConfig = {
  features: {
    // Phase 1: Core features (ENABLED)
    toolbar: true,
    imageBlock: true,
    codeBlocks: true,
    tables: true,

    // Phase 2: Advanced features (DISABLED - coming later)
    latex: false, // TODO: Enable in Phase 2
    textColor: false, // TODO: Enable in Phase 2
    highlight: false, // TODO: Enable in Phase 2
    alignment: false, // TODO: Enable in Phase 2
    videoEmbed: false, // TODO: Enable in Phase 2
  },

  upload: {
    endpoint: '/posts/{post_id}/media',
    maxFileSize: 5, // 5MB max
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  theme: {
    accentColor: '#8b7fc7', // Obsidian purple accent
    useFrame: true, // Use Crepe's frame theme
  },

  behavior: {
    placeholder: 'Start writing your blog post...',
    readOnly: false,
    spellCheck: true,
  },
}
