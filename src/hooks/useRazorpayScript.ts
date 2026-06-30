'use client'

import { useEffect, useState } from 'react'

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

/** Loads the Razorpay Checkout widget script once and reports readiness. */
export function useRazorpayScript(): boolean {
  const [loaded, setLoaded] = useState(
    typeof window !== 'undefined' && !!window.Razorpay
  )

  useEffect(() => {
    if (loaded) return
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => setLoaded(true))
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)
  }, [loaded])

  return loaded
}
