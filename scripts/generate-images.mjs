/* global document, Image */
import { writeFile } from 'node:fs/promises'
// Genererer billeder til public/ med Playwright + Chrome:
//   - portrættet som WebP i to størrelser (ud fra public/images/mathias-dalgaard.jpg)
//   - delingsbillede (Open Graph) og favicons
//
//   npm run images
//
// Kør igen, hvis navn, titel eller portræt ændres. Kræver Google Chrome installeret.
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { chromium } from '@playwright/test'

const require = createRequire(import.meta.url)
const publicDir = new URL('../public/', import.meta.url)

const readFileBase64 = (file) => readFile(file).then((b) => b.toString('base64'))

const [serif, serifItalic, sans, photo] = await Promise.all([
  readFileBase64(require.resolve('@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2')),
  readFileBase64(require.resolve('@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2')),
  readFileBase64(require.resolve('@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2')),
  readFileBase64(new URL('images/mathias-dalgaard.jpg', publicDir)),
])

const fonts = `
  @font-face { font-family: 'Serif'; src: url(data:font/woff2;base64,${serif}) format('woff2'); }
  @font-face { font-family: 'Serif'; font-style: italic; src: url(data:font/woff2;base64,${serifItalic}) format('woff2'); }
  @font-face { font-family: 'Sans'; font-weight: 200 800; src: url(data:font/woff2;base64,${sans}) format('woff2'); }
`

const ogHtml = `<!doctype html><html><head><style>
  ${fonts}
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: #f5efe4; font-family: 'Sans'; color: #16213a; overflow: hidden; position: relative; }
  .rings { position: absolute; right: -260px; top: -300px; width: 980px; height: 980px; border-radius: 50%;
    background: repeating-radial-gradient(circle, transparent 0 46px, rgba(30,91,87,.07) 46px 47.5px); }
  .text { position: absolute; left: 84px; top: 78px; width: 640px; }
  .eyebrow { font-weight: 800; font-size: 19px; letter-spacing: .16em; text-transform: uppercase; color: #1e5b57; display: flex; gap: 14px; align-items: center; }
  .eyebrow i { width: 7px; height: 7px; border-radius: 50%; background: #b5603a; display: block; }
  h1 { font-family: 'Serif'; font-weight: 400; font-size: 132px; line-height: .86; letter-spacing: -.02em; margin-top: 30px; }
  h1 em { font-style: italic; } h1 b { color: #b5603a; font-weight: 400; font-style: normal; }
  p { font-family: 'Serif'; font-size: 33px; line-height: 1.22; margin-top: 26px; max-width: 590px; }
  .tags { position: absolute; left: 84px; bottom: 54px; display: flex; gap: 12px; }
  .tags span { padding: 10px 20px; border-radius: 999px; border: 1.5px solid #ddd2bf; background: #fffdf9; font-weight: 700; font-size: 19px; color: #2b3550; }
  .tags span:first-child { background: #dce8e3; border-color: rgba(30,91,87,.35); color: #164744; }
  .photo { position: absolute; right: 96px; top: 70px; width: 330px; height: 430px; border-radius: 999px 999px 26px 26px; overflow: hidden;
    box-shadow: 0 40px 70px -30px rgba(22,33,58,.5); }
  .photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 35%; }
  .frame { position: absolute; right: 80px; top: 86px; width: 330px; height: 430px; border-radius: 999px 999px 26px 26px; border: 2px solid #b5603a; }
</style></head><body>
  <div class="rings"></div>
  <div class="frame"></div>
  <div class="photo"><img src="data:image/jpeg;base64,${photo}"></div>
  <div class="text">
    <div class="eyebrow">Kandidat i politisk kommunikation <i></i> Odense</div>
    <h1>Mathias<br><em>Dalgaard</em><b>.</b></h1>
    <p>Jeg skaber overblik, når opgaverne er komplekse – og gør det nemmere for andre at handle.</p>
  </div>
  <div class="tags"><span>Politisk analyse</span><span>International koordinering</span><span>Formidling</span></div>
</body></html>`

const iconHtml = (size) => `<!doctype html><html><head><style>
  ${fonts}
  * { margin: 0; } body { width: ${size}px; height: ${size}px; background: transparent; }
  .mark { width: ${size}px; height: ${size}px; border-radius: ${size >= 128 ? 0 : '50%'}; background: #16213a; color: #f5efe4;
    display: grid; place-items: center; font-family: 'Serif'; font-style: italic; font-size: ${size * 0.44}px; position: relative; }
  .mark span { transform: translate(-${size * 0.03}px, ${size * 0.02}px); }
  .dot { position: absolute; width: ${size * 0.1}px; height: ${size * 0.1}px; border-radius: 50%; background: #d27a50; left: ${size * 0.75}px; top: ${size * 0.58}px; }
</style></head><body><div class="mark"><span>MD</span><i class="dot"></i></div></body></html>`

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await og.setContent(ogHtml, { waitUntil: 'load' })
  await og.evaluate(() => document.fonts.ready)
  await og.screenshot({ path: new URL('og-image.jpg', publicDir).pathname, type: 'jpeg', quality: 86 })

  // Portrættet i to størrelser – den lille bruges på mobil.
  const encoder = await browser.newPage()
  for (const width of [800, 480]) {
    const dataUrl = await encoder.evaluate(
      async ({ src, width }) => {
        const image = new Image()
        image.src = src
        await image.decode()
        const height = Math.round((image.naturalHeight / image.naturalWidth) * width)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        context.imageSmoothingQuality = 'high'
        context.drawImage(image, 0, 0, width, height)
        return canvas.toDataURL('image/webp', 0.8)
      },
      { src: `data:image/jpeg;base64,${photo}`, width },
    )
    const file = width === 800 ? 'mathias-dalgaard.webp' : `mathias-dalgaard-${width}.webp`
    await writeFile(new URL(`images/${file}`, publicDir), Buffer.from(dataUrl.split(',')[1], 'base64'))
  }

  for (const [file, size] of [
    ['apple-touch-icon.png', 180],
    ['favicon-32.png', 32],
  ]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
    await page.setContent(iconHtml(size), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: new URL(file, publicDir).pathname, omitBackground: true })
  }
  console.log('✓ portræt (WebP 800/480), og-image.jpg, apple-touch-icon.png og favicon-32.png i public/')
} finally {
  await browser.close()
}
