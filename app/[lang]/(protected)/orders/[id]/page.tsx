import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../../dictionaries'
import OrderDetailClient from '../../../../../src/features/orders/OrderDetailClient'

interface Props { params: Promise<{ lang: string; id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { lang, id } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  return <OrderDetailClient id={id} lang={lang} dict={dict.orders} />
}
