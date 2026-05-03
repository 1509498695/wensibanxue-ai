import type { ReactNode } from 'react'
import StudyIllustration from './StudyIllustration'

type PageHeaderTone = 'blue' | 'purple' | 'teal' | 'orange' | 'indigo'

type PageHeaderProps = {
  actions?: ReactNode
  className?: string
  icon: ReactNode
  illustration?: boolean
  subtitle: string
  title: string
  tone?: PageHeaderTone
}

function PageHeader({
  actions,
  className = '',
  icon,
  illustration = true,
  subtitle,
  title,
  tone = 'blue',
}: PageHeaderProps) {
  return (
    <header className={`app-page-header is-${tone} ${className}`.trim()}>
      <div className="app-page-header__copy">
        <span className="app-page-header__icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="app-page-header__aside">
        {actions}
        {illustration ? <StudyIllustration className="app-page-header__illustration" size="compact" /> : null}
      </div>
    </header>
  )
}

export default PageHeader
