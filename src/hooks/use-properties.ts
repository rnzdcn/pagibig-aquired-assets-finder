import { useQuery } from '@tanstack/react-query'
import { getProperties } from '@/api/properties'
import { isSearchReady, type PropertyFilters } from '@/types/filters'

interface UsePropertiesOptions {
  /** Polling interval in ms for the new-listings watch. `false` disables polling. */
  refetchInterval?: number | false
}

export function useProperties(filters: PropertyFilters, options: UsePropertiesOptions = {}) {
  const ready = isSearchReady(filters)

  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => getProperties(filters),
    enabled: ready,
    staleTime: 60 * 1000,
    refetchInterval: options.refetchInterval ?? false,
    refetchIntervalInBackground: true,
  })
}
