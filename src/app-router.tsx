import { useCallback, useEffect, useState } from 'react'

export type Page = 'browse' | 'favorites'

function readPage(): Page {
  return window.location.hash === '#favorites' ? 'favorites' : 'browse'
}

/** Minimal two-page router synced to the URL hash — no client router needed for this app's scope. */
export function usePageRouter() {
  const [page, setPage] = useState<Page>(readPage)

  useEffect(() => {
    const onHashChange = () => setPage(readPage())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((next: Page) => {
    window.location.hash = next === 'browse' ? '' : next
    setPage(next)
  }, [])

  return { page, navigate }
}
