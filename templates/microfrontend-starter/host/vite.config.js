import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// starter 默认端口：host 6100 / demo-front 6101（与 k-project 的 8100 段错开，可并行起动）
const microProxy = (prefix, port) => ({
  target: `http://127.0.0.1:${port}`,
  changeOrigin: true,
  rewrite: (path) => {
    const stripped = path.replace(new RegExp(`^${prefix}/?`), '');
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  },
});

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6100,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      // 走网关同源部署时 /micro/demo 由网关转发；多端口 dev 时这里兜底，避免落回 host SPA（套娃）
      '/micro/demo': microProxy('/micro/demo', 6101),
    },
  },
})
