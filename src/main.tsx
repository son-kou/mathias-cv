import '@fontsource-variable/manrope/wght.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'

// Indgangsanimationer aktiveres først, når JavaScript faktisk kører – så indholdet
// aldrig forbliver skjult, hvis scriptet ikke kan indlæses.
document.documentElement.classList.add('js')

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// I produktion er HTML'en forhåndsrenderet (scripts/prerender.mjs) og skal blot "vækkes".
if (container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
