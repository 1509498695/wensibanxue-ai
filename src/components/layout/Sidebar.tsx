import { BookOpen, Feather, Sparkles } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import type { PageKey } from './navItems'

type SidebarProps = {
  activePage: PageKey
  onPageChange: (page: PageKey) => void
}

function Sidebar({ activePage, onPageChange }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="主导航">
      <div className="sidebar-brand">
        <div className="brand-logo" aria-hidden="true">
          <BookOpen className="brand-book" size={42} strokeWidth={2.2} />
          <Feather className="brand-feather" size={34} strokeWidth={2.1} />
          <Sparkles className="brand-spark" size={17} strokeWidth={2.5} />
        </div>
        <div className="brand-title">
          文思伴学 <span>AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            aria-current={activePage === key ? 'page' : undefined}
            className={`sidebar-link${activePage === key ? ' is-active' : ''}`}
            key={key}
            onClick={() => onPageChange(key)}
            type="button"
          >
            <Icon size={23} strokeWidth={2.2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-quote">文以载道，思辨致远</p>
        <div className="book-decor" aria-hidden="true">
          <span className="book-decor__glow" />
          <span className="book-decor__left-page" />
          <span className="book-decor__right-page" />
          <span className="book-decor__base" />
          <span className="book-decor__pen" />
          <span className="book-decor__leaf book-decor__leaf--one" />
          <span className="book-decor__leaf book-decor__leaf--two" />
          <span className="book-decor__leaf book-decor__leaf--three" />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
