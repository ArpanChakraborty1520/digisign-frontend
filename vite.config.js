// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react()
    ,tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ Alias for '@/...'
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // ✅ Your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

