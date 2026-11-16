import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Plus,
  ShieldCheck,
} from 'lucide-react'

import type { ConnectMailboxInput } from '@aurora/contracts'
import { connectMailboxRequestSchema } from '@aurora/contracts'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { connectMailbox } from './mail-api'

type Step = 'credentials' | 'verify' | 'done'

type ConnectMailboxDialogProps = {
  onConnected: () => Promise<void> | void
}

const stepTitles: Record<Step, string> = {
  credentials: 'Connect a Google account',
  verify: 'Confirm two-factor authentication',
  done: 'Mailbox connected',
}

const stepDescriptions: Record<Step, string> = {
  credentials:
    'Link a mailbox with a 16-character Google app password. Your main Google password is never requested.',
  verify:
    'Enter the 6-digit code from the authenticator app linked to this Google account.',
  done: 'The account is linked and the first sync has been queued.',
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className={cn(
          step === 'credentials' && 'font-medium text-foreground',
        )}
      >
        1. Account
      </span>
      <span aria-hidden="true">/</span>
      <span className={cn(step === 'verify' && 'font-medium text-foreground')}>
        2. Verification
      </span>
    </div>
  )
}

export function ConnectMailboxDialog({
  onConnected,
}: ConnectMailboxDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('credentials')
  const [connectedEmail, setConnectedEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ConnectMailboxInput>({
    resolver: zodResolver(connectMailboxRequestSchema),
    defaultValues: {
      email: '',
      appPassword: '',
      twoFactorCode: '',
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSubmitting) {
      return
    }

    setOpen(nextOpen)

    if (!nextOpen) {
      reset()
      setStep('credentials')
      setServerError(null)
    }
  }

  async function handleContinue() {
    const isValid = await trigger(['email', 'appPassword'])

    if (isValid) {
      setServerError(null)
      setStep('verify')
    }
  }

  async function onSubmit(values: ConnectMailboxInput) {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const mailbox = await connectMailbox(values)
      setConnectedEmail(mailbox.address)
      await onConnected()
      setStep('done')
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Could not connect the mailbox.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          Connect account
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md"
        showCloseButton={!isSubmitting}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) {
            event.preventDefault()
          }
        }}
        onInteractOutside={(event) => {
          if (isSubmitting) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
          <DialogDescription>{stepDescriptions[step]}</DialogDescription>
          {step !== 'done' && <StepIndicator step={step} />}
        </DialogHeader>

        {step === 'credentials' && (
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void handleContinue()
            }}
          >
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="connect-email">Google account</FieldLabel>
                <Input
                  id="connect-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@gmail.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.appPassword}>
                <FieldLabel htmlFor="connect-app-password">
                  App password
                </FieldLabel>
                <Input
                  id="connect-app-password"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="abcd efgh ijkl mnop"
                  aria-invalid={!!errors.appPassword}
                  {...register('appPassword')}
                />
                <FieldDescription>
                  Google shows the 16-character password once, in four groups
                  of four. Spaces are optional.
                </FieldDescription>
                <FieldError errors={[errors.appPassword]} />
              </Field>
            </FieldGroup>

            <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <KeyRound className="mt-0.5 size-4 shrink-0" />
              <p>
                Create it in your Google Account under{' '}
                <span className="text-foreground">
                  Security → 2-Step Verification → App passwords
                </span>
                . It can be revoked at any time. This demo sends the password
                only to the local Aurora API and never contacts Google.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleOpenChange(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Continue
                <ArrowRight data-icon="inline-end" />
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'verify' && (
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Field data-invalid={!!errors.twoFactorCode}>
                <FieldLabel htmlFor="connect-2fa">
                  Authentication code
                </FieldLabel>
                <Input
                  id="connect-2fa"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.4em]"
                  aria-invalid={!!errors.twoFactorCode}
                  {...register('twoFactorCode')}
                />
                <FieldDescription>
                  Open Google Authenticator or another TOTP app. The demo API
                  accepts any 6-digit code.
                </FieldDescription>
                <FieldError errors={[errors.twoFactorCode]} />
              </Field>
            </FieldGroup>

            <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              <p>
                The app password is sent to the Aurora API over HTTPS. In
                production the server verifies the provider and stores only
                encrypted credentials; the browser never keeps them.
              </p>
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
              >
                {serverError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setServerError(null)
                  setStep('credentials')
                }}
              >
                <ArrowLeft data-icon="inline-start" />
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <ShieldCheck data-icon="inline-start" />
                    Verify and connect
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'done' && (
          <>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {connectedEmail}
                </span>{' '}
                is now in the mailbox list. Letters will appear after the first
                sync completes.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  handleOpenChange(false)
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
