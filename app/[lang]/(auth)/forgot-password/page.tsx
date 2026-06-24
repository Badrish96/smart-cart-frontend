import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'
import AuthCard from '@/src/features/auth/AuthCard'
import ForgotPasswordForm from '@/src/features/auth/ForgotPasswordForm'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <AuthCard
      title={dict.auth.forgot_password.title}
      subtitle={dict.auth.forgot_password.subtitle}
      lang={lang}
    >
      <ForgotPasswordForm dict={dict.auth.forgot_password} lang={lang} />
    </AuthCard>
  )
}
