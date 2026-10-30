import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { experiences, places, type Category } from '../../data/content'
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { Reveal } from '../Reveal'
import { Timeline, type TimelineFilter } from './Timeline'
import { WorldMap } from './WorldMap'

/**
 * "Min rejse": kortet og tidslinjen deler tilstand, så et klik det ene sted
 * altid kan ses det andet – by ↔ erfaring.
 */
export function JourneySection() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)
  const [filter, setFilter] = useState<TimelineFilter>('all')
  const [nearEntryId, setNearEntryId] = useState<string | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)
  const triggerRef = useRef<HTMLElement | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const stickyLayout = useMediaQuery('(min-width: 1100px)')

  const selectPlace = useCallback(
    (id: string, trigger?: HTMLElement | null, entryId: string | null = null, moveFocus = true) => {
      // Ved bladring i panelet beholdes den oprindelige "afsender", så fokus kan vende tilbage dertil.
      if (trigger) triggerRef.current = trigger
      setSelectedId(id)
      setActiveEntryId(entryId)
      if (moveFocus) setFocusRequest((n) => n + 1)
    },
    [],
  )

  const closePanel = useCallback(() => {
    setSelectedId(null)
    setActiveEntryId(null)
    const trigger = triggerRef.current
    if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    else mapRef.current?.querySelector<HTMLElement>('.map-viewport')?.focus({ preventScroll: true })
  }, [])

  // Escape lukker infopanelet (men ikke hvis mobilmenuen er åben).
  useEffect(() => {
    if (!selectedId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) closePanel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedId, closePanel])

  // Fra tidslinjen til kortet: vælg byen og sørg for, at kortet er synligt.
  const showOnMap = useCallback(
    (placeId: string, entryId: string, trigger: HTMLElement) => {
      selectPlace(placeId, trigger, entryId)
      const viewport = mapRef.current?.querySelector('.map-viewport')
      if (!viewport) return
      const rect = viewport.getBoundingClientRect()
      const header = 80
      if (rect.top < header || rect.bottom > window.innerHeight) {
        mapRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      }
    },
    [selectPlace, reduced],
  )

  // Fra kortet til tidslinjen: rul til erfaringen og fremhæv den kort.
  const showInTimeline = useCallback(
    (entryId: string) => {
      const entry = experiences.find((e) => e.id === entryId)
      if (entry && filter !== 'all' && entry.category !== filter) setFilter('all')
      setFlashId(null)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const card = document.getElementById(`erfaring-${entryId}`)
          if (!card) return
          card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' })
          card.focus({ preventScroll: true })
          setFlashId(entryId)
        }),
      )
    },
    [filter, reduced],
  )

  useEffect(() => {
    if (!flashId) return
    const timer = window.setTimeout(() => setFlashId(null), 2200)
    return () => window.clearTimeout(timer)
  }, [flashId])

  const linkedEntryIds = useMemo(
    () => (selectedId ? experiences.filter((e) => e.placeIds.includes(selectedId)).map((e) => e.id) : []),
    [selectedId],
  )

  const nearPlaceIds = useMemo(
    () => (stickyLayout && nearEntryId ? (experiences.find((e) => e.id === nearEntryId)?.placeIds ?? []) : []),
    [stickyLayout, nearEntryId],
  )

  // Når tidslinjen er filtreret, dæmpes byer uden erfaringer i den kategori.
  const dimmedPlaceIds = useMemo(() => {
    if (filter === 'all') return []
    const category: Category = filter
    return places
      .filter((p) => !experiences.some((e) => e.category === category && e.placeIds.includes(p.id)))
      .map((p) => p.id)
  }, [filter])

  return (
    <section id="rejse" className="section journey" aria-labelledby="rejse-title">
      <div className="container">
        <Reveal as="header" className="section-head">
          <p className="eyebrow">
            <span className="eyebrow__num">02</span> Min rejse
          </p>
          <h2 id="rejse-title" className="section-title">
            Fem lande. <em>Én rød tråd.</em>
          </h2>
          <p className="section-lead">
            Fra et mandarinkursus i Taipei til EU-formandskabet i Bruxelles: Hvert sted har givet mig noget, jeg
            bruger i dag. Klik på en by på kortet – eller på en erfaring i tidslinjen – og se, hvordan det hænger
            sammen.
          </p>
        </Reveal>

        <div className="journey__layout">
          <div className="journey__map" ref={mapRef}>
            <WorldMap
              selectedId={selectedId}
              activeEntryId={activeEntryId}
              onSelect={selectPlace}
              onClose={closePanel}
              onShowInTimeline={showInTimeline}
              nearIds={nearPlaceIds}
              dimmedIds={dimmedPlaceIds}
              focusRequest={focusRequest}
            />
          </div>
          <div className="journey__timeline">
            <Timeline
              filter={filter}
              onFilter={setFilter}
              linkedIds={linkedEntryIds}
              flashId={flashId}
              onShowOnMap={showOnMap}
              onNear={stickyLayout ? setNearEntryId : undefined}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
