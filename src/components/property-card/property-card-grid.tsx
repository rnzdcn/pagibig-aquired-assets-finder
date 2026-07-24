import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { LayoutGrid } from 'lucide-react'
import { PropertyCard } from './property-card'
import type { Property } from '@/types/property'

interface PropertyCardGridProps {
  data: Property[]
  isFavorite: (id: string) => boolean
  onToggleFavorite: (property: Property) => void
  onViewDetails: (property: Property) => void
}

export function PropertyCardGrid({ data, isFavorite, onToggleFavorite, onViewDetails }: PropertyCardGridProps) {
  if (data.length === 0) {
    return (
      <Empty className="mt-6">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
            <LayoutGrid />
          </EmptyMedia>
          <EmptyTitle>No properties found</EmptyTitle>
          <EmptyDescription>Try widening your filters or picking a different city.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={isFavorite(property.id)}
          onToggleFavorite={() => onToggleFavorite(property)}
          onViewDetails={() => onViewDetails(property)}
        />
      ))}
    </div>
  )
}
