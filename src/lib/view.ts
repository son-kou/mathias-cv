import type { Bounds } from './geo'

export interface ViewTransform {
  k: number
  x: number
  y: number
}

export interface Viewport {
  width: number
  height: number
  /** Plads i højre side, der er dækket af infopanelet. */
  insetRight?: number
  /** Luft omkring udsnittet – mere vandret, så bynavnene ikke klippes af. */
  padding?: number | { x: number; y: number }
}

/**
 * Finder den zoom/forskydning, der får `bounds` til at fylde det synlige
 * område – med hensyn til et eventuelt infopanel i højre side.
 */
export function fitBounds(bounds: Bounds, viewport: Viewport, kMin: number, kMax: number): ViewTransform {
  const { width, height, insetRight = 0, padding = 32 } = viewport
  const pad = typeof padding === 'number' ? { x: padding, y: padding } : padding
  const availableWidth = Math.max(40, width - insetRight - pad.x * 2)
  const availableHeight = Math.max(40, height - pad.y * 2)
  const boundsWidth = Math.max(1e-6, bounds.x1 - bounds.x0)
  const boundsHeight = Math.max(1e-6, bounds.y1 - bounds.y0)
  const k = clamp(Math.min(availableWidth / boundsWidth, availableHeight / boundsHeight), kMin, kMax)
  const cx = (bounds.x0 + bounds.x1) / 2
  const cy = (bounds.y0 + bounds.y1) / 2
  return {
    k,
    x: pad.x + availableWidth / 2 - k * cx,
    y: pad.y + availableHeight / 2 - k * cy,
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
