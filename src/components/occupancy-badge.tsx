import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface OccupancyBadgeProps {
  occupancy: string
  className?: string
}

export function OccupancyBadge({ occupancy, className }: OccupancyBadgeProps) {
  const isOccupied = occupancy.toLowerCase().startsWith('occupied')

  return (
    <Badge
      variant={isOccupied ? 'destructive' : 'secondary'}
      className={cn(!isOccupied && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', className)}
    >
      {occupancy}
    </Badge>
  )
}
