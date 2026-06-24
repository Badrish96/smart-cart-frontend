'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Input from '@/src/components/ui/Input'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { forgotPasswordThunk, clearFlags, selectAuth } from '@/src/store/slices/authSlice'
import { ROUTES } from '@/src/routes'
import { createForgotPasswordSchema } from './schemas'
import type { ForgotPasswordFormValues } from './schemas'

interface ForgotPasswordDict {
  title: string
  subtitle: string
  email_label: string
  email_placeholder: string
  submit: string
  loading: string
  success_title: string
  success_message: string
  back_to_login: string
  error_email_required: string
  error_email_invalid: string
  error_email_max: string
}

interface Props {
  dict: ForgotPasswordDict
  lang: string
}

export default function ForgotPasswordForm({ dict, lang }: Props) {
  const dispatch = useAppDispatch()
  const { isLoading, forgotPasswordSuccess } = useAppSelector(selectAuth)

  const schema = useMemo(() => createForgotPasswordSchema(dict), [dict])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  useEffect(() => {
    dispatch(clearFlags())
  }, [dispatch])

  const onSubmit = (values: ForgotPasswordFormValues) => {
    dispatch(forgotPasswordThunk(values))
  }

  if (forgotPasswordSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <span className="toast-icon toast-icon--success">
          <CheckCircle size={52} strokeWidth={1.5} />
        </span>
        <h2 className="text-h4 text-primary">{dict.success_title}</h2>
        <p className="text-body-sm text-secondary">{dict.success_message}</p>
        <Link href={ROUTES.login(lang)} className="btn btn-outline mt-4 link-plain">
          {dict.back_to_login}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Input
        label={dict.email_label}
        type="email"
        placeholder={dict.email_placeholder}
        autoComplete="email"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...register('email')}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary btn-lg btn-block mt-2"
      >
        {isLoading ? dict.loading : dict.submit}
      </button>

      <p className="text-center fs-sm text-secondary mt-2">
        <Link href={ROUTES.login(lang)} className="text-accent fw-semibold link-plain">
          {dict.back_to_login}
        </Link>
      </p>
    </form>
  )
}
