import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getDictionary, hasLocale } from '../../dictionaries'

const ProductsPageClient = dynamic(
  () => import('@/src/features/products/ProductsPageClient'),
  {
    loading: () => (
      <div className="max-w-7xl mx-auto px-6 mt-24">
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-10 rounded-xl bg-secondary w-1/3" />
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-secondary h-72" />
            ))}
          </div>
        </div>
      </div>
    ),
  }
)

interface Props {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang as 'en' | 'hi')
  return {
    title: `${dict.products_page.heading} — SmartCart`,
    description: dict.products_page.description,
  }
}

export default async function ProductsPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return <ProductsPageClient dict={dict.products_page} lang={lang} />
}
