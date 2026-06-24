import { z } from 'zod'

export interface ForgotPasswordSchemaMessages {
  error_email_required: string
  error_email_invalid: string
  error_email_max: string
}

export const createForgotPasswordSchema = (m: ForgotPasswordSchemaMessages) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, m.error_email_required)
      .max(254, m.error_email_max)
      .email(m.error_email_invalid),
  })

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>
