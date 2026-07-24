import { useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'
import type { PropertyFilters } from '@/types/filters'

const STORAGE_KEY = 'pagibig-copa:saved-searches'

export interface SavedSearch {
  id: string
  name: string
  filters: PropertyFilters
  createdAt: string
}

export function useSavedFilters() {
  const [savedSearches, setSavedSearches] = useLocalStorage<SavedSearch[]>(STORAGE_KEY, [])

  const saveSearch = useCallback(
    (name: string, filters: PropertyFilters) => {
      const entry: SavedSearch = {
        id: crypto.randomUUID(),
        name,
        filters,
        createdAt: new Date().toISOString(),
      }
      setSavedSearches((prev) => [entry, ...prev])
    },
    [setSavedSearches],
  )

  const removeSearch = useCallback(
    (id: string) => {
      setSavedSearches((prev) => prev.filter((entry) => entry.id !== id))
    },
    [setSavedSearches],
  )

  return { savedSearches, saveSearch, removeSearch }
}
