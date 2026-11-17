import type { Member } from '../lib/types'
import { getTier } from '../lib/rules'
import { formatNumber } from '../lib/format'
import { APP_NAME } from '../lib/app'

/**
 * Thẻ thành viên tỉ lệ 1.586:1 (thẻ ngân hàng), nền đặc màu hạng, chữ trắng.
 * Đổi hạng → màu nền chuyển mượt 600ms.
 */
export function MemberCard({ member }: { member: Member }) {
  const tier = getTier(member.points)
  return (
    <div
      className="relative flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-[16px] p-5 text-white"
      style={{ backgroundColor: tier.color, transition: 'background-color 600ms cubic-bezier(0.2,0.8,0.2,1)' }}
      aria-label={`Thẻ ${APP_NAME} hạng ${tier.name} của ${member.name}, mã ${member.id}, ${formatNumber(member.points)} điểm`}
    >
      {/* Một vệt sáng chéo, opacity ≤ 0.08 */}
      <span
        className="pointer-events-none absolute -top-1/2 left-[38%] h-[200%] w-[34%] rotate-[24deg] bg-white opacity-[0.07]"
        aria-hidden
      />
      <div className="relative flex items-center justify-between">
        <span className="text-lg font-bold tracking-[-0.02em]">{APP_NAME}</span>
        <span className="text-sm font-semibold uppercase tracking-[0.12em]">{tier.name}</span>
      </div>
      <p className="relative font-mono text-2xl font-semibold tracking-[0.14em]">{member.id}</p>
      <div className="relative flex items-end justify-between gap-3">
        <span className="min-w-0 truncate text-base font-semibold">{member.name}</span>
        <span className="num shrink-0 text-lg font-bold">
          {formatNumber(member.points)} <span className="text-sm font-semibold">điểm</span>
        </span>
      </div>
    </div>
  )
}
