// import { Heart, Search } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { ThemeToggle } from '@/components/theme-toggle'
// import { useFavorites } from '@/hooks/use-favorites'
// import { cn } from '@/lib/utils'
import type { Page } from '@/app-router'

interface NavbarProps {
  page: Page
  onNavigate: (page: Page) => void
}

export function Navbar({ onNavigate }: NavbarProps) {
  // const { favorites } = useFavorites()

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
        <button
          className="flex items-center gap-2.5 font-semibold"
          onClick={() => onNavigate('browse')}
        >
          <span className="flex shrink-0 items-center rounded-md  p-1">
            <img src="/pagibig-logo.webp" alt="Pag-IBIG Fund" className="h-6 w-auto" />
          </span>
          {/*<span className="hidden sm:inline">Acquired Assets Finder</span>*/}
          {/*<span className="sm:hidden">Assets Finder</span>*/}
        </button>

        <nav className="flex items-center gap-1">
          {/*<Button*/}
          {/*  variant={page === 'browse' ? 'secondary' : 'ghost'}*/}
          {/*  size="sm"*/}
          {/*  onClick={() => onNavigate('browse')}*/}
          {/*>*/}
          {/*  <Search data-icon="inline-start" />*/}
          {/*  <span className="hidden sm:inline">Browse</span>*/}
          {/*</Button>*/}
          {/*<Button*/}
          {/*  variant={page === 'favorites' ? 'secondary' : 'ghost'}*/}
          {/*  size="sm"*/}
          {/*  onClick={() => onNavigate('favorites')}*/}
          {/*  className="relative"*/}
          {/*>*/}
          {/*  <Heart data-icon="inline-start" className={cn(page === 'favorites' && 'fill-current')} />*/}
          {/*  <span className="hidden sm:inline">Favorites</span>*/}
          {/*  {favorites.length > 0 && (*/}
          {/*    <Badge variant="secondary" className="ml-1">*/}
          {/*      {favorites.length}*/}
          {/*    </Badge>*/}
          {/*  )}*/}
          {/*</Button>*/}
          {/*<ThemeToggle />*/}
        </nav>
      </div>
    </header>
  )
}
