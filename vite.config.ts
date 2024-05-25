import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
        '/graphql': {
            target: 'https://test-8sol08mr5-antonisabats-projects.vercel.app/graphql',
            changeOrigin: true,
            secure: false,
        },
    }
  },
  plugins: [react()],
})
