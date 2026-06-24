'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { fetchProductsThunk, selectProducts, selectProductsLoading } from '@/src/store/slices/productSlice'
import HeroSection from './HeroSection'
import CollectionSection from './CollectionSection'
import type { Product } from '@/src/types/product'

// These 3 specific products are pinned to the hero — their images are curated to look
// good on the dark hero background. New products added via admin appear in the
// collection carousel below but do not replace these hero cards.
const HERO_PRODUCTS: Product[] = [
  {
    _id: '6a3c098d6bb24349ac7d46ed',
    name: 'Airwave Max 5',
    description: 'High-fidelity drivers, adaptive sound control, and spatial audio in a premium design built for comfort and endurance.',
    price: 139.99,
    category: 'Wireless',
    stock: 300,
    images: [{ url: 'https://res.cloudinary.com/dngdl83of/image/upload/v1782319499/smart-cart/products/qed4ibgc6tqc86ft36wk.webp', publicId: 'smart-cart/products/qed4ibgc6tqc86ft36wk', _id: '6a3c098d6bb24349ac7d46ee' }],
  },
  {
    _id: '6a3bfe6be6cb9987a0081033',
    name: 'Noise Airwave Max 6',
    description: 'Hi-Res LDAC Audio, Dual Drivers, Adaptive ANC up to 45 dB, 120 Hours Playtime — built for marathon sessions.',
    price: 299.99,
    category: 'Wireless',
    stock: 1000,
    images: [{ url: 'https://res.cloudinary.com/dngdl83of/image/upload/v1782317577/smart-cart/products/azvpwfdaqtoq0ldo5rny.webp', publicId: 'smart-cart/products/azvpwfdaqtoq0ldo5rny', _id: '6a3c020c6bb24349ac7d4528' }],
  },
  {
    _id: '6a3be9df1416c8f42dfa9827',
    name: 'Skullcandy Crusher Wireless',
    description: 'Adjustable Sensory Bass, 50-hour battery, Rapid Charge, and flat-folding design — the go-anywhere headphone.',
    price: 150,
    category: 'Wireless',
    stock: 350,
    images: [{ url: 'https://res.cloudinary.com/dngdl83of/image/upload/v1782311389/smart-cart/products/mv9gy4adkuvmde6f9a5t.webp', publicId: 'smart-cart/products/mv9gy4adkuvmde6f9a5t', _id: '6a3be9df1416c8f42dfa9828' }],
  },
]

interface Props {
  heroDict: {
    title_line1: string
    title_accent: string
    title_line2: string
    description: string
    shop_now: string
    add_to_cart: string
  }
  productsDict: {
    wireless_headphones: string
    add_to_cart: string
    view_all: string
  }
  collectionDict: {
    heading: string
    heading_accent: string
    subheading: string
    tabs: string[]
    shop_now: string
    add_to_cart: string
  }
  lang: string
}

export default function HomeProductsClient({ heroDict, productsDict, collectionDict, lang }: Props) {
  const dispatch = useAppDispatch()
  const products = useAppSelector(selectProducts)
  const isLoading = useAppSelector(selectProductsLoading)

  useEffect(() => {
    dispatch(fetchProductsThunk({}))
  }, [dispatch])

  return (
    <>
      <HeroSection
        heroDict={heroDict}
        productsDict={productsDict}
        products={HERO_PRODUCTS}
        isLoading={false}
        lang={lang}
      />
      <CollectionSection
        dict={collectionDict}
        products={products}
        isLoading={isLoading}
        lang={lang}
      />
    </>
  )
}
