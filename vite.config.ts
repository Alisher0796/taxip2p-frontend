import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://backend-production-d89d.up.railway.app',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'https://backend-production-d89d.up.railway.app',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    // Оптимизация сборки
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'telegram': ['@twa-dev/sdk']
        }
      }
    }
  }
})
