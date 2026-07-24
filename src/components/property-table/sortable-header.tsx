import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SortableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={onClick}>
      {label}
      <ArrowUpDown data-icon="inline-end" className="opacity-50" />
    </Button>
  )
}
