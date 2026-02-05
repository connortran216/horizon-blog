/**
 * Crepe Editor Configuration
 *
 * Centralized configuration for the Crepe WYSIWYG editor.
 * Phase 1: Core features (basic formatting, code, tables)
 * Phase 2: Image upload enabled on top of phase 1 baseline
 */

export interface CrepeConfig {
  features: {
    // Currently wired features
    toolbar: boolean
    imageBlock: boolean
    codeBlocks: boolean
    tables: boolean
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
    toolbar: true,
    imageBlock: true,
    codeBlocks: true,
    tables: true,
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
