import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './use-local-storage'
import { normalizeProperty, type Property, type RawProperty } from '@/types/property'

const STORAGE_KEY = 'pagibig-copa:favorites'

export function useFavorites() {
  const [stored, setStored] = useLocalStorage<Record<string, RawProperty>>(STORAGE_KEY, {})

  const favorites = useMemo<Property[]>(() => Object.values(stored).map(normalizeProperty), [stored])
  const isFavorite = useCallback((id: string) => id in stored, [stored])

  const toggleFavorite = useCallback(
    (property: Property) => {
      setStored((prev) => {
        if (property.id in prev) {
          const next = { ...prev }
          delete next[property.id]
          return next
        }
        return { ...prev, [property.id]: property.raw }
      })
    },
    [setStored],
  )

  return { favorites, isFavorite, toggleFavorite }
}
