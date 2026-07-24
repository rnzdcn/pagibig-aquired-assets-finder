import { ExternalLink, MapPin, Mail, Phone, ImageOff } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { OccupancyBadge } from '@/components/occupancy-badge'
import { FavoriteButton } from '@/components/favorite-button'
import { usePropertyImages } from '@/hooks/use-property-images'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Property } from '@/types/property'

interface PropertyDrawerProps {
  property: Property | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function PropertyDrawer({ property, open, onOpenChange, isFavorite, onToggleFavorite }: PropertyDrawerProps) {
  const images = usePropertyImages(open ? (property?.id ?? null) : null, true)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="sm:max-w-md">
        {property && (
          <>
            <DrawerHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <DrawerTitle>{property.propertyType}</DrawerTitle>
                  <DrawerDescription className="flex items-start gap-1">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    {property.location}
                  </DrawerDescription>
                </div>
                <FavoriteButton active={isFavorite} onToggle={onToggleFavorite} />
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
                {images.isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : images.data && images.data.length > 0 ? (
                  <img src={images.data[0]} alt={property.propertyType} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <ImageOff className="size-6" />
                    <span className="text-xs">No photo uploaded yet</span>
                  </div>
                )}
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <OccupancyBadge occupancy={property.occupancy} />
                <Badge variant="outline">{property.auctionLabel}</Badge>
                <Badge variant="secondary">{property.batchNo}</Badge>
              </div>

              <p className="mb-4 text-2xl font-semibold">{formatCurrency(property.minBid)}</p>

              <Separator className="mb-4" />

              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Lot Area" value={`${property.lotArea.toLocaleString()} sqm`} />
                <DetailRow label="Floor Area" value={`${property.floorArea.toLocaleString()} sqm`} />
                <DetailRow label="Appraisal Date" value={formatDate(property.appraisalDate)} />
                <DetailRow label="Inspection Date" value={formatDate(property.inspectionDate)} />
                <DetailRow label="Title No." value={property.titleNo || 'N/A'} />
                <DetailRow label="Subdivision" value={property.subdivision || 'N/A'} />
                <DetailRow label="Bidding Opens" value={formatDate(property.openingDate)} />
                <DetailRow label="Handling Unit" value={property.handlingUnit || 'N/A'} />
              </div>

              {property.remarks && (
                <>
                  <Separator className="my-4" />
                  <DetailRow label="Remarks" value={property.remarks} />
                </>
              )}

              {(property.contact || property.email) && (
                <>
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-2">
                    {property.contact && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="size-3.5 text-muted-foreground" />
                        {property.contact}
                      </div>
                    )}
                    {property.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="size-3.5 text-muted-foreground" />
                        {property.email}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <DrawerFooter className="border-t">
              <Button asChild>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin data-icon="inline-start" />
                  Open in Google Maps
                  <ExternalLink data-icon="inline-end" />
                </a>
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
