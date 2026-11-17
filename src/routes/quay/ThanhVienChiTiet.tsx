import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, History, UserX } from 'lucide-react'
import { Empty } from '../../components/ui/Empty'
import { MemberMiniCard } from '../../components/MemberMiniCard'
import { TxnList } from '../../components/TxnList'
import { useStore } from '../../store/AppStore'
import { findMember, memberTxns } from '../../lib/rules'

export default function ThanhVienChiTiet() {
  const { id = '' } = useParams()
  const { state } = useStore()
  const member = findMember(state, id)
  const txns = member ? memberTxns(state, member.id) : []

  return (
    <>
      <div className="px-2 pt-2">
        <Link to="/quay/thanh-vien" className="inline-flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-muted">
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden /> Thành viên
        </Link>
      </div>
      {!member ? (
        <Empty
          icon={UserX}
          title="Không tìm thấy thành viên"
          hint={`Không có thành viên mã ${id}.`}
          action={
            <Link to="/quay/thanh-vien" className="inline-flex min-h-11 items-center rounded-[10px] border border-line bg-surface px-4 font-semibold">
              Về danh sách
            </Link>
          }
        />
      ) : (
        <div className="px-4">
          <h1 className="sr-only">{member.name}</h1>
          <MemberMiniCard member={member} />
          <Link
            to={`/quay/cong-diem?ma=${encodeURIComponent(member.id)}`}
            className="mt-3 flex min-h-12 items-center justify-center rounded-[10px] border border-line bg-surface font-semibold"
          >
            Cộng điểm cho thành viên này
          </Link>
          <h2 className="mt-6 mb-3 text-lg font-bold tracking-[-0.02em]">Lịch sử điểm</h2>
          {txns.length ? (
            <TxnList txns={txns} />
          ) : (
            <Empty icon={History} title="Chưa có giao dịch" hint="Các lần cộng điểm, đổi ưu đãi sẽ hiện ở đây." />
          )}
        </div>
      )}
    </>
  )
}
