import { useQuery } from '@tanstack/react-query'
import { getCities, getProvinces, getRegions } from '@/api/locations'

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
    staleTime: 30 * 60 * 1000,
  })
}

export function useProvinces(regionCode: string | null) {
  return useQuery({
    queryKey: ['provinces', regionCode],
    queryFn: () => getProvinces(regionCode as string),
    enabled: Boolean(regionCode),
    staleTime: 30 * 60 * 1000,
  })
}

export function useCities(regionCode: string | null, provinceCode: string | null) {
  return useQuery({
    queryKey: ['cities', regionCode, provinceCode],
    queryFn: () => getCities(regionCode as string, provinceCode as string),
    enabled: Boolean(regionCode && provinceCode),
    staleTime: 30 * 60 * 1000,
  })
}
