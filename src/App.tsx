import { useCallback, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { LayoutDashboard, ListChecks, Settings as SettingsIcon } from 'lucide-react'
import { TabBar, type TabItem } from './components/TabBar'
import { Intro } from './components/Intro'
import { pageTransition } from './lib/motion'
import { APP_NAME } from './lib/app'
import { sessionFlag, setSessionFlag } from './store/storage'
import Home from './routes/Home'
import List from './routes/List'
import Settings from './routes/Settings'

const TABS: TabItem[] = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/danh-sach', label: 'Danh sách', icon: ListChecks },
  { to: '/cai-dat', label: 'Cài đặt', icon: SettingsIcon },
]

export default function App() {
  const location = useLocation()
  const reduce = useReducedMotion()
  const [showIntro, setShowIntro] = useState(() => !sessionFlag('intro'))
  const finishIntro = useCallback(() => {
    setSessionFlag('intro')
    setShowIntro(false)
  }, [])

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-bg">
      <AnimatePresence>{showIntro && !reduce && <Intro name={APP_NAME} onDone={finishIntro} />}</AnimatePresence>
      <main style={{ paddingBottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 16px)' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname} {...(reduce ? {} : pageTransition)}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/danh-sach" element={<List />} />
              <Route path="/cai-dat" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <TabBar items={TABS} />
    </div>
  )
}
