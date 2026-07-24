import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  active: boolean
  onToggle: () => void
  className?: string
}

export function FavoriteButton({ active, onToggle, className }: FavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('size-8 text-muted-foreground hover:text-rose-500', className)}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      <Heart className={cn(active && 'fill-rose-500 text-rose-500')} />
    </Button>
  )
}
