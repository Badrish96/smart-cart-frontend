'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/src/components/ui/Input'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { loginThunk, selectAuth } from '@/src/store/slices/authSlice'
import { ROUTES } from '@/src/routes'
import { createLoginSchema } from './schemas'
import type { LoginFormValues } from './schemas'

interface LoginDict {
  title: string
  subtitle: string
  email_label: string
  email_placeholder: string
  password_label: string
  password_placeholder: string
  forgot_password: string
  submit: string
  loading: string
  no_account: string
  register_link: string
  error_email_required: string
  error_email_invalid: string
  error_email_max: string
  error_password_required: string
  error_password_min: string
  error_password_max: string
}

interface Props {
  dict: LoginDict
  lang: string
}

export default function LoginForm({ dict, lang }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()
  const { isLoading, token, user } = useAppSelector(selectAuth) as {
    isLoading: boolean
    token: string | null
    user: { role?: string } | null
  }
  const router = useRouter()

  const schema = useMemo(() => createLoginSchema(dict), [dict])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  useEffect(() => {
    if (token && user) {
      router.replace(
        user.role === 'admin' ? ROUTES.adminDashboard(lang) : ROUTES.products(lang)
      )
    }
  }, [token, user, router, lang])

  const onSubmit = (values: LoginFormValues) => {
    dispatch(loginThunk(values))
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

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="fs-sm fw-medium text-secondary">{dict.password_label}</span>
          <Link href={ROUTES.forgotPassword(lang)} className="fs-sm text-accent link-plain">
            {dict.forgot_password}
          </Link>
        </div>
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={dict.password_placeholder}
          autoComplete="current-password"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="btn-icon text-muted"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary btn-lg btn-block mt-2"
      >
        {isLoading ? dict.loading : dict.submit}
      </button>

      <p className="text-center fs-sm text-secondary mt-2">
        {dict.no_account}{' '}
        <Link href={ROUTES.register(lang)} className="text-accent fw-semibold link-plain">
          {dict.register_link}
        </Link>
      </p>
    </form>
  )
}
