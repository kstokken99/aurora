import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Minus, Plus, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCounterStore } from '@/stores/counter-store'

export const Route = createFileRoute('/')({
  component: OverviewPage,
})

function OverviewPage() {
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)
  const decrement = useCounterStore((state) => state.decrement)
  const reset = useCounterStore((state) => state.reset)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Aurora</h1>
        <p className="max-w-2xl text-muted-foreground">
          Vite + React starter wired with TanStack Router, shadcn/ui, Zod,
          React Hook Form and Zustand.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Zustand</CardTitle>
            <CardDescription>
              Global client state with selector-based subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Decrement"
                onClick={decrement}
              >
                <Minus />
              </Button>
              <span className="w-16 text-center text-2xl font-semibold tabular-nums">
                {count}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Increment"
                onClick={increment}
              >
                <Plus />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Reset"
                onClick={reset}
              >
                <RotateCcw />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              State lives in <code>src/stores/counter-store.ts</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TanStack Router</CardTitle>
            <CardDescription>
              File-based, fully typed routing with validated search params.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              The form page shows React Hook Form + Zod with shadcn/ui fields.
            </p>
            <Button asChild className="w-fit">
              <Link to="/profile">
                Open profile form
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
