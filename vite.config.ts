import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 部署到 GitHub Pages 需要設定 base 路徑
  // This base path must match your GitHub repository name
  base: '/L2O2025/', 
})
