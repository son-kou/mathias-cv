import { useEffect, useRef } from 'react'
import { journeyRoute, kindLabels, places, type Experience, type Place } from '../../data/content'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { Icon } from '../Icon'

interface MapPanelProps {
  place: Place
  linked: Experience[]
  activeEntryId: string | null
  /** Ligger panelet oven på kortet (bred skærm) eller under det (mobil)? */
  overlay: boolean
  /** Tæller, der stiger, når fokus skal flyttes til panelet. */
  focusRequest: number
  onClose: () => void
  onNavigate: (placeId: string) => void
  onShowInTimeline: (entryId: string) => void
}

export function MapPanel({
  place,
  linked,
  activeEntryId,
  overlay,
  focusRequest,
  onClose,
  onNavigate,
  onShowInTimeline,
}: MapPanelProps) {
  const panelRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reduced = usePrefersReducedMotion()

  // Flyt fokus til panelet, når en by vælges udefra (pin, byliste eller tidslinje).
  useEffect(() => {
    if (!focusRequest) return
    headingRef.current?.focus({ preventScroll: true })
    if (!overlay && panelRef.current) {
      // På mobil ligger panelet under kortet – sørg for, at starten af det kan ses.
      const rect = panelRef.current.getBoundingClientRect()
      if (rect.top > window.innerHeight - 140) {
        window.scrollBy({ top: rect.top - window.innerHeight * 0.4, behavior: reduced ? 'auto' : 'smooth' })
      }
    }
    // Kun når der kommer en ny anmodning – ikke ved hver ændring af layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest])

  const index = journeyRoute.indexOf(place.id)
  const byId = (id: string) => places.find((p) => p.id === id)!
  const previous = byId(journeyRoute[(index - 1 + journeyRoute.length) % journeyRoute.length])
  const next = byId(journeyRoute[(index + 1) % journeyRoute.length])

  return (
    <section
      ref={panelRef}
      id="kort-panel"
      className={`map-panel${overlay ? ' map-panel--overlay' : ''}`}
      aria-labelledby="kort-panel-titel"
    >
      <div className="map-panel__top">
        <ul className="kind-tags" aria-label="Type">
          {place.kinds.map((kind) => (
            <li key={kind} className={`kind-tag kind-tag--${kind}`}>
              {kindLabels[kind]}
            </li>
          ))}
        </ul>
        <button type="button" className="icon-button map-panel__close" onClick={onClose} aria-label="Luk panelet">
          <Icon name="close" />
        </button>
      </div>

      <div className="map-panel__body" key={place.id}>
        <h3 id="kort-panel-titel" ref={headingRef} tabIndex={-1} className="map-panel__city">
          {place.city}
          <span className="map-panel__country">, {place.country}</span>
        </h3>
        <p className="map-panel__meta">
          <span className="map-panel__period">{place.period}</span>
          {place.headline}
        </p>

        <blockquote className="map-panel__story">
          <p>{place.story}</p>
        </blockquote>

        {linked.length > 0 && (
          <div className="map-panel__entries">
            <h4 className="mini-heading">Se i tidslinjen</h4>
            <ul>
              {linked.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`entry-link${entry.id === activeEntryId ? ' is-active' : ''}`}
                    onClick={() => onShowInTimeline(entry.id)}
                  >
                    <span className="entry-link__title">{entry.title}</span>
                    <span className="entry-link__meta">
                      {entry.org} · {entry.period}
                    </span>
                    <Icon name="arrowRight" className="entry-link__arrow" />
                    <span className="sr-only"> – vis i tidslinjen</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {place.skills.length > 0 && (
          <ul className="chips" aria-label="Kompetencer">
            {place.skills.map((skill) => (
              <li key={skill} className="chip">
                {skill}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="map-panel__nav">
        <button type="button" className="text-button" onClick={() => onNavigate(previous.id)}>
          <Icon name="arrowLeft" />
          <span className="sr-only">Forrige by: </span>
          {previous.city}
        </button>
        <span className="map-panel__step" aria-hidden="true">
          {index + 1} / {journeyRoute.length}
        </span>
        <button type="button" className="text-button" onClick={() => onNavigate(next.id)}>
          <span className="sr-only">Næste by: </span>
          {next.city}
          <Icon name="arrowRight" />
        </button>
      </div>
    </section>
  )
}
