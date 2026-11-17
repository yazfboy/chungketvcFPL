import { PageHeader } from '../../components/ui/PageHeader'
import { TierChip } from '../../components/TierChip'
import { useStore } from '../../store/AppStore'
import { MIN_AMOUNT, RULES_EFFECTIVE_FROM, TIERS, VND_PER_POINT, pointsForAmount } from '../../lib/rules'
import { formatDate, formatNumber, formatVnd } from '../../lib/format'

/** Ví dụ làm tròn: 19 lần tỉ lệ + một phần lẻ. */
const EXAMPLE_AMOUNT = VND_PER_POINT * 19 + VND_PER_POINT * 0.9

/** Thể lệ — mọi con số đọc trực tiếp từ rules.ts / state.rewards, không gõ tay. */
export default function TheLe() {
  const { state } = useStore()
  return (
    <>
      <PageHeader title="Thể lệ" subtitle={`Áp dụng từ ${formatDate(RULES_EFFECTIVE_FROM)} · Dữ liệu ban đầu: bộ mẫu BTC`} />
      <div className="flex flex-col gap-6 px-4">
        <section>
          <h2 className="text-lg font-bold tracking-[-0.02em]">Tích điểm</h2>
          <p className="num mt-2 text-[28px] leading-tight font-bold tracking-[-0.02em]">
            {formatVnd(VND_PER_POINT)} = 1 điểm
          </p>
          <p className="num mt-1 text-sm text-muted">
            Làm tròn xuống. Hoá đơn dưới {formatVnd(MIN_AMOUNT)} không tích điểm. Ví dụ: {formatVnd(EXAMPLE_AMOUNT)} →{' '}
            {formatNumber(pointsForAmount(EXAMPLE_AMOUNT))} điểm.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-[-0.02em]">Hạng thành viên</h2>
          <ul className="mt-2 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
            {TIERS.map((t, i) => {
              const next = TIERS[i + 1]
              return (
                <li key={t.id} className="flex min-h-14 items-center gap-3 px-4 py-3">
                  <TierChip tier={t} />
                  <span className="num flex-1 text-right font-semibold">
                    {next
                      ? t.min === 0
                        ? `Dưới ${formatNumber(next.min)} điểm`
                        : `${formatNumber(t.min)} – ${formatNumber(next.min - 1)} điểm`
                      : `Từ ${formatNumber(t.min)} điểm`}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-[-0.02em]">Ưu đãi đổi điểm</h2>
          <ul className="mt-2 divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface">
            {state.rewards.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{r.name}</span>
                  <span className="block text-sm text-muted">
                    {r.description}
                    {!r.active && ' · Ngừng áp dụng'}
                  </span>
                </span>
                <span className="num shrink-0 font-bold">{formatNumber(r.cost)} điểm</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-[-0.02em]">Quy tắc</h2>
          <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-base">
            <li>Hạng tính theo điểm hiện tại, nên đổi quà có thể làm thay đổi hạng — app luôn báo trước khi xác nhận.</li>
            <li>Mỗi mã giao dịch chỉ được cộng điểm 1 lần trên toàn hệ thống.</li>
            <li>Mỗi voucher chỉ dùng 1 lần tại quầy.</li>
            <li>Điểm và lịch sử lưu trên thiết bị này; “Nạp dữ liệu mẫu” sẽ ghi đè dữ liệu hiện có.</li>
          </ul>
        </section>
      </div>
    </>
  )
}
