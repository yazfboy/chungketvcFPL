import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BarChart3, BookOpen, CirclePlus, CreditCard, Gift, History, TicketCheck, Users } from 'lucide-react'
import { TabBar, type TabItem } from './components/TabBar'
import { AppHeader } from './components/AppHeader'
import { Intro } from './components/Intro'
import { pageTransition } from './lib/motion'

const EASE_CSS = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
import { APP_NAME } from './lib/app'
import { loadRole, saveRole, sessionFlag, setSessionFlag, type Role } from './store/storage'
import CongDiem from './routes/quay/CongDiem'
import ThanhVien from './routes/quay/ThanhVien'
import ThanhVienChiTiet from './routes/quay/ThanhVienChiTiet'
import DuLieu from './routes/quay/DuLieu'
import QuayThongKe from './routes/quay/ThongKe'
import QuayVoucher from './routes/quay/Voucher'
import TvLayout from './routes/tv/TvLayout'
import TvThe from './routes/tv/The'
import TvUuDai from './routes/tv/UuDai'
import TvLichSu from './routes/tv/LichSu'
import TvTheLe from './routes/tv/TheLe'
import DangNhap from './routes/quay/DangNhap'
import { useStore } from './store/AppStore'
import { useToast } from './components/ui/Toast'

const TABS: Record<Role, TabItem[]> = {
  tv: [
    { to: '/tv/the', label: 'Thẻ', icon: CreditCard },
    { to: '/tv/uu-dai', label: 'Ưu đãi', icon: Gift },
    { to: '/tv/lich-su', label: 'Lịch sử', icon: History },
    { to: '/tv/the-le', label: 'Thể lệ', icon: BookOpen },
  ],
  quay: [
    { to: '/quay/cong-diem', label: 'Cộng điểm', icon: CirclePlus },
    { to: '/quay/voucher', label: 'Voucher', icon: TicketCheck },
    { to: '/quay/thanh-vien', label: 'Thành viên', icon: Users },
    { to: '/quay/thong-ke', label: 'Thống kê', icon: BarChart3 },
  ],
}

const HOME: Record<Role, string> = { tv: '/tv/the', quay: '/quay/cong-diem' }

type IntroPhase = 'off' | 'hold' | { reveal: number }

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/** ?intro=1 (trước hoặc sau dấu #) → chạy lại màn mở đầu khi thuyết trình. */
function introRequestedByUrl(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('intro') === '1') {
      const url = new URL(window.location.href)
      url.searchParams.delete('intro')
      window.history.replaceState(null, '', url.toString())
      return true
    }
  } catch {
    /* bỏ qua */
  }
  return false
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const reduce = useReducedMotion()
  const role: Role = location.pathname.startsWith('/quay') ? 'quay' : 'tv'
  const { quayAuthed, setQuayAuthed } = useStore()
  const toast = useToast()

  const [intro, setIntro] = useState<IntroPhase>(() =>
    !prefersReducedMotion() && (introRequestedByUrl() || !sessionFlag('intro')) ? 'hold' : 'off',
  )
  const [introRun, setIntroRun] = useState(0)

  const playIntro = useCallback(() => {
    if (prefersReducedMotion()) return
    setIntroRun((n) => n + 1)
    setIntro('hold')
  }, [])
  const onReveal = useCallback((ms: number) => setIntro({ reveal: ms }), [])
  const onIntroDone = useCallback(() => {
    setSessionFlag('intro')
    setIntro('off')
  }, [])

  // ?intro=1 trong phần hash (vd: #/tv/the?intro=1)
  useEffect(() => {
    if (params.get('intro') !== '1') return
    const next = new URLSearchParams(params)
    next.delete('intro')
    setParams(next, { replace: true })
    playIntro()
  }, [params, setParams, playIntro])

  useEffect(() => {
    if (location.pathname !== '/') saveRole(role)
  }, [role, location.pathname])

  // Khung app dùng CSS transition (không phụ thuộc requestAnimationFrame) → không bao giờ kẹt ở trạng thái mờ.
  const frameStyle: CSSProperties =
    intro === 'hold'
      ? { transform: 'scale(0.98)', opacity: 0.6, transformOrigin: '50% 30%' }
      : typeof intro === 'object'
        ? {
            transform: 'scale(1)',
            opacity: 1,
            transformOrigin: '50% 30%',
            transition: `transform ${intro.reveal}ms ${EASE_CSS}, opacity ${intro.reveal}ms ${EASE_CSS}`,
          }
        : {}

  return (
    <>
      {intro !== 'off' && <Intro key={introRun} name={APP_NAME} onReveal={onReveal} onDone={onIntroDone} />}
      {/* Khung app (header + nội dung) — tab bar để ngoài vì transform phá position: fixed */}
      <div style={frameStyle}>
        <AppHeader
          role={role}
          onRoleChange={(r) => {
            if (r === role) return
            saveRole(r)
            navigate(HOME[r])
          }}
          onReplayIntro={playIntro}
          onLogout={
            quayAuthed
              ? () => {
                  setQuayAuthed(false)
                  toast.show('Đã đăng xuất Quầy')
                }
              : undefined
          }
        />
        <div className="mx-auto min-h-[calc(100dvh-60px)] max-w-[480px] bg-bg">
          <main style={{ paddingBottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 24px)' }}>
            {/* Chỉ animation vào (không chờ animation thoát) → đổi route không bao giờ bị kẹt. */}
            <motion.div
              key={location.pathname}
              initial={reduce ? false : pageTransition.initial}
              animate={pageTransition.animate}
              transition={pageTransition.transition}
            >
              {/* Cổng Quầy mô phỏng: chưa đăng nhập → màn đăng nhập (giữ nguyên URL, vào xong hiện đúng màn). */}
              {role === 'quay' && !quayAuthed ? (
                <DangNhap />
              ) : (
              <Routes location={location}>
                <Route path="/" element={<Navigate to={HOME[loadRole()]} replace />} />
                <Route path="/tv" element={<TvLayout />}>
                  <Route index element={<Navigate to="/tv/the" replace />} />
                  <Route path="the" element={<TvThe />} />
                  <Route path="uu-dai" element={<TvUuDai />} />
                  <Route path="lich-su" element={<TvLichSu />} />
                  <Route path="the-le" element={<TvTheLe />} />
                </Route>
                <Route path="/quay/cong-diem" element={<CongDiem key={location.search} />} />
                <Route path="/quay/voucher" element={<QuayVoucher />} />
                <Route path="/quay/thanh-vien" element={<ThanhVien />} />
                <Route path="/quay/thanh-vien/:id" element={<ThanhVienChiTiet />} />
                <Route path="/quay/thong-ke" element={<QuayThongKe />} />
                <Route path="/quay/du-lieu" element={<DuLieu />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              )}
            </motion.div>
          </main>
        </div>
      </div>
      <TabBar items={TABS[role]} />
    </>
  )
}
