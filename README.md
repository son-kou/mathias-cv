# Mathias Dalgaard – personlig karrierehjemmeside

En hurtig, tilgængelig single-page-hjemmeside med interaktivt verdenskort, interaktivt CV og en
personlig kontaktsektion. Siden bygges statisk og hostes gratis på GitHub Pages.

**Live:** https://son-kou.github.io/mathias-cv/

| Sektion | Indhold |
| --- | --- |
| Forside | Navn, kort introduktion, CV som PDF og fire hurtige fakta |
| Rejse & erfaring | Verdenskort (zoom, klynger af tætte byer, infopanel) koblet til en filtrerbar tidslinje |
| Kompetencer | "Det tager jeg med til bordet", kompetencer med dokumentation, sprog og værktøjer |
| Kontakt | Kaffekop med damp, drejeskivetelefon (`tel:`), kuvert (`mailto:`) og LinkedIn |

---

## Kom i gang lokalt

Kræver Node.js 20.19 eller nyere (se `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173/mathias-cv/
```

## Redigér indholdet

**Al tekst og alle data ligger i [`src/data/content.ts`](src/data/content.ts).** Filen er kommenteret
og opdelt i afsnit:

| Afsnit | Hvad styrer det? |
| --- | --- |
| `site` | Sidetitel, beskrivelse til Google/LinkedIn og stien til CV-PDF'en |
| `profile`, `facts` | Forsidens tekster, kompetence-chips, portræt og "Kort fortalt" |
| `places` | Byerne på kortet: koordinater, type (arbejde/uddannelse/udlandsophold/base), tekst til infopanelet |
| `journeyRoute` | Rækkefølgen, den kobberfarvede linje forbinder byerne i |
| `experiences` | Tidslinjen (nyeste først). `placeIds` forbinder en erfaring med byer på kortet |
| `strengths`, `competencies`, `languages`, `tools` | Sektionen "Det tager jeg med til bordet" |
| `contact` | Telefon, e-mail, LinkedIn og de små personlige noter |

Kør `npm test` efter ændringer – testene fanger fx en erfaring, der peger på en by, som ikke findes.

### CV som PDF

Læg filen her: `public/cv/Mathias-Dalgaard-CV.pdf` (stien kan ændres i `site.cv.file`).
Knappen "Se mit CV" bliver kun aktiv, hvis filen findes, når siden bygges – ellers vises en
inaktiv pladsholder ("CV som PDF følger snart").

### Portræt, delingsbillede og favicon

Udskift `public/images/mathias-dalgaard.jpg` (kvadratisk, mindst 800 × 800 px) og kør:

```bash
npm run images     # kræver Google Chrome
```

Det laver WebP-udgaver af portrættet (800 og 480 px), delingsbilledet `public/og-image.jpg`
(1200 × 630) og ikonerne.

### Kortet

Byernes koordinater står i `places`. Selve verdenskortet (`src/data/world.json`) er genereret fra
Natural Earth 1:50m og forenklet, så det kun vejer ca. 38 kB komprimeret. Vil du fremhæve andre
lande, så ret listen i [`scripts/build-map.mjs`](scripts/build-map.mjs) og kør `npm run map:build`.

## Udgiv på GitHub Pages

Udgivelse sker automatisk via GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
ved hvert push til `main`: lint → test → build → deploy.

Engangsopsætning: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Stien (`/mathias-cv/`) og den fulde adresse hentes automatisk fra Pages-indstillingerne, så et
eget domæne virker uden kodeændringer. Til lokale builds bruges standardværdierne i
[`scripts/site-env.mjs`](scripts/site-env.mjs).

## Kvalitet og test

```bash
npm run lint       # ESLint inkl. tilgængelighedsregler (jsx-a11y)
npm test           # Vitest: dataintegritet, kortmatematik, interaktioner, forhåndsrendering
npm run build      # typecheck + produktionsbuild + forhåndsrendering
npm run test:e2e   # Playwright mod den byggede side (kør build først; bruger installeret Chrome)
```

End-to-end-testene dækker desktop og mobil: ingen vandret scroll fra 320 til 1920 px, kort ↔
tidslinje begge veje, klynger, filtre, Escape, tastaturstyring af kortet, CV/telefon/e-mail-links,
"reducer bevægelse" og 404-siden.

Lighthouse (lokalt, produktionsbuild): desktop 100/100/100/100 · mobil 97/100/100/100
(ydeevne/tilgængelighed/best practices/SEO).

## Teknik – og hvorfor

- **React + TypeScript + Vite.** Forhåndsrenderes til statisk HTML ([`scripts/prerender.mjs`](scripts/prerender.mjs)),
  så indholdet vises med det samme, kan læses af søgemaskiner og fungerer uden JavaScript.
- **Kort med d3-geo og d3-zoom** i stedet for et tungt kortbibliotek: fuld kontrol over det
  redaktionelle udtryk, ingen API-nøgler, og kortdata hentes først, når kortet nærmer sig skærmen.
- **Ingen animationsbibliotek.** CSS og lidt JavaScript; `prefers-reduced-motion` respekteres overalt.
- **Skrifttyper hostes selv** (Instrument Serif + Manrope via Fontsource) – ingen kald til Google
  Fonts, hvilket også er rart i en GDPR-sammenhæng.

## Mappestruktur

```
src/
  data/content.ts        ← alt indhold
  data/world.json        ← genereret verdenskort
  components/            ← Hero, SiteHeader, journey/ (kort, panel, tidslinje), contact/ (illustrationer)
  styles/                ← designsystem (tokens.css) og et stylesheet pr. sektion
  lib/, hooks/           ← kortmatematik, klynger, små hjælpere
public/                  ← CV, billeder, favicon
scripts/                 ← kortdata, billeder, forhåndsrendering
tests/unit, tests/e2e    ← Vitest og Playwright
```

Mappen `cv-files/` (kilde-CV'er, bl.a. målrettede ansøgninger) er udeladt fra git via `.gitignore`.
