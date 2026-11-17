import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { resetAll } from '../store/storage'

export default function Settings() {
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  function handleReset() {
    resetAll()
    setConfirming(false)
    setDone(true)
    window.setTimeout(() => window.location.reload(), 600)
  }

  return (
    <>
      <PageHeader title="Cài đặt" />
      <section className="px-4">
        <div className="rounded-[14px] border border-line bg-surface p-4">
          <h2 className="font-semibold">Khôi phục dữ liệu mẫu</h2>
          <p className="mt-1 text-sm text-muted">
            Xoá mọi thay đổi đã lưu trên máy này và nạp lại dữ liệu ban đầu.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {!confirming ? (
              <Button variant="secondary" full onClick={() => setConfirming(true)} disabled={done}>
                <RotateCcw size={20} strokeWidth={1.75} aria-hidden />
                {done ? 'Đã khôi phục' : 'Khôi phục dữ liệu mẫu'}
              </Button>
            ) : (
              <>
                <Button variant="danger" full onClick={handleReset}>
                  Xác nhận xoá và khôi phục
                </Button>
                <Button variant="secondary" full onClick={() => setConfirming(false)}>
                  Huỷ
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
