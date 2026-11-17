import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import type { Member } from '../../lib/types'
import { findMember } from '../../lib/rules'
import { useStore } from '../../store/AppStore'
import { saveRole } from '../../store/storage'
import { useToast } from '../../components/ui/Toast'
import VaoThe from './VaoThe'

/** State điều hướng: mở sẵn sheet đổi ưu đãi (từ ca TC-KT-03/04 hoặc nút ở tab Thẻ). */
export interface TvNavState {
  redeem?: string
}

/**
 * Khung vai Thành viên:
 * - ?ma=KT-xxx → chọn thành viên đó, chuyển vai, rồi xóa param (giữ thành viên khi đổi tab).
 * - Chưa chọn thành viên (hoặc mã không còn tồn tại) → màn "Vào thẻ của bạn". Thể lệ xem được không cần thẻ.
 */
export default function TvLayout() {
  const { state, currentMember, setCurrentMemberId } = useStore()
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  const ma = params.get('ma')
  const paramMember = ma ? findMember(state, ma) : undefined

  useEffect(() => {
    if (!ma) return
    if (paramMember) setCurrentMemberId(paramMember.id)
    else toast.show(`Không tìm thấy thành viên ${ma.toUpperCase()}`, 'error')
    saveRole('tv')
    const rest = new URLSearchParams(params)
    const redeem = rest.get('uudai') ?? undefined
    rest.delete('ma')
    rest.delete('uudai')
    const search = rest.toString()
    const navState: TvNavState | null = redeem && paramMember ? { redeem } : null
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true, state: navState })
    // chỉ chạy khi param ma thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ma])

  const member = paramMember ?? currentMember
  const isRulesPage = location.pathname === '/tv/the-le'

  return (
    <>
      {member && (
        <div className="border-b border-line bg-surface">
          <div className="flex min-h-12 items-center gap-2 pl-4 pr-2">
            <p className="min-w-0 flex-1 truncate text-sm text-muted">
              Đang xem: <span className="font-semibold text-ink">{member.name}</span> · <span className="num">{member.id}</span>
            </p>
            <button
              type="button"
              onClick={() => setCurrentMemberId(null)}
              className="min-h-11 shrink-0 rounded-[10px] px-3 text-sm font-semibold text-accent"
            >
              Đổi
            </button>
          </div>
        </div>
      )}
      {member ? <Outlet context={member} /> : isRulesPage ? <Outlet context={undefined} /> : <VaoThe />}
    </>
  )
}

/** Thành viên đang xem — chỉ dùng trong các tab cần thẻ (TvLayout đảm bảo đã có). */
export function useMember(): Member {
  return useOutletContext<Member>()
}
