import { site } from '../data/content'
import { asset } from '../lib/url'
import { Icon } from './Icon'

interface CvLinkProps {
  variant: 'hero' | 'header' | 'menu'
}

/**
 * Link til CV'et som PDF. Er filen ikke lagt i public/, vises en tydelig, inaktiv
 * pladsholder i stedet for et link, der ville give en 404-fejl.
 */
export function CvLink({ variant }: CvLinkProps) {
  if (!__CV_AVAILABLE__) {
    if (variant === 'header') return null
    return (
      <span className={`cv-link cv-link--${variant} is-unavailable`} aria-disabled="true">
        <Icon name="document" />
        <span>CV som PDF følger snart</span>
      </span>
    )
  }
  return (
    <a className={`cv-link cv-link--${variant}`} href={asset(site.cv.file)} target="_blank" rel="noopener">
      <Icon name="document" />
      <span>
        {variant === 'header' ? 'CV' : site.cv.label}
        {variant !== 'header' && <span className="cv-link__meta"> · {site.cv.meta}</span>}
      </span>
      <span className="sr-only"> (åbner PDF i et nyt vindue)</span>
    </a>
  )
}
