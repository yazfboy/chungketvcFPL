// Chuyển file Excel của BTC sang JSON tĩnh (chạy 1 lần, không parse lúc runtime).
// Cách dùng: npm run data -- data/mau.xlsx [thư-mục-ra=src/data]
// Cấu trúc file BTC: dòng 1 = tiêu đề, dòng 2 = ghi chú, sau đó là HEADER rồi dữ liệu.
// Đề nói header ở dòng 3 nhưng file thực tế có dòng 3 trống, header ở dòng 4 → tự dò:
// header = dòng đầu tiên từ dòng 3 trở đi có ít nhất 2 ô có dữ liệu.
// Mỗi sheet (trừ "Huong dan") -> src/data/<ten-sheet>.json. Mọi ô đọc dạng chuỗi (raw: false)
// để giữ số 0 đầu của số điện thoại; ép kiểu số được làm trong src/lib/seed.ts.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import * as XLSX from 'xlsx'

const [, , input, outDir = 'src/data'] = process.argv
if (!input) {
  console.error('Thiếu đường dẫn file Excel. Ví dụ: npm run data -- data/mau.xlsx')
  process.exit(1)
}

const SKIP = new Set(['huong dan'])

const wb = XLSX.read(readFileSync(resolve(input)), { type: 'buffer' })
mkdirSync(outDir, { recursive: true })

for (const name of wb.SheetNames) {
  if (SKIP.has(name.trim().toLowerCase())) continue
  const sheet = wb.Sheets[name]
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: true })
  let headerRow = 2
  while (headerRow < grid.length && grid[headerRow].filter((c) => String(c).trim() !== '').length < 2) headerRow++
  const rows = XLSX.utils
    .sheet_to_json(sheet, { range: headerRow, defval: '', raw: false })
    .map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), String(v).trim()])))
    .filter((row) => Object.values(row).some((v) => v !== ''))
  const file = join(outDir, `${name.trim()}.json`)
  writeFileSync(file, JSON.stringify(rows, null, 2) + '\n', 'utf8')
  console.log(`✓ ${name} → ${file} (${rows.length} dòng)`)
}
