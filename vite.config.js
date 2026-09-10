import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/derby-vote/',
  build: {
    outDir: 'dist/derby-vote',
  },
  plugins: [react(), tailwindcss()],
})
