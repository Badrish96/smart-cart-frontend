import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'
import AuthCard from '@/src/features/auth/AuthCard'
import LoginForm from '@/src/features/auth/LoginForm'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function LoginPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <AuthCard title={dict.auth.login.title} subtitle={dict.auth.login.subtitle} lang={lang}>
      <LoginForm dict={dict.auth.login} lang={lang} />
    </AuthCard>
  )
}
