// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { render } from '../../src/entry-server'

describe('forhåndsrendering', () => {
  it('kan renderes uden browser (window/document)', () => {
    const html = render()
    expect(html).toContain('Mathias')
    expect(html).toContain('Fem lande.')
    expect(html).toContain('href="tel:+4525525657"')
    expect(html).toContain('Stagiaire, cyber- og hybride trusler')
  })
})
