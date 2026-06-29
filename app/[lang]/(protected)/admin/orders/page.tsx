import { notFound } from 'next/navigation'
import { hasLocale } from '../../../dictionaries'
import AdminOrdersClient from '../../../../../src/features/admin/AdminOrdersClient'

interface Props { params: Promise<{ lang: string }> }

export default async function AdminOrdersPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return (
    <div className="p-6">
      <h1 className="text-h3 text-primary mb-6">Orders</h1>
      <AdminOrdersClient />
    </div>
  )
}
