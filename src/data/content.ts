/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ALT INDHOLD PÅ SIDEN REDIGERES I DENNE FIL
 * ─────────────────────────────────────────────────────────────────────────────
 *  Tekster, erfaringer, byer på kortet, kompetencer og kontaktoplysninger ligger
 *  samlet her. Komponenterne læser alt herfra, så du sjældent behøver at røre
 *  ved andre filer.
 *
 *  Kilder: Mathias' CV (cv-files/) og hans egen beskrivelse af baggrunden.
 *  Opfind ikke nye oplysninger – hvis noget mangler, så lad feltet være tomt.
 *
 *  Tip: `npm test` tjekker bl.a., at alle henvisninger mellem erfaringer, byer
 *  og kort hænger sammen, når du har ændret noget.
 */

/* ── Typer ──────────────────────────────────────────────────────────────── */

/** Kategorier i tidslinjen (og filtrene over den). */
export type Category = 'work' | 'education' | 'international'

/** Pin-typer på kortet. `base` er der, hvor Mathias bor i dag. */
export type PlaceKind = Category | 'base'

export interface Place {
  id: string
  city: string
  country: string
  /** [længdegrad, breddegrad]. Kun byniveau – aldrig private adresser. */
  coordinates: [number, number]
  /** Første type bestemmer pinnens ikon. Flere typer giver en todelt pin. */
  kinds: PlaceKind[]
  /** Kort periode, der vises ved pinnen på kortet. */
  period: string
  /** Institution(er) eller arbejdsplads(er) – vises i infopanelet. */
  headline: string
  /** Et par sætninger til infopanelet. */
  story: string
  skills: string[]
  /** Hvilken side af pinnen bynavnet står på, så tætte byer ikke overlapper. */
  labelSide?: 'left' | 'right'
}

export interface Role {
  org: string
  role: string
  period: string
  location?: string
  text: string
}

export interface Experience {
  id: string
  category: Category
  /** Vises øverst på kortet i tidslinjen. */
  period: string
  title: string
  subtitle?: string
  org: string
  location: string
  /** Id'er fra `places` – forbinder erfaringen med byer på kortet. */
  placeIds: string[]
  summary: string
  /** De vigtigste punkter – vises altid. */
  highlights: string[]
  /** Ekstra punkter bag "Læs mere". */
  more?: string[]
  /** Bruges, når én erfaring dækker flere arbejdspladser. */
  roles?: Role[]
  /** Hvad erfaringen har lært Mathias – vises bag "Læs mere". */
  learned?: string
  skills: string[]
}

/* ── Siden generelt ─────────────────────────────────────────────────────── */

export const site = {
  // Sidens adresse og undermappe sættes i scripts/site-env.mjs (og automatisk i GitHub Actions).
  title: 'Mathias Dalgaard · Politisk kommunikation, analyse og koordinering',
  description:
    'Kandidat i politisk kommunikation fra Universitetet i Oslo med ti måneders erfaring fra Danmarks Faste Repræsentation ved EU under det danske EU-formandskab. Analyse, koordinering og formidling – på tværs af fagligheder og landegrænser.',
  themeColor: '#f5efe4',
  /**
   * CV'et som PDF. Læg filen i `public/` under denne sti. Knappen bliver kun
   * aktiv, hvis filen findes, når siden bygges.
   */
  cv: {
    file: 'cv/Mathias-Dalgaard-CV.pdf',
    label: 'Se mit CV',
    meta: 'PDF · 2 sider',
  },
  /** Delingsbillede til LinkedIn, Facebook m.fl. (1200 × 630 px i `public/`, laves med `npm run images`). */
  ogImage: 'og-image.jpg',
}

export const nav = [
  { id: 'forside', label: 'Forside' },
  { id: 'rejse', label: 'Rejse & erfaring' },
  { id: 'kompetencer', label: 'Kompetencer' },
  { id: 'kontakt', label: 'Kontakt' },
] as const

