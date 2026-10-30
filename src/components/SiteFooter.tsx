import { profile } from '../data/content'
import { Icon } from './Icon'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__name">
          {profile.name}
          <span className="hero__dot" aria-hidden="true">
            .
          </span>
        </p>
        <p className="site-footer__meta">
          {profile.role} · Base i {profile.base}
        </p>
        <a className="site-footer__top" href="#forside">
          Til toppen
          <Icon name="arrowUpRight" />
        </a>
      </div>
    </footer>
  )
}
