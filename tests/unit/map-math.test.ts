import { describe, expect, it } from 'vitest'
import { places } from '../../src/data/content'
import { clusterPoints } from '../../src/lib/cluster'
import { boundsOf, project, WORLD_HEIGHT, WORLD_WIDTH } from '../../src/lib/geo'
import { fitBounds } from '../../src/lib/view'

describe('clusterPoints', () => {
  it('holder fjerne punkter adskilt', () => {
    const clusters = clusterPoints(
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 100, y: 0 },
      ],
      30,
    )
    expect(clusters.map((c) => c.members)).toEqual([['a'], ['b']])
  })

  it('samler tætte punkter kædevis og placerer klyngen i midten', () => {
    const clusters = clusterPoints(
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 25, y: 0 },
        { id: 'c', x: 50, y: 0 },
        { id: 'd', x: 400, y: 0 },
      ],
      30,
    )
    expect(clusters).toHaveLength(2)
    expect(clusters[0]).toMatchObject({ id: 'a+b+c', x: 25, y: 0, members: ['a', 'b', 'c'] })
  })
})

describe('kortets geometri', () => {
  it('projicerer alle byer ind på kortet', () => {
    for (const place of places) {
      const [x, y] = project(place.coordinates)
      expect(x).toBeGreaterThan(0)
      expect(x).toBeLessThan(WORLD_WIDTH)
      expect(y).toBeGreaterThan(0)
      expect(y).toBeLessThan(WORLD_HEIGHT)
    }
  })

  it('lægger Odense vest for København og Oslo nord for begge', () => {
    const [odense, kbh, oslo] = ['odense', 'kobenhavn', 'oslo'].map((id) =>
      project(places.find((p) => p.id === id)!.coordinates),
    )
    expect(odense[0]).toBeLessThan(kbh[0])
    expect(oslo[1]).toBeLessThan(odense[1])
  })

  it('giver luft omkring et udsnit', () => {
    const tight = boundsOf([[10, 55]])
    const padded = boundsOf([[10, 55]], 5, 3)
    expect(padded.x0).toBeLessThan(tight.x0)
    expect(padded.y1).toBeGreaterThan(tight.y1)
  })
})

describe('fitBounds', () => {
  const bounds = { x0: 100, y0: 100, x1: 200, y1: 150 }

  it('centrerer udsnittet i det synlige område', () => {
    const t = fitBounds(bounds, { width: 800, height: 600, padding: 40 }, 0.1, 100)
    expect(t.k * 150 + t.x).toBeCloseTo(400)
    expect(t.k * 125 + t.y).toBeCloseTo(300)
  })

  it('tager højde for infopanelet i højre side', () => {
    const t = fitBounds(bounds, { width: 800, height: 600, padding: 40, insetRight: 300 }, 0.1, 100)
    expect(t.k * 150 + t.x).toBeCloseTo(250)
  })

  it('respekterer maksimal zoom', () => {
    const t = fitBounds({ x0: 10, y0: 10, x1: 10.001, y1: 10.001 }, { width: 800, height: 600 }, 1, 20)
    expect(t.k).toBe(20)
  })
})
