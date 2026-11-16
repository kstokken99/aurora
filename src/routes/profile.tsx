import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  profileSchema,
  type ProfileFormValues,
} from '@/schemas/profile-schema'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const [savedProfile, setSavedProfile] = useState<ProfileFormValues | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      bio: '',
    },
  })

  function onSubmit(values: ProfileFormValues) {
    setSavedProfile(values)
  }

  function handleReset() {
    reset()
    setSavedProfile(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="max-w-2xl text-muted-foreground">
          Form state is owned by React Hook Form, validation by Zod, and the UI
          is composed from shadcn/ui field primitives.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            All fields are validated on submit against the schema in{' '}
            <code>src/schemas/profile-schema.ts</code>.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ada@example.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                <FieldDescription>
                  We will never share your email with anyone.
                </FieldDescription>
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.bio}>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="A short introduction"
                  aria-invalid={!!errors.bio}
                  {...register('bio')}
                />
                <FieldDescription>Up to 280 characters.</FieldDescription>
                <FieldError errors={[errors.bio]} />
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="mt-6 flex items-center gap-2">
            <Button type="submit">Save profile</Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            {isSubmitSuccessful && savedProfile && (
              <span className="text-sm text-muted-foreground">
                Saved for {savedProfile.name}
              </span>
            )}
          </CardFooter>
        </form>
      </Card>

      {savedProfile && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Submitted values</CardTitle>
            <CardDescription>
              Typed output of the Zod schema after validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
              {JSON.stringify(savedProfile, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
