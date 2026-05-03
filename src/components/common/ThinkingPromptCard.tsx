import { GraduationCap, Lightbulb } from 'lucide-react'
import type { ResultTextItem } from '../../types/results'
import { DEFAULT_THINKING_PROMPTS } from '../../utils/learningGuidance'
import { textFromItem } from '../../utils/resultText'

type ThinkingPromptCardProps = {
  prompts?: ResultTextItem[]
  variant?: 'warm' | 'blue'
}

function ThinkingPromptCard({ prompts, variant = 'warm' }: ThinkingPromptCardProps) {
  const items = Array.isArray(prompts) ? prompts.map(textFromItem).filter(Boolean) : []
  const visibleItems = items.length > 0 ? items : DEFAULT_THINKING_PROMPTS
  const Icon = variant === 'blue' ? GraduationCap : Lightbulb

  return (
    <article className={`thinking-prompt-card is-${variant}`}>
      <div className="thinking-prompt-title">
        <span>
          <Icon size={18} />
        </span>
        <h2>继续思考</h2>
      </div>
      <ul>
        {visibleItems.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

export default ThinkingPromptCard
