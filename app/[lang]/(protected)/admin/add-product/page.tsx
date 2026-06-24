import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../../dictionaries'
import AddProductForm from '@/src/features/admin/AddProductForm'

interface Props {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang as 'en' | 'hi')
  return { title: dict.admin.add_product.page_title }
}

export default async function AdminAddProductPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  return <AddProductForm dict={dict.admin.add_product} lang={lang} />
}