/* ── Forside ────────────────────────────────────────────────────────────── */

export const profile = {
  name: 'Mathias Dalgaard',
  firstName: 'Mathias',
  lastName: 'Dalgaard',
  role: 'Kandidat i politisk kommunikation',
  base: 'Odense',
  /** Fra CV'et – står i den roterende badge ved portrættet. */
  tagline: 'Politisk forståelse · Stærk koordinering · Blik for detaljen',
  lead: 'Jeg skaber overblik, når opgaverne er komplekse – og gør det nemmere for andre at handle.',
  intro:
    'Fra EU-formandskabet i Bruxelles til journalistik i Oslo og kundeservice i internationale virksomheder har jeg arbejdet med analyse, koordinering og kommunikation – på tværs af fagligheder, organisationer og landegrænser.',
  /** Vises som en kort, animeret række under introduktionen. */
  highlightSkills: [
    'Politisk analyse',
    'International koordinering',
    'Skarpe indberetninger',
    'Klar formidling',
    'Tværgående samarbejde',
  ],
  /** Udskift jpg-filen og kør `npm run images` – så laves WebP-udgaverne automatisk. */
  photo: {
    jpg: 'images/mathias-dalgaard.jpg',
    webp: 'images/mathias-dalgaard.webp',
    webpSmall: 'images/mathias-dalgaard-480.webp',
    sizes: '(max-width: 860px) 250px, 410px',
    width: 800,
    height: 800,
    alt: 'Portræt af Mathias Dalgaard, der smiler til kameraet',
  },
}

/** "Kort fortalt" – fire hurtige fakta under introduktionen. */
export const facts = [
  {
    value: '10',
    unit: 'måneder',
    text: 'ved Danmarks Faste Repræsentation ved EU under det danske EU-formandskab',
  },
  {
    value: '2',
    unit: 'timer',
    text: 'var ofte deadline på mine indberetninger fra Rådets arbejdsgrupper',
  },
  {
    value: '5',
    unit: 'lande',
    text: 'hvor jeg har studeret eller arbejdet: Danmark, Norge, Belgien, Japan og Taiwan',
  },
  {
    value: 'A',
    unit: '(12)',
    text: 'for mit kandidatspeciale om retorik i koalitionsregeringer',
  },
]

/* ── Min rejse: byer på kortet ──────────────────────────────────────────── */

