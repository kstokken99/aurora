import { useTable } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { messageColumnCount, messageColumns } from './columns'
import type { Message } from './mail-data'
import { mailTableFeatures } from './mail-table-features'

const PAGE_SIZES = [8, 12, 24]

type MessagesTableProps = {
  data: readonly Message[]
}

export function MessagesTable({ data }: MessagesTableProps) {
  const table = useTable({
    features: mailTableFeatures,
    columns: messageColumns,
    data,
    getRowId: (row) => row.id,
    globalFilterFn: 'includesString',
    initialState: {
      sorting: [{ id: 'receivedAt', desc: true }],
      pagination: { pageIndex: 0, pageSize: 8 },
    },
  })

  const globalFilter = (table.state.globalFilter as string | undefined) ?? ''
  const selectedCount = table.getSelectedRowIds().length
  const rows = table.getRowModel().rows
  const filteredCount = table.getFilteredRowModel().rows.length
  const pageCount = Math.max(table.getPageCount(), 1)
  const { pageIndex, pageSize } = table.state.pagination

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value)
            }}
            placeholder="Search subject, sender or email"
            aria-label="Search messages"
            className="pr-8 pl-8"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              aria-label="Clear search"
              onClick={() => {
                table.setGlobalFilter('')
              }}
            >
              <X />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <>
              <Badge variant="secondary">{selectedCount} selected</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  table.resetRowSelection()
                }}
              >
                Clear
              </Button>
            </>
          )}
          <span className="text-sm text-muted-foreground">
            {filteredCount} messages
          </span>
        </div>
      </div>

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
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={messageColumnCount}
                className="h-24 text-center text-muted-foreground"
              >
                No messages match your filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.previousPage()
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft data-icon="inline-start" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.nextPage()
            }}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}
