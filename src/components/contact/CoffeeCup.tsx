import { useRef, type PointerEvent } from 'react'

/**
 * Illustreret kaffekop med blød damp. Dampen bevæger sig roligt hele tiden og
 * "viger" en smule for musen, når man bevæger den hen over koppen.
 */
export function CoffeeCup() {
  const ref = useRef<HTMLDivElement>(null)

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current
    if (!element || event.pointerType === 'touch') return
    const rect = element.getBoundingClientRect()
    const lean = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    element.style.setProperty('--lean', lean.toFixed(3))
  }

  return (
    <div
      ref={ref}
      className="cup"
      onPointerMove={onPointerMove}
      onPointerLeave={() => ref.current?.style.setProperty('--lean', '0')}
    >
      <svg viewBox="0 0 240 250" role="img" aria-labelledby="kop-titel" focusable="false">
        <title id="kop-titel">Illustration af en dampende kop kaffe</title>
        <defs>
          <linearGradient id="steam-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.82" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="steam-mask" maskUnits="userSpaceOnUse" x="40" y="-10" width="160" height="130">
            <rect x="40" y="-10" width="160" height="130" fill="url(#steam-fade)" />
          </mask>
          <filter id="steam-blur" x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <g className="cup__steam-lean">
          <g className="cup__steam" mask="url(#steam-mask)" filter="url(#steam-blur)">
            <path d="M98 108C86 90 110 78 100 60S90 32 102 12" />
            <path d="M121 106C133 88 109 74 121 54S131 26 119 4" />
            <path d="M144 108C132 92 154 80 144 62S136 36 147 16" />
          </g>
        </g>

        {/* Underkop */}
        <ellipse cx="120" cy="224" rx="98" ry="17" className="cup__saucer" />
        <ellipse cx="120" cy="220" rx="64" ry="9" className="cup__saucer-well" />

        {/* Hank */}
        <path d="M182 134c32-6 38 40-4 46" className="cup__handle" />

        {/* Kop */}
        <path d="M54 118c0 52 26 94 66 94s66-42 66-94Z" className="cup__body" />
        <path d="M186 118c0 52-26 94-66 94 30-10 50-46 52-94Z" className="cup__shade" />
        <path d="M58 144c34 13 90 13 124 0" className="cup__band" />
        <path d="M60 154c33 12 87 12 120 0" className="cup__band cup__band--thin" />
        <path d="M70 132c2 30 12 54 28 68" className="cup__shine" />

        {/* Kant og kaffe */}
        <ellipse cx="120" cy="118" rx="66" ry="13" className="cup__rim" />
        <ellipse cx="120" cy="120.5" rx="57.5" ry="9.5" className="cup__coffee" />
        <path d="M108 118.5c4-6 12-1 12 3 0-4 8-9 12-3s-12 9-12 9-16-3-12-9Z" className="cup__art" />
      </svg>
    </div>
  )
}
