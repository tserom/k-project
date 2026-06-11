import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Node 16 没有 built-in structuredClone；ESLint 9 内部会用到。
// 这里做最小 polyfill，避免影响业务运行时代码。
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // 合理场景：根据 url 变化重置错误态属于“同步外部状态”的一类。
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
