import { z } from 'zod'

export interface ResetPasswordSchemaMessages {
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

export const createResetPasswordSchema = (m: ResetPasswordSchemaMessages) =>
  z
    .object({
      password: z
        .string()
        .min(1, m.error_password_required)
        .min(8, m.error_password_min)
        .max(128, m.error_password_max)
        .refine((v) => !/\s/.test(v), m.error_password_no_spaces)
        .refine((v) => /[A-Z]/.test(v), m.error_password_uppercase)
        .refine((v) => /[a-z]/.test(v), m.error_password_lowercase)
        .refine((v) => /[0-9]/.test(v), m.error_password_digit)
        .refine((v) => /[^A-Za-z0-9]/.test(v), m.error_password_special),

      confirmPassword: z.string().min(1, m.error_confirm_required),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: m.error_passwords_mismatch,
      path: ['confirmPassword'],
    })

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>
