import { useMemo, useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { SearchBar } from '@/components/search-bar'
import { ViewToggle } from '@/components/view-toggle'
import { PropertyResultsView } from '@/components/property-results-view'
import { PropertyDrawer } from '@/components/property-drawer'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useFavorites } from '@/hooks/use-favorites'
import type { Property } from '@/types/property'

export function FavoritesPage() {
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'table' | 'cards'>('cards')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return favorites
    return favorites.filter(
      (property) =>
        property.batchNo.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.cityMuni.toLowerCase().includes(query) ||
        property.propertyType.toLowerCase().includes(query),
    )
  }, [favorites, search])

  const handleToggleFavorite = (property: Property) => {
    toggleFavorite(property)
    toast('Removed from favorites', { description: `${property.propertyType} — ${property.batchNo}` })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
          <Heart className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold">Favorites</h1>
          <p className="text-sm text-muted-foreground">Properties you've saved for later.</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Empty className="mt-6 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-rose-500/10 text-rose-500">
              <Heart />
            </EmptyMedia>
            <EmptyTitle>No favorites yet</EmptyTitle>
            <EmptyDescription>Tap the heart icon on any property to save it here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar value={search} onChange={setSearch} />
            <ViewToggle value={view} onChange={setView} />
          </div>

          <PropertyResultsView
            view={view}
            data={filtered}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onViewDetails={(property) => {
              setSelectedProperty(property)
              setDrawerOpen(true)
            }}
          />
        </>
      )}

      <PropertyDrawer
        property={selectedProperty}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        isFavorite={selectedProperty ? isFavorite(selectedProperty.id) : false}
        onToggleFavorite={() => selectedProperty && handleToggleFavorite(selectedProperty)}
      />
    </div>
  )
}
