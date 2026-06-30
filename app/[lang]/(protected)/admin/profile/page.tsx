import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDictionary, hasLocale } from '../../../dictionaries'
import ProfileClient from '@/src/features/profile/ProfileClient'

interface Props {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const dict = await getDictionary(lang)
  return { title: dict.profile.page_title }
}

export default async function AdminProfilePage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <div className="admin-content">
      <ProfileClient dict={dict.profile} className="max-w-3xl" />
    </div>
  )
}
