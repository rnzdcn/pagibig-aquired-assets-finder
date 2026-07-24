import { AlertCircle, MapPinned, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

export function SearchPromptState() {
  return (
    <Empty className="mt-6 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
          <MapPinned />
        </EmptyMedia>
        <EmptyTitle>Choose a location to get started</EmptyTitle>
        <EmptyDescription>
          Select a Region, Province, and City/Municipality in the filters panel to search Pag-IBIG's acquired
          assets.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive" className="mt-6">
      <AlertCircle />
      <AlertTitle>Couldn't load properties</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          <RotateCcw data-icon="inline-start" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function TableSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <Skeleton className="h-9 w-full" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  )
}
