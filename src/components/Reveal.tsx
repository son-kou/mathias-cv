import { useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { useInViewOnce } from '../hooks/useInView'

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** Forsinkelse i ms – giver en blød, forskudt indgang i lister. */
  delay?: number
  children: ReactNode
}

/**
 * Lader indhold glide blidt ind, når det kommer til syne. Uden JavaScript – eller
 * med "reducer bevægelse" slået til – vises indholdet bare med det samme (se CSS).
 */
export function Reveal({ as: Tag = 'div', className, delay = 0, children, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const visible = useInViewOnce(ref, { rootMargin: '0px 0px -8% 0px' })
  const merged = delay ? ({ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties) : style
  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={merged}
      {...rest}
    >
      {children}
    </Tag>
  )
}
