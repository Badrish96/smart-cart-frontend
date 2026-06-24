import { notFound } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import AdminLayout from '@/src/features/admin/AdminLayout'

interface Props {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function ProtectedAdminLayout({ children, params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <AdminLayout lang={lang}>{children}</AdminLayout>
}
