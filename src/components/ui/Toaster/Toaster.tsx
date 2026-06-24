'use client'

import { useAppSelector } from '@/src/store/hooks'
import { selectToasts } from '@/src/store/slices/toastSlice'
import Toast from './Toast'

export default function Toaster() {
  const toasts = useAppSelector(selectToasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="toast-container"
      aria-label="Notifications"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}
