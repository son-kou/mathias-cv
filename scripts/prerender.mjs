// Forhåndsrenderer siden til statisk HTML efter `vite build`.
//
// Det giver hurtigere første visning, bedre SEO og en side, hvor alt indhold kan
// læses, selv hvis JavaScript ikke indlæses. React "vækker" derefter siden i browseren.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { basePath, siteUrl } from './site-env.mjs'

const dist = new URL('../dist/', import.meta.url)
const ssrDir = new URL('../dist-ssr/', import.meta.url)

const { render } = await import(new URL('entry-server.js', ssrDir).href)
const template = await readFile(new URL('index.html', dist), 'utf8')

if (!template.includes('<!--app-html-->')) {
  throw new Error('dist/index.html mangler pladsholderen <!--app-html-->')
}

await writeFile(new URL('index.html', dist), template.replace('<!--app-html-->', render()))

// En enkel 404-side til GitHub Pages med link tilbage til forsiden.
const base = basePath()
await writeFile(
  new URL('404.html', dist),
  `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Siden findes ikke · Mathias Dalgaard</title>
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5efe4;color:#16213a;font:17px/1.6 system-ui,sans-serif;text-align:center;padding:2rem}
  h1{font:400 clamp(2.5rem,8vw,4.5rem)/1 Georgia,serif;margin:0 0 1rem}
  a{display:inline-block;margin-top:1.5rem;padding:.8rem 1.4rem;border-radius:999px;background:#1e5b57;color:#fff;font-weight:700;text-decoration:none}
  a:focus-visible{outline:3px solid #b5603a;outline-offset:3px}
</style>
</head>
<body>
<main>
  <h1>Her er ingen kaffe.</h1>
  <p>Siden, du leder efter, findes ikke – men resten af historien gør.</p>
  <a href="${base}">Gå til forsiden</a>
</main>
</body>
</html>
`,
)

// Til søgemaskiner.
const url = siteUrl()
await writeFile(new URL('robots.txt', dist), `User-agent: *\nAllow: /\n\nSitemap: ${url}sitemap.xml\n`)
await writeFile(
  new URL('sitemap.xml', dist),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}</loc></url>\n</urlset>\n`,
)

await rm(ssrDir, { recursive: true, force: true })
console.log('✓ Forhåndsrenderet dist/index.html og skrev 404.html, robots.txt og sitemap.xml')
