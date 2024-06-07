import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 部署到 blue-book-admin目录下
    base: '/blue-book-admin'
})
