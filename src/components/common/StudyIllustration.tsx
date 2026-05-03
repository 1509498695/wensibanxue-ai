type StudyIllustrationProps = {
  className?: string
  size?: 'hero' | 'compact'
}

function StudyIllustration({ className = '', size = 'hero' }: StudyIllustrationProps) {
  return (
    <div className={`hero-visual study-illustration study-illustration--${size} ${className}`.trim()} aria-hidden="true">
      <span className="hero-blob hero-blob--purple" />
      <span className="hero-blob hero-blob--blue" />
      <span className="hero-plant hero-plant--left" />
      <span className="hero-plant hero-plant--right" />
      <div className="study-stack">
        <span className="stack-book stack-book--blue" />
        <span className="stack-book stack-book--red" />
      </div>
      <div className="open-book-hero">
        <span className="open-book-hero__left" />
        <span className="open-book-hero__right" />
        <span className="open-book-hero__spine" />
        <span className="open-book-hero__pen" />
      </div>
    </div>
  )
}

export default StudyIllustration
