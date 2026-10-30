import { easeCubicInOut } from 'd3-ease'
import { select } from 'd3-selection'
import 'd3-transition'
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom'
import type { FeatureCollection } from 'geojson'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { feature } from 'topojson-client'
import type { GeometryObject, Topology } from 'topojson-specification'
import worldUrl from '../../data/world.json?url'
import {
  experiences,
  journeyRoute,
  journeyRouteCaption,
  kindLabels,
  mapViews,
  places,
  type Place,
  type PlaceKind,
} from '../../data/content'
import { useElementSize } from '../../hooks/useElementSize'
import { useInViewOnce } from '../../hooks/useInView'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { clusterPoints } from '../../lib/cluster'
import { boundsOf, graticulePath, project, spherePath, WORLD_BOUNDS, WORLD_WIDTH, worldPath } from '../../lib/geo'
import { fitBounds, type ViewTransform } from '../../lib/view'
import { Icon, kindIcon } from '../Icon'
import { MapPanel } from './MapPanel'

/** Bredde (px), som infopanelet dækker, når det ligger oven på kortet. */
const PANEL_INSET = 344
/** Fra denne kortbredde lægges panelet oven på kortet – ellers under det. */
export const OVERLAY_MIN_WIDTH = 640
/** Pins tættere end dette (px) samles i en klynge, så de altid kan vælges. */
const CLUSTER_RADIUS = 38

const PROJECTED = places.map((place) => ({ place, xy: project(place.coordinates) }))
const ROUTE_ORDER = new Map(journeyRoute.map((id, index) => [id, index]))
const LEGEND_KINDS: PlaceKind[] = ['work', 'education', 'international', 'base']

interface WorldLayers {
  land: string
  borders: string
  visited: { id: string; name: string; d: string }[]
}

let worldRequest: Promise<WorldLayers> | null = null

