import type { Member } from '../lib/types'
import { getTier, nextTier } from '../lib/rules'
import { formatNumber, maskPhone } from '../lib/format'
import { APP_NAME } from '../lib/app'

/** Thẻ thu nhỏ — nền đặc màu hạng, chữ trắng. */
export function MemberMiniCard({ member }: { member: Member }) {
  const tier = getTier(member.points)
  const next = nextTier(member.points)
  return (
    <div className="rounded-[14px] p-4 text-white" style={{ background: tier.color }}>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="tracking-[-0.02em]">{APP_NAME}</span>
        <span className="uppercase tracking-wide">Hạng {tier.name}</span>
      </div>
      <p className="mt-4 text-xl leading-tight font-bold tracking-[-0.02em]">{member.name}</p>
      <p className="num text-sm text-white/85">
        {member.id} · {maskPhone(member.phone)}
      </p>
      <p className="num mt-3 text-[32px] leading-none font-bold tracking-[-0.02em]">
        {formatNumber(member.points)} <span className="text-base font-semibold">điểm</span>
      </p>
      <p className="num mt-2 text-sm text-white/85">
        {next ? `Còn ${formatNumber(next.remaining)} điểm lên hạng ${next.tier.name}` : 'Đã đạt hạng cao nhất'}
      </p>
    </div>
  )
}
