import { Building2, Eye, MapPin, Ruler } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OccupancyBadge } from '@/components/occupancy-badge'
import { FavoriteButton } from '@/components/favorite-button'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Property } from '@/types/property'

interface PropertyCardProps {
  property: Property
  isFavorite: boolean
  onToggleFavorite: () => void
  onViewDetails: () => void
}

export function PropertyCard({ property, isFavorite, onToggleFavorite, onViewDetails }: PropertyCardProps) {
  const isOccupied = property.occupancy.toLowerCase().startsWith('occupied')

  return (
    <Card
      className="cursor-pointer gap-3 overflow-hidden pt-0 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onViewDetails}
    >
      <div
        className={cn(
          'relative flex h-28 items-center justify-center bg-gradient-to-br',
          isOccupied
            ? 'from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800'
            : 'from-primary to-sky-500 dark:from-primary dark:to-sky-700',
        )}
      >
        <Building2 className="size-14 text-white/20" strokeWidth={1.5} />
        <Badge className="absolute top-2.5 left-2.5 bg-white/90 text-foreground hover:bg-white/90">
          {property.auctionLabel}
        </Badge>
        <FavoriteButton
          active={isFavorite}
          onToggle={onToggleFavorite}
          className="absolute top-2 right-2 bg-white/80 backdrop-blur hover:bg-white"
        />
      </div>

      <CardHeader>
        <CardTitle className="text-base">
          <span className="truncate">{property.propertyType}</span>
        </CardTitle>
        <p className="flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3 shrink-0" />
          <span className="line-clamp-2">{property.location}</span>
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Minimum Bid</p>
          <p className="text-2xl font-semibold text-primary">{formatCurrency(property.minBid)}</p>
        </div>
        <OccupancyBadge occupancy={property.occupancy} className="w-fit" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Ruler className="size-3" />
          <span>
            Lot {property.lotArea.toLocaleString()} sqm &middot; Floor {property.floorArea.toLocaleString()} sqm
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onViewDetails}>
          <Eye data-icon="inline-start" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
