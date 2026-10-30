import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { nav, profile } from '../data/content'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { CvLink } from './CvLink'
import { Icon } from './Icon'

const ids = nav.map((item) => item.id)

export function SiteHeader() {
  const active = useScrollSpy(ids)
  const [scrolled, setScrolled] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDialogElement>(null)

  // Skygge under headeren + diskret læse-fremskridt øverst.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      progressRef.current?.style.setProperty('--progress', progress.toFixed(4))
      setScrolled(window.scrollY > 12)
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
  }, [])

  const openMenu = () => menuRef.current?.showModal()
  const closeMenu = () => menuRef.current?.close()

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="site-header__progress" ref={progressRef} aria-hidden="true" />
      <div className="container site-header__inner">
        <a className="brand" href="#forside">
          <span className="brand__mark" aria-hidden="true">
            MD
          </span>
          <span className="brand__name">{profile.name}</span>
        </a>

        <nav className="site-nav" aria-label="Hovedmenu">
          <ul>
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  className="site-nav__link"
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <CvLink variant="header" />

        <button
          type="button"
          className="menu-button"
          aria-haspopup="dialog"
          aria-controls="mobilmenu"
          onClick={openMenu}
        >
          <span className="menu-button__lines" aria-hidden="true" />
          Menu
        </button>
      </div>

      {/* Klik på baggrunden lukker menuen (Escape håndteres af <dialog> selv). */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        id="mobilmenu"
        ref={menuRef}
        className="mobile-menu"
        aria-label="Menu"
        onClick={(event) => event.target === event.currentTarget && closeMenu()}
      >
        <div className="mobile-menu__inner">
          <div className="mobile-menu__top">
            <span className="brand__name">{profile.name}</span>
            <button type="button" className="icon-button" onClick={closeMenu} aria-label="Luk menuen">
              <Icon name="close" />
            </button>
          </div>
          <nav aria-label="Mobilmenu">
            <ol className="mobile-menu__list">
              {nav.map((item, index) => (
                <li key={item.id} style={{ '--i': index } as CSSProperties}>
                  <a
                    href={`#${item.id}`}
                    onClick={closeMenu}
                    aria-current={active === item.id ? 'true' : undefined}
                  >
                    <span className="mobile-menu__num" aria-hidden="true">
                      0{index + 1}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <CvLink variant="menu" />
        </div>
      </dialog>
    </header>
  )
}
