'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import Input from '@/src/components/ui/Input'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { resetPasswordThunk, clearFlags, selectAuth } from '@/src/store/slices/authSlice'
import { ROUTES } from '@/src/routes'
import { createResetPasswordSchema } from './schemas'
import type { ResetPasswordFormValues } from './schemas'
import PasswordStrengthMeter from './components/PasswordStrengthMeter'

interface ResetPasswordDict {
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

interface StrengthLabels {
  label: string
  weak: string
  fair: string
  strong: string
  very_strong: string
}

interface Props {
  dict: ResetPasswordDict
  strengthLabels: StrengthLabels
  lang: string
  token: string | null
}

export default function ResetPasswordForm({ dict, strengthLabels, lang, token }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const dispatch = useAppDispatch()
  const { isLoading, resetPasswordSuccess } = useAppSelector(selectAuth)

  const schema = useMemo(() => createResetPasswordSchema(dict), [dict])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  const passwordValue = watch('password') ?? ''

  useEffect(() => {
    dispatch(clearFlags())
  }, [dispatch])

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <span className="toast-icon toast-icon--warning">
          <AlertTriangle size={52} strokeWidth={1.5} />
        </span>
        <p className="text-body-sm text-secondary">{dict.invalid_token}</p>
        <Link href={ROUTES.forgotPassword(lang)} className="btn btn-outline mt-2 link-plain">
          {dict.go_to_login}
        </Link>
      </div>
    )
  }

  if (resetPasswordSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <span className="toast-icon toast-icon--success">
          <CheckCircle size={52} strokeWidth={1.5} />
        </span>
        <h2 className="text-h4 text-primary">{dict.success_title}</h2>
        <p className="text-body-sm text-secondary">{dict.success_message}</p>
        <Link href={ROUTES.login(lang)} className="btn btn-primary mt-4 link-plain">
          {dict.go_to_login}
        </Link>
      </div>
    )
  }

  const onSubmit = ({ password }: ResetPasswordFormValues) => {
    dispatch(resetPasswordThunk({ token, newPassword: password }))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Input
          label={dict.password_label}
          type={showPassword ? 'text' : 'password'}
          placeholder={dict.password_placeholder}
          autoComplete="new-password"
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
        <PasswordStrengthMeter password={passwordValue} labels={strengthLabels} />
      </div>

      <Input
        label={dict.confirm_password_label}
        type={showConfirm ? 'text' : 'password'}
        placeholder={dict.confirm_password_placeholder}
        autoComplete="new-password"
        leftIcon={<Lock size={16} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="btn-icon text-muted"
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary btn-lg btn-block mt-2"
      >
        {isLoading ? dict.loading : dict.submit}
      </button>
    </form>
  )
}