export const places: Place[] = [
  {
    id: 'bruxelles',
    city: 'Bruxelles',
    country: 'Belgien',
    coordinates: [4.3517, 50.8503],
    kinds: ['work'],
    period: '2025–26',
    headline: 'Danmarks Faste Repræsentation ved EU',
    story:
      'Under det danske EU-formandskab arbejdede jeg med cybersikkerhed, hybride trusler og politisk koordinering mellem danske ministerier, myndigheder og europæiske aktører.',
    skills: ['Politisk analyse', 'International koordinering', 'Kommunikation'],
    labelSide: 'left',
  },
  {
    id: 'oslo',
    city: 'Oslo',
    country: 'Norge',
    coordinates: [10.7522, 59.9139],
    kinds: ['education', 'work'],
    period: '2021–26',
    headline: 'Universitetet i Oslo · Universitas · Sydkoreas ambassade · Nespresso',
    story:
      'Fem år, to universitetsgrader og et arbejdsliv ved siden af: journalistik på Norges største studenteravis, kommunikation for Sydkoreas ambassade og kunderådgivning som kaffespecialist hos Nespresso.',
    skills: ['Politisk kommunikation', 'Journalistik', 'Service'],
    labelSide: 'right',
  },
  {
    id: 'kobenhavn',
    city: 'København',
    country: 'Danmark',
    coordinates: [12.5683, 55.6761],
    kinds: ['work'],
    period: '2020–21',
    headline: 'MUJI · flagskibsbutikken i ILLUM',
    story:
      'Jeg var med til at åbne MUJIs flagskibsbutik i ILLUM – med fokus på samarbejde, kommunikation og service i en international detailvirksomhed.',
    skills: ['Service', 'Samarbejde', 'Kommunikation'],
    labelSide: 'right',
  },
  {
    id: 'odense',
    city: 'Odense',
    country: 'Danmark',
    coordinates: [10.3883, 55.4038],
    kinds: ['base'],
    period: 'I dag',
    headline: 'Min base i dag',
    story:
      'Herfra er der kort vej til både København, Aarhus og resten af landet – og jeg er ustoppelig med et pendlerkort i hånden.',
    skills: [],
    labelSide: 'left',
  },
  {
    id: 'akita',
    city: 'Akita',
    country: 'Japan',
    coordinates: [140.1024, 39.72],
    kinds: ['international'],
    period: '2023',
    headline: 'Akita International University',
    story:
      'Et udvekslingssemester med japansk sprog og kurser i Japans historie og forfatning – i et internationalt studiemiljø i det nordlige Japan.',
    skills: ['Interkulturelt samarbejde', 'Japansk'],
    labelSide: 'left',
  },
  {
    id: 'taipei',
    city: 'Taipei',
    country: 'Taiwan',
    coordinates: [121.5654, 25.033],
    kinds: ['international'],
    period: '2018–19',
    headline: 'National Taiwan Normal University',
    story:
      'Et halvt år med intensivt mandarinkursus på stipendium fra Taiwans undervisningsministerium. Senere skrev jeg bachelorprojekt om Litauens internationale status i konflikten mellem Kina og Taiwan.',
    skills: ['Mandarin', 'Interkulturelt samarbejde'],
    labelSide: 'left',
  },
]

/**
 * Den stiplede linje på kortet: stederne i den rækkefølge, Mathias kom til dem
 * første gang. Perioder kan overlappe – tidslinjen viser detaljerne.
 */
export const journeyRoute = ['taipei', 'kobenhavn', 'oslo', 'akita', 'bruxelles', 'odense']
export const journeyRouteCaption = 'Linjen forbinder stederne i den rækkefølge, jeg kom til dem første gang.'

/** Knapperne over kortet. `places: 'all'` viser alle byer. */
export const mapViews = [
  { id: 'journey', label: 'Hele rejsen', places: 'all' as const },
  { id: 'europe', label: 'Europa', places: ['oslo', 'kobenhavn', 'odense', 'bruxelles'] },
  { id: 'asia', label: 'Østasien', places: ['akita', 'taipei'] },
]

/* ── Tidslinjen ─────────────────────────────────────────────────────────── */
/*  Rækkefølgen her er rækkefølgen på siden (nyeste først).                 */

