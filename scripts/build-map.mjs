// Genererer src/data/world.json – et kompakt verdenskort til den interaktive kortkomponent.
//
// Kilde: Natural Earth 1:50m via world-atlas. Vi bruger 50m frem for 110m, fordi 110m
// mangler bl.a. Fyn (Odense ville ellers ligge i havet), men forenkler geometrien, fjerner
// Antarktis og samler land/grænser på forhånd, så browseren kun skal tegne få stier.
//
// Kør igen med `npm run map:build`, hvis du fx vil fremhæve andre lande.
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { feature, merge, mesh, quantize } from 'topojson-client'
import { topology } from 'topojson-server'
import { filter, filterWeight, presimplify, quantile, simplify, sphericalRingArea } from 'topojson-simplify'

const require = createRequire(import.meta.url)
const source = JSON.parse(await readFile(require.resolve('world-atlas/countries-50m.json'), 'utf8'))

// ISO 3166-1 numeriske koder for lande, Mathias har boet, studeret eller arbejdet i.
const HIGHLIGHTED = {
  208: 'Danmark',
  578: 'Norge',
  '056': 'Belgien',
  392: 'Japan',
  158: 'Taiwan',
}
const ANTARCTICA = '010'

// 1) Forenkl den oprindelige topologi (delte grænser forbliver delte): behold ca. 12 % af
//    punkterne og fjern meget små øer, som alligevel ikke kan ses.
const KEEP = 0.12
const MIN_ISLAND_AREA = 1e-5 // steradianer
const presimplified = presimplify(source)
const simplified = filter(
  simplify(presimplified, quantile(presimplified, KEEP)),
  filterWeight(presimplified, MIN_ISLAND_AREA, (ring, interior) => sphericalRingArea(ring, interior)),
)
const countries = simplified.objects.countries
countries.geometries = countries.geometries.filter((g) => g.id !== ANTARCTICA)

// 2) Byg de tre lag, kortet skal bruge.
const land = merge(simplified, countries.geometries)
const borders = mesh(simplified, countries, (a, b) => a !== b)
const highlighted = feature(simplified, {
  type: 'GeometryCollection',
  geometries: countries.geometries
    .filter((g) => g.id in HIGHLIGHTED)
    .map((g) => ({ ...g, properties: { name: HIGHLIGHTED[g.id] ?? g.properties.name } })),
})

// 3) Gem som ny, kvantiseret topologi.
const out = quantize(topology({ land, borders, highlighted }), 3e4)
await writeFile(new URL('../src/data/world.json', import.meta.url), JSON.stringify(out))

const found = highlighted.features.map((f) => f.properties.name).join(', ')
console.log(`world.json skrevet (${(JSON.stringify(out).length / 1024).toFixed(0)} kB) · fremhævet: ${found}`)
