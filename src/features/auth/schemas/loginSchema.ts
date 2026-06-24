import { z } from 'zod'

export interface LoginSchemaMessages {
  error_email_required: string
  error_email_invalid: string
  error_email_max: string
  error_password_required: string
  error_password_min: string
  error_password_max: string
}

export const createLoginSchema = (m: LoginSchemaMessages) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, m.error_email_required)
      .max(254, m.error_email_max)
      .email(m.error_email_invalid),
    password: z
      .string()
      .min(1, m.error_password_required)
      .min(8, m.error_password_min)
      .max(128, m.error_password_max),
  })

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>
