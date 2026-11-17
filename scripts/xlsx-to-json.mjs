// Chuyển file Excel của BTC sang JSON tĩnh (chạy 1 lần, không parse lúc runtime).
// Cách dùng: node scripts/xlsx-to-json.mjs <đường-dẫn.xlsx> [thư-mục-ra=src/data]
// Mỗi sheet -> 1 file <ten-sheet>.json (mảng object, khoá = dòng tiêu đề).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import * as XLSX from 'xlsx'

const [, , input, outDir = 'src/data'] = process.argv
if (!input) {
  console.error('Thiếu đường dẫn file Excel. Ví dụ: npm run data -- data/de.xlsx')
  process.exit(1)
}

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'sheet'

const wb = XLSX.read(readFileSync(resolve(input)), { type: 'buffer', cellDates: true })
mkdirSync(outDir, { recursive: true })

for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: null, raw: true })
  const file = join(outDir, `${slug(name)}.json`)
  writeFileSync(file, JSON.stringify(rows, null, 2) + '\n', 'utf8')
  console.log(`✓ ${name} → ${file} (${rows.length} dòng)`)
}
