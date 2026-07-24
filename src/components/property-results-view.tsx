import { PropertyTable } from '@/components/property-table/property-table'
import { PropertyCardGrid } from '@/components/property-card/property-card-grid'
import type { Property } from '@/types/property'

interface PropertyResultsViewProps {
  view: 'table' | 'cards'
  data: Property[]
  isFavorite: (id: string) => boolean
  onToggleFavorite: (property: Property) => void
  onViewDetails: (property: Property) => void
}

export function PropertyResultsView({ view, data, isFavorite, onToggleFavorite, onViewDetails }: PropertyResultsViewProps) {
  if (view === 'cards') {
    return (
      <PropertyCardGrid
        data={data}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onViewDetails={onViewDetails}
      />
    )
  }

  return (
    <PropertyTable data={data} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} onViewDetails={onViewDetails} />
  )
}
