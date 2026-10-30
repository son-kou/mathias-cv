import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../../src/App'

const timelineCards = () => document.querySelectorAll('.timeline__list > li')

describe('forsiden', () => {
  it('viser navn, rolle og tydelige handlinger', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Mathias\s*Dalgaard/)
    expect(screen.getAllByText(/Kandidat i politisk kommunikation/).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Udforsk min erfaring/ })).toHaveAttribute('href', '#rejse')
    expect(screen.getByRole('link', { name: /Skal vi tage en kaffe\?/ })).toHaveAttribute('href', '#kontakt')
  })

  it('linker til CV’et som PDF, når filen findes', () => {
    render(<App />)
    const links = screen.getAllByRole('link', { name: /CV/ })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) expect(link.getAttribute('href')).toMatch(/cv\/Mathias-Dalgaard-CV\.pdf$/)
  })
})

describe('kontakt', () => {
  it('har fungerende telefon-, mail- og LinkedIn-links med tekst', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /Ring til mig.*\+45 25 52 56 57/ })).toHaveAttribute('href', 'tel:+4525525657')
    expect(screen.getByRole('link', { name: /Send mig en besked.*mathias\.dalgrd@gmail\.com/ })).toHaveAttribute(
      'href',
      'mailto:mathias.dalgrd@gmail.com?subject=Skal%20vi%20tage%20en%20kaffe%3F',
    )
    const linkedin = screen.getByRole('link', { name: /LinkedIn/ })
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/mathias-dalgaard')
    expect(linkedin.getAttribute('rel')).toContain('noopener')
  })
})

describe('tidslinje og kort', () => {
  it('filtrerer tidslinjen', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(timelineCards()).toHaveLength(8)
    await user.click(screen.getByRole('button', { name: /^Uddannelse/ }))
    expect(timelineCards()).toHaveLength(2)
    expect(screen.getByRole('button', { name: /^Uddannelse/ })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /^Internationale ophold/ }))
    expect(timelineCards()).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: /^Alle/ }))
    expect(timelineCards()).toHaveLength(8)
  })

  it('åbner byens panel fra tidslinjen og lukker det med Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Vis Bruxelles på kortet' }))
    const panel = screen.getByRole('region', { name: /Bruxelles/ })
    expect(within(panel).getByText('Danmarks Faste Repræsentation ved EU')).toBeInTheDocument()
    expect(within(panel).getByRole('heading', { level: 3 })).toHaveFocus()
    expect(document.querySelector('.tl-entry.is-linked')).not.toBeNull()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('region', { name: /Bruxelles/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vis Bruxelles på kortet' })).toHaveFocus()
  })

  it('viser alle Oslo-erfaringer i panelet og kan bladre videre', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('group', { name: 'Vælg en by' })).getByRole('button', { name: 'Oslo' }))
    const panel = screen.getByRole('region', { name: /Oslo/ })
    expect(within(panel).getAllByRole('button', { name: /vis i tidslinjen/ })).toHaveLength(5)

    await user.click(within(panel).getByRole('button', { name: /Næste by/ }))
    expect(screen.getByRole('region', { name: /Akita/ })).toBeInTheDocument()
  })
})

describe('styrker', () => {
  it('folder et konkret eksempel ud', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getAllByRole('button', { name: 'Se et konkret eksempel' })[0]
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveTextContent('Skjul eksemplet')
  })
})
