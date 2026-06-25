'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { fetchProductsThunk, selectProducts, selectProductsLoading } from '@/src/store/slices/productSlice'
import { productService } from '@/src/services/product.service'
import HeroSection from './HeroSection'
import CollectionSection from './CollectionSection'
import type { Product } from '@/src/types/product'

// IDs of the three curated hero products.
// They are fetched individually so their live price / discount / stock is
// always accurate, independent of pagination in the main products listing.
const HERO_IDS = [
  '6a3c098d6bb24349ac7d46ed',
  '6a3bfe6be6cb9987a0081033',
  '6a3be9df1416c8f42dfa9827',
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

  // Hero products fetched individually so prices are always from the API
  const [heroProducts, setHeroProducts] = useState<Product[]>([])
  const [heroLoading, setHeroLoading] = useState(true)

  useEffect(() => {
    dispatch(fetchProductsThunk({}))
  }, [dispatch])

  useEffect(() => {
    let cancelled = false
    Promise.all(HERO_IDS.map((id) => productService.getProduct(id)))
      .then((items) => { if (!cancelled) setHeroProducts(items) })
      .catch(console.error)
      .finally(() => { if (!cancelled) setHeroLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <HeroSection
        heroDict={heroDict}
        productsDict={productsDict}
        products={heroProducts}
        isLoading={heroLoading}
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
