import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
  duration: number
}

interface ToastState {
  toasts: ToastItem[]
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
}

const MAX_TOASTS = 5
let _seq = 0

const toastSlice = createSlice({
  name: 'toast',
  initialState: { toasts: [] } as ToastState,
  reducers: {
    addToast: {
      reducer(state, action: PayloadAction<ToastItem>) {
        if (state.toasts.length >= MAX_TOASTS) state.toasts.shift()
        state.toasts.push(action.payload)
      },
      prepare(payload: Omit<ToastItem, 'id' | 'duration'> & { duration?: number }) {
        return {
          payload: {
            ...payload,
            id: `t-${++_seq}-${Date.now()}`,
            duration: payload.duration ?? DEFAULT_DURATIONS[payload.type],
          },
        }
      },
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    clearToasts(state) {
      state.toasts = []
    },
  },
})

export const { addToast, removeToast, clearToasts } = toastSlice.actions
export default toastSlice.reducer

export const selectToasts = (state: RootState) => state.toast.toasts
