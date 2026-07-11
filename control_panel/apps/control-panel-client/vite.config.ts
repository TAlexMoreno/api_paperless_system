import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../control-panel-server/dist/public',
    emptyOutDir: true,
  },
  server: command === 'serve'
    ? {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    }
    : undefined,
}))
