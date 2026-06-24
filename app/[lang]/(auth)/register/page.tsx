import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'
import AuthCard from '@/src/features/auth/AuthCard'
import RegisterForm from '@/src/features/auth/RegisterForm'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function RegisterPage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)

  return (
    <AuthCard title={dict.auth.register.title} subtitle={dict.auth.register.subtitle} lang={lang}>
      <RegisterForm
        dict={dict.auth.register}
        strengthLabels={dict.auth.password_strength}
        lang={lang}
      />
    </AuthCard>
  )
}
