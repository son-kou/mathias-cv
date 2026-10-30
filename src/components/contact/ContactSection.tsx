import { useEffect, useState, type ReactNode } from 'react'
import { contact } from '../../data/content'
import { mailtoHref, telHref } from '../../lib/url'
import { Icon } from '../Icon'
import { Reveal } from '../Reveal'
import { CoffeeCup } from './CoffeeCup'
import { Envelope } from './Envelope'
import { RotaryPhone } from './RotaryPhone'

export function ContactSection() {
  return (
    <section id="kontakt" className="section contact" aria-labelledby="kontakt-titel">
      <div className="container">
        <Reveal as="header" className="section-head section-head--center">
          <p className="eyebrow">
            <span className="eyebrow__num">04</span> Kontakt
          </p>
          <h2 id="kontakt-titel" className="section-title">
            {contact.heading}{' '}
            <span className="contact__emoji" aria-hidden="true">
              ☕
            </span>
          </h2>
          <p className="section-lead">{contact.text}</p>
        </Reveal>

        <div className="contact__scene">
          <ContactCard
            variant="phone"
            href={telHref(contact.phone)}
            title="Ring til mig"
            value={contact.phoneDisplay}
            bubble="Giv mig et kald"
            copyValue={contact.phoneDisplay}
            copyWhat="telefonnummeret"
            art={<RotaryPhone />}
          />

          <figure className="contact__cup">
            <CoffeeCup />
            <figcaption>{contact.coffeeNote}</figcaption>
          </figure>

          <ContactCard
            variant="mail"
            href={mailtoHref(contact.email, contact.emailSubject)}
            title="Send mig en besked"
            value={contact.email}
            bubble="Skriv til mig"
            copyValue={contact.email}
            copyWhat="e-mailadressen"
            art={<Envelope />}
          />
        </div>

        <div className="contact__extras">
          <a className="linkedin-link" href={contact.linkedin} target="_blank" rel="noopener noreferrer">
            <Icon name="linkedin" />
            Find mig på LinkedIn
            <span className="sr-only"> (åbner i et nyt vindue)</span>
          </a>
          <p className="contact__commute">{contact.commuteNote}</p>
        </div>
      </div>
    </section>
  )
}

interface ContactCardProps {
  variant: 'phone' | 'mail'
  href: string
  title: string
  value: string
  bubble: string
  copyValue: string
  copyWhat: string
  art: ReactNode
}

function ContactCard({ variant, href, title, value, bubble, copyValue, copyWhat, art }: ContactCardProps) {
  return (
    <div className={`contact-card contact-card--${variant}`}>
      <a className="contact-card__link" href={href}>
        <span className="contact-card__art">
          {art}
          <span className="contact-card__bubble" aria-hidden="true">
            {bubble}
          </span>
        </span>
        <span className="contact-card__text">
          <span className="contact-card__title">
            <Icon name={variant === 'phone' ? 'phone' : 'mail'} />
            {title}
          </span>
          <span className="contact-card__value">{value}</span>
        </span>
      </a>
      <CopyButton value={copyValue} what={copyWhat} />
    </div>
  )
}

/** Praktisk, hvis man ikke har et mailprogram sat op – eller sidder ved en computer uden telefon. */
function CopyButton({ value, what }: { value: string; what: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (status === 'idle') return
    const timer = window.setTimeout(() => setStatus('idle'), 2400)
    return () => window.clearTimeout(timer)
  }, [status])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <>
      <button type="button" className={`copy-button is-${status}`} onClick={copy}>
        <Icon name={status === 'copied' ? 'check' : 'copy'} />
        <span aria-hidden="true">
          {status === 'copied' ? 'Kopieret' : status === 'failed' ? 'Kunne ikke kopiere' : 'Kopiér'}
        </span>
        <span className="sr-only">Kopiér {what}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {status === 'copied' ? `${what} er kopieret` : status === 'failed' ? `${what} kunne ikke kopieres` : ''}
      </span>
    </>
  )
}
