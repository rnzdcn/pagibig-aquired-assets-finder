import { useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { PropertyFiltersSidebar } from '@/components/filters/property-filters'
import { PageHero } from '@/components/page-hero'
import { PropertyStats } from '@/components/property-stats'
import { SearchBar } from '@/components/search-bar'
import { AuctionTabs } from '@/components/auction-tabs'
import { ViewToggle } from '@/components/view-toggle'
import { PropertyResultsView } from '@/components/property-results-view'
import { SearchPromptState, ErrorState, TableSkeleton } from '@/components/property-results-states'
import { PropertyDrawer } from '@/components/property-drawer'
import { WatchToggle } from '@/components/watch-toggle'
import { DailyAlertToggle } from '@/components/daily-alert-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useProperties } from '@/hooks/use-properties'
import { useFavorites } from '@/hooks/use-favorites'
import { useSavedFilters } from '@/hooks/use-saved-filters'
import { useFiltersUrl } from '@/hooks/use-filters-url'
import { usePushSubscription } from '@/hooks/use-push-subscription'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { requestNotificationPermission, useNewListingWatch, WATCH_POLL_MS } from '@/hooks/use-new-listing-watch'
import { isSearchReady } from '@/types/filters'
import type { Property } from '@/types/property'

export function PropertiesPage() {
  const { state, update } = useFiltersUrl()
  const { filters, search, auction, view } = state

  const [watchEnabled, setWatchEnabled] = useLocalStorage('pagibig-copa:watch-enabled', false)
  const propertiesQuery = useProperties(filters, { refetchInterval: watchEnabled ? WATCH_POLL_MS : false })
  useNewListingWatch({
    enabled: watchEnabled,
    cityCode: filters.cityCode,
    cityName: filters.cityName,
    data: propertiesQuery.data,
  })
  const { isFavorite, toggleFavorite } = useFavorites()
  const { savedSearches, saveSearch, removeSearch } = useSavedFilters()
  const pushSubscription = usePushSubscription()

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const ready = isSearchReady(filters)

  const filteredData = useMemo(() => {
    let list = propertiesQuery.data ?? []

    if (auction !== 'all') {
      list = list.filter((property) => property.auctionType === auction)
    }

    const query = search.trim().toLowerCase()
    if (query) {
      list = list.filter(
        (property) =>
          property.batchNo.toLowerCase().includes(query) ||
          property.id.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.cityMuni.toLowerCase().includes(query) ||
          property.propertyType.toLowerCase().includes(query),
      )
    }

    return list
  }, [propertiesQuery.data, auction, search])

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property)
    setDrawerOpen(true)
  }

  const handleToggleFavorite = (property: Property) => {
    const wasFavorite = isFavorite(property.id)
    toggleFavorite(property)
    toast(wasFavorite ? 'Removed from favorites' : 'Added to favorites', {
      description: property.propertyType + ' — ' + property.batchNo,
    })
  }

  const handleSaveSearch = (name: string) => {
    saveSearch(name, filters)
    toast.success(`Saved search "${name}"`)
  }

  const handleToggleWatch = () => {
    if (!watchEnabled) {
      requestNotificationPermission()
      toast.success('Watching for new listings', {
        description: filters.cityName
          ? `You'll be alerted here when new properties appear in ${filters.cityName}.`
          : undefined,
      })
    }
    setWatchEnabled((prev) => !prev)
  }

  const handleTogglePush = () => {
    if (pushSubscription.subscribed) {
      pushSubscription.unsubscribe()
    } else {
      pushSubscription.subscribe()
    }
  }

  const filterSidebar = (
    <PropertyFiltersSidebar
      filters={filters}
      onApply={(next) => update({ filters: next })}
      savedSearches={savedSearches}
      onSaveSearch={handleSaveSearch}
      onLoadSearch={(next) => update({ filters: next })}
      onDeleteSearch={removeSearch}
    />
  )

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 p-4 lg:p-6">
      <PageHero />
      <PropertyStats data={filteredData} isLoading={propertiesQuery.isLoading} />

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] rounded-xl border bg-card p-4">
            {filterSidebar}
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal data-icon="inline-start" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] p-4">
                  <SheetHeader className="px-0">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-2 h-[calc(100vh-6rem)]">{filterSidebar}</div>
                </SheetContent>
              </Sheet>
              <SearchBar value={search} onChange={(value) => update({ search: value })} />
            </div>
            <div className="flex items-center gap-2">
              <WatchToggle enabled={watchEnabled} disabled={!ready} onToggle={handleToggleWatch} />
              <DailyAlertToggle
                supported={pushSubscription.supported}
                subscribed={pushSubscription.subscribed}
                loading={pushSubscription.loading}
                onToggle={handleTogglePush}
              />
              <ViewToggle value={view} onChange={(value) => update({ view: value })} />
            </div>
          </div>

          <AuctionTabs value={auction} onChange={(value) => update({ auction: value })} />

          {!ready ? (
            <SearchPromptState />
          ) : propertiesQuery.isLoading ? (
            <TableSkeleton />
          ) : propertiesQuery.isError ? (
            <ErrorState
              message={propertiesQuery.error instanceof Error ? propertiesQuery.error.message : 'Please try again.'}
              onRetry={() => propertiesQuery.refetch()}
            />
          ) : (
            <PropertyResultsView
              view={view}
              data={filteredData}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onViewDetails={handleViewDetails}
            />
          )}
        </main>
      </div>

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
