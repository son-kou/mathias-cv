/** Retro drejeskivetelefon. Dekorativ – selve linket har en tydelig tekst. */
export function RotaryPhone() {
  const holes = Array.from({ length: 10 }, (_, i) => {
    const angle = ((-60 - i * 30) * Math.PI) / 180
    return { x: 120 + 25 * Math.cos(angle), y: 150 + 25 * Math.sin(angle) }
  })
  return (
    <svg className="phone" viewBox="0 0 240 214" aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="204" rx="92" ry="7" className="art-shadow" />
      <g className="phone__shake">
        <path
          d="M58 196 77 104q4-14 18-14h50q14 0 18 14l19 92q2 8-6 8H64q-8 0-6-8Z"
          className="phone__body"
        />
        <path d="M77 104q4-14 18-14h8l-20 114H64q-8 0-6-8Z" className="phone__body-light" />
        <path d="M86 90v-8M154 90v-8" className="phone__prong" />

        <circle cx="120" cy="150" r="37" className="phone__dial" />
        {holes.map((hole, i) => (
          <circle key={i} cx={hole.x.toFixed(2)} cy={hole.y.toFixed(2)} r="5.6" className="phone__hole" />
        ))}
        <circle cx="120" cy="150" r="11.5" className="phone__center" />
        <circle cx="120" cy="150" r="3" className="phone__hole" />
        <path d="m143 172 8 7" className="phone__stop" />

        <path
          d="M60 180c-20 4-26-12-17-20s-9-14-4-22 -12-14-5-22 8-10 12-14"
          className="phone__cord"
        />

        <g className="phone__handset">
          <path
            d="M36 92c-4-26 18-32 30-32h108c12 0 34 6 30 32l-4 8q-3 6-10 3l-20-8q-6-2-6-9v-6q0-4-6-4H82q-6 0-6 4v6q0 7-6 9l-20 8q-7 3-10-3Z"
            className="phone__handset-shape"
          />
          <path d="M70 66h100" className="phone__handset-shine" />
        </g>

        <g className="phone__ring">
          <path d="M26 64c-6 8-6 18 0 26M16 58c-10 12-10 30 0 42" />
          <path d="M214 64c6 8 6 18 0 26M224 58c10 12 10 30 0 42" />
        </g>
      </g>
    </svg>
  )
}
