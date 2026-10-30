/// <reference types="vitest/config" />
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { contact, languages, profile, site } from './src/data/content'
import { basePath, siteUrl } from './scripts/site-env.mjs'

const BASE = basePath()
const SITE_URL = siteUrl()
const CV_AVAILABLE = existsSync(resolve(__dirname, 'public', site.cv.file))

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Udfylder {{pladsholdere}} i index.html med indhold fra src/data/content.ts. */
function siteMeta(): Plugin {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: SITE_URL,
    image: `${SITE_URL}${profile.photo.jpg}`,
    description: site.description,
    jobTitle: profile.role,
    email: `mailto:${contact.email}`,
    telephone: contact.phoneDisplay,
    address: { '@type': 'PostalAddress', addressLocality: profile.base, addressCountry: 'DK' },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Universitetet i Oslo' },
      { '@type': 'CollegeOrUniversity', name: 'Akita International University' },
      { '@type': 'CollegeOrUniversity', name: 'National Taiwan Normal University' },
    ],
    knowsLanguage: languages.map((l) => l.lang),
    sameAs: [contact.linkedin],
  }
  const values: Record<string, string> = {
    title: escapeHtml(site.title),
    description: escapeHtml(site.description),
    siteUrl: SITE_URL,
    ogImage: `${SITE_URL}${site.ogImage}`,
    ogImageAlt: escapeHtml(`${profile.name} – ${profile.role}`),
    themeColor: site.themeColor,
    jsonLd: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
  }
  return {
    name: 'site-meta',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => ({
        html: html.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
          if (!(key in values)) throw new Error(`Ukendt pladsholder i index.html: ${match}`)
          return values[key]
        }),
        // Portrættet er det største element på forsiden – hent den rigtige størrelse med det samme.
        tags: [
          {
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'image',
              type: 'image/webp',
              fetchpriority: 'high',
              imagesrcset: `${BASE}${profile.photo.webpSmall} 480w, ${BASE}${profile.photo.webp} 800w`,
              imagesizes: profile.photo.sizes,
            },
            injectTo: 'head',
          },
        ],
      }),
    },
  }
}

/** Preloader de to vigtigste skrifttyper (latin), så overskriften ikke "hopper". */
function preloadFonts(): Plugin {
  const wanted = [/instrument-serif-latin-400-normal.*\.woff2$/, /manrope-latin-wght-normal.*\.woff2$/]
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (_html, ctx) => {
        const files = Object.keys(ctx.bundle ?? {}).filter((file) => wanted.some((re) => re.test(file)))
        return files.map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', href: `${BASE}${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head' as const,
        }))
      },
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [react(), siteMeta(), preloadFonts()],
  define: {
    __CV_AVAILABLE__: JSON.stringify(CV_AVAILABLE),
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    css: false,
  },
})
