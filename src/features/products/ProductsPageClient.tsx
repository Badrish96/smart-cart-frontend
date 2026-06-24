'use client'

import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { fetchProductsThunk, selectProducts, selectProductsLoading } from '@/src/store/slices/productSlice'
import ProductCard from './ProductCard'
import { PRODUCT_CATEGORIES } from '@/src/types/product'

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

export default function ProductsPageClient({ dict, lang }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectProducts)
  const isLoading = useAppSelector(selectProductsLoading)

  // Tab 0 = "All", tabs 1..n = PRODUCT_CATEGORIES
  const tabs = [dict.filter_all, ...PRODUCT_CATEGORIES]
  const activeCategory = activeIdx === 0 ? undefined : PRODUCT_CATEGORIES[activeIdx - 1]

  useEffect(() => {
    dispatch(fetchProductsThunk({ category: activeCategory }))
  }, [activeCategory, dispatch])

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
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                addToCartLabel={dict.add_to_cart}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
