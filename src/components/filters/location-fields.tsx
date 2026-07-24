import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldLabel } from '@/components/ui/field'
import { useCities, useProvinces, useRegions } from '@/hooks/use-locations'
import type { PropertyFilters } from '@/types/filters'
import { Skeleton } from '@/components/ui/skeleton'

interface LocationFieldsProps {
  filters: PropertyFilters
  onChange: (filters: PropertyFilters) => void
}

export function LocationFields({ filters, onChange }: LocationFieldsProps) {
  const regions = useRegions()
  const provinces = useProvinces(filters.regionCode)
  const cities = useCities(filters.regionCode, filters.provinceCode)

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="region-select">Region</FieldLabel>
        {regions.isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <Select
            value={filters.regionCode ?? undefined}
            onValueChange={(value) => {
              const region = regions.data?.find((r) => r.code === value)
              onChange({
                ...filters,
                regionCode: value,
                regionName: region?.name ?? null,
                provinceCode: null,
                provinceName: null,
                cityCode: null,
                cityName: null,
              })
            }}
          >
            <SelectTrigger id="region-select" className="w-full">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {regions.data?.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="province-select">Province</FieldLabel>
        <Select
          disabled={!filters.regionCode || provinces.isLoading}
          value={filters.provinceCode ?? undefined}
          onValueChange={(value) => {
            const province = provinces.data?.find((p) => p.code === value)
            onChange({
              ...filters,
              provinceCode: value,
              provinceName: province?.name ?? null,
              cityCode: null,
              cityName: null,
            })
          }}
        >
          <SelectTrigger id="province-select" className="w-full">
            <SelectValue placeholder="Select Province" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {provinces.data?.map((province) => (
                <SelectItem key={province.code} value={province.code}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor="city-select">City / Municipality</FieldLabel>
        <Select
          disabled={!filters.provinceCode || cities.isLoading}
          value={filters.cityCode ?? undefined}
          onValueChange={(value) => {
            const city = cities.data?.find((c) => c.code === value)
            onChange({
              ...filters,
              cityCode: value,
              cityName: city?.name.trim() ?? null,
            })
          }}
        >
          <SelectTrigger id="city-select" className="w-full">
            <SelectValue placeholder="Select City/Municipality" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {cities.data?.map((city) => (
                <SelectItem key={city.code} value={city.code}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}
