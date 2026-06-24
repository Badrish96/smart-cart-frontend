'use client'

import Link from 'next/link'
import { ShoppingCart, Headphones } from 'lucide-react'
import type { Product } from '@/src/types/product'
import { getImageUrl } from '@/src/types/product'
import { ROUTES } from '@/src/routes'

interface Props {
  product: Product
  addToCartLabel: string
  lang: string
}

export default function ProductCard({ product, addToCartLabel, lang }: Props) {
  const rawImage = product.images?.[0]
  const imageUrl = rawImage ? getImageUrl(rawImage) : null

  return (
    <Link href={ROUTES.productDetail(lang, product._id)} className="product-card-item link-plain">
      <div className="product-card-img-wrap product-img-canvas">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <Headphones size={56} className="product-card-no-img" />
        )}
      </div>

      <div className="product-card-body">
        <p className="product-card-category">{product.category}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>

        <div className="product-card-footer">
          <span className="product-card-price">₹{product.price.toFixed(2)}</span>
          <button
            type="button"
            className="product-card-add-btn"
            aria-label={addToCartLabel}
            title={addToCartLabel}
            onClick={(e) => e.preventDefault()}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  )
}
