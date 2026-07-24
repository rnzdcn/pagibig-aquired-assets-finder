import { ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function PageHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-sky-500/10 px-5 py-7 sm:px-8 sm:py-9">
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="size-3" />
            Official Pag-IBIG listings
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3" />
            Updated straight from the source
          </Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Find your next property, without the paperwork hassle
        </h1>
        <p className="max-w-2xl text-sm text-pretty text-muted-foreground sm:text-base">
          Search, filter, and compare Pag-IBIG's acquired assets — foreclosed houses, lots, and condos up for
          public auction or negotiated sale — in a faster, friendlier interface than the source site.
        </p>
      </div>
    </div>
  )
}
