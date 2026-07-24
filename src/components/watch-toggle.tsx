import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface WatchToggleProps {
  enabled: boolean
  disabled?: boolean
  onToggle: () => void
}

export function WatchToggle({ enabled, disabled, onToggle }: WatchToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={enabled ? 'secondary' : 'outline'} size="sm" disabled={disabled} onClick={onToggle}>
          {enabled ? <BellRing data-icon="inline-start" /> : <Bell data-icon="inline-start" />}
          {enabled ? 'Watching' : 'Watch'}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {enabled
          ? 'Watching this city for new listings — checking every 5 minutes while this tab is open.'
          : 'Get notified here when new properties are listed in this city.'}
      </TooltipContent>
    </Tooltip>
  )
}
