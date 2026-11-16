import { useTable } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

import type { Mailbox } from '@aurora/contracts'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { mailboxColumns } from './columns'
import { mailTableFeatures } from './mail-table-features'

type MailboxTableProps = {
  data: readonly Mailbox[]
  selectedMailboxId: string | null
  onSelectMailbox: (mailboxId: string | null) => void
}

export function MailboxTable({
  data,
  selectedMailboxId,
  onSelectMailbox,
}: MailboxTableProps) {
  const table = useTable({
    features: mailTableFeatures,
    columns: mailboxColumns,
    data,
    getRowId: (row) => row.id,
    initialState: {
      sorting: [{ id: 'lastSyncedAt', desc: true }],
    },
  })

  function toggleMailbox(mailboxId: string) {
    onSelectMailbox(selectedMailboxId === mailboxId ? null : mailboxId)
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </TableHead>
            ))}
            <TableHead className="w-8" />
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={mailboxColumns.length + 1}
              className="h-24 text-center text-muted-foreground"
            >
              No mailboxes linked yet.
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => {
            const isSelected = selectedMailboxId === row.original.id

            return (
              <TableRow
                key={row.id}
                data-state={isSelected ? 'selected' : undefined}
                aria-selected={isSelected}
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => {
                  toggleMailbox(row.original.id)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleMailbox(row.original.id)
                  }
                }}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
                <TableCell className="w-8 text-right">
                  <ChevronRight
                    className={cn(
                      'ml-auto size-4 text-muted-foreground transition-transform',
                      isSelected && 'rotate-90 text-foreground',
                    )}
                  />
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
