import { Navbar } from '@/components/navbar'
import { PropertiesPage } from '@/pages/properties-page'
import { FavoritesPage } from '@/pages/favorites-page'
import { usePageRouter } from '@/app-router'

function App() {
  const { page, navigate } = usePageRouter()

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <Navbar page={page} onNavigate={navigate} />
      {page === 'browse' ? <PropertiesPage /> : <FavoritesPage />}
    </div>
  )
}

export default App
