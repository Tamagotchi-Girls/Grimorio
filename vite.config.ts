import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

import sitio from './config/site.json'

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), configuracionDelSitio(sitio)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
    strictPort: true,
    allowedHosts: ['.trycloudflare.com'],
    watch: {
      // En WSL con el proyecto en /mnt/c los cambios no llegan por inotify: `pnpm dev:wsl` activa el sondeo.
      usePolling: process.env.WATCH_POLLING === '1',
      interval: 300,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8443'),
    allowedHosts: ['.trycloudflare.com'],
  },
})

type ConfiguracionDelSitio = {
  title?: string
  description?: string
  language?: string
  robots?: { index?: boolean }
  icons?: { icon?: string }
}

/** Aplica config/site.json al HTML: título, descripción, idioma, ícono, Open Graph y robots (meta y robots.txt). */
function configuracionDelSitio(config: ConfiguracionDelSitio): Plugin {
  const escapar = (valor: string) => valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const title = config.title ?? ''
  const description = config.description ?? ''
  const favicon = config.icons?.icon ?? ''
  const language = config.language?.replace(/[^a-zA-Z0-9_-]/g, '') || 'en'
  const sinIndexar = config.robots?.index === false
  const robotsTxt = sinIndexar ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'configuracion-del-sitio',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const result = html.replace('<!-- sitio:lang -->', language).replace('<!-- sitio:title -->', escapar(title))

        const tags: HtmlTagDescriptor[] = []
        if (description) tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        if (sinIndexar) tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        if (favicon) tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        if (title) tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        if (description) tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })

        return { html: result, tags }
      },
    },
  }
}
