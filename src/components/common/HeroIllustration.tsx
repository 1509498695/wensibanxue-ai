export type HeroIllustrationVariant =
  | 'home'
  | 'workflow'
  | 'topic'
  | 'argument'
  | 'material'
  | 'diagnosis'
  | 'about'

type HeroIllustrationProps = {
  className?: string
  size?: 'hero' | 'compact'
  variant: HeroIllustrationVariant
}

const heroMap: Record<HeroIllustrationVariant, string> = {
  home: new URL('../../assets/hero/hero-home.png', import.meta.url).href,
  workflow: new URL('../../assets/hero/hero-workflow.png', import.meta.url).href,
  topic: new URL('../../assets/hero/hero-topic.png', import.meta.url).href,
  argument: new URL('../../assets/hero/hero-argument.png', import.meta.url).href,
  material: new URL('../../assets/hero/hero-material.png', import.meta.url).href,
  diagnosis: new URL('../../assets/hero/hero-diagnosis.png', import.meta.url).href,
  about: new URL('../../assets/hero/hero-about.png', import.meta.url).href,
}

function HeroIllustration({ className = '', size = 'compact', variant }: HeroIllustrationProps) {
  return (
    <div className={`hero-illustration is-${size} is-${variant} ${className}`.trim()} aria-hidden="true">
      <span className="hero-illustration__glow is-blue" />
      <span className="hero-illustration__glow is-purple" />
      <img alt="" className="hero-illustration__image" draggable={false} src={heroMap[variant]} />
    </div>
  )
}

export default HeroIllustration
