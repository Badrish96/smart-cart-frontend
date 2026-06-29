import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { hasLocale, getDictionary } from '../../../dictionaries'

const ProductDetailClient = dynamic(
  () => import('@/src/features/products/ProductDetailClient'),
  {
    loading: () => (
      <div className="max-w-5xl mx-auto px-6 mt-24 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="rounded-2xl bg-secondary h-96" />
          <div className="flex flex-col gap-4">
            <div className="h-6 rounded bg-secondary w-1/4" />
            <div className="h-10 rounded bg-secondary w-3/4" />
            <div className="h-4 rounded bg-secondary w-1/3" />
            <div className="h-24 rounded bg-secondary w-full" />
            <div className="h-12 rounded-xl bg-secondary w-1/2" />
          </div>
        </div>
      </div>
    ),
  }
)

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
      reviewsDict={dict.reviews}
    />
  )
}
