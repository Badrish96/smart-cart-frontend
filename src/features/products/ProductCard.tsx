'use client'

import Link from 'next/link'
import { Headphones } from 'lucide-react'
import type { Product } from '@/src/types/product'
import { getImageUrl } from '@/src/types/product'
import { ROUTES } from '@/src/routes'
import WishlistButton from '@/src/components/ui/WishlistButton/WishlistButton'
import AddToCartButton from '@/src/components/ui/AddToCartButton/AddToCartButton'

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
          <div className="flex items-center gap-2">
            <WishlistButton productId={product._id} lang={lang} />
            <AddToCartButton productId={product._id} lang={lang} label={addToCartLabel} variant="icon" />
          </div>
        </div>
      </div>
    </Link>
  )
}
