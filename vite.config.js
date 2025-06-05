import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' 
    ? '/GitHub_ToolBox/' // for GitHub Pages deployment
    : '/', // for development
  server: {
    // Always open at the base path in development
    open: true
  }
})
