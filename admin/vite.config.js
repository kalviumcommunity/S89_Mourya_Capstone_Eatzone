import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175, // Fixed port 5175 for admin
    strictPort: true, // Force port 5175, fail if busy
    host: true, // Allow external connections
    proxy: {
      '/api': {
        target: 'https://eatzone.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/images': {
        target: 'https://eatzone.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
