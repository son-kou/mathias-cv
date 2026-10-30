import { useId, useState } from 'react'
import { competencies, experiences, languages, references, strengths, tools } from '../data/content'
import { Icon } from './Icon'
import { Reveal } from './Reveal'

export function StrengthsSection() {
  return (
    <section id="kompetencer" className="section strengths" aria-labelledby="kompetencer-titel">
      <div className="container">
        <Reveal as="header" className="section-head">
          <p className="eyebrow">
            <span className="eyebrow__num">03</span> Erfaring & kompetencer
          </p>
          <h2 id="kompetencer-titel" className="section-title">
            Det tager jeg med <em>til bordet</em>
          </h2>
          <p className="section-lead">
            Min baggrund spænder fra EU-diplomati til kundeservice. Det lyder måske som to forskellige verdener – men
            håndværket er det samme: forstå sagen, forstå modtageren, og sørg for, at tingene bliver gjort.
          </p>
        </Reveal>

        <ol className="strength-cards">
          {strengths.map((strength, index) => (
            <StrengthCard key={strength.id} strength={strength} index={index} />
          ))}
        </ol>

        <div className="skills">
          <Reveal className="skills__main">
            <h3 className="skills__title">Kompetencer – og hvor jeg har brugt dem</h3>
            <ul className="competencies">
              {competencies.map((item) => (
                <li key={item.name} className="competency">
                  <span className="competency__name">{item.name}</span>
                  <span className="competency__proof">{item.proof}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="skills__side">
            <Reveal className="skills__block" delay={80}>
              <h3 className="skills__title">Sprog</h3>
              <ul className="languages">
                {languages.map((language) => (
                  <li key={language.name} className="language">
                    <span className="language__greeting" lang={language.lang} aria-hidden="true">
                      {language.greeting}
                    </span>
                    <span className="language__name">{language.name}</span>
                    <span className="language__level">{language.level}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="skills__block" delay={140}>
              <h3 className="skills__title">Værktøjer</h3>
              <ul className="chips">
                {tools.map((tool) => (
                  <li key={tool} className="chip chip--quiet">
                    {tool}
                  </li>
                ))}
              </ul>
              <p className="references">
                <Icon name="document" />
                {references}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

const icons = {
  overblik: (
    <>
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="9" />
      <path d="M24 3v8M24 37v8M3 24h8M37 24h8" />
      <circle cx="24" cy="24" r="2" className="fill" />
    </>
  ),
  formidling: (
    <>
      <path className="tangle" d="M5 30c4-14 9 10 13-2s7-12 10 0-4 10-1 4" />
      <path d="M30 28h13m0 0-5-5m5 5-5 5" />
      <path d="M8 40h32" className="soft" />
    </>
  ),
  samarbejde: (
    <>
      <path d="M13 31 24 13l11 18Z" className="soft" />
      <circle cx="24" cy="12" r="5" />
      <circle cx="12" cy="33" r="5" />
      <circle cx="36" cy="33" r="5" />
    </>
  ),
} as const

function StrengthCard({ strength, index }: { strength: (typeof strengths)[number]; index: number }) {
  const [open, setOpen] = useState(false)
  const exampleId = useId()
  const evidence = strength.evidence
    .map((id) => experiences.find((e) => e.id === id))
    .filter((e) => e !== undefined)

  return (
    <Reveal as="li" className={`strength-card${open ? ' is-open' : ''}`} delay={index * 110}>
      <div className="strength-card__top">
        <span className="strength-card__num" aria-hidden="true">
          0{index + 1}
        </span>
        <svg className="strength-card__icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          {icons[strength.id]}
        </svg>
      </div>
      <h3 className="strength-card__title">{strength.title}</h3>
      <p className="strength-card__lead">{strength.lead}</p>
      <p className="strength-card__value">
        <span className="strength-card__label">Det får I</span>
        {strength.value}
      </p>

      <button
        type="button"
        className="strength-card__toggle"
        aria-expanded={open}
        aria-controls={exampleId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Skjul eksemplet' : 'Se et konkret eksempel'}
        <Icon name="plus" className="strength-card__toggle-icon" />
      </button>
      <div className="collapsible" id={exampleId} inert={!open}>
        <div className="collapsible__inner">
          <p className="strength-card__example">{strength.example}</p>
          <p className="strength-card__evidence">
            <span>Fra tidslinjen:</span>
            {evidence.map((entry) => (
              <a key={entry.id} href={`#erfaring-${entry.id}`}>
                {entry.org}
              </a>
            ))}
          </p>
        </div>
      </div>
    </Reveal>
  )
}