/** Henter og tegner verdenskortet én gang (lazy – først når kortet nærmer sig). */
function loadWorld() {
  worldRequest ??= fetch(worldUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Kortdata kunne ikke hentes (${response.status})`)
      return response.json() as Promise<Topology>
    })
    .then((topology) => {
      const visited = feature(topology, topology.objects.highlighted) as FeatureCollection
      return {
        land: worldPath(feature(topology, topology.objects.land as GeometryObject)) ?? '',
        borders: worldPath(feature(topology, topology.objects.borders as GeometryObject)) ?? '',
        visited: visited.features.map((f, i) => ({
          id: String(f.id ?? i),
          name: String(f.properties?.name ?? ''),
          d: worldPath(f) ?? '',
        })),
      }
    })
    .catch((error: unknown) => {
      worldRequest = null
      throw error
    })
  return worldRequest
}

interface WorldMapProps {
  selectedId: string | null
  activeEntryId: string | null
  onSelect: (id: string, trigger?: HTMLElement | null, entryId?: string | null, moveFocus?: boolean) => void
  onClose: () => void
  onShowInTimeline: (entryId: string) => void
  nearIds: string[]
  dimmedIds: string[]
  focusRequest: number
}

export function WorldMap({
  selectedId,
  activeEntryId,
  onSelect,
  onClose,
  onShowInTimeline,
  nearIds,
  dimmedIds,
  focusRequest,
}: WorldMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const size = useElementSize(viewportRef)
  const reduced = usePrefersReducedMotion()
  const approaching = useInViewOnce(viewportRef, { rootMargin: '900px 0px' })
  const revealed = useInViewOnce(viewportRef, { threshold: 0.25 })
  const [world, setWorld] = useState<WorldLayers | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [transform, setTransform] = useState<ViewTransform | null>(null)
  const [view, setView] = useState<string | null>('journey')
  const [wheelHint, setWheelHint] = useState(false)
  const [intro, setIntro] = useState(false)

  const overlayPanel = (size?.width ?? 0) >= OVERLAY_MIN_WIDTH
  const limits = useMemo(() => {
    if (!size) return null
    const fit = fitBounds(WORLD_BOUNDS, { ...size, padding: 8 }, 0, Infinity)
    return { min: fit.k * 0.9, max: fit.k * 60 }
  }, [size])

  // Spejl af de værdier, som zoom-callbacks skal kende uden at blive genoprettet.
  const live = useRef({ selectedId, view, overlayPanel, size, limits, reduced })
  useEffect(() => {
    live.current = { selectedId, view, overlayPanel, size, limits, reduced }
  })

  /* ── Hvor skal kortet kigge hen? ─────────────────────────────────────── */

  const targetFor = useCallback((what: { place: string } | { view: string } | { members: string[] }) => {
    const { size, limits, overlayPanel, selectedId } = live.current
    if (!size || !limits) return null
    const padding = size.width < 560 ? { x: 44, y: 30 } : { x: 96, y: 52 }
    if ('place' in what) {
      const place = places.find((p) => p.id === what.place)
      if (!place) return null
      const insetRight = overlayPanel ? PANEL_INSET : 0
      return fitBounds(boundsOf([place.coordinates], 7, 4.5), { ...size, padding, insetRight }, limits.min, limits.max)
    }
    const insetRight = overlayPanel && selectedId ? PANEL_INSET : 0
    if ('members' in what) {
      const coords = places.filter((p) => what.members.includes(p.id)).map((p) => p.coordinates)
      const roomy = { x: padding.x, y: padding.y * 1.4 }
      return fitBounds(boundsOf(coords, 1, 0.8), { ...size, padding: roomy, insetRight }, limits.min, limits.max)
    }
    const preset = mapViews.find((v) => v.id === what.view) ?? mapViews[0]
    const coords = places
      .filter((p) => preset.places === 'all' || preset.places.includes(p.id))
      .map((p) => p.coordinates)
    return fitBounds(boundsOf(coords, 4, 3), { ...size, padding, insetRight }, limits.min, limits.max)
  }, [])

  const goTo = useCallback((target: ViewTransform | null, duration = 1100) => {
    const svg = svgRef.current
    const behavior = zoomRef.current
    if (!svg || !behavior || !target) return
    const next = zoomIdentity.translate(target.x, target.y).scale(target.k)
    const selection = select(svg)
    // Brugeren er i gang – nye pins skal ikke vente på intro-animationen.
    setIntro(false)
    selection.interrupt()
    if (duration === 0 || live.current.reduced) behavior.transform(selection, next)
    else selection.transition().duration(duration).ease(easeCubicInOut).call(behavior.transform, next)
  }, [])

  /* ── Opsætning af zoom/pan ───────────────────────────────────────────── */

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const behavior = zoom<SVGSVGElement, unknown>()
      // Almindelig scroll ruller siden; ⌘/Ctrl + scroll (og knib på touchpad) zoomer.
      // På touch flytter én finger siden, mens to fingre zoomer og flytter kortet.
      .filter((event: Event) => {
        if (event.type === 'wheel') return (event as WheelEvent).ctrlKey || (event as WheelEvent).metaKey
        if (event.type === 'touchstart') return (event as TouchEvent).touches.length > 1
        return !(event as MouseEvent).ctrlKey && !(event as MouseEvent).button
      })
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { k, x, y } = event.transform
        setTransform({ k, x, y })
        if (event.sourceEvent) {
          setView(null)
          setIntro(false)
        }
      })
    select(svg).call(behavior)
    zoomRef.current = behavior
    return () => {
      select(svg).interrupt().on('.zoom', null)
      zoomRef.current = null
    }
  }, [])

  // Ny størrelse: opdatér grænser og vis det aktuelle udsnit igen.
  useEffect(() => {
    const behavior = zoomRef.current
    if (!size || !limits || !behavior) return
    behavior
      .extent([
        [0, 0],
        [size.width, size.height],
      ])
      .scaleExtent([limits.min, limits.max])
      .translateExtent([
        [-WORLD_WIDTH * 0.15, 0],
        [WORLD_WIDTH * 1.15, WORLD_BOUNDS.y1 + 60],
      ])
    const { selectedId, view } = live.current
    goTo(selectedId ? targetFor({ place: selectedId }) : targetFor({ view: view ?? 'journey' }), 0)
  }, [size, limits, goTo, targetFor])

  // En by er valgt (fra kortet, bylisten eller tidslinjen): flyv derhen.
  useEffect(() => {
    if (!selectedId) return
    setView(null)
    goTo(targetFor({ place: selectedId }))
  }, [selectedId, goTo, targetFor])

  // Hent kortdata, når kortet nærmer sig skærmen.
  useEffect(() => {
    if (!approaching || world) return
    let cancelled = false
    loadWorld()
      .then((layers) => !cancelled && setWorld(layers))
      .catch(() => !cancelled && setLoadFailed(true))
    return () => {
      cancelled = true
    }
  }, [approaching, world])

  // Første gang kortet ses, dukker pins frem én for én i rutens rækkefølge.
  useEffect(() => {
    if (!revealed) return
    setIntro(true)
    const timer = window.setTimeout(() => setIntro(false), 3400)
    return () => window.clearTimeout(timer)
  }, [revealed])

  // Diskret hjælpetekst, hvis man scroller over kortet uden ⌘/Ctrl.
  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    let timer = 0
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) < 4) return
      setWheelHint(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setWheelHint(false), 1500)
    }
    element.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      element.removeEventListener('wheel', onWheel)
      window.clearTimeout(timer)
    }
  }, [])

  /* ── Handlinger ──────────────────────────────────────────────────────── */

  const showView = (id: string) => {
    setView(id)
    goTo(targetFor({ view: id }))
  }

  const zoomBy = (factor: number) => {
    const svg = svgRef.current
    const behavior = zoomRef.current
    if (!svg || !behavior) return
    setView(null)
    const selection = select(svg)
    if (reduced) behavior.scaleBy(selection, factor)
    else behavior.scaleBy(selection.transition().duration(350).ease(easeCubicInOut), factor)
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !transform) return
    const svg = svgRef.current
    const behavior = zoomRef.current
    if (!svg || !behavior) return
    const step = 90 / transform.k
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    }
    if (event.key in moves) {
      event.preventDefault()
      setView(null)
      const [dx, dy] = moves[event.key]
      behavior.translateBy(select(svg).transition().duration(reduced ? 0 : 220), dx, dy)
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomBy(1.6)
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      zoomBy(1 / 1.6)
    } else if (event.key === '0') {
      event.preventDefault()
      showView('journey')
    }
  }

  /* ── Pins, klynger og rute i skærmkoordinater ────────────────────────── */

  const screen = useMemo(() => {
    if (!transform) return null
    const points = PROJECTED.map(({ place, xy }) => ({
      id: place.id,
      x: transform.k * xy[0] + transform.x,
      y: transform.k * xy[1] + transform.y,
    }))
    return {
      byId: new Map(points.map((p) => [p.id, p])),
      clusters: clusterPoints(points, CLUSTER_RADIUS),
    }
  }, [transform])

  const routePath = useMemo(() => {
    if (!screen) return ''
    const stops = journeyRoute.map((id) => screen.byId.get(id)).filter((p) => p !== undefined)
    return stops.reduce((d, point, index) => {
      if (index === 0) return `M${point.x.toFixed(1)},${point.y.toFixed(1)}`
      const from = stops[index - 1]
      // Bløde buer, der altid bøjer opad – som flyruter på et gammelt kort.
      let nx = point.y - from.y
      let ny = -(point.x - from.x)
      if (ny > 0) {
        nx = -nx
        ny = -ny
      }
      const cx = (from.x + point.x) / 2 + nx * 0.2
      const cy = (from.y + point.y) / 2 + ny * 0.2
      return `${d} Q${cx.toFixed(1)},${cy.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`
    }, '')
  }, [screen])

  const selectedPlace = places.find((p) => p.id === selectedId) ?? null
  const linked = selectedPlace ? experiences.filter((e) => e.placeIds.includes(selectedPlace.id)) : []

  const viewportClass = [
    'map-viewport',
    revealed && 'is-revealed',
    intro && 'is-intro',
    world && 'is-loaded',
    selectedPlace && overlayPanel && 'has-panel',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="map-card">
      <div className="map-card__bar">
        <div className="segmented" role="group" aria-label="Vælg kortudsnit">
          {mapViews.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="segmented__button"
              aria-pressed={view === preset.id}
              onClick={() => showView(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="map-zoom" role="group" aria-label="Zoom">
          <button type="button" className="icon-button" onClick={() => zoomBy(1 / 1.6)} aria-label="Zoom ud">
            <Icon name="minus" />
          </button>
          <button type="button" className="icon-button" onClick={() => zoomBy(1.6)} aria-label="Zoom ind">
            <Icon name="plus" />
          </button>
          <button type="button" className="icon-button" onClick={() => showView('journey')} aria-label="Vis hele rejsen">
            <Icon name="focus" />
          </button>
        </div>
      </div>

      <div className="map-stage">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- piletaster og +/− styrer kortet */}
        <div
          ref={viewportRef}
          className={viewportClass}
          // Kortet kan fokuseres, så det kan styres med piletaster og + / −.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="group"
          aria-roledescription="kort"
          aria-label="Interaktivt verdenskort over de steder, jeg har studeret og arbejdet"
          aria-describedby="kort-hjaelp"
          onKeyDown={onKeyDown}
        >
          <svg ref={svgRef} className="map-svg" aria-hidden="true" focusable="false">
            {transform && (
              <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
                <MapBase world={world} />
              </g>
            )}
          </svg>

          {screen && (
            <svg className="map-route" aria-hidden="true" focusable="false">
              <path className="map-route__path" d={routePath} pathLength={1} />
            </svg>
          )}

          <div className="map-pins">
            {screen?.clusters.map((cluster) => {
              if (cluster.members.length > 1) {
                const members = places.filter((p) => cluster.members.includes(p.id))
                const names = members.map((p) => p.city)
                const containsSelected = selectedId !== null && cluster.members.includes(selectedId)
                return (
                  <button
                    key={cluster.id}
                    type="button"
                    className={`map-cluster${containsSelected ? ' is-selected' : ''}`}
                    style={{ transform: `translate(${cluster.x}px, ${cluster.y}px)` }}
                    onClick={() => {
                      setView(null)
                      goTo(targetFor({ members: cluster.members }), 900)
                    }}
                    aria-label={`${members.length} steder: ${names.join(', ')}. Zoom ind`}
                  >
                    <span className="map-cluster__count" aria-hidden="true">
                      {members.length}
                    </span>
                    <span className="map-cluster__label" aria-hidden="true">
                      {names.join(' · ')}
                    </span>
                  </button>
                )
              }
              const place = places.find((p) => p.id === cluster.members[0])!
              return (
                <Pin
                  key={place.id}
                  place={place}
                  x={cluster.x}
                  y={cluster.y}
                  selected={selectedId === place.id}
                  near={nearIds.includes(place.id)}
                  dimmed={dimmedIds.includes(place.id)}
                  onSelect={(trigger) => onSelect(place.id, trigger)}
                />
              )
            })}
          </div>

          <p className={`map-hint${wheelHint ? ' is-visible' : ''}`} aria-hidden="true">
            Hold ⌘ eller Ctrl nede, og scroll for at zoome
          </p>
          {loadFailed && <p className="map-error">Kortet kunne ikke indlæses – byerne kan stadig vælges nedenfor.</p>}
        </div>

        {selectedPlace && (
          <MapPanel
            place={selectedPlace}
            linked={linked}
            activeEntryId={activeEntryId}
            overlay={overlayPanel}
            focusRequest={focusRequest}
            onClose={onClose}
            onNavigate={(id) => onSelect(id, null, null, false)}
            onShowInTimeline={onShowInTimeline}
          />
        )}
      </div>

      <div className="map-card__foot">
        <div className="map-cities" role="group" aria-label="Vælg en by">
          {journeyRoute.map((id) => {
            const place = places.find((p) => p.id === id)!
            return (
              <button
                key={id}
                type="button"
                className="city-chip"
                aria-pressed={selectedId === id}
                aria-controls={selectedId === id ? 'kort-panel' : undefined}
                onClick={(event) => onSelect(id, event.currentTarget)}
                style={kindColors(place.kinds)}
              >
                <span className="city-chip__dot" aria-hidden="true" />
                {place.city}
              </button>
            )
          })}
        </div>
        <ul className="map-legend" aria-label="Signaturforklaring">
          {LEGEND_KINDS.map((kind) => (
            <li key={kind}>
              <span className={`legend-pin legend-pin--${kind}`} aria-hidden="true">
                <Icon name={kindIcon[kind]} />
              </span>
              {kindLabels[kind]}
            </li>
          ))}
          <li className="map-legend__route">
            <span className="legend-route" aria-hidden="true" />
            {journeyRouteCaption}
          </li>
        </ul>
        <p className="map-help" id="kort-hjaelp">
          <span className="map-help__pointer">Træk for at flytte kortet, og brug ⌘/Ctrl + scroll for at zoome. </span>
          <span className="map-help__touch">Knib med to fingre for at zoome. </span>
          Tætte byer samles i en cirkel – klik på den for at zoome ind. Når kortet er i fokus, virker piletasterne og
          + / −.
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {selectedPlace ? `${selectedPlace.city}, ${selectedPlace.country} er valgt.` : ''}
      </p>
    </div>
  )
}

function kindColors(kinds: PlaceKind[]) {
  return {
    '--c1': `var(--kind-${kinds[0]})`,
    '--c2': `var(--kind-${kinds[1] ?? kinds[0]})`,
  } as CSSProperties
}

interface PinProps {
  place: Place
  x: number
  y: number
  selected: boolean
  near: boolean
  dimmed: boolean
  onSelect: (trigger: HTMLElement) => void
}

function Pin({ place, x, y, selected, near, dimmed, onSelect }: PinProps) {
  const className = [
    'map-pin',
    `map-pin--${place.kinds[0]}`,
    place.kinds.length > 1 && 'map-pin--split',
    selected && 'is-selected',
    near && 'is-near',
    dimmed && 'is-dimmed',
  ]
    .filter(Boolean)
    .join(' ')
  const style = {
    transform: `translate(${x}px, ${y}px)`,
    '--order': ROUTE_ORDER.get(place.id) ?? 0,
    ...kindColors(place.kinds),
  } as CSSProperties
  const kinds = place.kinds.map((k) => kindLabels[k].toLowerCase()).join(' og ')
  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={`${place.city}, ${place.country} – ${kinds}, ${place.period}`}
      aria-expanded={selected}
      aria-controls={selected ? 'kort-panel' : undefined}
      onClick={(event) => onSelect(event.currentTarget)}
    >
      <span className="map-pin__halo" aria-hidden="true" />
      <span className="map-pin__dot" aria-hidden="true">
        <Icon name={kindIcon[place.kinds[0]]} weight={2} />
      </span>
      <span className={`map-pin__label map-pin__label--${place.labelSide ?? 'right'}`} aria-hidden="true">
        <span className="map-pin__city">{place.city}</span>
        <span className="map-pin__period">{place.period}</span>
      </span>
    </button>
  )
}

/** Selve kortet. Memoiseret, så det ikke tegnes om, mens man zoomer. */
const MapBase = memo(function MapBase({ world }: { world: WorldLayers | null }) {
  return (
    <>
      <path className="map-sphere" d={spherePath} vectorEffect="non-scaling-stroke" />
      <path className="map-graticule" d={graticulePath} vectorEffect="non-scaling-stroke" />
      {world && (
        <g className="map-land-layer">
          <path className="map-land" d={world.land} vectorEffect="non-scaling-stroke" />
          {world.visited.map((country) => (
            <path key={country.id} className="map-visited" d={country.d} vectorEffect="non-scaling-stroke" />
          ))}
          <path className="map-borders" d={world.borders} vectorEffect="non-scaling-stroke" />
        </g>
      )}
    </>
  )
})