export const experiences: Experience[] = [
  {
    id: 'eu-repraesentation',
    category: 'work',
    period: 'Apr. 2025 – jan. 2026',
    title: 'Stagiaire, cyber- og hybride trusler',
    org: 'Danmarks Faste Repræsentation ved EU',
    location: 'Bruxelles, Belgien',
    placeIds: ['bruxelles'],
    summary:
      'Ti måneder på fuld tid midt i det danske EU-formandskab – med ansvar for at holde danske ministerier og myndigheder opdateret om EU-forhandlinger om cyber- og hybride trusler.',
    highlights: [
      'Hovedansvar for politiske indberetninger fra Rådets arbejdsgrupper til danske ministerier og myndigheder, herunder SAMSIK – ofte med deadlines på blot to timer.',
      'Fulgte og analyserede forhandlingerne om bl.a. cybersikkerhedsreserven, Cyber Blueprint og resilienskapitlet i EU’s rumlov.',
      'Koordinerede danske input og informationsudveksling mellem ministerier, myndigheder og europæiske samarbejdspartnere.',
    ],
    more: [
      'Var med til at forberede og afvikle møder, diplomatiske besøg og arrangementer – bl.a. Telerådsmødet med ministerdeltagelse, Microsoft Cyber Agora og møder for cyberambassadører.',
      'Udarbejdede mødemateriale, talepunkter og præsentationer til diplomatiske og politiske aktiviteter.',
      'Arbejdede med fortrolige oplysninger i T-miljøet og håndterede politisk følsomme sager under korte deadlines.',
      'Samarbejdede direkte med SAMSIK og MSSB om cyber- og hybride trusler.',
    ],
    learned:
      'Jeg lærte at skabe overblik over komplekse politiske spørgsmål, formidle beslutningsrelevant information og samarbejde på tværs af institutioner og fagligheder.',
    skills: ['Politisk analyse', 'International koordinering', 'Indberetninger', 'Mødeforberedelse'],
  },
  {
    id: 'kandidat-uio',
    category: 'education',
    period: '2024 – 2026',
    title: 'Kandidat i politisk kommunikation',
    org: 'Universitetet i Oslo',
    location: 'Oslo, Norge',
    placeIds: ['oslo'],
    summary:
      'Fagligt fokus på politisk kommunikation, strategisk kommunikation og politiske beslutningsprocesser.',
    highlights: [
      'Speciale om regeringspartiers retoriske håndtering af mediekritik: “Two Sides of the Same Coin? Rhetorical (Re)negotiation of Participation in Coalition Government”.',
      'Specialet blev bedømt til A (12).',
    ],
    skills: ['Politisk kommunikation', 'Retorisk analyse', 'Strategisk kommunikation'],
  },
  {
    id: 'akita',
    category: 'international',
    period: 'Mar. – aug. 2023',
    title: 'Udvekslingsophold',
    org: 'Akita International University',
    location: 'Akita, Japan',
    placeIds: ['akita'],
    summary: 'Et semester i et internationalt studiemiljø i det nordlige Japan.',
    highlights: ['Japansk sprog samt kurser i Japans historie og forfatning.'],
    skills: ['Interkulturelt samarbejde', 'Japansk'],
  },
  {
    id: 'sydkorea-ambassade',
    category: 'work',
    period: 'Apr. – nov. 2022',
    title: 'Journalistik og kommunikation',
    org: 'Sydkoreas ambassade i Norge',
    location: 'Oslo, Norge',
    placeIds: ['oslo'],
    summary: 'Frivilligt arbejde med journalistik, kommunikation og public diplomacy – tæt på ambassadøren.',
    highlights: [
      'Assisterede ambassadøren ved diplomatiske og kulturelle arrangementer.',
      'Trådte til med få timers varsel som notatfører ved en konference om sikkerhed i Arktis.',
      'Skrev engelsksprogede artikler om diplomati, kultur og internationale forhold.',
    ],
    skills: ['Public diplomacy', 'Skriftlig formidling', 'Arrangementer'],
  },
  {
    id: 'universitas',
    category: 'work',
    period: 'Feb. – jun. 2022',
    title: 'Freelancejournalist',
    org: 'Universitas',
    location: 'Oslo, Norge',
    placeIds: ['oslo'],
    summary: 'Journalist på den engelsksprogede, internationale redaktion på Norges største studenteravis.',
    highlights: [
      'Researchede, interviewede og skrev artikler om samfundsrelevante emner.',
      'Udviklede og pitchede artikelidéer på redaktionsmøder.',
      'Leverede under korte deadlines i tæt samarbejde med redaktøren.',
    ],
    skills: ['Journalistik', 'Research', 'Interviews'],
  },
  {
    id: 'bachelor-uio',
    category: 'education',
    period: '2021 – 2024',
    title: 'Bachelor i internationale studier',
    subtitle: 'Specialisering i statskundskab',
    org: 'Universitetet i Oslo',
    location: 'Oslo, Norge',
    placeIds: ['oslo'],
    summary:
      'Fagligt fokus på international politik, politiske institutioner og internationale relationer – samt kvantitative og kvalitative metoder.',
    highlights: [
      'Bachelorprojekt om Litauens internationale status i relation til konflikten mellem Kina og Taiwan – bedømt til A.',
    ],
    skills: ['Statskundskab', 'International politik', 'Metode'],
  },
  {
    id: 'service',
    category: 'work',
    period: '2019 – 2025',
    title: 'Salg, kundeservice og sagsbehandling',
    org: 'Just Eat, MUJI og Nespresso',
    location: 'København og Oslo',
    placeIds: ['kobenhavn', 'oslo'],
    summary:
      'Flere års erfaring fra salg og service har givet mig en praktisk tilgang til arbejdet, en skarp forståelse for modtageren og vane med at samarbejde med mange forskellige mennesker.',
    highlights: [],
    roles: [
      {
        org: 'Nespresso',
        role: 'Kaffespecialist',
        period: 'Aug. 2022 – apr. 2025',
        location: 'Oslo',
        text: 'Rådgav kunder ud fra deres behov og håndterede reklamationer i flagskibsbutikken – også i travle perioder med lange køer.',
      },
      {
        org: 'MUJI',
        role: 'Salgsassistent',
        period: 'Aug. 2020 – aug. 2021',
        location: 'København',
        text: 'Var med til at åbne MUJIs flagskibsbutik i ILLUM og bidrog til den efterfølgende drift.',
      },
      {
        org: 'Just Eat',
        role: 'Kundeservicemedarbejder',
        period: 'Maj – okt. 2019',
        text: 'Håndterede kompensationssager og koordinerede løsninger mellem kunder, restaurantpartnere og leveringsbude – via telefon, e-mail og chat.',
      },
    ],
    skills: ['Service- og modtagerforståelse', 'Sagsbehandling', 'Samarbejde'],
  },
  {
    id: 'taipei',
    category: 'international',
    period: 'Sep. 2018 – feb. 2019',
    title: 'Sprogophold',
    org: 'National Taiwan Normal University',
    location: 'Taipei, Taiwan',
    placeIds: ['taipei'],
    summary: 'Et halvt år med intensivt mandarinkursus – på stipendium fra Taiwans undervisningsministerium.',
    highlights: [],
    skills: ['Mandarin', 'Interkulturelt samarbejde'],
  },
]

