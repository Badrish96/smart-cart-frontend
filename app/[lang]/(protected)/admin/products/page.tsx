import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { hasLocale } from '../../../dictionaries'

const AdminProductsClient = dynamic(
  () => import('@/src/features/admin/AdminProductsClient'),
  {
    loading: () => (
      <div className="max-w-5xl mx-auto px-6 mt-24 animate-pulse flex flex-col gap-4">
        <div className="h-8 rounded bg-secondary w-1/4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-secondary h-20" />
        ))}
      </div>
    ),
  }
)

interface Props {
  params: Promise<{ lang: string }>
}

export default async function AdminProductsPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <AdminProductsClient lang={lang} />
}
