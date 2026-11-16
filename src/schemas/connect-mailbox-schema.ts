import { z } from 'zod'

const APP_PASSWORD_PATTERN = /^[a-z0-9]{16}$/i

export const connectMailboxSchema = z.object({
  email: z.email('Enter the Google account email.'),
  appPassword: z
    .string()
    .trim()
    .min(1, 'Enter the 16-character app password.')
    .refine(
      (value) => APP_PASSWORD_PATTERN.test(value.replace(/\s+/g, '')),
      'The app password must contain exactly 16 letters or digits.',
    ),
  twoFactorCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from the authenticator app.'),
})

export type ConnectMailboxFormValues = z.infer<typeof connectMailboxSchema>
