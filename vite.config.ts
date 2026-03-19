import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'BE_'],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('@milkdown') || id.includes('crepe') || id.includes('prosemirror')) {
            return 'editor-core'
          }

          if (id.includes('@codemirror') || id.includes('@lezer')) {
            return 'editor-code'
          }

          if (id.includes('shiki') || id.includes('@shikijs')) {
            return 'code-highlight'
          }

          if (
            id.includes('react-markdown') ||
            id.includes('remark-') ||
            id.includes('rehype-') ||
            id.includes('unified') ||
            id.includes('micromark') ||
            id.includes('mdast') ||
            id.includes('hast') ||
            id.includes('highlight.js') ||
            id.includes('prismjs') ||
            id.includes('katex')
          ) {
            return 'markdown'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    allowedHosts: ['blog.connortran.io.vn'],
  },
  envDir: '.',
})
