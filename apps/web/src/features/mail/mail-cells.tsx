import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { MailboxStatus } from '@aurora/contracts'

import { mailboxStatusLabels } from './mail-labels'

function SortIndicator({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc') {
    return <ArrowUp data-icon="inline-end" />
  }

  if (direction === 'desc') {
    return <ArrowDown data-icon="inline-end" />
  }

  return <ArrowUpDown data-icon="inline-end" className="opacity-50" />
}

export function SortableHeader({
  label,
  direction,
  onClick,
}: {
  label: string
  direction: false | 'asc' | 'desc'
  onClick?: (event: unknown) => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2"
      onClick={onClick}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <SortIndicator direction={direction} />
    </Button>
  )
}

export function MailboxStatusBadge({ status }: { status: MailboxStatus }) {
  const variant = status === 'error' ? 'destructive' : 'outline'
  const dotClassName =
    status === 'connected'
      ? 'bg-primary'
      : status === 'syncing'
        ? 'bg-muted-foreground'
        : 'bg-destructive'

  return (
    <Badge variant={variant} className="gap-1.5">
      <span className={cn('size-1.5 rounded-full', dotClassName)} />
      {mailboxStatusLabels[status]}
    </Badge>
  )
}
