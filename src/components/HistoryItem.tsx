import { CirclePlus, Gift, TicketCheck, type LucideIcon } from 'lucide-react'
import type { Reward, Txn } from '../lib/types'
import { formatNumber, formatSignedPoints, formatTime, formatVnd } from '../lib/format'
import { SampleTag } from './ui/SampleTag'

const ICON: Record<Txn['type'], LucideIcon> = { earn: CirclePlus, redeem: Gift, use_voucher: TicketCheck }

export function describeTxn(t: Txn, rewards: readonly Reward[]): string {
  const reward = t.rewardId ? rewards.find((r) => r.id === t.rewardId) : undefined
  switch (t.type) {
    case 'earn':
      return ['Mua hàng', t.txnCode, t.amount ? formatVnd(t.amount) : null].filter(Boolean).join(' · ')
    case 'redeem':
      return reward ? `Đổi ${reward.name}` : ['Đổi ưu đãi', t.txnCode].filter(Boolean).join(' · ')
    case 'use_voucher':
      return `Dùng voucher ${t.voucherCode ?? ''}`.trim()
  }
}

/** Một dòng biến động điểm (phía Thành viên). */
export function HistoryItem({ txn, rewards }: { txn: Txn; rewards: readonly Reward[] }) {
  const Icon = ICON[txn.type]
  const tone = txn.points > 0 ? 'text-success' : txn.points < 0 ? 'text-danger' : 'text-muted'
  return (
    <li className="flex gap-3 px-4 py-3">
      <Icon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-muted" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="num font-medium break-words">{describeTxn(txn, rewards)}</p>
        <p className="num mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span>Số dư sau: {formatNumber(txn.balanceAfter)}</span>
          <span aria-hidden>·</span>
          <span>{formatTime(txn.at)}</span>
          {txn.sample && <SampleTag />}
        </p>
      </div>
      <p className={`num shrink-0 text-lg leading-tight font-bold ${tone}`}>
        {txn.points === 0 ? '0' : formatSignedPoints(txn.points).replace('-', '−')}
      </p>
    </li>
  )
}
