'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, User, ShoppingBag, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/src/components/ui/Input'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { registerThunk, selectAuth } from '@/src/store/slices/authSlice'
import { ROUTES } from '@/src/routes'
import { createRegisterSchema } from './schemas'
import type { RegisterFormValues } from './schemas'
import PasswordStrengthMeter from './components/PasswordStrengthMeter'
import type { UserRole } from '@/src/types/auth'

interface RegisterDict {
  title: string
  subtitle: string
  name_label: string
  name_placeholder: string
  email_label: string
  email_placeholder: string
  password_label: string
  password_placeholder: string
  confirm_password_label: string
  confirm_password_placeholder: string
  submit: string
  loading: string
  have_account: string
  login_link: string
  role_heading: string
  role_user: string
  role_user_desc: string
  role_admin: string
  role_admin_desc: string
  error_name_required: string
  error_name_min: string
  error_name_max: string
  error_name_letters: string
  error_name_start: string
  error_email_required: string
  error_email_invalid: string
  error_email_max: string
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
  dict: RegisterDict
  strengthLabels: StrengthLabels
  lang: string
}

export default function RegisterForm({ dict, strengthLabels, lang }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState<UserRole>('user')
  const dispatch = useAppDispatch()
  const { isLoading, token, user } = useAppSelector(selectAuth)
  const router = useRouter()

  const schema = useMemo(() => createRegisterSchema(dict), [dict])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  const passwordValue = useWatch({ control, name: 'password' }) ?? ''

  useEffect(() => {
    if (token && user) {
      router.replace(
        user.role === 'admin' ? ROUTES.adminDashboard(lang) : ROUTES.products(lang)
      )
    }
  }, [token, user, router, lang])

  const onSubmit = ({ name, email, password }: RegisterFormValues) => {
    dispatch(registerThunk({ name, email, password, role }))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Role selector */}
      <div className="flex flex-col gap-2">
        <span className="fs-sm fw-medium text-secondary">{dict.role_heading}</span>
        <div className="flex gap-3">
          <button
            type="button"
            className={`role-card${role === 'user' ? ' role-card--active' : ''}`}
            onClick={() => setRole('user')}
          >
            <div className="role-card-icon"><ShoppingBag size={18} /></div>
            <div className="role-card-title">{dict.role_user}</div>
            <div className="role-card-desc">{dict.role_user_desc}</div>
          </button>
          <button
            type="button"
            className={`role-card${role === 'admin' ? ' role-card--active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <div className="role-card-icon"><Settings size={18} /></div>
            <div className="role-card-title">{dict.role_admin}</div>
            <div className="role-card-desc">{dict.role_admin_desc}</div>
          </button>
        </div>
      </div>

      <Input
        label={dict.name_label}
        type="text"
        placeholder={dict.name_placeholder}
        autoComplete="name"
        leftIcon={<User size={16} />}
        error={errors.name?.message}
        {...register('name')}
      />

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

      <p className="text-center fs-sm text-secondary mt-2">
        {dict.have_account}{' '}
        <Link href={ROUTES.login(lang)} className="text-accent fw-semibold link-plain">
          {dict.login_link}
        </Link>
      </p>
    </form>
  )
}
