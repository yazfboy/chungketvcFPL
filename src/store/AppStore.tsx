import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import type { AppState, Result } from '../lib/types'
import { emptyState } from '../lib/rules'
import { buildSampleState } from '../lib/seed'
import { loadAppState, saveAppState } from './storage'
import { useToast } from '../components/ui/Toast'

type Action = { type: 'set'; state: AppState }

function reducer(_: AppState, action: Action): AppState {
  return action.state
}

interface Store {
  state: AppState
  hasData: boolean
  /** Chạy một thao tác nghiệp vụ thuần (rules.ts); nếu ok thì lưu state mới. */
  run: <T extends object>(op: (s: AppState) => Result<T>) => Result<T>
  loadSample: () => AppState
  clearAll: () => void
}

const StoreContext = createContext<Store | null>(null)

const initial = loadAppState()
let corruptionReported = false

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial.state)
  const ref = useRef(state)
  const toast = useToast()

  useEffect(() => {
    if (initial.corrupted && !corruptionReported) {
      corruptionReported = true
      toast.show('Dữ liệu lưu trên máy bị hỏng — đã khởi tạo lại trạng thái rỗng', 'error')
    }
  }, [toast])

  const commit = useCallback((next: AppState) => {
    ref.current = next
    saveAppState(next)
    dispatch({ type: 'set', state: next })
  }, [])

  const run = useCallback(
    <T extends object>(op: (s: AppState) => Result<T>): Result<T> => {
      const r = op(ref.current)
      if (r.ok) commit(r.state)
      return r
    },
    [commit],
  )

  const loadSample = useCallback(() => {
    const s = buildSampleState()
    commit(s)
    return s
  }, [commit])

  const clearAll = useCallback(() => commit(emptyState()), [commit])

  const value = useMemo<Store>(
    () => ({ state, hasData: state.members.length > 0, run, loadSample, clearAll }),
    [state, run, loadSample, clearAll],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore phải nằm trong AppStoreProvider')
  return s
}
