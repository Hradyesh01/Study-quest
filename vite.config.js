import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base path so the build works unchanged on localhost,
// a GitHub Pages-style subpath, or a root custom domain (e.g. roronoa.site).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
