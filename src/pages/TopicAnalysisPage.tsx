import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  BrainCircuit,
  ClipboardCopy,
  KeyRound,
  Lightbulb,
  PenLine,
  RefreshCw,
  SendHorizontal,
  Sparkles,
} from 'lucide-react'
import ExportMenu from '../components/common/ExportMenu'
import PageHero from '../components/common/PageHero'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import {
  API_KEY_REQUIRED_NOTICE,
  DEMO_MODE_NOTICE,
} from '../services/demoContent'
import { getDemoMode } from '../services/settingsService'
import { addHistoryItem } from '../services/historyService'
import {
  buildDemoUpgradeThinkingAnswer,
  buildUpgradeThinkingDraftKey,
  buildUpgradeThinkingFullQuestion,
  buildUpgradeThinkingPrompt,
  createUpgradeThinkingDraft,
  getUpgradeThinkingQuestion,
  isUpgradeThinkingQuestionId,
  normalizeUpgradeThinkingDrafts,
  parseUpgradeThinkingResponse,
  type UpgradeThinkingQuestionId,
  upgradeThinkingQuestions,
  upsertUpgradeThinkingDraft,
} from '../services/upgradeThinking'
import { parseFollowUpKeywords } from '../services/keywordFollowUp'
import { exportResultFile } from '../utils/exportFile'
import type { ResultExportFormat } from '../utils/exportFormatter'
import {
  normalizeFollowUpSummaries,
  readLastArgumentGeneratorState,
  readLastTopicAnalysisState,
  writeLastTopicAnalysisState,
} from '../utils/lastPageState'

function uniqueKeywords(keywords: string[]) {
  return Array.from(new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean))).slice(0, 8)
}

function getSingleKeyword(value: string) {
  return parseFollowUpKeywords(value)[0] || ''
}

function composeUpgradeThinkingText(fullQuestion: string, viewpoints: string[], answer: string) {
  return [
    fullQuestion ? `## 思辨问题\n${fullQuestion}` : '',
    viewpoints.length > 0 ? `## 推荐观点\n${viewpoints.map((viewpoint) => `- ${viewpoint}`).join('\n')}` : '',
    answer ? `## AI 分析\n${answer}` : '',
  ].filter(Boolean).join('\n\n')
}

