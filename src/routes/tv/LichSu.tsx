import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Empty } from '../../components/ui/Empty'
import { HistoryItem } from '../../components/HistoryItem'
import { useStore } from '../../store/AppStore'
import { memberTxns } from '../../lib/rules'
import { formatDayLabel, vnDayKey } from '../../lib/format'
import type { Txn } from '../../lib/types'
import { useMember } from './TvLayout'

type Filter = 'all' | 'earn' | 'spend'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'earn', label: 'Cộng' },
  { id: 'spend', label: 'Đổi' },
]

export default function LichSu() {
  const member = useMember()
  const { state } = useStore()
  const [filter, setFilter] = useState<Filter>('all')

  const groups = useMemo(() => {
    const txns = memberTxns(state, member.id).filter((t) =>
      filter === 'all' ? true : filter === 'earn' ? t.type === 'earn' : t.type !== 'earn',
    )
    const map = new Map<string, Txn[]>()
    for (const t of txns) {
      const k = vnDayKey(t.at)
      map.set(k, [...(map.get(k) ?? []), t])
    }
    return [...map.entries()]
  }, [state, member.id, filter])

  return (
    <>
      <PageHeader title="Lịch sử" subtitle="Biến động điểm của thẻ" />
      <div className="flex gap-2 px-4" role="radiogroup" aria-label="Lọc lịch sử">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-11 rounded-[10px] border px-4 text-sm ${
              filter === f.id ? 'border-accent bg-accent font-bold text-white' : 'border-line bg-surface font-medium text-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <Empty
          icon={History}
          title={filter === 'all' ? 'Chưa có biến động' : 'Không có biến động phù hợp'}
          hint={filter === 'all' ? 'Đọc mã thẻ ở quầy khi thanh toán để tích điểm.' : 'Chọn “Tất cả” để xem mọi biến động.'}
        />
      ) : (
        <div className="mt-4 flex flex-col gap-5 px-4">
          {groups.map(([day, txns]) => (
            <section key={day}>
              <h2 className="num mb-2 text-sm font-semibold text-muted">{formatDayLabel(day)}</h2>
              <ul className="divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
                {txns.map((t) => (
                  <HistoryItem key={t.id} txn={t} rewards={state.rewards} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
