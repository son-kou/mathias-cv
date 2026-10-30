/**
 * Retro kuvert med luftpost-kant. Ved hover/fokus folder flappen sig op, og et
 * lille brev glider halvt op af kuverten. Dekorativ – linket har en tydelig tekst.
 */
export function Envelope() {
  return (
    <svg className="envelope" viewBox="0 0 240 214" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="airmail" width="18" height="8" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
          <rect width="18" height="8" className="envelope__stripe-base" />
          <rect width="6" height="8" className="envelope__stripe-a" />
          <rect x="9" width="6" height="8" className="envelope__stripe-b" />
        </pattern>
        <clipPath id="envelope-clip">
          <rect x="24" y="78" width="192" height="122" rx="7" />
        </clipPath>
      </defs>

      <ellipse cx="120" cy="206" rx="98" ry="6" className="art-shadow" />

      {/* Kuvertens inderside */}
      <rect x="24" y="78" width="192" height="122" rx="7" className="envelope__back" />

      {/* Flappen, når den er åben (ligger bag brevet) */}
      <path d="M24 82 120 20l96 62Z" className="envelope__flap-open" />

      {/* Brevet */}
      <g className="envelope__letter">
        <rect x="42" y="88" width="156" height="104" rx="3" className="envelope__paper" />
        <text x="58" y="112" className="envelope__greeting">
          Hej Mathias,
        </text>
        <path d="M58 126h118M58 138h104M58 150h112M58 162h64" className="envelope__lines" />
        <path d="M156 170c3-5 9-2 9 2 0-4 6-7 9-2s-9 9-9 9-12-4-9-9Z" className="envelope__heart" />
      </g>

      {/* Forsiden (lommen), som brevet stikker op af */}
      <g clipPath="url(#envelope-clip)">
        <path d="M24 82 120 146l96-64v118H24Z" className="envelope__front" />
        <path d="m24 200 84-62M216 200l-84-62" className="envelope__fold" />
        <rect x="24" y="192" width="192" height="8" fill="url(#airmail)" />
      </g>

      {/* Flappen, når den er lukket – med lakseglet */}
      <g className="envelope__flap-closed">
        <path d="M24 85q0-7 7-7h178q7 0 7 7l-96 64Z" className="envelope__flap" />
        <circle cx="120" cy="140" r="14" className="envelope__seal" />
        <circle cx="120" cy="140" r="10" className="envelope__seal-ring" />
        <text x="120" y="145.5" className="envelope__seal-letter">
          M
        </text>
      </g>
    </svg>
  )
}
