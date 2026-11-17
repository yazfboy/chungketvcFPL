import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { SampleTag } from '../../components/ui/SampleTag'
import { TierChip } from '../../components/TierChip'
import { SampleLoadBlock } from '../../components/SampleLoadBlock'
import { describeTxn } from '../../components/HistoryItem'
import { useStore } from '../../store/AppStore'
import { computeStats } from '../../lib/stats'
import { getTier } from '../../lib/rules'
import { formatDateTime, formatNumber, formatSignedPoints } from '../../lib/format'

export default function ThongKe() {
  const { state, hasData } = useStore()
  if (!hasData)
    return (
      <>
        <PageHeader title="Thống kê" />
        <SampleLoadBlock />
      </>
    )

  const s = computeStats(state)
  const names = new Map(state.members.map((m) => [m.id, m.name]))
  const tiles = [
    { label: 'Tổng thành viên', value: formatNumber(s.totalMembers) },
    { label: 'Điểm đã phát', value: formatNumber(s.pointsIssued) },
    { label: 'Điểm đã đổi', value: formatNumber(s.pointsRedeemed) },
    { label: 'Voucher đã dùng', value: `${formatNumber(s.vouchersUsed)}/${formatNumber(s.vouchersIssued)}` },
  ]

  return (
    <>
      <PageHeader title="Thống kê" subtitle="Tính từ dữ liệu trên máy này" action={state.isSample ? <SampleTag /> : undefined} />
      <div className="flex flex-col gap-6 px-4">
        <section className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-[14px] border border-line bg-surface p-4">
              <p className="text-sm text-muted">{t.label}</p>
              <p className="num mt-1 text-[26px] leading-tight font-bold tracking-[-0.02em]">{t.value}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-[-0.02em]">Phân bố hạng</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {s.tierDistribution.map((d) => (
              <li key={d.tier.id}>
                <div className="num mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">{d.tier.name}</span>
                  <span className="text-muted">
                    {formatNumber(d.count)} thành viên · {d.pct}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-line" aria-hidden>
                  <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.tier.color, transition: 'width 600ms' }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-[-0.02em]">Top 5 theo điểm</h2>
          <ol className="mt-2 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
            {s.top.map((m, i) => (
              <li key={m.id}>
                <Link to={`/quay/thanh-vien/${m.id}`} className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-bg">
                  <span className="num w-5 text-sm font-semibold text-muted">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{m.name}</span>
                    <span className="num block text-sm text-muted">{m.id}</span>
                  </span>
                  <TierChip tier={getTier(m.points)} />
                  <span className="num w-16 text-right font-bold">{formatNumber(m.points)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-[-0.02em]">Giao dịch gần nhất</h2>
          {s.recent.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Chưa có giao dịch.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
              {s.recent.map((t) => (
                <li key={t.id} className="flex gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {names.get(t.memberId) ?? t.memberId} <span className="num text-sm font-normal text-muted">· {t.memberId}</span>
                    </p>
                    <p className="num text-sm break-words text-muted">{describeTxn(t, state.rewards)}</p>
                    <p className="num flex items-center gap-2 text-sm text-muted">
                      {formatDateTime(t.at)}
                      {t.sample && <SampleTag />}
                    </p>
                  </div>
                  <p className={`num shrink-0 text-lg font-bold ${t.points > 0 ? 'text-success' : t.points < 0 ? 'text-danger' : 'text-muted'}`}>
                    {t.points === 0 ? '0' : formatSignedPoints(t.points).replace('-', '−')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
