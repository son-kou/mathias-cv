export interface ScreenPoint {
  id: string
  x: number
  y: number
}

export interface Cluster {
  id: string
  x: number
  y: number
  members: string[]
}

/**
 * Samler pins, der ligger tættere end `radius` pixels, i én klynge (kædevis,
 * så A–B–C bliver én klynge, selv om A og C ligger lidt længere fra hinanden).
 * Rækkefølgen i input bevares, så resultatet er stabilt mellem frames.
 */
export function clusterPoints(points: ScreenPoint[], radius: number): Cluster[] {
  const used = new Set<string>()
  const clusters: Cluster[] = []

  for (const seed of points) {
    if (used.has(seed.id)) continue
    used.add(seed.id)
    const members = [seed]
    for (let i = 0; i < members.length; i++) {
      for (const candidate of points) {
        if (used.has(candidate.id)) continue
        if (Math.hypot(candidate.x - members[i].x, candidate.y - members[i].y) < radius) {
          used.add(candidate.id)
          members.push(candidate)
        }
      }
    }
    clusters.push({
      id: members.map((m) => m.id).join('+'),
      x: members.reduce((sum, m) => sum + m.x, 0) / members.length,
      y: members.reduce((sum, m) => sum + m.y, 0) / members.length,
      members: members.map((m) => m.id),
    })
  }
  return clusters
}
