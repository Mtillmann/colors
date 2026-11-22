// Imports the "best of" names from meodai/color-names (color-name-list, MIT license,
// https://github.com/meodai/color-names) into sources/color-name-list-bestof.json.
// Usage: node scripts/import-color-name-list.js [path/to/colornames.csv]
import fs from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const csvPath = process.argv[2] ?? '../color-names-ref/src/colornames.csv'
const rows = fs.readFileSync(csvPath, 'utf8').trim().split('\n')
const header = rows.shift().split(',')
const [nameIdx, hexIdx, goodIdx] = ['name', 'hex', 'good name'].map(k => header.indexOf(k))
if (nameIdx < 0 || hexIdx < 0 || goodIdx < 0) throw new Error('unexpected CSV header: ' + header.join(','))

const out = []
for (const row of rows) {
  const cols = row.split(',')
  if (cols[goodIdx] !== 'x') continue // "best of" list only
  const hex = cols[hexIdx].trim().toUpperCase()
  if (!/^#[0-9A-F]{6}$/.test(hex)) throw new Error('invalid hex: ' + row)
  out.push({ hex, alias: [cols[nameIdx].trim()] })
}

fs.writeFileSync(dirname(fileURLToPath(import.meta.url)) + '/../sources/color-name-list-bestof.json', JSON.stringify(out, null, 2))
console.log(`imported ${out.length} best-of names`)
