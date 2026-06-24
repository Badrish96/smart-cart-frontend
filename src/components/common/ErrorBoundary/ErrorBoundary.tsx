'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { store } from '@/src/store/store'
import { addToast } from '@/src/store/slices/toastSlice'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Show the error in the global toaster
    store.dispatch(
      addToast({
        type: 'error',
        title: 'Something went wrong',
        message: error.message,
        duration: 8000,
      })
    )
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-6 text-center">
          <span className="toast-icon toast-icon--error" style={{ width: 56, height: 56 }}>
            <AlertTriangle size={56} strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-h3 text-primary">Something went wrong</h2>
            {this.state.error?.message && (
              <p className="text-body-sm text-secondary" style={{ maxWidth: 420 }}>
                {this.state.error.message}
              </p>
            )}
          </div>
          <button className="btn btn-primary" onClick={this.reset}>
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
