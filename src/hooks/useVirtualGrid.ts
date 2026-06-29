'use client'

import { useEffect, useRef, useState } from 'react'
import { useVirtualList } from './useVirtualList'

interface VirtualGridOptions<T> {
  items: T[]
  /** Estimated height of a single card row (card height + gap) */
  rowHeight: number
  /** Extra rows to render above/below viewport */
  overscan?: number
}

export interface VirtualGridResult<T> {
  containerRef: React.RefObject<HTMLDivElement | null>
  visibleItems: T[]
  paddingTop: number
  paddingBottom: number
  columns: number
}

/** Derive responsive column count from container width, matching .product-grid breakpoints */
function getColumns(width: number): number {
  if (width < 480) return 1
  if (width < 768) return 2
  if (width < 1200) return 3
  return 4
}

export function useVirtualGrid<T>({
  items,
  rowHeight,
  overscan = 2,
}: VirtualGridOptions<T>): VirtualGridResult<T> {
  const [columns, setColumns] = useState(4)

  // Single ref shared by ResizeObserver and useVirtualList
  const containerRef = useRef<HTMLDivElement>(null)

  // Observe container width → derive column count
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setColumns(getColumns(entries[0].contentRect.width))
    })
    ro.observe(el)
    setColumns(getColumns(el.clientWidth))
    return () => ro.disconnect()
  }, [])

  const rowCount = Math.ceil(items.length / columns)

  // Pass the same containerRef into useVirtualList — no merging required
  const { virtualItems, paddingTop, paddingBottom } = useVirtualList(
    { itemCount: rowCount, estimatedItemHeight: rowHeight, overscan },
    containerRef
  )

  // Flatten visible row indices back to items
  const visibleItems = virtualItems.flatMap(({ index }) =>
    items.slice(index * columns, (index + 1) * columns)
  )

  return { containerRef, visibleItems, paddingTop, paddingBottom, columns }
}
