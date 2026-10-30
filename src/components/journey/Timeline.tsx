import { useEffect, useRef } from 'react'
import { categoryLabels, experiences, places, type Category, type Experience } from '../../data/content'
import { Icon, type IconName } from '../Icon'
import { Reveal } from '../Reveal'

export type TimelineFilter = 'all' | Category

const FILTERS: { id: TimelineFilter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'work', label: categoryLabels.work },
  { id: 'education', label: categoryLabels.education },
  { id: 'international', label: categoryLabels.international },
]

const categoryIcon: Record<Category, IconName> = {
  work: 'briefcase',
  education: 'cap',
  international: 'globe',
}

interface TimelineProps {
  filter: TimelineFilter
  onFilter: (filter: TimelineFilter) => void
  /** Erfaringer knyttet til den by, der er valgt på kortet. */
  linkedIds: string[]
  flashId: string | null
  onShowOnMap: (placeId: string, entryId: string, trigger: HTMLElement) => void
  /** Kaldes med den erfaring, der er midt på skærmen (bruges til at lyse byen op på kortet). */
  onNear?: (entryId: string | null) => void
}

export function Timeline({ filter, onFilter, linkedIds, flashId, onShowOnMap, onNear }: TimelineProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const visible = filter === 'all' ? experiences : experiences.filter((e) => e.category === filter)

  // Tidslinjens streg "fyldes" i takt med, at man scroller gennem den.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = list.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rect.top) / rect.height))
      list.style.setProperty('--rail', progress.toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [filter])

  // Hvilken erfaring er midt på skærmen? (Kun på brede skærme, hvor kortet står ved siden af.)
  useEffect(() => {
    const list = listRef.current
    if (!onNear || !list || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting)
        if (hit) onNear((hit.target as HTMLElement).dataset.entry ?? null)
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    list.querySelectorAll('[data-entry]').forEach((el) => observer.observe(el))
    return () => {
      observer.disconnect()
      onNear(null)
    }
  }, [onNear, filter])

  return (
    <div className="timeline">
      <div className="timeline__head">
        <h3 className="timeline__title">Erfaring og uddannelse</h3>
        <div className="filters" role="group" aria-label="Filtrér tidslinjen">
          {FILTERS.map((option) => {
            const count =
              option.id === 'all' ? experiences.length : experiences.filter((e) => e.category === option.id).length
            return (
              <button
                key={option.id}
                type="button"
                className={`filter filter--${option.id}`}
                aria-pressed={filter === option.id}
                onClick={() => onFilter(option.id)}
              >
                {option.label}
                <span className="filter__count" aria-label={`(${count})`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <ol className="timeline__list" ref={listRef}>
        {visible.map((entry) => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            linked={linkedIds.includes(entry.id)}
            flash={flashId === entry.id}
            onShowOnMap={onShowOnMap}
          />
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {filter === 'all'
          ? ''
          : `Viser ${visible.length} af ${experiences.length} punkter: ${categoryLabels[filter].toLowerCase()}.`}
      </p>
    </div>
  )
}

interface EntryProps {
  entry: Experience
  linked: boolean
  flash: boolean
  onShowOnMap: TimelineProps['onShowOnMap']
}

function TimelineEntry({ entry, linked, flash, onShowOnMap }: EntryProps) {
  const titleId = `erfaring-${entry.id}-titel`
  const hasMore = Boolean(entry.more?.length || entry.learned)
  const className = [
    'tl-entry',
    `tl-entry--${entry.category}`,
    linked && 'is-linked',
    flash && 'is-flash',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={className} data-entry={entry.id}>
      <span className="tl-entry__node" aria-hidden="true">
        <Icon name={categoryIcon[entry.category]} weight={1.9} />
      </span>
      <Reveal as="article" className="tl-card" id={`erfaring-${entry.id}`} tabIndex={-1} aria-labelledby={titleId}>
        <div className="tl-card__inner">
          <p className="tl-card__meta">
            <span className="tl-card__period">{entry.period}</span>
            <span className="tl-card__category">{categoryLabels[entry.category]}</span>
          </p>
          <h4 className="tl-card__title" id={titleId}>
            {entry.title}
          </h4>
          {entry.subtitle && <p className="tl-card__subtitle">{entry.subtitle}</p>}
          <p className="tl-card__org">
            {entry.org}
            <span className="tl-card__location"> · {entry.location}</span>
          </p>
          <p className="tl-card__summary">{entry.summary}</p>

          {entry.highlights.length > 0 && (
            <ul className="tl-card__list">
              {entry.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {entry.roles && (
            <ul className="tl-roles">
              {entry.roles.map((role) => (
                <li key={role.org} className="tl-role">
                  <p className="tl-role__head">
                    <strong>{role.org}</strong> · {role.role}
                    <span className="tl-role__meta">
                      {role.period}
                      {role.location && ` · ${role.location}`}
                    </span>
                  </p>
                  <p className="tl-role__text">{role.text}</p>
                </li>
              ))}
            </ul>
          )}

          {hasMore && (
            <details className="tl-more">
              <summary>
                <span className="tl-more__open">Læs mere</span>
                <span className="tl-more__close">Vis mindre</span>
                <Icon name="plus" className="tl-more__icon" />
              </summary>
              {entry.more && (
                <ul className="tl-card__list">
                  {entry.more.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {entry.learned && <p className="tl-card__learned">{entry.learned}</p>}
            </details>
          )}

          <div className="tl-card__foot">
            <ul className="chips chips--small" aria-label="Kompetencer">
              {entry.skills.map((skill) => (
                <li key={skill} className="chip">
                  {skill}
                </li>
              ))}
            </ul>
            {entry.placeIds.length > 0 && (
              <div className="tl-card__places">
                {entry.placeIds.map((placeId) => {
                  const place = places.find((p) => p.id === placeId)
                  if (!place) return null
                  return (
                    <button
                      key={placeId}
                      type="button"
                      className="place-button"
                      onClick={(event) => onShowOnMap(placeId, entry.id, event.currentTarget)}
                    >
                      <Icon name="pin" />
                      <span className="sr-only">Vis </span>
                      {place.city}
                      <span className="sr-only"> på kortet</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </li>
  )
}
