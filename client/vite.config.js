import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /complaint-management-system/, set by the deploy workflow
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    // Forward /api calls to the Express server so the client never hardcodes its URL
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
