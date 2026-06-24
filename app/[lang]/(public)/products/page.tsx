import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'
import ProductsPageClient from '@/src/features/products/ProductsPageClient'

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
