import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Gift, History, QrCode } from 'lucide-react'
import { MemberCard } from '../../components/MemberCard'
import { QrSheet } from '../../components/QrSheet'
import { HistoryItem } from '../../components/HistoryItem'
import { Button } from '../../components/ui/Button'
import { Empty } from '../../components/ui/Empty'
import { useStore } from '../../store/AppStore'
import { getTier, memberTxns, nearestReward, nextTier, tierProgress } from '../../lib/rules'
import { formatNumber } from '../../lib/format'
import { useMember, type TvNavState } from './TvLayout'

export default function The() {
  const member = useMember()
  const { state } = useStore()
  const navigate = useNavigate()
  const [qrOpen, setQrOpen] = useState(false)

  const tier = getTier(member.points)
  const next = nextTier(member.points)
  const progress = tierProgress(member.points)
  const near = nearestReward(state.rewards, member.points)
  const recent = memberTxns(state, member.id).slice(0, 3)

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <h1 className="sr-only">Thẻ của {member.name}</h1>
      <MemberCard member={member} />
      <Button variant="secondary" full onClick={() => setQrOpen(true)}>
        <QrCode size={20} strokeWidth={1.75} aria-hidden /> Hiện mã QR
      </Button>

      <section className="rounded-[14px] border border-line bg-surface p-4">
        {next && progress != null ? (
          <>
            <p className="num font-semibold">
              Còn {formatNumber(next.remaining)} điểm để lên {next.tier.name}
            </p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuemin={tier.min}
              aria-valuemax={next.tier.min}
              aria-valuenow={member.points}
              aria-label={`Tiến độ lên hạng ${next.tier.name}`}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${progress * 100}%`, background: tier.color, transition: 'width 600ms, background-color 600ms' }}
              />
            </div>
            <p className="num mt-2 flex justify-between text-sm text-muted">
              <span>
                {tier.name} {formatNumber(tier.min)}
              </span>
              <span>
                {next.tier.name} {formatNumber(next.tier.min)}
              </span>
            </p>
          </>
        ) : (
          <p className="font-semibold">Bạn đang ở hạng cao nhất</p>
        )}
      </section>

      {near && (
        <section className="flex items-center gap-3 rounded-[14px] border border-line bg-surface p-4">
          <Gift size={20} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden />
          <p className="num min-w-0 flex-1 text-sm">
            {near.affordable ? (
              <>
                Bạn đủ điểm đổi <span className="font-semibold">{near.reward.name}</span>
              </>
            ) : (
              <>
                Còn <span className="font-semibold">{formatNumber(near.missing)} điểm</span> nữa để đổi{' '}
                <span className="font-semibold">{near.reward.name}</span>
              </>
            )}
          </p>
          {near.affordable ? (
            <Button
              className="shrink-0 px-3 text-sm"
              onClick={() => navigate('/tv/uu-dai', { state: { redeem: near.reward.id } satisfies TvNavState })}
            >
              Đổi ngay
            </Button>
          ) : (
            <Link to="/tv/uu-dai" className="flex min-h-11 shrink-0 items-center px-2 text-sm font-semibold text-accent">
              Xem
            </Link>
          )}
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-[-0.02em]">Biến động gần đây</h2>
          <Link to="/tv/lich-su" className="-mr-2 flex min-h-11 items-center gap-0.5 px-2 text-sm font-semibold text-accent">
            Xem tất cả <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
        {recent.length ? (
          <ul className="mt-2 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
            {recent.map((t) => (
              <HistoryItem key={t.id} txn={t} rewards={state.rewards} />
            ))}
          </ul>
        ) : (
          <Empty icon={History} title="Chưa có biến động" hint="Đọc mã thẻ ở quầy khi thanh toán để tích điểm." />
        )}
      </section>

      <QrSheet member={member} open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  )
}
