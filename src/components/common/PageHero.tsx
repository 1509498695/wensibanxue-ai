import type { ReactNode } from 'react'
import HeroIllustration, { type HeroIllustrationVariant } from './HeroIllustration'

type PageHeroTone = 'blue' | 'purple' | 'teal' | 'orange' | 'indigo'

type PageHeroProps = {
  children?: ReactNode
  className?: string
  icon: ReactNode
  illustrationSize?: 'hero' | 'compact'
  subtitle: ReactNode
  title: ReactNode
  tone?: PageHeroTone
  variant: HeroIllustrationVariant
}

function PageHero({
  children,
  className = '',
  icon,
  illustrationSize = 'compact',
  subtitle,
  title,
  tone = 'blue',
  variant,
}: PageHeroProps) {
  return (
    <section className={`page-hero is-${tone} ${className}`.trim()}>
      <div className="page-hero__content">
        <span className="page-hero__icon" aria-hidden="true">
          {icon}
        </span>
        <div className="page-hero__copy">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children ? <div className="page-hero__extra">{children}</div> : null}
        </div>
      </div>
      <div className="page-hero__aside">
        <HeroIllustration size={illustrationSize} variant={variant} />
      </div>
    </section>
  )
}

export default PageHero
