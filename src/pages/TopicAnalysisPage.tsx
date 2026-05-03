import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  AlertTriangle,
  ClipboardCopy,
  FileSearch,
  PenLine,
  Route,
  SearchCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import RefineActionBar, { type RefineActionItem } from '../components/common/RefineActionBar'
import ExportMenu from '../components/common/ExportMenu'
import PageHero from '../components/common/PageHero'
import ThinkingPromptCard from '../components/common/ThinkingPromptCard'
import { TopicAnalysisCards } from '../components/results/StructuredResultCards'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildTopicAnalysisPrompt } from '../services/prompts'
import { buildTopicRefinePrompt, type TopicRefineAction } from '../services/refinePrompts'
import { addHistoryItem } from '../services/historyService'
import { parseModelJsonWithRepair } from '../services/jsonRepairService'
import { API_KEY_REQUIRED_NOTICE, DEMO_MODE_NOTICE, demoTopicAnalysisStructuredResult, getDemoTopicRefineResult } from '../services/demoContent'
import { getDemoMode, getStudentLearningMode } from '../services/settingsService'
import type { TopicAnalysisResult } from '../types/results'
import { exportResultFile } from '../utils/exportFile'
import type { ResultExportFormat } from '../utils/exportFormatter'
import { readLastTopicAnalysisState, writeLastTopicAnalysisState } from '../utils/lastPageState'
import { formatTopicAnalysisResult } from '../utils/resultText'

const depthOptions = ['基础', '深入', '高分']
const defaultInput = '阅读下面材料，根据要求写一篇不少于800字的议论文。材料主题为：责任与担当。'
const fallbackNotice = '模型返回格式不完全规范，已使用文本模式展示。'
const topicRefineActionItems: Array<RefineActionItem<TopicRefineAction>> = [
  { id: 'deepenIdeas', label: '立意更深刻', Icon: Sparkles },
  { id: 'lowerDifficulty', label: '降低难度', Icon: SlidersHorizontal },
  { id: 'addWarnings', label: '增加避坑提醒', Icon: AlertTriangle },
  { id: 'generateAngles', label: '生成写作角度', Icon: Route },
]

