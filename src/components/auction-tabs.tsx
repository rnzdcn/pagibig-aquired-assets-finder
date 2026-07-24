import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { AuctionTypeFilter } from '@/types/filters'

const OPTIONS: { value: AuctionTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '1', label: 'First Auction' },
  { value: '2', label: 'Second Auction' },
  { value: '3', label: 'Negotiated Sale' },
]

interface AuctionTabsProps {
  value: AuctionTypeFilter
  onChange: (value: AuctionTypeFilter) => void
}

export function AuctionTabs({ value, onChange }: AuctionTabsProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(next) => next && onChange(next as AuctionTypeFilter)}
      className="flex-wrap"
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} className="text-xs sm:text-sm">
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
