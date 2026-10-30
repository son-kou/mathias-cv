import type { CSSProperties } from 'react'
import { facts, profile } from '../data/content'
import { asset } from '../lib/url'
import { CvLink } from './CvLink'
import { Icon } from './Icon'

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function Hero() {
  return (
    <section id="forside" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__text">
          <p className="eyebrow hero__eyebrow intro-anim" style={delay(0)}>
            {profile.role}
            <span className="hero__eyebrow-sep" aria-hidden="true" />
            Base i {profile.base}
          </p>

          <h1 id="hero-title" className="hero__name">
            <span className="hero__line">
              <span className="hero__word" style={delay(90)}>
                {profile.firstName}
              </span>
            </span>
            <span className="hero__line">
              <span className="hero__word hero__word--italic" style={delay(190)}>
                {profile.lastName}
                <span className="hero__dot" aria-hidden="true">
                  .
                </span>
              </span>
            </span>
          </h1>

          <p className="hero__lead intro-anim" style={delay(300)}>
            {profile.lead}
          </p>
          <p className="hero__intro intro-anim" style={delay(380)}>
            {profile.intro}
          </p>

          <div className="hero__actions intro-anim" style={delay(460)}>
            <a className="button button--primary" href="#rejse">
              Udforsk min erfaring
              <Icon name="arrowDown" className="button__icon button__icon--down" />
            </a>
            <a className="button button--secondary" href="#kontakt">
              <Icon name="coffee" className="button__icon" />
              Skal vi tage en kaffe?
            </a>
            <CvLink variant="hero" />
          </div>

          <ul className="hero__skills" aria-label="Udvalgte kompetencer">
            {profile.highlightSkills.map((skill, index) => (
              <li key={skill} className="intro-anim" style={delay(560 + index * 60)}>
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <figure className="hero__portrait">
          <div className="portrait">
            <picture>
              <source
                srcSet={`${asset(profile.photo.webpSmall)} 480w, ${asset(profile.photo.webp)} 800w`}
                sizes={profile.photo.sizes}
                type="image/webp"
              />
              <img
                src={asset(profile.photo.jpg)}
                width={profile.photo.width}
                height={profile.photo.height}
                alt={profile.photo.alt}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
          <TaglineBadge />
        </figure>
      </div>

      <div className="container">
        <dl className="facts" aria-label="Kort fortalt">
          {facts.map((fact, index) => (
            <div className="fact intro-anim" style={delay(520 + index * 70)} key={fact.text}>
              <dt className="fact__value">
                {fact.value}
                <span className="fact__unit">{fact.unit}</span>
              </dt>
              <dd className="fact__text">{fact.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** Rund, langsomt roterende badge med CV'ets tagline og en lille kaffekop i midten. */
function TaglineBadge() {
  const text = `${profile.tagline} · `
  return (
    <svg className="badge" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <path id="badge-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
      </defs>
      <circle cx="100" cy="100" r="96" className="badge__bg" />
      <g className="badge__ring">
        <text className="badge__text">
          <textPath href="#badge-circle" textLength="462" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </g>
      <g className="badge__cup" transform="translate(100 104)">
        <path d="M-18 -8h30v9a15 15 0 0 1-15 15h0a15 15 0 0 1-15-15v-9Z" />
        <path d="M12 -4h4a6 6 0 0 1 0 12h-4" />
        <path className="badge__steam" d="M-8 -16c-3 -4 3 -6 0 -10M2 -16c-3 -4 3 -6 0 -10" />
      </g>
    </svg>
  )
}
