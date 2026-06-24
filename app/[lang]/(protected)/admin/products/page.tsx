import { notFound } from 'next/navigation'
import { hasLocale } from '../../../dictionaries'
import AdminProductsClient from '@/src/features/admin/AdminProductsClient'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function AdminProductsPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <AdminProductsClient lang={lang} />
}
