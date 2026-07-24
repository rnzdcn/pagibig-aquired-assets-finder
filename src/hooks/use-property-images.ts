import { useQuery } from '@tanstack/react-query'
import { getPropertyImages } from '@/api/images'

export function usePropertyImages(ropaId: string | null, carousel = false) {
  return useQuery({
    queryKey: ['property-images', ropaId, carousel],
    queryFn: () => getPropertyImages(ropaId as string, carousel),
    enabled: Boolean(ropaId),
    staleTime: 10 * 60 * 1000,
  })
}
