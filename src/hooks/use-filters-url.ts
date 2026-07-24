import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_FILTERS, EMPTY_FILTERS, type PropertyFilters } from '@/types/filters'

export interface UrlState {
  filters: PropertyFilters
  search: string
  auction: 'all' | '1' | '2' | '3'
  view: 'table' | 'cards'
}

const DEFAULT_STATE: UrlState = {
  filters: DEFAULT_FILTERS,
  search: '',
  auction: 'all',
  view: 'table',
}

function decode(): UrlState {
  const params = new URLSearchParams(window.location.search)
  const num = (key: string): number | null => {
    const raw = params.get(key)
    if (raw === null || raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }

  return {
    filters: {
      regionCode: params.get('region'),
      regionName: params.get('regionName'),
      provinceCode: params.get('province'),
      provinceName: params.get('provinceName'),
      cityCode: params.get('city'),
      cityName: params.get('cityName'),
      propType: params.get('type'),
      occupancy: params.get('occ'),
      bidFrom: num('bidFrom') ?? EMPTY_FILTERS.bidFrom,
      bidTo: num('bidTo') ?? EMPTY_FILTERS.bidTo,
      lotFrom: num('lotFrom'),
      lotTo: num('lotTo'),
      floorFrom: num('floorFrom'),
      floorTo: num('floorTo'),
    },
    search: params.get('q') ?? '',
    auction: (params.get('auction') as UrlState['auction']) ?? 'all',
    view: (params.get('view') as UrlState['view']) ?? 'table',
  }
}

function encode(state: UrlState): string {
  const params = new URLSearchParams()
  const { filters } = state
  if (filters.regionCode) params.set('region', filters.regionCode)
  if (filters.regionName) params.set('regionName', filters.regionName)
  if (filters.provinceCode) params.set('province', filters.provinceCode)
  if (filters.provinceName) params.set('provinceName', filters.provinceName)
  if (filters.cityCode) params.set('city', filters.cityCode)
  if (filters.cityName) params.set('cityName', filters.cityName)
  if (filters.propType) params.set('type', filters.propType)
  if (filters.occupancy) params.set('occ', filters.occupancy)
  if (filters.bidFrom > 0) params.set('bidFrom', String(filters.bidFrom))
  if (filters.bidTo !== EMPTY_FILTERS.bidTo) params.set('bidTo', String(filters.bidTo))
  if (filters.lotFrom != null) params.set('lotFrom', String(filters.lotFrom))
  if (filters.lotTo != null) params.set('lotTo', String(filters.lotTo))
  if (filters.floorFrom != null) params.set('floorFrom', String(filters.floorFrom))
  if (filters.floorTo != null) params.set('floorTo', String(filters.floorTo))
  if (state.search) params.set('q', state.search)
  if (state.auction !== 'all') params.set('auction', state.auction)
  if (state.view !== 'table') params.set('view', state.view)
  return params.toString()
}

/** Keeps filter/search/view state mirrored into the URL query string for shareable links. */
export function useFiltersUrl() {
  const [state, setState] = useState<UrlState>(() =>
    window.location.search ? decode() : DEFAULT_STATE,
  )

  useEffect(() => {
    const query = encode(state)
    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname
    window.history.replaceState(null, '', next)
  }, [state])

  const update = useCallback((patch: Partial<UrlState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  return { state, setState, update }
}
