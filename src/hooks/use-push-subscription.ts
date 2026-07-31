import { useCallback, useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    Boolean(VAPID_PUBLIC_KEY)
  )
}

/** Subscribes this browser to the daily 8am push alert — persists across tab/browser close, unlike use-new-listing-watch. */
export function usePushSubscription() {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!pushSupported()) return
    navigator.serviceWorker.getRegistration('/sw.js').then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription()
      setSubscribed(Boolean(subscription))
    })
  }, [])

  const subscribe = useCallback(async () => {
    if (!pushSupported()) return
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const registration = await navigator.serviceWorker.register('/sw.js')
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
        }))

      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })
      setSubscribed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      const subscription = await registration?.pushManager.getSubscription()
      await subscription?.unsubscribe()
      await fetch('/api/push-subscribe', { method: 'DELETE' })
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }, [])

  return { supported: pushSupported(), subscribed, loading, subscribe, unsubscribe }
}