function TopicAnalysisPage() {
  const [initialPageState] = useState(() => readLastTopicAnalysisState())
  const [argumentPageState] = useState(() => readLastArgumentGeneratorState())
  const [keyword, setKeyword] = useState(() => getSingleKeyword(initialPageState.followUpKeyword || ''))
  const [questionId, setQuestionId] = useState<UpgradeThinkingQuestionId | undefined>(() =>
    isUpgradeThinkingQuestionId(initialPageState.followUpQuestionId) ? initialPageState.followUpQuestionId : undefined,
  )
  const [fullQuestion, setFullQuestion] = useState(initialPageState.followUpFullQuestion || '')
  const [answer, setAnswer] = useState(initialPageState.followUpAnswer || '')
  const [viewpoints, setViewpoints] = useState(() => normalizeFollowUpSummaries(initialPageState))
  const [drafts, setDrafts] = useState(() => normalizeUpgradeThinkingDrafts(initialPageState))
  const [isLoading, setIsLoading] = useState(false)
  const [lastGeneratedAt, setLastGeneratedAt] = useState(initialPageState.lastGeneratedAt || '')
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const recommendedKeywords = uniqueKeywords(argumentPageState.structuredResult?.analysis?.keywords || [])
  const selectedKeyword = getSingleKeyword(keyword)
  const argumentInput = argumentPageState.input || ''
  const argumentText = argumentPageState.resultText || ''

  useEffect(() => {
    writeLastTopicAnalysisState({
      input: argumentInput,
      resultText: answer,
      structuredResult: null,
      isTextFallback: false,
      lastGeneratedAt,
      followUpKeyword: selectedKeyword,
      followUpQuestionId: questionId,
      followUpFullQuestion: fullQuestion,
      followUpAnswer: answer,
      followUpSummaries: viewpoints,
      followUpDrafts: drafts,
    })
  }, [answer, argumentInput, drafts, fullQuestion, lastGeneratedAt, questionId, selectedKeyword, viewpoints])

  const clearCurrentResult = () => {
    setQuestionId(undefined)
    setFullQuestion('')
    setAnswer('')
    setViewpoints([])
  }

  const handleKeywordChange = (value: string) => {
    setKeyword(getSingleKeyword(value))
    clearCurrentResult()
  }

  const handleKeywordChipClick = (item: string) => {
    handleKeywordChange(selectedKeyword === item ? '' : item)
  }

  const handleAsk = async (nextQuestionId: UpgradeThinkingQuestionId, forceRegenerate = false) => {
    const activeKeyword = getSingleKeyword(keyword)
    const question = getUpgradeThinkingQuestion(nextQuestionId)
    const nextFullQuestion = activeKeyword ? buildUpgradeThinkingFullQuestion(activeKeyword, nextQuestionId) : ''
    const draftKey = buildUpgradeThinkingDraftKey(nextQuestionId, nextFullQuestion)

    if (!activeKeyword) {
      setError('请输入或选择一个关键词')
      return
    }

    const existingDraft = drafts.find((draft) => draft.key === draftKey)

    if (existingDraft && !forceRegenerate) {
      setQuestionId(existingDraft.questionId)
      setFullQuestion(existingDraft.fullQuestion)
      setAnswer(existingDraft.answer)
      setViewpoints(existingDraft.viewpoints)
      setError('')
      setCopyStatus('')
      return
    }

    setIsLoading(true)
    setQuestionId(nextQuestionId)
    setFullQuestion(nextFullQuestion)
    setAnswer('')
    setViewpoints([])
    setError('')
    setCopyStatus('')

    if (getDemoMode()) {
      const result = buildDemoUpgradeThinkingAnswer({
        fullQuestion: nextFullQuestion,
        keyword: activeKeyword,
        questionId: nextQuestionId,
      })
      const draft = createUpgradeThinkingDraft({
        answer: result.answer,
        fullQuestion: nextFullQuestion,
        keyword: activeKeyword,
        questionId: nextQuestionId,
        viewpoints: result.viewpoints,
      })

      setAnswer(result.answer)
      setViewpoints(result.viewpoints)
      setDrafts((currentDrafts) => upsertUpgradeThinkingDraft(currentDrafts, draft))
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'topic',
        mode: 'demo',
        title: `${activeKeyword.slice(0, 18)} · 升格思辨`,
        input: nextFullQuestion,
        output: result.answer,
      })
      setCopyStatus(`${DEMO_MODE_NOTICE} 思辨完成。`)
      setIsLoading(false)
      return
    }

    if (!getLLMConfig().apiKey) {
      setError(API_KEY_REQUIRED_NOTICE)
      setIsLoading(false)
      return
    }

    try {
      const content = await chatCompletion(
        buildUpgradeThinkingPrompt({
          argumentInput,
          argumentText,
          fullQuestion: nextFullQuestion,
          keyword: activeKeyword,
          questionText: question.questionText,
        }),
      )
      const result = parseUpgradeThinkingResponse(content)
      const draft = createUpgradeThinkingDraft({
        answer: result.answer,
        fullQuestion: nextFullQuestion,
        keyword: activeKeyword,
        questionId: nextQuestionId,
        viewpoints: result.viewpoints,
      })

      setAnswer(result.answer)
      setViewpoints(result.viewpoints)
      setDrafts((currentDrafts) => upsertUpgradeThinkingDraft(currentDrafts, draft))
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'topic',
        mode: 'api',
        title: `${activeKeyword.slice(0, 18)} · 升格思辨`,
        input: nextFullQuestion,
        output: result.answer,
      })
      setCopyStatus('思辨完成')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '生成失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = () => {
    if (questionId) {
      void handleAsk(questionId, true)
    }
  }

  const handleCopy = async () => {
    if (!answer) {
      return
    }

    try {
      await navigator.clipboard.writeText(composeUpgradeThinkingText(fullQuestion, viewpoints, answer))
      setCopyStatus('已复制升格思辨结果')
    } catch {
      setError('复制失败，请手动复制')
    }
  }

  const handleExport = async (format: ResultExportFormat) => {
    if (!answer) {
      return
    }

    try {
      const result = await exportResultFile(format, '升格思辨结果', {
        typeLabel: '升格思辨',
        title: fullQuestion.slice(0, 24) || '升格思辨结果',
        input: fullQuestion,
        output: composeUpgradeThinkingText(fullQuestion, viewpoints, answer),
      })

      if (!result.canceled) {
        setCopyStatus('导出成功')
      }
    } catch {
      setError('导出失败，请稍后重试')
    }
  }

  return (
    <div className="topic-page upgrade-thinking-page">
      <PageHero
        className="topic-header"
        icon={<BrainCircuit size={34} strokeWidth={2.1} />}
        subtitle="基于论点生成的关键词继续追问，训练利弊辨析、标准意识和更高级的思辨表达。"
        title="升格思辨"
        tone="blue"
        variant="topic"
      />

      <section className="keyword-follow-up-card glass-card upgrade-thinking-panel" aria-label="升格思辨">
        <div className="card-title">
          <span className="small-title-icon is-teal">
            <Sparkles size={19} />
          </span>
          关键词思辨
        </div>

        <div className="keyword-follow-up-grid">
          <label className="keyword-follow-up-field">
            <span>
              <KeyRound size={16} />
              输入关键词
            </span>
            <input
              className="keyword-follow-up-input"
              disabled={isLoading}
              onChange={(event) => handleKeywordChange(event.target.value)}
              placeholder="例如：责任"
              value={keyword}
            />
          </label>

          <div className="keyword-follow-up-keywords" aria-label="推荐关键词">
            <span className="keyword-follow-up-label">论点生成页关键词</span>
            {recommendedKeywords.length > 0 ? (
              <div className="keyword-follow-up-chip-list">
                {recommendedKeywords.map((item) => (
                  <button
                    className={`keyword-chip${selectedKeyword === item ? ' is-active' : ''}`}
                    disabled={isLoading}
                    key={item}
                    onClick={() => handleKeywordChipClick(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : (
              <p className="upgrade-thinking-note">未读取到论点生成关键词，可先在“论点生成”页生成结果，或在左侧手动输入关键词。</p>
            )}
          </div>
        </div>

        <div className="keyword-follow-up-questions">
          <span className="keyword-follow-up-label">
            <Lightbulb size={16} />
            选择思辨方向
          </span>
          <div className="keyword-follow-up-question-list">
            {upgradeThinkingQuestions.map((question) => {
              const isActive = questionId === question.id
              const isQuestionLoading = isLoading && isActive

              return (
                <button
                  className={`keyword-question-button${isActive ? ' is-active' : ''}${isQuestionLoading ? ' is-loading' : ''}`}
                  disabled={isLoading}
                  key={question.id}
                  onClick={() => handleAsk(question.id)}
                  type="button"
                >
                  {isQuestionLoading ? <span className="loading-spinner" /> : <SendHorizontal size={15} />}
                  {isQuestionLoading ? '思辨中...' : question.label}
                </button>
              )
            })}
          </div>
        </div>

        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      <div className="result-actions app-action-bar">
        <button className="secondary-button" disabled={!answer} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制结果
        </button>
        <ExportMenu disabled={!answer} label="导出结果" onExport={handleExport} />
      </div>

      {fullQuestion || answer ? (
        <section className="keyword-follow-up-result upgrade-thinking-result glass-card">
          {fullQuestion ? (
            <div className="keyword-follow-up-question-preview">
              <span>思辨问题</span>
              <p>{fullQuestion}</p>
              {viewpoints.length > 0 ? (
                <div className="keyword-follow-up-summary">
                  <span>推荐观点</span>
                  <div className="keyword-follow-up-summary-list">
                    {viewpoints.slice(0, 5).map((viewpoint) => (
                      <strong key={viewpoint}>{viewpoint.slice(0, 20)}</strong>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {answer ? (
            <div className="keyword-follow-up-answer">
              <div className="keyword-follow-up-answer-header">
                <span>AI 分析</span>
                {questionId ? (
                  <button className="keyword-follow-up-regenerate" disabled={isLoading} onClick={handleRegenerate} type="button">
                    {isLoading ? <span className="loading-spinner" /> : <RefreshCw size={15} />}
                    {isLoading ? '思辨中...' : '重新生成'}
                  </button>
                ) : null}
              </div>
              <div className="markdown-body">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="ai-result-card glass-card upgrade-thinking-empty">
          <div className="card-title">
            <span className="small-title-icon is-blue">
              <PenLine size={19} />
            </span>
            开始升格思辨
          </div>
          <p>选择或输入关键词后，围绕“利与弊”或“判断标准”继续追问，系统会给出推荐观点和可迁移的议论文分析。</p>
        </section>
      )}
    </div>
  )
}

export default TopicAnalysisPage
