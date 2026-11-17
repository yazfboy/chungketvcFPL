import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/be-vietnam-pro/400.css'
import '@fontsource/be-vietnam-pro/500.css'
import '@fontsource/be-vietnam-pro/600.css'
import '@fontsource/be-vietnam-pro/700.css'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/ui/Toast'
import { AppStoreProvider } from './store/AppStore'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <HashRouter>
        <ToastProvider>
          <AppStoreProvider>
            <App />
          </AppStoreProvider>
        </ToastProvider>
      </HashRouter>
    </StrictMode>,
  )
}
