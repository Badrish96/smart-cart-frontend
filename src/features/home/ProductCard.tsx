'use client'

import React from 'react'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import Card from '../../components/ui/Card'

interface ProductCardProps {
  name: string
  price: number
  originalPrice: number
  image: string
  addToCartLabel: string
}

export default function ProductCard({ name, price, originalPrice, image, addToCartLabel }: ProductCardProps) {
  return (
    <Card className="flex flex-col items-center p-4 gap-2.5 cursor-pointer relative overflow-visible z-[1]">
      <div className="product-image-wrap">
        <Image src={image} alt={name} fill className="object-contain drop-shadow-2xl" sizes="160px" />
      </div>
      <div className="text-center w-full">
        <h3 className="text-sm font-semibold text-primary mb-1">{name}</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="price-current">₹{price}</span>
          <span className="price-original">₹{originalPrice}</span>
        </div>
      </div>
      <button type="button" className="product-cart-btn" aria-label={addToCartLabel} title={addToCartLabel}>
        <ShoppingCart size={14} />
      </button>
    </Card>
  )
}
