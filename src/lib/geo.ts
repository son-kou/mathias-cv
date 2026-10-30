import { geoGraticule, geoNaturalEarth1, geoPath } from 'd3-geo'

/**
 * Kortets "verdenskoordinater": Natural Earth-projektionen, skaleret så hele
 * kloden er 1000 enheder bred. Zoom og panorering sker oven på disse koordinater.
 */
export const WORLD_WIDTH = 1000

export const projection = geoNaturalEarth1().fitWidth(WORLD_WIDTH, { type: 'Sphere' }).precision(0.3)

export const worldPath = geoPath(projection).digits(2)

const sphereBounds = worldPath.bounds({ type: 'Sphere' })
export const WORLD_HEIGHT = sphereBounds[1][1]

/** Den del af kloden, der er relevant at vise (uden Antarktis). */
export const WORLD_BOUNDS: Bounds = { x0: 0, y0: 0, x1: WORLD_WIDTH, y1: WORLD_HEIGHT * 0.86 }

export const spherePath = worldPath({ type: 'Sphere' }) ?? ''
export const graticulePath = worldPath(geoGraticule().step([20, 20])()) ?? ''

export interface Bounds {
  x0: number
  y0: number
  x1: number
  y1: number
}

export function project(coordinates: [number, number]): [number, number] {
  const point = projection(coordinates)
  if (!point) throw new Error(`Kan ikke projicere ${coordinates.join(', ')}`)
  return point
}

/**
 * Afgrænsning (i verdenskoordinater) af en række steder plus en margen i grader,
 * så der er luft og geografisk kontekst omkring dem.
 */
export function boundsOf(coordinates: [number, number][], padLon = 0, padLat = 0): Bounds {
  const xs: number[] = []
  const ys: number[] = []
  for (const [lon, lat] of coordinates) {
    for (const [dx, dy] of [
      [-padLon, -padLat],
      [padLon, -padLat],
      [-padLon, padLat],
      [padLon, padLat],
    ]) {
      const [x, y] = project([lon + dx, Math.max(-85, Math.min(85, lat + dy))])
      xs.push(x)
      ys.push(y)
    }
  }
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
}
