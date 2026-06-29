'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft, Headphones, Check, Tag, Weight, Ruler, ZoomIn, X } from 'lucide-react'
import Link from 'next/link'
import { productService } from '@/src/services/product.service'
import { getImageUrl } from '@/src/types/product'
import type { Product } from '@/src/types/product'
import { ROUTES } from '@/src/routes'
import ReviewsSection from './ReviewsSection'
import WishlistButton from '@/src/components/ui/WishlistButton/WishlistButton'
import AddToCartButton from '@/src/components/ui/AddToCartButton/AddToCartButton'

interface ReviewsDict {
  heading: string
  no_reviews: string
  add_heading: string
  rating_label: string
  comment_label: string
  comment_placeholder: string
  submit: string
  loading: string
  already_reviewed: string
  login_required: string
  error_rating: string
  error_comment_min: string
  error_comment_max: string
}

interface Props {
  id: string
  lang: string
  backLabel: string
  addToCartLabel: string
  stockLabel: string
  inStockLabel: string
  outOfStockLabel: string
  categoryLabel: string
  reviewsDict: ReviewsDict
}

export default function ProductDetailClient({
  id, lang, backLabel, addToCartLabel, stockLabel, inStockLabel, outOfStockLabel, categoryLabel, reviewsDict,
}: Props) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    productService.getProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="product-detail-skeleton-img" />
        <div className="product-detail-skeleton-body" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="products-empty" style={{ paddingTop: 120 }}>
        <Headphones size={56} className="text-muted" />
        <p className="text-h4 text-primary">Product not found</p>
        <Link href={ROUTES.products(lang)} className="btn btn-outline mt-4 link-plain">
          {backLabel}
        </Link>
      </div>
    )
  }

  const images = product.images.map(getImageUrl)
  const inStock = product.stock > 0
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : null

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIdx((i) => (i + 1) % images.length)

  return (
    <div className="product-detail-page">
      {/* Back link */}
      <div className="product-detail-back">
        <Link href={ROUTES.products(lang)} className="flex items-center gap-2 text-secondary nav-link fs-sm link-plain">
          <ArrowLeft size={16} />
          {backLabel}
        </Link>
      </div>

      <div className="product-detail-grid">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="product-gallery-main product-img-canvas">
            {images.length > 0 ? (
              <button
                type="button"
                className="gallery-zoom-trigger"
                onClick={() => setZoomed(true)}
                aria-label="Zoom image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[activeIdx]} alt={`${product.name} — image ${activeIdx + 1}`} className="product-gallery-main-img" />
                <span className="gallery-zoom-icon"><ZoomIn size={18} /></span>
              </button>
            ) : (
              <Headphones size={80} className="text-muted" />
            )}
            {images.length > 1 && (
              <>
                <button type="button" className="gallery-nav gallery-nav--prev" onClick={prev} aria-label="Previous image"><ChevronLeft size={20} /></button>
                <button type="button" className="gallery-nav gallery-nav--next" onClick={next} aria-label="Next image"><ChevronRight size={20} /></button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="product-gallery-thumbs">
              {images.map((url, i) => (
                <button key={url} type="button" onClick={() => setActiveIdx(i)} className={`gallery-thumb product-img-canvas${i === activeIdx ? ' gallery-thumb--active' : ''}`} aria-label={`View image ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${product.name} thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="product-detail-info">
          {/* Category + Brand row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="product-card-category">{categoryLabel}: {product.category}</span>
            {product.brand && <span className="pd-badge pd-badge--brand">{product.brand}</span>}
          </div>

          <h1 className="text-h2 text-primary mt-2 mb-1">{product.name}</h1>

          {product.sku && <p className="fs-xs text-muted mb-3">SKU: {product.sku}</p>}

          {/* Price row */}
          <div className="flex items-baseline gap-3 mb-2">
            {discountedPrice ? (
              <>
                <span className="product-detail-price">₹{discountedPrice.toFixed(2)}</span>
                <span className="pd-price-original">₹{product.price.toFixed(2)}</span>
                <span className="pd-badge pd-badge--discount">{product.discount}% off</span>
              </>
            ) : (
              <span className="product-detail-price">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Stock */}
          <p className={`product-detail-stock${inStock ? ' product-detail-stock--in' : ' product-detail-stock--out'}`}>
            {stockLabel}: {inStock ? `${inStockLabel} (${product.stock})` : outOfStockLabel}
          </p>

          {/* Description */}
          <p className="text-body text-secondary mt-4 mb-5 pd-description">{product.description}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <Tag size={14} className="text-muted flex-shrink-0" />
              {product.tags.map((tag) => (
                <span key={tag} className="pd-tag">{tag}</span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Quantity selector */}
            <div className="qty-control qty-control--lg">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >−</button>
              <span>{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={qty >= (product.stock ?? 99)}
                onClick={() => setQty((q) => Math.min(product.stock ?? 99, q + 1))}
              >+</button>
            </div>
            <AddToCartButton
              productId={product._id}
              lang={lang}
              label={addToCartLabel}
              variant="full"
              disabled={!inStock}
              quantity={qty}
              className="btn-lg"
            />
            <WishlistButton productId={product._id} lang={lang} size={20} className="w-12 h-12" />
          </div>

          {/* Key Features */}
          {product.keyFeatures && product.keyFeatures.length > 0 && (
            <div className="pd-section">
              <h3 className="pd-section-title">Key Features</h3>
              <ul className="flex flex-col gap-2">
                {product.keyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 fs-sm text-secondary">
                    <Check size={14} className="text-accent flex-shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Physical */}
          {(product.weight || product.dimensions) && (
            <div className="pd-section">
              <h3 className="pd-section-title">Physical</h3>
              <div className="flex gap-4 flex-wrap">
                {product.weight && (
                  <div className="pd-physical-item">
                    <Weight size={14} className="text-muted" />
                    <span className="fs-sm text-secondary">{product.weight.value} {product.weight.unit}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="pd-physical-item">
                    <Ruler size={14} className="text-muted" />
                    <span className="fs-sm text-secondary">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specifications — full-width below the grid */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="pd-specs-section">
          <h2 className="text-h3 text-primary mb-6">Specifications</h2>
          <div className="pd-specs-table">
            {product.specifications.map((spec, i) => (
              <div key={i} className={`pd-spec-row${i % 2 === 0 ? ' pd-spec-row--alt' : ''}`}>
                <span className="pd-spec-key">{spec.key}</span>
                <span className="pd-spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ReviewsSection productId={id} dict={reviewsDict} />

      {/* Image zoom lightbox */}
      {zoomed && images.length > 0 && (
        <div
          className="gallery-lightbox"
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom"
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
          >
            <X size={22} />
          </button>
          {images.length > 1 && (
            <button
              type="button"
              className="gallery-lightbox-nav gallery-lightbox-nav--prev"
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIdx]}
            alt={`${product.name} — image ${activeIdx + 1}`}
            className="gallery-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <button
              type="button"
              className="gallery-lightbox-nav gallery-lightbox-nav--next"
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          )}
          {images.length > 1 && (
            <div className="gallery-lightbox-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`gallery-lightbox-dot${i === activeIdx ? ' gallery-lightbox-dot--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(i) }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
