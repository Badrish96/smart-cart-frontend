'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, ChevronLeft, ChevronRight, Headphones } from 'lucide-react'
import Button from '../../components/ui/Button'
import { getImageUrl, PRODUCT_CATEGORIES } from '@/src/types/product'
import type { Product } from '@/src/types/product'
import { ROUTES } from '@/src/routes'
import WishlistButton from '@/src/components/ui/WishlistButton/WishlistButton'

interface CollectionDict {
  heading: string
  heading_accent: string
  subheading: string
  tabs: string[]
  shop_now: string
  add_to_cart: string
}

interface Props {
  dict: CollectionDict
  products?: Product[]
  isLoading?: boolean
  lang?: string
}

// Tab 0 = "All", tabs 1..n = PRODUCT_CATEGORIES[0..n-1]
// This way adding a new category to PRODUCT_CATEGORIES automatically adds a tab.
const TABS = ['All', ...PRODUCT_CATEGORIES] as const

export default function CollectionSection({ dict, products = [], isLoading = false, lang = 'en' }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const activeCategory = activeTab === 0 ? null : TABS[activeTab]
  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products

  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <section className="py-20">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <h2 className="section-heading">
            {dict.heading} <span className="text-accent">{dict.heading_accent}</span>
          </h2>
          <p className="section-subheading md:max-w-xs">{dict.subheading}</p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-3 flex-wrap mb-8">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={['tab-btn', activeTab === i ? 'tab-btn--active' : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab(i)}
            >
              {i === 0 ? (dict.tabs[0] ?? tab) : tab}
            </button>
          ))}
        </div>

        {/* Carousel */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="carousel-item card p-4 flex flex-col gap-3">
                <div className="product-detail-skeleton-img hero-skeleton-card-img" />
                <div className="product-detail-skeleton-body hero-skeleton-card-body" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Headphones size={48} className="text-muted" />
            <p className="text-body text-secondary">No products in this category yet.</p>
          </div>
        ) : (
          <div className="carousel-wrap px-6">
            <button
              type="button"
              className="carousel-btn carousel-btn--prev"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="carousel-track" ref={trackRef}>
              {filtered.map((product) => {
                const rawImg = product.images?.[0]
                const imgUrl = rawImg ? getImageUrl(rawImg) : null
                return (
                  <Link
                    key={product._id}
                    href={ROUTES.productDetail(lang, product._id)}
                    className="carousel-item card flex flex-col items-center p-4 gap-3 cursor-pointer group overflow-visible link-plain"
                  >
                    <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full badge-accent text-white">
                      {product.category}
                    </span>
                    <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center rounded-xl product-img-canvas">
                      {imgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="collection-card-img group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Headphones size={48} className="text-muted" />
                      )}
                    </div>
                    <div className="text-center w-full">
                      <p className="fs-xs fw-medium text-primary mb-1 hero-product-name">{product.name}</p>
                      <div className="product-pricing">
                        <span className="price-current fs-sm fw-bold">₹{product.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <WishlistButton productId={product._id} lang={lang} size={14} />
                      <button
                        type="button"
                        className="product-cart-btn"
                        aria-label={dict.add_to_cart}
                        onClick={(e) => e.preventDefault()}
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </Link>
                )
              })}
            </div>

            <button
              type="button"
              className="carousel-btn carousel-btn--next"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link href={ROUTES.products(lang)} className="link-plain">
            <Button variant="outline" size="lg">{dict.shop_now}</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
