import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useLocalStorage } from './use-local-storage'
import type { Property } from '@/types/property'

export const WATCH_POLL_MS = 5 * 60 * 1000

interface SeenState {
  cityCode: string | null
  seenIds: string[]
}

const DEFAULT_SEEN_STATE: SeenState = { cityCode: null, seenIds: [] }
const STORAGE_KEY = 'pagibig-copa:new-listing-watch-seen'

function notifySupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

interface UseNewListingWatchOptions {
  enabled: boolean
  cityCode: string | null
  cityName: string | null
  data: Property[] | undefined
}

/** Polls the active search (via refetchInterval on useProperties) and alerts on newly-appeared listings. */
export function useNewListingWatch({ enabled, cityCode, cityName, data }: UseNewListingWatchOptions) {
  const [seen, setSeen] = useLocalStorage<SeenState>(STORAGE_KEY, DEFAULT_SEEN_STATE)
  const isFirstRunForCity = useRef(true)

  useEffect(() => {
    if (!enabled || !data || !cityCode) return

    // New city (or first activation) — snapshot the baseline instead of treating every
    // existing listing as "new".
    if (seen.cityCode !== cityCode) {
      isFirstRunForCity.current = true
      setSeen({ cityCode, seenIds: data.map((p) => p.id) })
      return
    }

    const seenIds = new Set(seen.seenIds)
    const newListings = data.filter((p) => !seenIds.has(p.id))

    if (newListings.length > 0) {
      if (!isFirstRunForCity.current) {
        const description =
          newListings.length === 1
            ? `${newListings[0].propertyType} — ${newListings[0].batchNo}`
            : `${newListings.length} new properties, including ${newListings[0].propertyType}`

        toast.success('New listing found', { description })

        if (notifySupported() && Notification.permission === 'granted') {
          const notification = new Notification('New Pag-IBIG listing', {
            body: cityName ? `${description} in ${cityName}` : description,
            icon: '/favicon.svg',
          })
          notification.onclick = () => window.focus()
        }
      }
      setSeen({ cityCode, seenIds: data.map((p) => p.id) })
    }

    isFirstRunForCity.current = false
  }, [enabled, data, cityCode, cityName, seen.cityCode, seen.seenIds, setSeen])
}

export async function requestNotificationPermission() {
  if (notifySupported() && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}
