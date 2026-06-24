import { notFound } from 'next/navigation'
import { hasLocale, getDictionary } from '../../../dictionaries'
import ProductDetailClient from '@/src/features/products/ProductDetailClient'

interface Props {
  params: Promise<{ lang: string; id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { lang, id } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const p = dict.products_page

  return (
    <ProductDetailClient
      id={id}
      lang={lang}
      backLabel="Back to products"
      addToCartLabel={p.add_to_cart}
      stockLabel="Stock"
      inStockLabel="In stock"
      outOfStockLabel="Out of stock"
      categoryLabel="Category"
    />
  )
}
