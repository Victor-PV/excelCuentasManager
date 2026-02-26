import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gastos',
        short_name: 'Gastos',
        description: 'Gestiona tus gastos desde Google Sheets',
        theme_color: '#ffffff',
        background_color: '#107490',
        display: 'standalone',
        lang: "es-MX",
        icons: [
          {
            src: '/icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icon-256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})