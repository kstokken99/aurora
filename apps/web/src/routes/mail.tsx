import { useMemo, useState } from 'react'
import {
  createFileRoute,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { Mail, MailOpen, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConnectMailboxDialog } from '@/features/mail/connect-mailbox-dialog'
import { formatCount } from '@/features/mail/format'
import { fetchMailData } from '@/features/mail/mail-api'
import { MailboxTable } from '@/features/mail/mailbox-table'
import { MessagesTable } from '@/features/mail/messages-table'

export const Route = createFileRoute('/mail')({
  component: MailPage,
  loader: () => fetchMailData(),
  errorComponent: MailError,
})

type StatCardProps = {
  label: string
  value: number
  hint: string
}

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">
          {formatCount(value)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function MailError({ error }: ErrorComponentProps) {
  const router = useRouter()
  const message =
    error instanceof Error ? error.message : 'The mail API is unavailable.'

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Could not load mailboxes</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            void router.invalidate()
          }}
        >
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

function MailPage() {
  const { mailboxes, messages } = Route.useLoaderData()
  const router = useRouter()
  const [selectedMailboxId, setSelectedMailboxId] = useState<string | null>(
    null,
  )

  const selectedMailbox = selectedMailboxId
    ? mailboxes.find((mailbox) => mailbox.id === selectedMailboxId)
    : undefined

  const visibleMessages = useMemo(
    () =>
      selectedMailboxId
        ? messages.filter((message) => message.mailboxId === selectedMailboxId)
        : messages,
    [messages, selectedMailboxId],
  )

  const unreadCount = visibleMessages.filter((message) => !message.isRead).length
  const connectedCount = mailboxes.filter(
    (mailbox) => mailbox.status === 'connected',
  ).length
  const attentionCount = mailboxes.filter(
    (mailbox) => mailbox.status === 'error',
  ).length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Mailboxes</h1>
          <Badge variant="outline">API data</Badge>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Mailboxes linked to your account and the latest letters received in
          them. Data comes from the Aurora API, and the tables are powered by
          TanStack Table with sorting, search, pagination and row selection.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Linked mailboxes"
          value={mailboxes.length}
          hint={`${connectedCount} connected, ${attentionCount} need attention`}
        />
        <StatCard
          label="Unread letters"
          value={unreadCount}
          hint={
            selectedMailbox
              ? `In ${selectedMailbox.address}`
              : 'Across all linked mailboxes'
          }
        />
        <StatCard
          label="Letters in view"
          value={visibleMessages.length}
          hint={
            selectedMailbox
              ? `From ${selectedMailbox.address}`
              : 'All mailboxes combined'
          }
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                Linked mailboxes
              </CardTitle>
              <CardDescription>
                Click a mailbox to show only its letters in the table below.
              </CardDescription>
            </div>
            <ConnectMailboxDialog
              onConnected={() => router.invalidate()}
            />
          </div>
        </CardHeader>
        <CardContent>
          <MailboxTable
            data={mailboxes}
            selectedMailboxId={selectedMailboxId}
            onSelectMailbox={setSelectedMailboxId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailOpen className="size-4 text-muted-foreground" />
            Letters
          </CardTitle>
          <CardDescription>
            {selectedMailbox
              ? `Showing letters from ${selectedMailbox.address}.`
              : 'Latest letters from all linked mailboxes.'}
          </CardDescription>
          {selectedMailbox && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => {
                setSelectedMailboxId(null)
              }}
            >
              <X data-icon="inline-start" />
              All mailboxes
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <MessagesTable data={visibleMessages} mailboxes={mailboxes} />
        </CardContent>
      </Card>
    </div>
  )
}
