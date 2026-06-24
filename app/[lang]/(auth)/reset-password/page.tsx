import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'
import AuthCard from '@/src/features/auth/AuthCard'
import ResetPasswordClient from './ResetPasswordClient'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function ResetPasswordPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <AuthCard
      title={dict.auth.reset_password.title}
      subtitle={dict.auth.reset_password.subtitle}
      lang={lang}
    >
      <Suspense fallback={null}>
        <ResetPasswordClient
          dict={dict.auth.reset_password}
          strengthLabels={dict.auth.password_strength}
          lang={lang}
        />
      </Suspense>
    </AuthCard>
  )
}
