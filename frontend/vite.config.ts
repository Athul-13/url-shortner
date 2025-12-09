import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://backend:8000'
  const port = parseInt(process.env.VITE_PORT || '5174', 10)

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: port,
      watch: {
        usePolling: true, // Enable polling for Docker file watching
        interval: 1000, // Poll every 1 second
      },
      hmr: {
        host: 'localhost', // Use localhost for HMR connection
        port: port,
      },
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
