import type { AuctionType } from './property'

export interface PropertyFilters {
  regionCode: string | null
  regionName: string | null
  provinceCode: string | null
  provinceName: string | null
  cityCode: string | null
  cityName: string | null
  propType: string | null
  occupancy: string | null
  bidFrom: number
  bidTo: number
  lotFrom: number | null
  lotTo: number | null
  floorFrom: number | null
  floorTo: number | null
}

export const EMPTY_FILTERS: PropertyFilters = {
  regionCode: null,
  regionName: null,
  provinceCode: null,
  provinceName: null,
  cityCode: null,
  cityName: null,
  propType: null,
  occupancy: null,
  bidFrom: 0,
  bidTo: 0,
  lotFrom: null,
  lotTo: null,
  floorFrom: null,
  floorTo: null,
}

/** Preselected on first load so the app opens with results instead of an empty prompt. */
export const DEFAULT_FILTERS: PropertyFilters = {
  ...EMPTY_FILTERS,
  regionCode: '040000000',
  regionName: 'REGION 4-A (CALABARZON)',
  provinceCode: '042100000',
  provinceName: 'CAVITE',
  cityCode: '042106000',
  cityName: 'CITY OF DASMARIÑAS',
}

export type AuctionTypeFilter = 'all' | AuctionType

export function isSearchReady(filters: PropertyFilters): boolean {
  return Boolean(filters.regionCode && filters.provinceCode && filters.cityCode)
}
