'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useAppDispatch } from '@/src/store/hooks'
import { removeToast } from '@/src/store/slices/toastSlice'
import type { ToastItem } from '@/src/store/slices/toastSlice'

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const

export default function Toast({ id, type, title, message, duration }: ToastItem) {
  const dispatch = useAppDispatch()
  const [exiting, setExiting] = useState(false)

  const dismiss = () => {
    setExiting(true)
    setTimeout(() => dispatch(removeToast(id)), 280)
  }

  useEffect(() => {
    const timer = setTimeout(dismiss, duration)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, duration])

  const Icon = ICONS[type]

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`toast toast--${type}${exiting ? ' toast--exiting' : ''}`}
    >
      <span className={`toast-icon toast-icon--${type}`} aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>

      <div className="toast-body">
        <p className="toast-title">{title}</p>
        {message && <p className="toast-msg">{message}</p>}
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      <div
        className={`toast-progress toast-progress--${type}`}
        style={{ animationDuration: `${duration}ms` }}
        aria-hidden="true"
      />
    </div>
  )
}
