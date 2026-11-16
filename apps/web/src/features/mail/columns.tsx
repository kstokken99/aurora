import { createColumnHelper } from '@tanstack/react-table'
import { Paperclip } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

import { formatCount, formatDateTime } from './format'
import { MailboxStatusBadge, SortableHeader } from './mail-cells'
import {
  mailboxById,
  providerLabels,
  type Mailbox,
  type Message,
} from './mail-data'
import { mailTableFeatures } from './mail-table-features'

const mailboxHelper = createColumnHelper<typeof mailTableFeatures, Mailbox>()
const messageHelper = createColumnHelper<typeof mailTableFeatures, Message>()

export const mailboxColumns = mailboxHelper.columns([
  mailboxHelper.accessor('address', {
    header: ({ column }) => (
      <SortableHeader
        label="Mailbox"
        direction={column.getIsSorted()}
        onClick={column.getToggleSortingHandler()}
      />
    ),
    sortFn: 'alphanumeric',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.original.address}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.displayName}
        </span>
      </div>
    ),
  }),
  mailboxHelper.accessor('provider', {
    header: 'Provider',
    cell: ({ getValue }) => (
      <Badge variant="secondary">{providerLabels[getValue()]}</Badge>
    ),
  }),
  mailboxHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => <MailboxStatusBadge status={getValue()} />,
  }),
  mailboxHelper.accessor('unreadCount', {
    header: ({ column }) => (
      <SortableHeader
        label="Unread"
        direction={column.getIsSorted()}
        onClick={column.getToggleSortingHandler()}
      />
    ),
    cell: ({ getValue }) => (
      <span
        className={cn(
          'tabular-nums',
          getValue() > 0 ? 'font-medium' : 'text-muted-foreground',
        )}
      >
        {formatCount(getValue())}
      </span>
    ),
  }),
  mailboxHelper.accessor('totalMessages', {
    header: ({ column }) => (
      <SortableHeader
        label="Letters"
        direction={column.getIsSorted()}
        onClick={column.getToggleSortingHandler()}
      />
    ),
    cell: ({ getValue }) => (
      <span className="tabular-nums text-muted-foreground">
        {formatCount(getValue())}
      </span>
    ),
  }),
  mailboxHelper.accessor('lastSyncedAt', {
    header: ({ column }) => (
      <SortableHeader
        label="Last sync"
        direction={column.getIsSorted()}
        onClick={column.getToggleSortingHandler()}
      />
    ),
    sortFn: 'datetime',
    sortDescFirst: true,
    enableGlobalFilter: false,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatDateTime(getValue())}
      </span>
    ),
  }),
])

export const messageColumns = messageHelper.columns([
  messageHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        aria-label="Select all messages on this page"
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value)
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        aria-label={`Select message "${row.original.subject}"`}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value)
        }}
      />
    ),
    enableSorting: false,
    enableGlobalFilter: false,
  }),
  messageHelper.accessor('subject', {
    header: ({ column }) => (
      <SortableHeader
        label="Subject"
        direction={column.getIsSorted()}
        onClick={column.getToggleSortingHandler()}
      />
    ),
    sortFn: 'alphanumeric',
    cell: ({ row }) => (
      <div className="flex max-w-[420px] flex-col gap-1">
        <div className="flex items-center gap-2">
          {!row.original.isRead && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-primary"
              aria-label="Unread"
            />
          )}
          <span
            className={cn(
              'truncate',
              row.original.isRead
                ? 'font-normal text-muted-foreground'
                : 'font-medium',
            )}
          >
            {row.original.subject}
          </span>
          {row.original.hasAttachments && (
            <Paperclip
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-label="Has attachments"
            />
          )}
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {row.original.snippet}
        </span>
        <div className="flex flex-wrap gap-1">
          {row.original.labels.map((label) => (
            <Badge key={label} variant="outline" className="text-[10px]">
              {label}
            </Badge>
          ))}
        </div>
      </div>
    ),
  }),
  messageHelper.accessor('senderName', {
    header: ({ column }) => (
      <SortableHeader
        label="From"
        direction={column.getIsSorted()}
        onClick={column.getToggleSortingHandler()}
      />
    ),
    sortFn: 'alphanumeric',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.senderName}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.senderEmail}
        </span>
      </div>
    ),
  }),
  messageHelper.accessor('mailboxId', {
    header: 'Mailbox',
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {mailboxById.get(getValue())?.address ?? 'Unknown mailbox'}
      </span>
    ),
  }),
  messageHelper.accessor('receivedAt', {
    header: ({ column }) => (
      <SortableHeader
        label="Received"
        direction={column.getIsSorted()}
        onClick={column.getToggleSortingHandler()}
      />
    ),
    sortFn: 'datetime',
    sortDescFirst: true,
    enableGlobalFilter: false,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatDateTime(getValue())}
      </span>
    ),
  }),
  messageHelper.accessor('isRead', {
    header: 'Status',
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="secondary">Read</Badge>
      ) : (
        <Badge>Unread</Badge>
      ),
  }),
])

export const messageColumnCount = messageColumns.length
