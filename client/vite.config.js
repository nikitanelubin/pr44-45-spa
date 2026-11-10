import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  // при npm run dev запросы к API и картинкам уходят на сервер Express
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3004',
      '/uploads': 'http://127.0.0.1:3004',
    },
  },
})