/* ── Det tager jeg med til bordet ───────────────────────────────────────── */

export const strengths = [
  {
    id: 'overblik',
    title: 'Jeg skaber overblik',
    lead: 'Fra komplekse EU-forhandlinger til tværgående koordinering.',
    value: 'Beslutningstagere får det, de skal bruge – præcist, i tide og uden støj.',
    example:
      'Under EU-formandskabet havde jeg hovedansvaret for indberetninger fra Rådets arbejdsgrupper til danske ministerier og myndigheder. Deadlinen var ofte to timer, så det handlede om hurtigt at skille det væsentlige fra resten.',
    evidence: ['eu-repraesentation'],
  },
  {
    id: 'formidling',
    title: 'Jeg gør det komplekse forståeligt',
    lead: 'Fra politiske indberetninger til journalistik og målrettet kommunikation.',
    value: 'Tekster, der passer til modtageren – hvad enten det er en beslutningstager, en fagkollega eller en bredere offentlighed.',
    example:
      'Jeg har skrevet talepunkter og mødemateriale til diplomatiske aktiviteter, engelsksprogede artikler til Norges største studenteravis og et speciale om, hvordan regeringspartier håndterer kritik retorisk.',
    evidence: ['eu-repraesentation', 'universitas', 'kandidat-uio'],
  },
  {
    id: 'samarbejde',
    title: 'Jeg får mennesker og opgaver til at hænge sammen',
    lead: 'Fra internationale samarbejder til kundeservice og praktisk problemløsning.',
    value: 'En kollega, der følger sagen til dørs – og sørger for, at alle ved, hvad næste skridt er.',
    example:
      'Hos Just Eat koordinerede jeg løsninger mellem kunder, restauranter og bude. I Bruxelles koordinerede jeg danske input mellem ministerier, myndigheder og europæiske partnere. Skalaen var en anden – håndværket det samme.',
    evidence: ['service', 'eu-repraesentation'],
  },
] as const

