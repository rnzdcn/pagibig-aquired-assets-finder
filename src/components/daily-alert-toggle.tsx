import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface DailyAlertToggleProps {
  supported: boolean
  subscribed: boolean
  loading: boolean
  onToggle: () => void
}

export function DailyAlertToggle({ supported, subscribed, loading, onToggle }: DailyAlertToggleProps) {
  if (!supported) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={subscribed ? 'secondary' : 'outline'} size="sm" disabled={loading} onClick={onToggle}>
          {subscribed ? <BellRing data-icon="inline-start" /> : <Bell data-icon="inline-start" />}
          {subscribed ? 'Daily alert on' : 'Daily alert'}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {subscribed
          ? 'Push notification every day at 8am PHT — arrives even with this app fully closed.'
          : 'Get a push notification every day at 8am PHT, even with this app fully closed.'}
      </TooltipContent>
    </Tooltip>
  )
}
