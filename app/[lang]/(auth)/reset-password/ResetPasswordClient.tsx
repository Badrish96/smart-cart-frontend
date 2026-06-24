'use client'

import { useSearchParams } from 'next/navigation'
import ResetPasswordForm from '@/src/features/auth/ResetPasswordForm'

interface Props {
  dict: {
    title: string
    subtitle: string
    password_label: string
    password_placeholder: string
    confirm_password_label: string
    confirm_password_placeholder: string
    submit: string
    loading: string
    success_title: string
    success_message: string
    go_to_login: string
    invalid_token: string
    error_password_required: string
    error_password_min: string
    error_password_max: string
    error_password_no_spaces: string
    error_password_uppercase: string
    error_password_lowercase: string
    error_password_digit: string
    error_password_special: string
    error_confirm_required: string
    error_passwords_mismatch: string
  }
  strengthLabels: {
    label: string
    weak: string
    fair: string
    strong: string
    very_strong: string
  }
  lang: string
}

export default function ResetPasswordClient({ dict, strengthLabels, lang }: Props) {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  return <ResetPasswordForm dict={dict} strengthLabels={strengthLabels} lang={lang} token={token} />
}
