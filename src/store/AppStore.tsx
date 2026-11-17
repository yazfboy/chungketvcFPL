import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AppState, Member, Result } from '../lib/types'
import { emptyState, findMember } from '../lib/rules'
import { buildSampleState } from '../lib/seed'
import { STATE_KEY, loadAppState, loadCurrentMemberId, saveAppState, saveCurrentMemberId } from './storage'
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
  /** Thành viên đang xem ở vai Thành viên — undefined nếu chưa chọn hoặc mã không còn tồn tại. */
  currentMember: Member | undefined
  setCurrentMemberId: (id: string | null) => void
}

const StoreContext = createContext<Store | null>(null)

const initial = loadAppState()
let corruptionReported = false

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial.state)
  const [currentId, setCurrentId] = useState<string | null>(loadCurrentMemberId)
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

  const setCurrentMemberId = useCallback((id: string | null) => {
    setCurrentId(id)
    saveCurrentMemberId(id)
  }, [])

  // Đồng bộ 2 đầu thời gian thực: tab khác (VD: Quầy) ghi localStorage → tab này nạp lại state, không reload.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage || e.key !== STATE_KEY) return
      if (e.newValue == null) {
        ref.current = emptyState()
        dispatch({ type: 'set', state: ref.current })
        return
      }
      const loaded = loadAppState()
      if (loaded.corrupted) return
      ref.current = loaded.state
      dispatch({ type: 'set', state: loaded.state })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const currentMember = currentId ? findMember(state, currentId) : undefined

  // Mã đang xem không còn trong dữ liệu (nạp lại mẫu / xóa dữ liệu) → tự xóa, về màn chọn thẻ.
  useEffect(() => {
    if (currentId && !currentMember) setCurrentMemberId(null)
  }, [currentId, currentMember, setCurrentMemberId])

  const value = useMemo<Store>(
    () => ({
      state,
      hasData: state.members.length > 0,
      run,
      loadSample,
      clearAll,
      currentMember,
      setCurrentMemberId,
    }),
    [state, run, loadSample, clearAll, currentMember, setCurrentMemberId],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore phải nằm trong AppStoreProvider')
  return s
}
