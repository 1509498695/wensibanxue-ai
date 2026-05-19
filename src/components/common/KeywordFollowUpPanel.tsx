import ReactMarkdown from 'react-markdown'
import { HelpCircle, KeyRound, MessageSquareText, RefreshCw, SendHorizontal } from 'lucide-react'
import {
  keywordFollowUpQuestions,
  formatFollowUpKeywords,
  parseFollowUpKeywords,
  type KeywordFollowUpQuestionId,
} from '../../services/keywordFollowUp'

type KeywordFollowUpPanelProps = {
  answer: string
  askDisabledReason?: string
  canAsk?: boolean
  disabled?: boolean
  fullQuestion: string
  isLoading?: boolean
  keyword: string
  keywords: string[]
  onAsk: (questionId: KeywordFollowUpQuestionId) => void
  onKeywordChange: (keyword: string) => void
  onRegenerate: () => void
  questionId?: KeywordFollowUpQuestionId
  summaries: string[]
}

function uniqueKeywords(keywords: string[]) {
  return Array.from(new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean))).slice(0, 8)
}

function KeywordFollowUpPanel({
  answer,
  askDisabledReason,
  canAsk = true,
  disabled = false,
  fullQuestion,
  isLoading = false,
  keyword,
  keywords,
  onAsk,
  onKeywordChange,
  onRegenerate,
  questionId,
  summaries,
}: KeywordFollowUpPanelProps) {
  const recommendedKeywords = uniqueKeywords(keywords)
  const visibleSummaries = summaries.slice(0, 5)
  const selectedKeywords = parseFollowUpKeywords(keyword)
  const selectedKeywordSet = new Set(selectedKeywords)

  const handleKeywordChipClick = (item: string) => {
    const nextKeywords = selectedKeywordSet.has(item)
      ? selectedKeywords.filter((keywordItem) => keywordItem !== item)
      : [...selectedKeywords, item]

    onKeywordChange(formatFollowUpKeywords(nextKeywords))
  }

  return (
    <section className="keyword-follow-up-card glass-card" aria-label="关键词追问">
      <div className="card-title">
        <span className="small-title-icon is-teal">
          <MessageSquareText size={19} />
        </span>
        关键词追问
      </div>

      <div className="keyword-follow-up-grid">
        <label className="keyword-follow-up-field">
          <span>
            <KeyRound size={16} />
            输入关键词
          </span>
          <input
            className="keyword-follow-up-input"
            disabled={disabled}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="例如：责任、青年、时代"
            value={keyword}
          />
        </label>

        {recommendedKeywords.length > 0 ? (
          <div className="keyword-follow-up-keywords" aria-label="推荐关键词">
            <span className="keyword-follow-up-label">推荐关键词</span>
            <div className="keyword-follow-up-chip-list">
              {recommendedKeywords.map((item) => (
                <button
                  className={`keyword-chip${selectedKeywordSet.has(item) ? ' is-active' : ''}`}
                  disabled={disabled}
                  key={item}
                  onClick={() => handleKeywordChipClick(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="keyword-follow-up-questions">
        <span className="keyword-follow-up-label">
          <HelpCircle size={16} />
          选择追问
        </span>
        <div className="keyword-follow-up-question-list">
          {keywordFollowUpQuestions.map((question) => {
            const isActive = questionId === question.id
            const isQuestionLoading = isLoading && isActive
            const multipleKeywordsDisabled = Boolean(question.requiresMultipleKeywords && selectedKeywords.length < 2)
            const isDisabled =
              disabled || !canAsk || multipleKeywordsDisabled
            const label = question.hint ? `${question.label}（${question.hint}）` : question.label
            const disabledTitle = !canAsk
              ? askDisabledReason
              : multipleKeywordsDisabled
                ? '请至少选择或输入 2 个关键词'
                : undefined

            return (
              <button
                className={`keyword-question-button${isActive ? ' is-active' : ''}${isQuestionLoading ? ' is-loading' : ''}`}
                disabled={isDisabled}
                key={question.id}
                onClick={() => onAsk(question.id)}
                type="button"
                title={disabledTitle}
              >
                {isQuestionLoading ? <span className="loading-spinner" /> : <SendHorizontal size={15} />}
                {isQuestionLoading ? '追问中...' : label}
              </button>
            )
          })}
        </div>
      </div>

      {fullQuestion || answer ? (
        <div className="keyword-follow-up-result">
          {fullQuestion ? (
            <div className="keyword-follow-up-question-preview">
              <span>追问问题</span>
              <p>{fullQuestion}</p>
              {visibleSummaries.length > 0 ? (
                <div className="keyword-follow-up-summary">
                  <span>回答总结</span>
                  <div className="keyword-follow-up-summary-list">
                    {visibleSummaries.map((summary) => (
                      <strong key={summary}>{summary.slice(0, 20)}</strong>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {answer ? (
            <div className="keyword-follow-up-answer">
              <div className="keyword-follow-up-answer-header">
                <span>AI 回答</span>
                {questionId ? (
                  <button
                    className="keyword-follow-up-regenerate"
                    disabled={disabled || isLoading}
                    onClick={onRegenerate}
                    type="button"
                  >
                    {isLoading ? <span className="loading-spinner" /> : <RefreshCw size={15} />}
                    {isLoading ? '追问中...' : '重新生成'}
                  </button>
                ) : null}
              </div>
              <div className="markdown-body">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default KeywordFollowUpPanel
