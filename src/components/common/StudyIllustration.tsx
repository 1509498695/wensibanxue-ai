type StudyIllustrationProps = {
  className?: string
}

function StudyIllustration({ className = '' }: StudyIllustrationProps) {
  return (
    <div className={`hero-visual ${className}`.trim()} aria-hidden="true">
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
