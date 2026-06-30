'use client'

import { useEffect, useMemo, useState } from 'react'
import { Tag, SlidersHorizontal, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { fetchProductsThunk, selectProducts, selectProductsLoading } from '@/src/store/slices/productSlice'
import ProductCard from './ProductCard'
import { PRODUCT_CATEGORIES, SORT_OPTIONS } from '@/src/types/product'
import type { SortOption } from '@/src/types/product'
import { useVirtualGrid } from '@/src/hooks/useVirtualGrid'
import { useDebounce } from '@/src/hooks/useDebounce'
import Input from '@/src/components/ui/Input'
import Dropdown from '@/src/components/ui/Dropdown/Dropdown'

// Estimated height of one product card row (card ~320px + 24px gap)
const ROW_HEIGHT = 344

interface ProductsDict {
  label: string
  heading: string
  description: string
  exclusive_offers: string
  exclusive_offers_desc: string
  new_arrivals: string
  new_arrivals_desc: string
  catalog_size: string
  catalog_size_desc: string
  filter_all: string
  no_products: string
  no_products_sub: string
  loading: string
  add_to_cart: string
  filters: string
  clear_filters: string
  brand: string
  brand_placeholder: string
  min_price: string
  max_price: string
  min_rating: string
  min_discount: string
  in_stock: string
  in_stock_only: string
  out_of_stock_only: string
  any: string
  search: string
  search_placeholder: string
  sort: string
  sort_newest: string
  sort_oldest: string
  sort_price_low: string
  sort_price_high: string
  sort_rating: string
  sort_discount: string
  sort_name_az: string
  sort_name_za: string
}

interface Props {
  dict: ProductsDict
  lang: string
}

const STATS = (dict: ProductsDict) => [
  { value: dict.exclusive_offers,  desc: dict.exclusive_offers_desc },
  { value: dict.new_arrivals,      desc: dict.new_arrivals_desc },
  { value: dict.catalog_size,      desc: dict.catalog_size_desc },
]

const RATING_OPTIONS = ['4', '3', '2', '1']

export default function ProductsPageClient({ dict, lang }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')
  const [minDiscount, setMinDiscount] = useState('')
  const [inStock, setInStock] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')

  const debouncedSearch = useDebounce(search, 400)
  const debouncedBrand = useDebounce(brand, 400)
  const debouncedMinPrice = useDebounce(minPrice, 400)
  const debouncedMaxPrice = useDebounce(maxPrice, 400)
  const debouncedMinDiscount = useDebounce(minDiscount, 400)

  const dispatch = useAppDispatch()
  const products = useAppSelector(selectProducts)
  const isLoading = useAppSelector(selectProductsLoading)

  const { containerRef, visibleItems, paddingTop, paddingBottom } = useVirtualGrid({
    items: products,
    rowHeight: ROW_HEIGHT,
  })

  // Tab 0 = "All", tabs 1..n = PRODUCT_CATEGORIES
  const tabs = [dict.filter_all, ...PRODUCT_CATEGORIES]
  const activeCategory = activeIdx === 0 ? undefined : PRODUCT_CATEGORIES[activeIdx - 1]

  const sortOptions = useMemo(() => {
    const labels: Record<SortOption, string> = {
      newest: dict.sort_newest,
      oldest: dict.sort_oldest,
      priceLowToHigh: dict.sort_price_low,
      priceHighToLow: dict.sort_price_high,
      ratingHighToLow: dict.sort_rating,
      discountHighToLow: dict.sort_discount,
      nameAZ: dict.sort_name_az,
      nameZA: dict.sort_name_za,
    }
    return SORT_OPTIONS.map((value) => ({ value, label: labels[value] }))
  }, [dict])

  const ratingDropdownOptions = useMemo(
    () => [
      { value: '', label: dict.any },
      ...RATING_OPTIONS.map((r) => ({ value: r, label: `${r}+` })),
    ],
    [dict]
  )

  const stockDropdownOptions = useMemo(
    () => [
      { value: '', label: dict.any },
      { value: 'true', label: dict.in_stock_only },
      { value: 'false', label: dict.out_of_stock_only },
    ],
    [dict]
  )

  const hasActiveFilters =
    !!debouncedSearch || !!debouncedBrand || !!debouncedMinPrice || !!debouncedMaxPrice ||
    !!minRating || !!debouncedMinDiscount || !!inStock || sort !== 'newest'

  const clearFilters = () => {
    setSearch(''); setBrand(''); setMinPrice(''); setMaxPrice('')
    setMinRating(''); setMinDiscount(''); setInStock(''); setSort('newest')
  }

  useEffect(() => {
    dispatch(fetchProductsThunk({
      category: activeCategory,
      search: debouncedSearch || undefined,
      brand: debouncedBrand || undefined,
      minPrice: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
      maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      minDiscount: debouncedMinDiscount ? Number(debouncedMinDiscount) : undefined,
      inStock: inStock === '' ? undefined : inStock === 'true',
      sort,
    }))
  }, [
    activeCategory, debouncedSearch, debouncedBrand, debouncedMinPrice, debouncedMaxPrice,
    minRating, debouncedMinDiscount, inStock, sort, dispatch,
  ])

  return (
    <div className="products-page">
      {/* Hero */}
      <div className="products-hero">
        <div className="products-hero-inner">
          <div className="products-hero-grid">
            {/* Left: heading + description */}
            <div>
              <p className="products-label">{dict.label}</p>
              <h1 className="text-h1 text-primary mb-4">{dict.heading}</h1>
              <p className="text-body text-secondary" style={{ maxWidth: 400 }}>
                {dict.description}
              </p>
            </div>

            {/* Right: stat cards */}
            <div className="products-stats">
              {STATS(dict).map((s) => (
                <div key={s.value} className="products-stat-card">
                  <Tag size={18} className="text-accent mb-2" />
                  <p className="products-stat-value">{s.value}</p>
                  <p className="products-stat-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products body */}
      <div className="products-body">
        {/* Filter tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="products-filter-tabs">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn${activeIdx === i ? ' tab-btn--active' : ''}`}
                onClick={() => setActiveIdx(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`btn btn-outline btn-sm${showFilters ? ' btn-outline--active' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={14} />
            {dict.filters}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="products-filter-panel">
            <div className="products-filter-grid">
              <Input
                label={dict.search}
                placeholder={dict.search_placeholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Input
                label={dict.brand}
                placeholder={dict.brand_placeholder}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
              <Input
                label={dict.min_price}
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                label={dict.max_price}
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <Dropdown
                label={dict.min_rating}
                value={minRating}
                onChange={setMinRating}
                options={ratingDropdownOptions}
              />
              <Input
                label={dict.min_discount}
                type="number"
                min={0}
                max={100}
                value={minDiscount}
                onChange={(e) => setMinDiscount(e.target.value)}
              />
              <Dropdown
                label={dict.in_stock}
                value={inStock}
                onChange={setInStock}
                options={stockDropdownOptions}
              />
              <Dropdown
                label={dict.sort}
                value={sort}
                onChange={(v) => setSort(v as SortOption)}
                options={sortOptions}
              />
            </div>

            {hasActiveFilters && (
              <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={clearFilters}>
                <X size={14} />
                {dict.clear_filters}
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="products-empty">
            <p className="text-body text-secondary">{dict.loading}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <p className="text-h4 text-primary">{dict.no_products}</p>
            <p className="text-body-sm text-secondary">{dict.no_products_sub}</p>
          </div>
        ) : (
          <div ref={containerRef}>
            {paddingTop > 0 && <div style={{ height: paddingTop }} />}
            <div className="product-grid">
              {visibleItems.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  addToCartLabel={dict.add_to_cart}
                  lang={lang}
                />
              ))}
            </div>
            {paddingBottom > 0 && <div style={{ height: paddingBottom }} />}
          </div>
        )}
      </div>
    </div>
  )
}
