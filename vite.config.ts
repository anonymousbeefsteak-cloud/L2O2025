import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 部署到 GitHub Pages 需要設定 base 路徑
  // 將 'your-repo-name' 換成您的 GitHub 倉庫名稱
  base: '/your-repo-name/', 
})
