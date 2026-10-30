import { describe, expect, it } from 'vitest'
import * as content from '../../src/data/content'

const { contact, experiences, facts, journeyRoute, mapViews, places, strengths } = content
const placeIds = new Set(places.map((p) => p.id))
const experienceIds = new Set(experiences.map((e) => e.id))

describe('indholdet hænger sammen', () => {
  it('har unikke id’er', () => {
    expect(placeIds.size).toBe(places.length)
    expect(experienceIds.size).toBe(experiences.length)
  })

  it('knytter kun erfaringer til byer, der findes', () => {
    for (const entry of experiences) {
      for (const id of entry.placeIds) expect(placeIds, `${entry.id} → ${id}`).toContain(id)
    }
  })

  it('har mindst én erfaring for hver by (undtagen den nuværende base)', () => {
    for (const place of places.filter((p) => !p.kinds.includes('base'))) {
      expect(experiences.some((e) => e.placeIds.includes(place.id)), place.id).toBe(true)
    }
  })

  it('har en rute, der besøger alle byer præcis én gang', () => {
    expect(new Set(journeyRoute).size).toBe(journeyRoute.length)
    expect([...journeyRoute].sort()).toEqual([...placeIds].sort())
  })

  it('bruger kun eksisterende byer i kortudsnittene', () => {
    for (const view of mapViews) {
      if (view.places === 'all') continue
      for (const id of view.places) expect(placeIds).toContain(id)
    }
  })

  it('henviser kun til eksisterende erfaringer fra styrkekortene', () => {
    for (const strength of strengths) {
      for (const id of strength.evidence) expect(experienceIds).toContain(id)
    }
  })

  it('har gyldige koordinater (kun byniveau)', () => {
    for (const { coordinates: [lon, lat] } of places) {
      expect(lon).toBeGreaterThanOrEqual(-180)
      expect(lon).toBeLessThanOrEqual(180)
      expect(lat).toBeGreaterThanOrEqual(-90)
      expect(lat).toBeLessThanOrEqual(90)
    }
  })

  it('har korrekte kontaktoplysninger', () => {
    expect(contact.phone).toBe('+4525525657')
    expect(contact.phoneDisplay.replace(/\s/g, '')).toBe(contact.phone)
    expect(contact.email).toBe('mathias.dalgrd@gmail.com')
    expect(contact.linkedin).toBe('https://www.linkedin.com/in/mathias-dalgaard')
  })

  it('stemmer overens med CV’et på nøglepunkterne', () => {
    const eu = experiences.find((e) => e.id === 'eu-repraesentation')!
    expect(eu.period).toBe('Apr. 2025 – jan. 2026')
    expect(experiences.find((e) => e.id === 'kandidat-uio')!.title).toBe('Kandidat i politisk kommunikation')
    expect(JSON.stringify(experiences)).toContain('A (12)')
    expect(facts.map((f) => f.value)).toEqual(['10', '2', '5', 'A'])
  })

  it('indeholder ikke tekst fra målrettede ansøgninger', () => {
    expect(JSON.stringify(content)).not.toMatch(/stelton/i)
  })
})
