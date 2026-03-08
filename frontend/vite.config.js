import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/start': 'http://127.0.0.1:8000',
      '/turn': 'http://127.0.0.1:8000',
      '/end': 'http://127.0.0.1:8000',
    },
  },
})
