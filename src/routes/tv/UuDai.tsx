import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CircleAlert, Copy, Gift, QrCode, TicketX, TriangleAlert } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Empty } from '../../components/ui/Empty'
import { Sheet } from '../../components/ui/Sheet'
import { useToast } from '../../components/ui/Toast'
import { useStore } from '../../store/AppStore'
import { findReward, getTier, previewRedeem, redeem, rewardEligibility } from '../../lib/rules'
import { formatDateTime, formatNumber } from '../../lib/format'
import { feedbackError, feedbackSuccess } from '../../lib/feedback'
import { EASE, staggerDelay } from '../../lib/motion'
import type { Member, Reward, Voucher } from '../../lib/types'
import { useMember, type TvNavState } from './TvLayout'

type Tab = 'doi' | 'vi'

export default function UuDai() {
  const member = useMember()
  const { state, run } = useStore()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('doi')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)

  // Mở sẵn sheet xác nhận khi được điều hướng kèm { redeem } (ca TC-KT-03/04, nút "Đổi ngay").
  useEffect(() => {
    const redeemId = (location.state as TvNavState | null)?.redeem
    if (!redeemId) return
    setTab('doi')
    setConfirmId(redeemId)
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const vouchers = state.vouchers.filter((v) => v.memberId === member.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const tier = getTier(member.points)
  const confirmReward = confirmId ? findReward(state, confirmId) : undefined

  function doRedeem(reward: Reward) {
    const r = run((s) => redeem(s, { memberId: member.id, rewardId: reward.id }))
    setConfirmId(null)
    if (!r.ok) {
      feedbackError()
      toast.show(r.error, 'error')
      return
    }
    feedbackSuccess()
    toast.show(`Đã đổi ${reward.name} · còn ${formatNumber(r.member.points)} điểm`)
    if (r.newTier.id !== r.oldTier.id)
      window.setTimeout(() => toast.show(`Hạng chuyển từ ${r.oldTier.name} xuống ${r.newTier.name}`, 'tierup', r.newTier.color), 250)
    setHighlight(r.voucher.code)
    setTab('vi')
    window.setTimeout(() => setHighlight(null), 2400)
  }

  return (
    <>
      <PageHeader title="Ưu đãi" />
      <div className="px-4">
        {/* Dải số dư màu hạng — chuyển màu mượt khi đổi quà làm đổi hạng */}
        <div
          className="flex items-center justify-between rounded-[14px] px-4 py-3 text-white"
          style={{ backgroundColor: tier.color, transition: 'background-color 600ms cubic-bezier(0.2,0.8,0.2,1)' }}
        >
          <span className="text-sm font-semibold uppercase tracking-[0.12em]">Hạng {tier.name}</span>
          <span className="num text-xl font-bold">
            {formatNumber(member.points)} <span className="text-sm font-semibold">điểm</span>
          </span>
        </div>

        <div role="tablist" aria-label="Ưu đãi" className="mt-4 flex rounded-[12px] border border-line bg-surface p-0.5">
          {(
            [
              ['doi', 'Đổi điểm'],
              ['vi', `Ví ưu đãi (${vouchers.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-11 flex-1 rounded-[10px] text-sm ${tab === id ? 'bg-accent font-bold text-white' : 'font-medium text-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 px-4">
        {tab === 'doi' ? (
          <ul className="flex flex-col gap-3">
            {state.rewards.map((rw, i) => {
              const elig = rewardEligibility(member.points, rw)
              return (
                <motion.li
                  key={rw.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: staggerDelay(i), ease: EASE }}
                  className="rounded-[14px] border border-line bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{rw.name}</p>
                      <p className="mt-0.5 text-sm text-muted">{rw.description}</p>
                    </div>
                    <p className="num shrink-0 text-right text-lg leading-tight font-bold">
                      {formatNumber(rw.cost)}
                      <span className="block text-xs font-medium text-muted">điểm</span>
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className={`num text-sm ${elig.ok ? 'text-muted' : 'font-medium text-danger'}`}>
                      {elig.ok ? `Còn lại ${formatNumber(member.points - rw.cost)} điểm sau đổi` : elig.reason}
                    </span>
                    <Button className="shrink-0 px-5" disabled={!elig.ok} onClick={() => setConfirmId(rw.id)}>
                      Đổi
                    </Button>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        ) : vouchers.length === 0 ? (
          <Empty
            icon={TicketX}
            title="Ví ưu đãi trống"
            hint="Đổi điểm lấy voucher, rồi đưa mã cho nhân viên quầy khi thanh toán."
            action={<Button onClick={() => setTab('doi')}>Sang Đổi điểm</Button>}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {vouchers.map((v) => (
              <VoucherTicket key={v.code} voucher={v} reward={findReward(state, v.rewardId)} highlight={v.code === highlight} />
            ))}
          </ul>
        )}
      </div>

      <ConfirmRedeemSheet member={member} reward={confirmReward} onClose={() => setConfirmId(null)} onConfirm={doRedeem} />
    </>
  )
}

function ConfirmRedeemSheet({
  member,
  reward,
  onClose,
  onConfirm,
}: {
  member: Member
  reward: Reward | undefined
  onClose: () => void
  onConfirm: (r: Reward) => void
}) {
  const { state } = useStore()
  const preview = reward ? previewRedeem(state, { memberId: member.id, rewardId: reward.id }) : null
  return (
    <Sheet open={!!reward} title="Xác nhận đổi ưu đãi" onClose={onClose}>
      {reward && preview && (
        <div className="flex flex-col gap-4 pb-2">
          {preview.ok ? (
            <>
              <p className="num text-base">
                Đổi <span className="font-bold">{formatNumber(reward.cost)} điểm</span> lấy{' '}
                <span className="font-bold">{reward.name}</span>
              </p>
              <div className="num flex items-center justify-between rounded-[10px] bg-bg px-4 py-3">
                <span className="text-sm text-muted">Số dư sau đổi</span>
                <span className="text-lg font-bold">{formatNumber(preview.balanceAfter)} điểm</span>
              </div>
              {preview.tierDrops && (
                <p role="alert" className="flex items-start gap-2 rounded-[10px] border border-warning/30 bg-warning/5 p-3 text-sm font-medium text-warning">
                  <TriangleAlert size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
                  Sau khi đổi, hạng sẽ chuyển từ {preview.tierBefore.name} xuống {preview.tierAfter.name}
                </p>
              )}
              <Button full className="min-h-[52px]" onClick={() => onConfirm(reward)}>
                Xác nhận đổi
              </Button>
              <Button variant="secondary" full onClick={onClose}>
                Huỷ
              </Button>
            </>
          ) : (
            <>
              <p className="font-semibold">{reward.name}</p>
              <p role="alert" className="flex items-start gap-2 rounded-[10px] border border-danger/30 bg-danger/5 p-3 text-sm font-medium text-danger">
                <CircleAlert size={20} strokeWidth={1.75} className="shrink-0" aria-hidden />
                Không thể đổi. {preview.error}
              </p>
              <Button variant="secondary" full onClick={onClose}>
                Đóng
              </Button>
            </>
          )}
        </div>
      )}
    </Sheet>
  )
}

function VoucherTicket({ voucher, reward, highlight }: { voucher: Voucher; reward?: Reward; highlight: boolean }) {
  const toast = useToast()
  const [qrOpen, setQrOpen] = useState(false)
  const used = voucher.status === 'da_dung'

  async function copy() {
    try {
      await navigator.clipboard.writeText(voucher.code)
      toast.show(`Đã sao chép ${voucher.code}`)
    } catch {
      toast.show('Không sao chép được — hãy đọc mã cho nhân viên', 'error')
    }
  }

  return (
    <motion.li
      initial={highlight ? { scale: 0.98, opacity: 0 } : false}
      animate={{ scale: 1, opacity: used ? 0.55 : 1 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`relative overflow-hidden rounded-[14px] border bg-surface ${highlight ? 'border-accent' : 'border-line'}`}
      style={{ transition: 'border-color 600ms' }}
    >
      <div className="flex">
        <div className="w-3 shrink-0 border-r-2 border-dashed border-line bg-bg" aria-hidden />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-2 font-semibold">
              <Gift size={20} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden />
              {reward?.name ?? voucher.rewardId}
            </p>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold ${used ? 'border border-line text-muted' : 'bg-accent text-white'}`}
            >
              {used ? 'Đã dùng' : 'Chưa dùng'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <p className="min-w-0 flex-1 font-mono text-lg font-semibold tracking-[0.06em] break-all">{voucher.code}</p>
            {!used && (
              <button
                type="button"
                onClick={copy}
                aria-label={`Sao chép mã ${voucher.code}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-line"
              >
                <Copy size={20} strokeWidth={1.75} aria-hidden />
              </button>
            )}
          </div>
          <p className="num mt-1 text-sm text-muted">
            {used && voucher.usedAt ? `Đã dùng lúc ${formatDateTime(voucher.usedAt)}` : `Đổi lúc ${formatDateTime(voucher.createdAt)}`}
          </p>
          {!used && (
            <Button variant="secondary" full className="mt-3" onClick={() => setQrOpen(true)}>
              <QrCode size={20} strokeWidth={1.75} aria-hidden /> Hiện QR
            </Button>
          )}
        </div>
      </div>
      <Sheet open={qrOpen} title="QR voucher" onClose={() => setQrOpen(false)}>
        <div className="flex flex-col items-center pb-2 text-center">
          <div className="rounded-[14px] border border-line bg-white p-2">
            <QRCodeSVG value={voucher.code} size={220} level="M" marginSize={4} title={`QR ${voucher.code}`} />
          </div>
          <p className="mt-4 font-mono text-[22px] leading-none font-semibold tracking-[0.08em]">{voucher.code}</p>
          <p className="mt-2 text-sm text-muted">{reward?.name} · Đưa mã này cho nhân viên quầy quét</p>
        </div>
      </Sheet>
    </motion.li>
  )
}
