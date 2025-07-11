import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Explicitly configure React plugin
    include: "**/*.{jsx,tsx}",
    exclude: /node_modules/,
  })],
  base: '/', // Ensure proper base path for deployment
  define: {
    // Prevent service worker registration attempts
    'process.env.PUBLIC_URL': JSON.stringify(''),
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    rollupOptions: {
      output: {
        manualChunks: undefined, // Prevent chunk splitting issues
        // Ensure proper module initialization order
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimize dependencies to prevent circular dependency issues
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  server: {
    port: 5175, // Fixed port 5175 for admin
    strictPort: true, // Force port 5175, fail if busy
    host: true, // Allow external connections
    cors: true, // Enable CORS
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
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
  },
  // Optimize dependencies to prevent React 19 issues
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
})
