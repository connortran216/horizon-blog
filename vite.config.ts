import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const entry = (name: string) => fileURLToPath(new URL(`./${name}`, import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'BE_'],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    allowedHosts: ['blog.connortran.io.vn'],
  },
  envDir: '.',
  build: {
    rollupOptions: {
      // Two entries. `index.html` is the application, unchanged; `ui-kit.html`
      // is the design-system gallery, which is why it can never leak into the
      // shipped bundle - it is a separate build artefact, not a guarded route.
      input: {
        index: entry('index.html'),
        'ui-kit': entry('ui-kit.html'),
      },
    },
  },
})
