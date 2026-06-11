import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './'：作为无界子应用被父应用跨端口/跨路径加载时，静态资源用相对路径
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 6101,
    host: '0.0.0.0',
    allowedHosts: true,
    cors: true,
  },
})
