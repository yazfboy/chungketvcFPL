import type { Txn } from '../lib/types'
import { formatDateTime, formatNumber, formatSignedPoints, formatVnd } from '../lib/format'
import { SampleTag } from './ui/SampleTag'

const TYPE_LABEL: Record<Txn['type'], string> = {
  earn: 'Cộng điểm',
  redeem: 'Đổi ưu đãi',
  use_voucher: 'Dùng voucher',
}

/** Lịch sử biến động: loại, ±điểm, số dư sau, thời gian, mã GD. */
export function TxnList({ txns }: { txns: Txn[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
      {txns.map((t) => (
        <li key={t.id} className="flex gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              {TYPE_LABEL[t.type]}
              {t.sample && <SampleTag />}
            </p>
            <p className="num mt-0.5 text-sm text-muted">{formatDateTime(t.at)}</p>
            <p className="num text-sm break-all text-muted">
              {[t.txnCode, t.voucherCode, t.amount ? formatVnd(t.amount) : null, t.type !== 'earn' ? t.note : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`num text-lg leading-tight font-bold ${t.points > 0 ? 'text-accent' : 'text-ink'}`}>
              {t.points === 0 ? '0' : formatSignedPoints(t.points)}
            </p>
            <p className="num text-sm text-muted">Số dư {formatNumber(t.balanceAfter)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
