import { http } from '@/lib/http'
import { normalizeLocation, type LocationOption, type RawLocation } from '@/types/location'

export async function getRegions(): Promise<LocationOption[]> {
  const data = await http.get('locations', { searchParams: { grpid: 1 } }).json<RawLocation[]>()
  return data.map(normalizeLocation)
}

export async function getProvinces(regionCode: string): Promise<LocationOption[]> {
  const data = await http
    .get('locations', { searchParams: { grpid: 2, regionid: regionCode } })
    .json<RawLocation[]>()
  return data.map(normalizeLocation)
}

export async function getCities(regionCode: string, provinceCode: string): Promise<LocationOption[]> {
  const data = await http
    .get('locations', { searchParams: { grpid: 3, regionid: regionCode, provinceid: provinceCode } })
    .json<RawLocation[]>()
  return data.map(normalizeLocation)
}
