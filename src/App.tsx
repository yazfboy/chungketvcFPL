import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BarChart3, BookOpen, CirclePlus, CreditCard, Gift, History, TicketCheck, Users } from 'lucide-react'
import { TabBar, type TabItem } from './components/TabBar'
import { AppHeader } from './components/AppHeader'
import { Intro } from './components/Intro'
import { pageTransition } from './lib/motion'
import { APP_NAME } from './lib/app'
import { loadRole, saveRole, sessionFlag, setSessionFlag, type Role } from './store/storage'
import CongDiem from './routes/quay/CongDiem'
import ThanhVien from './routes/quay/ThanhVien'
import ThanhVienChiTiet from './routes/quay/ThanhVienChiTiet'
import DuLieu from './routes/quay/DuLieu'
import { QuayThongKe, QuayVoucher } from './routes/quay/Placeholders'
import TvLayout from './routes/tv/TvLayout'
import TvThe from './routes/tv/The'
import TvUuDai from './routes/tv/UuDai'
import TvLichSu from './routes/tv/LichSu'
import TvTheLe from './routes/tv/TheLe'

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

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const role: Role = location.pathname.startsWith('/quay') ? 'quay' : 'tv'
  const [showIntro, setShowIntro] = useState(() => !sessionFlag('intro'))
  const finishIntro = useCallback(() => {
    setSessionFlag('intro')
    setShowIntro(false)
  }, [])

  useEffect(() => {
    if (location.pathname !== '/') saveRole(role)
  }, [role, location.pathname])

  return (
    <>
      <AnimatePresence>{showIntro && !reduce && <Intro name={APP_NAME} onDone={finishIntro} />}</AnimatePresence>
      <AppHeader
        role={role}
        onRoleChange={(r) => {
          if (r === role) return
          saveRole(r)
          navigate(HOME[r])
        }}
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
          </motion.div>
        </main>
      </div>
      <TabBar items={TABS[role]} />
    </>
  )
}
