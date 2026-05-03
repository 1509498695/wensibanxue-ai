import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import type { PageKey } from './navItems'
import TopBar from './TopBar'

type AppLayoutProps = {
  activePage: PageKey
  children: ReactNode
  onPageChange: (page: PageKey) => void
}

function AppLayout({ activePage, children, onPageChange }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onPageChange={onPageChange} />
      <main className="app-main main-layout">
        <TopBar />
        <div className="page-scroll">
          <div className="page-container page-content">{children}</div>
        </div>
      </main>
    </div>
  )
}

export default AppLayout
