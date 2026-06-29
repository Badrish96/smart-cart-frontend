'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface VirtualListOptions {
  itemCount: number
  estimatedItemHeight: number
  /** Extra rows to render above and below the visible area */
  overscan?: number
}

export interface VirtualItem {
  index: number
}

export interface VirtualListResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  virtualItems: VirtualItem[]
  paddingTop: number
  paddingBottom: number
  totalHeight: number
}

/**
 * Window-scroll-aware virtualisation hook.
 * Accepts an optional external containerRef so callers (e.g. useVirtualGrid)
 * can own the single DOM ref and avoid merging.
 */
export function useVirtualList(
  { itemCount, estimatedItemHeight, overscan = 3 }: VirtualListOptions,
  externalRef?: React.RefObject<HTMLDivElement | null>
): VirtualListResult {
  const internalRef = useRef<HTMLDivElement>(null)
  const containerRef = externalRef ?? internalRef

  const [state, setState] = useState({
    scrollY: 0,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    containerTop: 0,
  })

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setState({
      scrollY: window.scrollY,
      windowHeight: window.innerHeight,
      containerTop: el.getBoundingClientRect().top + window.scrollY,
    })
  // containerRef is stable — intentionally omitted from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  const { scrollY, windowHeight, containerTop } = state
  const totalHeight = itemCount * estimatedItemHeight

  const relativeScroll = Math.max(0, scrollY - containerTop)
  const startIdx = Math.max(0, Math.floor(relativeScroll / estimatedItemHeight) - overscan)
  const endIdx = Math.min(
    itemCount - 1,
    Math.ceil((relativeScroll + windowHeight) / estimatedItemHeight) + overscan
  )

  const virtualItems: VirtualItem[] = []
  for (let i = startIdx; i <= endIdx; i++) {
    virtualItems.push({ index: i })
  }

  const paddingTop = startIdx * estimatedItemHeight
  const paddingBottom = Math.max(0, (itemCount - 1 - endIdx) * estimatedItemHeight)

  return { containerRef, virtualItems, paddingTop, paddingBottom, totalHeight }
}
