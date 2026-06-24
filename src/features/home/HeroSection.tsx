'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ChevronDown, Headphones } from 'lucide-react'
import Button from '../../components/ui/Button'
import { getImageUrl } from '@/src/types/product'
import type { Product } from '@/src/types/product'
import { ROUTES } from '@/src/routes'

interface HeroDict {
  title_line1: string
  title_accent: string
  title_line2: string
  description: string
  shop_now: string
  add_to_cart: string
}

interface ProductsDict {
  wireless_headphones: string
  add_to_cart: string
  view_all: string
}

interface Props {
  heroDict: HeroDict
  productsDict: ProductsDict
  products?: Product[]
  isLoading?: boolean
  lang?: string
}

export default function HeroSection({
  heroDict,
  productsDict,
  products = [],
  isLoading = false,
  lang = 'en',
}: Props) {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-model-wrap">
          <Image
            src="https://res.cloudinary.com/dngdl83of/image/upload/v1782309546/Hero_Model_1_tgewli.png"
            alt="Hero Model with headphones"
            fill
            className="object-cover object-center"
            priority
            sizes="65vw"
          />
        </div>
        <div className="hero-overlay-h" />
        <div className="hero-overlay-v" />

        <div className="max-w-[1280px] mx-auto px-8 max-sm:px-8 hero-content w-full">
          <div className="hero-text-block">
            <h1 className="hero-heading">
              <span className="hero-title-line">{heroDict.title_line1}</span>
              <span className="hero-title-row">
                <span className="hero-title-accent">{heroDict.title_accent}</span>
                <span className="hero-title-line"> {heroDict.title_line2}</span>
              </span>
            </h1>
            <p className="hero-description">{heroDict.description}</p>
            <div className="hero-cta flex gap-2 items-center max-sm:flex-col max-sm:gap-3">
              <Link href={ROUTES.products(lang)} className="link-plain">
                <Button variant="primary" size="lg">{heroDict.shop_now}</Button>
              </Link>
              <Button variant="outline" size="lg" icon={<ShoppingCart size={16} />}>
                {heroDict.add_to_cart}
              </Button>
            </div>
          </div>

          <button
            type="button"
            className="scroll-indicator"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Scroll to products"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </section>

      {/* ── Product Cards ── */}
      <section id="products" className="bg-primary pb-16 relative z-10">
        <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
          {isLoading ? (
            <div className="hero-products-grid">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="card p-4 flex flex-col gap-3">
                  <div className="product-detail-skeleton-img hero-skeleton-card-img" />
                  <div className="product-detail-skeleton-body hero-skeleton-card-body" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="hero-products-grid">
              {products.map((product) => {
                const rawImg = product.images?.[0]
                const imgUrl = rawImg ? getImageUrl(rawImg) : null
                return (
                  <Link
                    key={product._id}
                    href={ROUTES.productDetail(lang, product._id)}
                    className="card flex flex-col items-center p-4 gap-3 cursor-pointer overflow-visible link-plain"
                  >
                    <div className="product-image-wrap flex items-center justify-center">
                      {imgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="hero-product-thumb"
                        />
                      ) : (
                        <Headphones size={64} className="text-muted" />
                      )}
                    </div>
                    <div className="text-center w-full">
                      <p className="fs-sm fw-medium text-primary mb-1 hero-product-name">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="price-current">₹{product.price.toFixed(2)}</span>
                        <button
                          type="button"
                          className="product-cart-btn"
                          aria-label={productsDict.add_to_cart}
                          onClick={(e) => e.preventDefault()}
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
