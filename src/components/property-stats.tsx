import { useMemo } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Building, CircleDot, Home, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCompactCurrency } from '@/lib/format'
import type { Property } from '@/types/property'

interface PropertyStatsProps {
  data: Property[]
  isLoading: boolean
}

interface StatDef {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
}

export function PropertyStats({ data, isLoading }: PropertyStatsProps) {
  const stats = useMemo<StatDef[]>(() => {
    const total = data.length
    const bids = data.map((p) => p.minBid)
    const average = total > 0 ? bids.reduce((sum, v) => sum + v, 0) / total : 0
    const occupied = data.filter((p) => p.occupancy.toLowerCase().startsWith('occupied')).length
    const vacant = total - occupied
    const lowest = total > 0 ? Math.min(...bids) : 0
    const highest = total > 0 ? Math.max(...bids) : 0

    return [
      { label: 'Total Properties', value: total.toLocaleString(), icon: Home, tint: 'bg-primary/10 text-primary' },
      {
        label: 'Average Bid Price',
        value: formatCompactCurrency(average),
        icon: Wallet,
        tint: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      },
      {
        label: 'Occupied',
        value: occupied.toLocaleString(),
        icon: Building,
        tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      },
      {
        label: 'Vacant',
        value: vacant.toLocaleString(),
        icon: CircleDot,
        tint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      },
      {
        label: 'Lowest Price',
        value: formatCompactCurrency(lowest),
        icon: ArrowDownToLine,
        tint: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      },
      {
        label: 'Highest Price',
        value: formatCompactCurrency(highest),
        icon: ArrowUpFromLine,
        tint: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      },
    ]
  }, [data])

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="transition-shadow hover:shadow-sm">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.tint}`}>
              <stat.icon className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs text-muted-foreground">{stat.label}</span>
              {isLoading ? (
                <Skeleton className="mt-1 h-5 w-16" />
              ) : (
                <span className="truncate text-lg font-semibold">{stat.value}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
