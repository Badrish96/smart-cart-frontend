import { notFound } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import ContactPage from '@/src/features/contact/ContactPage'

interface Props {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props) {
  const { lang } = await params
  return { title: lang === 'hi' ? 'संपर्क करें — SmartCart' : 'Contact Us — SmartCart' }
}

export default async function Page({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <ContactPage lang={lang} />
}
