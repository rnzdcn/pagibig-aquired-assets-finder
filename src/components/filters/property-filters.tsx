import { BookmarkPlus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LocationFields } from './location-fields'
import { DEFAULT_FILTERS, type PropertyFilters } from '@/types/filters'
import type { SavedSearch } from '@/hooks/use-saved-filters'

interface PropertyFiltersSidebarProps {
  filters: PropertyFilters
  onApply: (filters: PropertyFilters) => void
  savedSearches: SavedSearch[]
  onSaveSearch: (name: string) => void
  onLoadSearch: (filters: PropertyFilters) => void
  onDeleteSearch: (id: string) => void
}

export function PropertyFiltersSidebar({
  filters,
  onApply,
  savedSearches,
  onSaveSearch,
  onLoadSearch,
  onDeleteSearch,
}: PropertyFiltersSidebarProps) {
  const handleReset = () => {
    onApply(DEFAULT_FILTERS)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <ScrollArea className="flex-1 pr-2">
        <FieldGroup>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Location</h3>
            <LocationFields filters={filters} onChange={onApply} />
          </div>

          {savedSearches.length > 0 && (
            <>
              <FieldSeparator />
              <div>
                <h3 className="mb-3 text-sm font-semibold">Saved Searches</h3>
                <ul className="flex flex-col gap-1.5">
                  {savedSearches.map((search) => (
                    <li key={search.id} className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 flex-1 justify-start truncate"
                        onClick={() => onLoadSearch(search.filters)}
                      >
                        {search.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${search.name}`}
                        onClick={() => onDeleteSearch(search.id)}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </FieldGroup>
      </ScrollArea>

      <Separator />

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={handleReset}>
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            const name = window.prompt('Name this search (e.g. "My Favorite Search")')
            if (name) onSaveSearch(name)
          }}
        >
          <BookmarkPlus data-icon="inline-start" />
          Save
        </Button>
      </div>
    </div>
  )
}
