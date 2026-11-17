import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight, Search, SearchX } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Empty } from '../../components/ui/Empty'
import { inputClass } from '../../components/ui/Field'
import { SampleTag } from '../../components/ui/SampleTag'
import { TierChip } from '../../components/TierChip'
import { SampleLoadBlock } from '../../components/SampleLoadBlock'
import { useStore } from '../../store/AppStore'
import { getTier } from '../../lib/rules'
import { formatNumber } from '../../lib/format'
import { searchMembers } from '../../lib/search'
import { EASE, staggerDelay } from '../../lib/motion'

export default function ThanhVien() {
  const { state, hasData } = useStore()
  const [q, setQ] = useState('')
  const results = useMemo(() => searchMembers(state.members, q), [state.members, q])

  if (!hasData)
    return (
      <>
        <PageHeader title="Thành viên" />
        <SampleLoadBlock />
      </>
    )

  return (
    <>
      <PageHeader
        title="Thành viên"
        subtitle={`${formatNumber(state.members.length)} thành viên`}
        action={state.isSample ? <SampleTag /> : undefined}
      />
      <div className="px-4">
        <label htmlFor="tim-tv" className="mb-1.5 block text-sm font-semibold">
          Tìm thành viên
        </label>
        <div className="relative">
          <Search size={20} strokeWidth={1.75} className="pointer-events-none absolute top-3.5 left-3 text-muted" aria-hidden />
          <input
            id="tim-tv"
            type="search"
            className={`${inputClass} pl-10`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tên, SĐT hoặc mã KT-…"
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
      </div>

      {results.length === 0 ? (
        <Empty icon={SearchX} title="Không có thành viên khớp" hint={`Không tìm thấy “${q.trim()}”. Thử tên không dấu, 4 số cuối SĐT hoặc mã KT-xxx.`} />
      ) : (
        <ul className="mx-4 mt-4 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
          {results.map((m, i) => {
            const tier = getTier(m.points)
            return (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: staggerDelay(i), ease: EASE }}
              >
                <Link to={`/quay/thanh-vien/${m.id}`} className="flex min-h-[60px] items-center gap-3 px-4 py-3 active:bg-bg">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{m.name}</p>
                    <p className="num text-sm text-muted">{m.id}</p>
                  </div>
                  <TierChip tier={tier} />
                  <p className="num w-16 text-right font-bold">{formatNumber(m.points)}</p>
                  <ChevronRight size={20} strokeWidth={1.75} className="-mr-1 text-muted" aria-hidden />
                </Link>
              </motion.li>
            )
          })}
        </ul>
      )}
      {q && results.length > 0 && (
        <p className="mt-3 px-4 text-sm text-muted">
          {results.length} kết quả cho “{q.trim()}”
        </p>
      )}
    </>
  )
}
