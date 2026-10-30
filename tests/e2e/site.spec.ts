import { expect, test, type Page } from '@playwright/test'

/** Fejl i konsollen (fx hydreringsfejl) skal få testene til at fejle. */
function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

const isMobile = (testInfo: { project: { name: string } }) => testInfo.project.name === 'mobil'

test('indlæses uden fejl og med korrekte metadata', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('./')
  await expect(page).toHaveTitle(/Mathias Dalgaard/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mathias')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/.+og-image\.jpg$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'da')
  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})

test('har ingen vandret scroll i nogen skærmbredde', async ({ page }) => {
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, `${width}px`).toBe(0)
  }
})

test('CV, telefon og e-mail virker', async ({ page, request }) => {
  await page.goto('./')
  const cv = page.locator('a.cv-link--hero')
  const href = await cv.getAttribute('href')
  const response = await request.get(new URL(href!, page.url()).toString())
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
  await expect(page.locator('.contact-card--phone a')).toHaveAttribute('href', 'tel:+4525525657')
  await expect(page.locator('.contact-card--mail a')).toHaveAttribute('href', /^mailto:mathias\.dalgrd@gmail\.com/)
})

test('navigation viser den aktuelle sektion', async ({ page }, testInfo) => {
  await page.goto('./')
  if (isMobile(testInfo)) {
    await page.getByRole('button', { name: 'Menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await page.getByRole('button', { name: 'Menu' }).click()
    await menu.getByRole('link', { name: /Kompetencer/ }).click()
    await expect(menu).toBeHidden()
  } else {
    await page.getByRole('navigation', { name: 'Hovedmenu' }).getByRole('link', { name: 'Kompetencer' }).click()
  }
  await expect(page.locator('#kompetencer')).toBeInViewport()
  if (!isMobile(testInfo)) {
    await expect(page.locator('.site-nav__link[aria-current="true"]')).toHaveText('Kompetencer', { timeout: 10_000 })
  }
})

test('kort og tidslinje er forbundet begge veje', async ({ page }) => {
  await page.goto('./#rejse')
  const cities = page.getByRole('group', { name: 'Vælg en by' })

  // By → panel → tidslinje
  await cities.getByRole('button', { name: 'Bruxelles' }).click()
  const panel = page.getByRole('region', { name: /Bruxelles/ })
  await expect(panel).toBeVisible()
  await expect(page.locator('.tl-entry.is-linked')).toHaveCount(1)
  await panel.getByRole('button', { name: /vis i tidslinjen/ }).click()
  await expect(page.locator('#erfaring-eu-repraesentation')).toBeFocused()
  await expect(page.locator('#erfaring-eu-repraesentation')).toBeInViewport()

  // Escape lukker panelet
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()

  // Tidslinje → kort
  await page.getByRole('button', { name: 'Vis Akita på kortet' }).click()
  await expect(page.getByRole('region', { name: /Akita/ })).toBeVisible()
  await expect(page.locator('.map-pin.is-selected')).toHaveCount(1)
  await expect(page.locator('.map-viewport')).toBeInViewport()
})

test('tætte byer samles og kan foldes ud', async ({ page }) => {
  await page.goto('./#rejse')
  await page.getByRole('button', { name: 'Hele rejsen', exact: true }).click()
  const cluster = page.locator('.map-cluster', { has: page.locator('text=København') }).first()
  await expect(cluster).toHaveAttribute('aria-label', /København/)
  // På smalle skærme kan det kræve et ekstra klik, før de allertætteste byer skilles ad.
  const kbh = page.getByRole('button', { name: /^København, Danmark/ })
  for (let attempt = 0; attempt < 3 && !(await kbh.isVisible()); attempt++) {
    await page.locator('.map-cluster', { has: page.locator('text=København') }).first().click()
    await page.waitForTimeout(1300)
  }
  await expect(kbh).toBeVisible()
  await expect(page.getByRole('button', { name: /^Odense, Danmark/ })).toBeVisible()
  // Nye pins skal kunne ses med det samme (ikke vente på intro-animationen).
  await page.waitForTimeout(700)
  const opacity = await page
    .locator('.map-pin', { hasText: 'Odense' })
    .locator('.map-pin__dot')
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(Number(opacity)).toBeGreaterThan(0.9)
})

test('filteret dæmper byer uden erfaringer i kategorien', async ({ page }) => {
  await page.goto('./#rejse')
  await page.getByRole('button', { name: 'Europa' }).click()
  await page.getByRole('button', { name: /^Uddannelse/ }).click()
  await expect(page.locator('.timeline__list > li')).toHaveCount(2)
  await expect(page.getByRole('button', { name: /^Oslo, Norge/ })).not.toHaveClass(/is-dimmed/)
  await expect(page.getByRole('button', { name: /^Bruxelles, Belgien/ })).toHaveClass(/is-dimmed/)
})

test('kortet kan styres med tastaturet', async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo), 'tastaturtest på desktop')
  await page.goto('./#rejse')
  const viewport = page.locator('.map-viewport')
  await viewport.focus()
  const transform = () => page.locator('.map-svg > g').getAttribute('transform')
  await expect.poll(transform).not.toBeNull()
  const before = await transform()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('+')
  await expect.poll(transform).not.toBe(before)
})

test('første Tab rammer "Spring til indholdet"', async ({ page }, testInfo) => {
  test.skip(isMobile(testInfo), 'tastaturtest på desktop')
  await page.goto('./')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Spring til indholdet' })).toBeFocused()
})

test('respekterer "reducer bevægelse"', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./#kontakt')
  const steam = page.locator('.cup__steam path').first()
  await expect(steam).toHaveCSS('animation-name', 'none')
  await expect(steam).toHaveCSS('opacity', '0.45')
  const badge = page.locator('.badge__ring')
  expect(await badge.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
})

test('har en venlig 404-side til GitHub Pages', async ({ request }) => {
  // `vite preview` sender alle ukendte adresser til index.html; GitHub Pages bruger 404.html.
  const response = await request.get('./404.html')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('Gå til forsiden')
  expect(html).toContain('href="/mathias-cv/"')
})
