'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, X, Headphones } from 'lucide-react'
import { useDebounce } from '@/src/hooks/useDebounce'
import { productService } from '@/src/services/product.service'
import { getImageUrl } from '@/src/types/product'
import type { Product } from '@/src/types/product'
import { ROUTES } from '@/src/routes'

interface Dict {
  placeholder: string
  no_results: string
  no_results_hint: string
  loading: string
  close: string
  results_for: string
}

interface Props {
  dict: Dict
  lang: string
  onClose: () => void
}

export default function SearchOverlay({ dict, lang, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [lastQuery, setLastQuery] = useState('')

  const debouncedQuery = useDebounce(query.trim(), 350)

  const isLoading   = debouncedQuery !== '' && debouncedQuery !== lastQuery
  const showResults = !isLoading && debouncedQuery !== '' && debouncedQuery === lastQuery
  const hasResults  = showResults && results.length > 0
  const noResults   = showResults && results.length === 0

  // Auto-focus
  useEffect(() => { inputRef.current?.focus() }, [])

  // Close on Escape or outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onMouse = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouse)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouse)
    }
  }, [onClose])

  // Search — all setState calls are inside .then() (no sync setState in effect body)
  useEffect(() => {
    if (!debouncedQuery) return
    let cancelled = false
    productService.searchProducts(debouncedQuery)
      .then(({ products }) => {
        if (cancelled) return
        // Filter client-side in case the backend ignores the search param
        // and returns a page of unfiltered results.
        const q = debouncedQuery.toLowerCase()
        const filtered = products.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q) ||
          (p.brand ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
        )
        setResults(filtered)
        setLastQuery(debouncedQuery)
      })
      .catch(console.error)
    return () => { cancelled = true }
  }, [debouncedQuery])

  return (
    <div ref={wrapperRef} className="search-dropdown-wrap">
      {/* Input row */}
      <div className="search-dropdown-input-row">
        <Search size={18} className="search-dropdown-icon text-muted" />
        <input
          ref={inputRef}
          type="search"
          className="search-dropdown-input"
          placeholder={dict.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            className="search-dropdown-clear navbar-icon-btn"
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            aria-label="Clear"
          >
            <X size={15} />
          </button>
        )}
        <button
          type="button"
          className="search-dropdown-close navbar-icon-btn"
          onClick={onClose}
          aria-label={dict.close}
        >
          <X size={18} />
        </button>
      </div>

      {/* Results panel — only shows when there's a query */}
      {debouncedQuery && (
        <div className="search-dropdown-results">
          {/* Loading skeletons */}
          {isLoading && (
            <div className="flex flex-col gap-2 p-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex-shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3 rounded bg-secondary w-3/4" />
                    <div className="h-3 rounded bg-secondary w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
              <Headphones size={36} className="text-muted" />
              <p className="fs-sm fw-semibold text-primary">
                {dict.no_results} &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="fs-xs text-muted">{dict.no_results_hint}</p>
            </div>
          )}

          {/* Results list */}
          {hasResults && (
            <>
              <p className="fs-xs text-muted px-4 pt-3 pb-1">
                {dict.results_for} &ldquo;{debouncedQuery}&rdquo; — {results.length} found
              </p>
              <ul className="search-result-list">
                {results.map((product) => {
                  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0]) : null
                  const discountedPrice = product.discount
                    ? product.price * (1 - product.discount / 100)
                    : null

                  return (
                    <li key={product._id}>
                      <Link
                        href={ROUTES.productDetail(lang, product._id)}
                        className="search-result-item link-plain"
                        onClick={onClose}
                      >
                        <div className="search-result-thumb">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imageUrl} alt={product.name} />
                          ) : (
                            <Headphones size={22} className="text-muted" />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <p className="fs-sm fw-medium text-primary truncate">{product.name}</p>
                          <p className="fs-xs text-muted">{product.category}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          {discountedPrice ? (
                            <>
                              <span className="fs-sm fw-bold text-accent">₹{discountedPrice.toFixed(2)}</span>
                              <span className="fs-xs text-muted line-through">₹{product.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="fs-sm fw-bold text-accent">₹{product.price.toFixed(2)}</span>
                          )}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
