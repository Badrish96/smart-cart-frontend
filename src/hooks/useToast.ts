'use client'

import { useAppDispatch } from '@/src/store/hooks'
import { addToast } from '@/src/store/slices/toastSlice'
import type { ToastType } from '@/src/store/slices/toastSlice'

interface ToastOptions {
  message?: string
  duration?: number
}

export function useToast() {
  const dispatch = useAppDispatch()

  const show = (type: ToastType, title: string, options?: ToastOptions) =>
    dispatch(addToast({ type, title, ...options }))

  return {
    success: (title: string, options?: ToastOptions) => show('success', title, options),
    error: (title: string, options?: ToastOptions) => show('error', title, options),
    warning: (title: string, options?: ToastOptions) => show('warning', title, options),
    info: (title: string, options?: ToastOptions) => show('info', title, options),
  }
}
