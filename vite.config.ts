import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    server: {
        proxy: {
            '/graphql': {
                target: 'https://sapphire-api.vercel.app/graphql',
                changeOrigin: true,
                secure: false,
            },
            '/api': {
                target: 'https://sapphirestudio.kinde.com',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    plugins: [react()],
});