/** Kompetencer – og hvor de er opbygget. */
export const competencies = [
  {
    name: 'Politisk analyse og kommunikation',
    proof: 'EU-forhandlinger om cyber- og hybride trusler · kandidat i politisk kommunikation',
  },
  {
    name: 'International koordinering',
    proof: 'Danske input mellem ministerier, myndigheder og europæiske partnere under formandskabet',
  },
  {
    name: 'Interessentdialog og tværgående samarbejde',
    proof: 'Direkte samarbejde med SAMSIK og MSSB · diplomater fra andre EU-lande',
  },
  {
    name: 'Skriftlig og mundtlig formidling',
    proof: 'Indberetninger, talepunkter og engelsksprogede artikler',
  },
  {
    name: 'Research og informationsbearbejdning',
    proof: 'Speciale og bachelorprojekt · research og interviews for Universitas',
  },
  {
    name: 'Planlægning og afvikling af møder og arrangementer',
    proof: 'Telerådsmødet, Microsoft Cyber Agora og møder for cyberambassadører',
  },
  {
    name: 'Service- og modtagerforståelse',
    proof: 'Flere års kundeservice hos Just Eat, MUJI og Nespresso',
  },
  {
    name: 'Interkulturelt samarbejde',
    proof: 'Studeret og arbejdet i fem lande · japansk og mandarin på samtaleniveau',
  },
]

export const languages = [
  { name: 'Dansk', level: 'Modersmål', greeting: 'Hej', lang: 'da' },
  { name: 'Engelsk', level: 'Flydende, skriftligt og mundtligt', greeting: 'Hello', lang: 'en' },
  { name: 'Norsk', level: 'Flydende', greeting: 'Hei', lang: 'no' },
  { name: 'Svensk', level: 'Meget god forståelse', greeting: 'Tjena', lang: 'sv' },
  { name: 'Japansk', level: 'Samtaleniveau', greeting: 'こんにちは', lang: 'ja' },
  { name: 'Mandarin', level: 'Samtaleniveau', greeting: '你好', lang: 'zh-Hant' },
]

export const tools = [
  'Microsoft 365 (Word, Excel, PowerPoint, Teams, Outlook)',
  'Public 360° (journalisering)',
  'Conference Manager',
  'Zendesk',
  'Adyen',
  'Canva Pro',
]

export const references =
  'Skriftlige anbefalinger fra kolleger ved Danmarks Faste Repræsentation ved EU – og referencer – sender jeg gerne efter aftale.'

/* ── Kontakt ────────────────────────────────────────────────────────────── */

export const contact = {
  heading: 'Skal vi tage en kaffe?',
  text: 'De bedste samtaler begynder ofte over en kop kaffe. Har du en spændende mulighed, et spørgsmål eller blot lyst til at høre mere? Så lad os tage en snak.',
  /** Bruges i tel:-linket – kun cifre og landekode. */
  phone: '+4525525657',
  phoneDisplay: '+45 25 52 56 57',
  email: 'mathias.dalgrd@gmail.com',
  emailSubject: 'Skal vi tage en kaffe?',
  linkedin: 'https://www.linkedin.com/in/mathias-dalgaard',
  coffeeNote: 'Kaffen er i trygge hænder – jeg var kaffespecialist hos Nespresso i næsten tre år.',
  commuteNote: 'Odense er min base, og jeg er ustoppelig med et pendlerkort i hånden.',
}

/* ── Etiketter ──────────────────────────────────────────────────────────── */

export const categoryLabels: Record<Category, string> = {
  work: 'Erhvervserfaring',
  education: 'Uddannelse',
  international: 'Internationale ophold',
}

export const kindLabels: Record<PlaceKind, string> = {
  work: 'Arbejde',
  education: 'Uddannelse',
  international: 'Udlandsophold',
  base: 'Base i dag',
}
