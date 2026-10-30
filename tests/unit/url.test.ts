import { describe, expect, it } from 'vitest'
import { asset, mailtoHref, telHref } from '../../src/lib/url'

describe('links', () => {
  it('laver tel:-links uden mellemrum', () => {
    expect(telHref('+45 25 52 56 57')).toBe('tel:+4525525657')
  })

  it('laver mailto:-links med kodet emne', () => {
    expect(mailtoHref('a@b.dk', 'Skal vi tage en kaffe?')).toBe('mailto:a@b.dk?subject=Skal%20vi%20tage%20en%20kaffe%3F')
    expect(mailtoHref('a@b.dk')).toBe('mailto:a@b.dk')
  })

  it('lægger GitHub Pages-undermappen foran filer i public/', () => {
    expect(asset('cv/x.pdf')).toBe(`${import.meta.env.BASE_URL}cv/x.pdf`)
    expect(asset('/cv/x.pdf')).toBe(`${import.meta.env.BASE_URL}cv/x.pdf`)
  })
})
