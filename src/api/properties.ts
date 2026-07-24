import { http } from '@/lib/http'
import { normalizeProperty, type Property, type RawProperty } from '@/types/property'
import type { PropertyFilters } from '@/types/filters'

interface PropertiesResponse {
  data: RawProperty[]
}

export async function getProperties(filters: PropertyFilters): Promise<Property[]> {
  if (!filters.regionCode || !filters.provinceCode || !filters.cityName) {
    return []
  }

  const searchParams: Record<string, string> = {
    region: filters.regionCode,
    province: filters.provinceCode,
    city_muni: filters.cityName,
    prop_type: filters.propType ?? '',
    occupancy: filters.occupancy ?? '',
    range_from: filters.bidFrom > 0 ? String(filters.bidFrom) : '',
    range_to: filters.bidTo > 0 ? String(filters.bidTo) : '',
    lot_from: filters.lotFrom != null ? String(filters.lotFrom) : '',
    lot_to: filters.lotTo != null ? String(filters.lotTo) : '',
    floor_from: filters.floorFrom != null ? String(filters.floorFrom) : '',
    floor_to: filters.floorTo != null ? String(filters.floorTo) : '',
  }

  const response = await http.get('properties', { searchParams }).json<PropertiesResponse>()
  return response.data.map(normalizeProperty)
}
