import { useEffect, useState } from 'react'

/** Returnerer id'et på den sektion, der aktuelt fylder midten af skærmen. */
export function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join('|')

  useEffect(() => {
    const sections = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (!sections.length || typeof IntersectionObserver === 'undefined') return

    const visible = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting)
        const current = sections.find((section) => visible.get(section.id))
        if (current) setActive(current.id)
      },
      // En smal stribe midt på skærmen afgør, hvilken sektion man "er i".
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [key])

  return active
}