function TopicAnalysisPage() {
  const [initialPageState] = useState(() => readLastTopicAnalysisState())
  const [input, setInput] = useState(initialPageState.input || defaultInput)
  const [depth, setDepth] = useState(initialPageState.depth || '深入')
  const [resultText, setResultText] = useState(initialPageState.resultText || '')
  const [structuredResult, setStructuredResult] = useState<TopicAnalysisResult | null>(
    initialPageState.structuredResult || null,
  )
  const [isTextFallback, setIsTextFallback] = useState(Boolean(initialPageState.isTextFallback))
  const [lastGeneratedAt, setLastGeneratedAt] = useState(initialPageState.lastGeneratedAt || '')
  const [isLoading, setIsLoading] = useState(false)
  const [refiningAction, setRefiningAction] = useState<TopicRefineAction | null>(null)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const isBusy = isLoading || refiningAction !== null
  const studentLearningMode = getStudentLearningMode()

  useEffect(() => {
    writeLastTopicAnalysisState({ input, depth, resultText, structuredResult, isTextFallback, lastGeneratedAt })
  }, [depth, input, isTextFallback, lastGeneratedAt, resultText, structuredResult])

  const handleGenerate = async () => {
    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setError('请输入作文题目或材料')
      return
    }

    setIsLoading(true)
    setError('')
    setCopyStatus('')
    setIsTextFallback(false)

    if (getDemoMode()) {
      const output = formatTopicAnalysisResult(demoTopicAnalysisStructuredResult)

      setStructuredResult(demoTopicAnalysisStructuredResult)
      setResultText(output)
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'topic',
        mode: 'demo',
        title: trimmedInput.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedInput,
        output,
      })
      setCopyStatus(DEMO_MODE_NOTICE)
      setIsLoading(false)
      return
    }

    if (!getLLMConfig().apiKey) {
      setError(API_KEY_REQUIRED_NOTICE)
      setIsLoading(false)
      return
    }

    try {
      const content = await chatCompletion(buildTopicAnalysisPrompt(trimmedInput, { depth }))
      const parseResult = await parseModelJsonWithRepair<TopicAnalysisResult>(content)
      const parsedResult = parseResult.result
      const output = parsedResult ? formatTopicAnalysisResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '' : fallbackNotice)
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'topic',
        mode: 'api',
        title: trimmedInput.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedInput,
        output,
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '生成失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefine = async (action: TopicRefineAction) => {
    const trimmedInput = input.trim()
    const actionLabel = topicRefineActionItems.find((item) => item.id === action)?.label || '二次优化'

    if (!trimmedInput || !resultText) {
      setError('请先生成结果后再优化')
      return
    }

    setRefiningAction(action)
    setError('')
    setCopyStatus('')

    if (getDemoMode()) {
      const demoResult = getDemoTopicRefineResult(action)
      const output = formatTopicAnalysisResult(demoResult)

      setStructuredResult(demoResult)
      setResultText(output)
      setIsTextFallback(false)
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'topic',
        mode: 'demo',
        title: `${trimmedInput.replace(/\s+/g, ' ').slice(0, 18)} · ${actionLabel}`,
        input: trimmedInput,
        output,
      })
      setCopyStatus(`${DEMO_MODE_NOTICE} 优化完成。`)
      setRefiningAction(null)
      return
    }

    if (!getLLMConfig().apiKey) {
      setError(API_KEY_REQUIRED_NOTICE)
      setRefiningAction(null)
      return
    }

    try {
      const content = await chatCompletion(
        buildTopicRefinePrompt({
          originalInput: trimmedInput,
          currentResult: structuredResult,
          currentText: resultText,
          action,
        }),
      )
      const parseResult = await parseModelJsonWithRepair<TopicAnalysisResult>(content)
      const parsedResult = parseResult.result
      const output = parsedResult ? formatTopicAnalysisResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '优化完成' : fallbackNotice)
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'topic',
        mode: 'api',
        title: `${trimmedInput.replace(/\s+/g, ' ').slice(0, 18)} · ${actionLabel}`,
        input: trimmedInput,
        output,
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '优化失败，请稍后重试')
    } finally {
      setRefiningAction(null)
    }
  }

  const handleCopy = async () => {
    if (!resultText) {
      return
    }

    try {
      await navigator.clipboard.writeText(resultText)
      setCopyStatus('已复制生成结果')
    } catch {
      setError('复制失败，请手动复制')
    }
  }

  const handleExport = async (format: ResultExportFormat) => {
    if (!resultText) {
      return
    }

    try {
      const result = await exportResultFile(format, '审题立意分析', {
          typeLabel: '审题立意助手',
          title: input.trim().replace(/\s+/g, ' ').slice(0, 24) || '审题立意分析',
          input: input.trim(),
          output: resultText,
        })

      if (!result.canceled) {
        setCopyStatus('导出成功')
      }
    } catch {
      setError('导出失败，请稍后重试')
    }
  }

  return (
    <div className="topic-page">
      <PageHero
        className="topic-header"
        icon={<FileSearch size={34} strokeWidth={2.1} />}
        subtitle="精准分析作文题目，提炼核心概念，帮你找到更稳妥、更深刻的立意方向。"
        title="审题立意助手"
        tone="blue"
        variant="topic"
      />

      <section className="topic-input-card glass-card app-card app-input-panel">
        <div className="card-title">
          <span className="small-title-icon is-blue">
            <PenLine size={19} />
          </span>
          作文题目 / 材料
        </div>
        <div className="topic-textarea-wrap app-textarea-field">
          <textarea
            aria-label="作文题目或材料"
            className="topic-textarea"
            onChange={(event) => setInput(event.target.value)}
            value={input}
          />
        </div>
        <div className="input-meta-row">
          <span>建议输入题目、材料或关键词。</span>
          <span>{input.length} / 500</span>
        </div>

        <div className="topic-controls">
          <div className="control-group">
            <span className="control-label">
              <SearchCheck size={21} />
              分析深度：
            </span>
            <div className="chip-group" aria-label="分析深度选择">
              {depthOptions.map((option) => (
                <button
                  className={`chip${depth === option ? ' is-active' : ''}`}
                  key={option}
                  onClick={() => setDepth(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`gradient-button topic-analyze-button${isLoading ? ' button-loading' : ''}`}
            disabled={isBusy}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Sparkles size={20} />}
            {isLoading ? '分析中...' : resultText ? '重新分析' : '开始分析'}
          </button>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      <div className="result-actions app-action-bar">
        <button className="secondary-button" disabled={!resultText} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制分析
        </button>
        <ExportMenu disabled={!resultText} label="导出结果" onExport={handleExport} />
      </div>

      {resultText ? (
        <RefineActionBar
          actions={topicRefineActionItems}
          activeAction={refiningAction}
          disabled={isBusy}
          onAction={handleRefine}
        />
      ) : null}

      {structuredResult ? (
        <TopicAnalysisCards onFavoriteStatus={setCopyStatus} result={structuredResult} />
      ) : resultText ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-blue">
              <SearchCheck size={19} />
            </span>
            AI 审题分析
          </div>
          {isTextFallback ? <p className="inline-success">{fallbackNotice}</p> : null}
          <div className="markdown-body">
            <ReactMarkdown>{resultText}</ReactMarkdown>
          </div>
        </article>
      ) : (
        <TopicAnalysisCards onFavoriteStatus={setCopyStatus} result={demoTopicAnalysisStructuredResult} />
      )}

      {studentLearningMode && resultText ? <ThinkingPromptCard prompts={structuredResult?.thinkingPrompts} /> : null}
    </div>
  )
}

export default TopicAnalysisPage
