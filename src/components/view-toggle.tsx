import { LayoutGrid, Table2 } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface ViewToggleProps {
  value: 'table' | 'cards'
  onChange: (value: 'table' | 'cards') => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(next) => next && onChange(next as 'table' | 'cards')}
    >
      <ToggleGroupItem value="table" aria-label="Table view">
        <Table2 data-icon="inline-start" />
        Table
      </ToggleGroupItem>
      <ToggleGroupItem value="cards" aria-label="Card view">
        <LayoutGrid data-icon="inline-start" />
        Cards
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
