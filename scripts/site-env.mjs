// Fælles opsætning af stier, så Vite og prerender-scriptet altid er enige.
//
// GitHub Actions sætter BASE_PATH og SITE_URL ud fra repositoriets Pages-indstillinger
// (se .github/workflows/deploy.yml). Lokalt bruges standardværdierne nedenfor –
// ret dem, hvis repositoriet får et andet navn eller et eget domæne.

const DEFAULT_BASE_PATH = '/mathias-cv/'
const DEFAULT_SITE_URL = 'https://son-kou.github.io/mathias-cv/'

const withTrailingSlash = (value) => (value.endsWith('/') ? value : `${value}/`)

export function basePath() {
  return withTrailingSlash(process.env.BASE_PATH || DEFAULT_BASE_PATH)
}

/** Fuld URL til siden, fx https://son-kou.github.io/mathias-cv/ */
export function siteUrl() {
  return withTrailingSlash(process.env.SITE_URL || DEFAULT_SITE_URL)
}
