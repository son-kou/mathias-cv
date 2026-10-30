import { ContactSection } from './components/contact/ContactSection'
import { Hero } from './components/Hero'
import { JourneySection } from './components/journey/JourneySection'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { StrengthsSection } from './components/StrengthsSection'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/hero.css'
import './styles/journey.css'
import './styles/strengths.css'
import './styles/contact.css'

export function App() {
  return (
    <>
      <a className="skip-link" href="#indhold">
        Spring til indholdet
      </a>
      <SiteHeader />
      <main id="indhold" tabIndex={-1}>
        <Hero />
        <JourneySection />
        <StrengthsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  )
}
