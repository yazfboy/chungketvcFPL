import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Volume2, VolumeX } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { SampleTag } from '../../components/ui/SampleTag'
import { useToast } from '../../components/ui/Toast'
import { useStore } from '../../store/AppStore'
import { saveRole } from '../../store/storage'
import { SAMPLE_MEMBER_COUNT, TEST_CASES, type TestCase } from '../../lib/seed'
import { formatNumber, formatVnd } from '../../lib/format'
import { feedbackSuccess, isSoundOn, setSoundOn } from '../../lib/feedback'

type Confirm = null | 'load' | 'clear'

export default function DuLieu() {
  const { state, hasData, loadSample, clearAll } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [sound, setSound] = useState(isSoundOn)

  function doLoad() {
    loadSample()
    setConfirm(null)
    toast.show(`Đã nạp dữ liệu mẫu: ${SAMPLE_MEMBER_COUNT} thành viên`)
  }

  function tryCase(tc: TestCase) {
    if (!hasData) {
      loadSample()
      toast.show('Đã tự nạp dữ liệu mẫu để chạy ca kiểm tra')
    }
    const ref = tc.ref.toUpperCase()
    if (ref.startsWith('KT-VCH')) {
      // Đổi ưu đãi: chuyển sang vai Thành viên, mở thẻ tại tab Ưu đãi.
      saveRole('tv')
      navigate(`/tv/uu-dai?ma=${encodeURIComponent(tc.memberId)}&uudai=${encodeURIComponent(ref)}`)
      return
    }
    const p = new URLSearchParams({ ma: tc.memberId })
    if (ref.startsWith('TX')) {
      if (tc.amount) p.set('tien', String(tc.amount))
      p.set('gd', ref)
    }
    navigate(`/quay/cong-diem?${p.toString()}`)
  }

  return (
    <>
      <PageHeader title="Dữ liệu" subtitle="Nạp dữ liệu mẫu, chạy ca kiểm tra của BTC" />
      <div className="flex flex-col gap-6 px-4">
        <section className="rounded-[14px] border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Thành viên hiện có</p>
              <p className="num text-[32px] leading-tight font-bold tracking-[-0.02em]">{formatNumber(state.members.length)}</p>
            </div>
            {state.isSample && <SampleTag />}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {confirm === 'load' ? (
              <ConfirmBox
                text="Ghi đè toàn bộ dữ liệu hiện tại bằng bộ dữ liệu mẫu BTC?"
                okLabel="Ghi đè và nạp"
                onOk={doLoad}
                onCancel={() => setConfirm(null)}
              />
            ) : confirm === 'clear' ? (
              <ConfirmBox
                text="Xóa toàn bộ thành viên, giao dịch và voucher trên máy này? Không thể hoàn tác."
                okLabel="Xóa toàn bộ"
                danger
                onOk={() => {
                  clearAll()
                  setConfirm(null)
                  toast.show('Đã xóa toàn bộ dữ liệu')
                }}
                onCancel={() => setConfirm(null)}
              />
            ) : (
              <>
                <Button full className="min-h-[52px]" onClick={() => (hasData ? setConfirm('load') : doLoad())}>
                  Nạp dữ liệu mẫu
                </Button>
                <Button variant="danger" full disabled={!hasData} onClick={() => setConfirm('clear')}>
                  Xóa toàn bộ dữ liệu
                </Button>
              </>
            )}
          </div>
          <p className="mt-3 text-sm text-muted">Bộ dữ liệu BTC · {SAMPLE_MEMBER_COUNT} thành viên · Mã thử thống nhất: KT-004</p>
        </section>

        <section>
          <h2 className="text-lg font-bold tracking-[-0.02em]">Ca kiểm tra của BTC</h2>
          <p className="mt-1 text-sm text-muted">Từ sheet KT_CaKiemTra. Bấm “Thử ca này” để mở đúng màn và điền sẵn dữ liệu.</p>
          <ul className="mt-3 flex flex-col gap-3">
            {TEST_CASES.map((tc) => (
              <li key={tc.id} className="rounded-[14px] border border-line bg-surface p-4">
                <p className="num text-sm font-semibold text-accent">{tc.id}</p>
                <p className="mt-0.5 font-semibold">{tc.situation}</p>
                <p className="num mt-1 text-sm text-muted">
                  {[tc.memberId, tc.ref !== tc.memberId ? tc.ref : null, tc.amount ? formatVnd(tc.amount) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="mt-2 text-sm">
                  <span className="text-muted">Mong đợi: </span>
                  {tc.expected}
                </p>
                <Button variant="secondary" full className="mt-3" onClick={() => tryCase(tc)}>
                  <Play size={20} strokeWidth={1.75} aria-hidden /> Thử ca này
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[14px] border border-line bg-surface">
          <button
            type="button"
            role="switch"
            aria-checked={sound}
            onClick={() => {
              const next = !sound
              setSound(next)
              setSoundOn(next)
              if (next) feedbackSuccess()
            }}
            className="flex min-h-14 w-full items-center gap-3 px-4 text-left"
          >
            {sound ? <Volume2 size={20} strokeWidth={1.75} aria-hidden /> : <VolumeX size={20} strokeWidth={1.75} aria-hidden />}
            <span className="flex-1">
              <span className="block font-semibold">Âm thanh bíp</span>
              <span className="block text-sm text-muted">Khi quét / cộng điểm thành công</span>
            </span>
            <span className={`relative h-7 w-12 rounded-full transition-colors ${sound ? 'bg-accent' : 'bg-line'}`} aria-hidden>
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.15)] transition-transform ${
                  sound ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
        </section>
      </div>
    </>
  )
}

function ConfirmBox({
  text,
  okLabel,
  danger,
  onOk,
  onCancel,
}: {
  text: string
  okLabel: string
  danger?: boolean
  onOk: () => void
  onCancel: () => void
}) {
  return (
    <div role="alertdialog" aria-label={text} className="flex flex-col gap-2">
      <p className="text-sm font-medium">{text}</p>
      <Button full variant={danger ? 'danger' : 'primary'} className="min-h-[52px]" onClick={onOk}>
        {okLabel}
      </Button>
      <Button full variant="secondary" onClick={onCancel}>
        Huỷ
      </Button>
    </div>
  )
}
