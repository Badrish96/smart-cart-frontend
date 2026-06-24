import { notFound } from 'next/navigation'
import { hasLocale } from '../dictionaries'
import '../../../src/styles/main.scss'

interface Props {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function AuthLayout({ children, params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <main className="flex-1">{children}</main>
}
