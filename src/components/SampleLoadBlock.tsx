import { Database } from 'lucide-react'
import { Button } from './ui/Button'
import { useStore } from '../store/AppStore'
import { useToast } from './ui/Toast'
import { SAMPLE_MEMBER_COUNT, SAMPLE_TEST_ID } from '../lib/seed'

/** Khối nổi bật khi chưa có dữ liệu — màn đầu của cả hai vai. */
export function SampleLoadBlock({ onLoaded }: { onLoaded?: () => void }) {
  const { loadSample } = useStore()
  const toast = useToast()

  return (
    <section className="mx-4 rounded-[14px] border border-line bg-surface p-5">
      <Database size={24} strokeWidth={1.75} className="text-accent" aria-hidden />
      <h2 className="mt-3 text-xl font-bold tracking-[-0.02em]">Chưa có dữ liệu</h2>
      <p className="mt-1 text-sm text-muted">Nạp bộ dữ liệu của Ban tổ chức để bắt đầu thử các luồng.</p>
      <Button
        full
        className="mt-5 min-h-[52px]"
        onClick={() => {
          loadSample()
          toast.show(`Đã nạp dữ liệu mẫu: ${SAMPLE_MEMBER_COUNT} thành viên`)
          onLoaded?.()
        }}
      >
        Nạp dữ liệu mẫu
      </Button>
      <p className="mt-3 text-sm text-muted">
        Bộ dữ liệu BTC · {SAMPLE_MEMBER_COUNT} thành viên · Mã thử thống nhất:{' '}
        <span className="num font-semibold text-ink">{SAMPLE_TEST_ID}</span>
      </p>
    </section>
  )
}
