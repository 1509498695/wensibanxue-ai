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
    <main className="app-shell">
      <Sidebar activePage={activePage} onPageChange={onPageChange} />
      <section className="main-layout">
        <TopBar />
        <div className="page-content">{children}</div>
      </section>
    </main>
  )
}

export default AppLayout
