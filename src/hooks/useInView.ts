import { useEffect, useState, type RefObject } from 'react'

/**
 * Bliver `true`, første gang elementet kommer inden for synsfeltet, og forbliver
 * det. Bruges til at indlæse kortdata og starte indgangsanimationer.
 */
export function useInViewOnce(ref: RefObject<Element | null>, options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false)
  const rootMargin = options?.rootMargin
  const threshold = options?.threshold

  useEffect(() => {
    const element = ref.current
    if (!element || inView) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, inView, rootMargin, threshold])

  return inView
}
