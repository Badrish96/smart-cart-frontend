import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, getDictionary } from './dictionaries'
import Navbar from '../../src/components/common/Navbar'
import '../../src/styles/main.scss'

export const metadata: Metadata = {
  title: 'SmartCart — Dive in Beats',
  description: 'Premium headphones and audio gear at SmartCart.',
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'hi' }]
}

interface Props {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <>
      <Navbar dict={dict} lang={lang} />
      <main className="flex-1">{children}</main>
    </>
  )
}
