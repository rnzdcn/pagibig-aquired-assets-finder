import { ArrowRight, Building2, LandPlot, MapPin, Ruler } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OccupancyBadge } from '@/components/occupancy-badge'
import { FavoriteButton } from '@/components/favorite-button'
import { usePropertyImages } from '@/hooks/use-property-images'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'
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
  const images = usePropertyImages(property.id)
  const thumbnail = images.data?.[0]
  const pricingArea = property.floorArea || property.lotArea
  const pricePerSqm = pricingArea > 0 ? property.minBid / pricingArea : null

  return (
    <Card
      className="group h-full cursor-pointer gap-3 overflow-hidden pt-0 shadow-sm ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/30"
      onClick={onViewDetails}
    >
      <div
        className={cn(
          'relative aspect-[4/3] overflow-hidden bg-gradient-to-br',
          isOccupied
            ? 'from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800'
            : 'from-primary to-sky-500 dark:from-primary dark:to-sky-700',
        )}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={property.propertyType}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2
              className={cn('size-14 text-white/25', images.isLoading && 'animate-pulse')}
              strokeWidth={1.5}
            />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />

        <Badge className="absolute top-2.5 left-2.5 border-0 bg-white/95 text-foreground shadow-sm hover:bg-white/95">
          {property.auctionLabel}
        </Badge>
        <FavoriteButton
          active={isFavorite}
          onToggle={onToggleFavorite}
          className="absolute top-2 right-2 bg-white/85 shadow-sm backdrop-blur hover:bg-white"
        />

        <p className="absolute bottom-2 left-3 flex items-center gap-1 text-xs font-medium text-white">
          <MapPin className="size-3 shrink-0" />
          <span className="line-clamp-1">{property.cityMuni}</span>
        </p>
      </div>

      <CardHeader>
        <CardTitle className="text-base">
          <span className="truncate">{property.propertyType}</span>
        </CardTitle>
        <p className="line-clamp-2 text-xs text-muted-foreground">{property.location}</p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Minimum Bid</p>
            <p className="text-2xl font-semibold text-primary">{formatCurrency(property.minBid)}</p>
          </div>
          {pricePerSqm && (
            <p className="pb-0.5 text-xs whitespace-nowrap text-muted-foreground">
              &asymp; {formatCompactCurrency(pricePerSqm)}/sqm
            </p>
          )}
        </div>

        <OccupancyBadge occupancy={property.occupancy} className="w-fit" />

        <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <LandPlot className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span>{property.lotArea.toLocaleString()} sqm lot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="size-3.5 shrink-0 text-muted-foreground/70" />
            <span>{property.floorArea.toLocaleString()} sqm floor</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="group/btn w-full" onClick={onViewDetails}>
          View Details
          <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  )
}
