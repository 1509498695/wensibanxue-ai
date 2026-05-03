import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  ArrowUpRight,
  BookOpenCheck,
  ClipboardCopy,
  Lightbulb,
  ListChecks,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react'
import RefineActionBar, { type RefineActionItem } from '../components/common/RefineActionBar'
import ExportMenu from '../components/common/ExportMenu'
import PageHero from '../components/common/PageHero'
import ThinkingPromptCard from '../components/common/ThinkingPromptCard'
import { ArgumentGeneratorCards } from '../components/results/StructuredResultCards'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildArgumentGeneratorPrompt } from '../services/prompts'
import { buildArgumentRefinePrompt, type ArgumentRefineAction } from '../services/refinePrompts'
import { addHistoryItem } from '../services/historyService'
import { parseModelJsonWithRepair } from '../services/jsonRepairService'
import {
  API_KEY_REQUIRED_NOTICE,
  DEMO_MODE_NOTICE,
  demoArgumentGeneratorStructuredResult,
  getDemoArgumentRefineResult,
} from '../services/demoContent'
import { getDemoMode, getStudentLearningMode } from '../services/settingsService'
import type { ArgumentGeneratorResult } from '../types/results'
import { exportResultFile } from '../utils/exportFile'
import type { ResultExportFormat } from '../utils/exportFormatter'
import { readLastArgumentGeneratorState, writeLastArgumentGeneratorState } from '../utils/lastPageState'
import { formatArgumentGeneratorResult } from '../utils/resultText'

const difficultyOptions = ['基础', '提升', '高分']
const defaultInput = '阅读下面材料，以“青年与时代”为主题写一篇议论文。'
const fallbackNotice = '模型返回格式不完全规范，已使用文本模式展示。'
const argumentRefineActionItems: Array<RefineActionItem<ArgumentRefineAction>> = [
  { id: 'deepenArguments', label: '深化论点', Icon: ArrowUpRight },
  { id: 'replaceArguments', label: '换一组论点', Icon: RefreshCw },
  { id: 'generateOutline', label: '生成作文大纲', Icon: ListChecks },
  { id: 'matchMaterials', label: '匹配更多素材', Icon: BookOpenCheck },
]

function ArgumentGeneratorPage() {
  const [initialPageState] = useState(() => readLastArgumentGeneratorState())
  const [input, setInput] = useState(initialPageState.input || defaultInput)
  const [difficulty, setDifficulty] = useState(initialPageState.difficulty || '提升')
  const [resultText, setResultText] = useState(initialPageState.resultText || '')
  const [structuredResult, setStructuredResult] = useState<ArgumentGeneratorResult | null>(
    initialPageState.structuredResult || null,
  )
  const [isTextFallback, setIsTextFallback] = useState(Boolean(initialPageState.isTextFallback))
  const [lastGeneratedAt, setLastGeneratedAt] = useState(initialPageState.lastGeneratedAt || '')
  const [isLoading, setIsLoading] = useState(false)
  const [refiningAction, setRefiningAction] = useState<ArgumentRefineAction | null>(null)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const isBusy = isLoading || refiningAction !== null
  const studentLearningMode = getStudentLearningMode()

  useEffect(() => {
    writeLastArgumentGeneratorState({
      input,
      difficulty,
      resultText,
      structuredResult,
      isTextFallback,
      lastGeneratedAt,
    })
  }, [difficulty, input, isTextFallback, lastGeneratedAt, resultText, structuredResult])

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
      const output = formatArgumentGeneratorResult(demoArgumentGeneratorStructuredResult)

      setStructuredResult(demoArgumentGeneratorStructuredResult)
      setResultText(output)
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'argument',
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
      const content = await chatCompletion(buildArgumentGeneratorPrompt(trimmedInput, { difficulty }))
      const parseResult = await parseModelJsonWithRepair<ArgumentGeneratorResult>(content)
      const parsedResult = parseResult.result
      const output = parsedResult ? formatArgumentGeneratorResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '' : fallbackNotice)
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'argument',
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

  const handleRefine = async (action: ArgumentRefineAction) => {
    const trimmedInput = input.trim()
    const actionLabel = argumentRefineActionItems.find((item) => item.id === action)?.label || '二次优化'

    if (!trimmedInput || !resultText) {
      setError('请先生成结果后再优化')
      return
    }

    setRefiningAction(action)
    setError('')
    setCopyStatus('')

    if (getDemoMode()) {
      const demoResult = getDemoArgumentRefineResult(action)
      const output = formatArgumentGeneratorResult(demoResult)

      setStructuredResult(demoResult)
      setResultText(output)
      setIsTextFallback(false)
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'argument',
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
        buildArgumentRefinePrompt({
          originalInput: trimmedInput,
          currentResult: structuredResult,
          currentText: resultText,
          action,
        }),
      )
      const parseResult = await parseModelJsonWithRepair<ArgumentGeneratorResult>(content)
      const parsedResult = parseResult.result
      const output = parsedResult ? formatArgumentGeneratorResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '优化完成' : fallbackNotice)
      setLastGeneratedAt(new Date().toISOString())
      addHistoryItem({
        type: 'argument',
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
      const result = await exportResultFile(format, '论点生成结果', {
          typeLabel: '议论文论点生成器',
          title: input.trim().replace(/\s+/g, ' ').slice(0, 24) || '论点生成结果',
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
    <div className="argument-page">
      <PageHero
        className="argument-header"
        icon={<Lightbulb size={34} strokeWidth={2.1} />}
        subtitle="多角度生成优质论点，帮助你构建清晰有力的论证框架。"
        title="议论文论点生成器"
        tone="purple"
        variant="argument"
      />

      <section className="argument-input-card glass-card app-card app-input-panel">
        <div className="card-title">
          <span className="small-title-icon">
            <PenLine size={19} />
          </span>
          作文题目 / 材料
        </div>
        <div className="argument-textarea-wrap app-textarea-field">
          <textarea
            aria-label="作文题目或材料"
            className="argument-textarea"
            onChange={(event) => setInput(event.target.value)}
            value={input}
          />
        </div>
        <div className="input-meta-row">
          <span>输入题目、材料或写作主题。</span>
          <span>{input.length} / 500</span>
        </div>

        <div className="argument-controls">
          <div className="control-group">
            <span className="control-label">
              <Sparkles size={21} />
              难度：
            </span>
            <div className="chip-group" aria-label="难度选择">
              {difficultyOptions.map((option) => (
                <button
                  className={`chip${difficulty === option ? ' is-active' : ''}`}
                  key={option}
                  onClick={() => setDifficulty(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`gradient-button generate-button${isLoading ? ' button-loading' : ''}`}
            disabled={isBusy}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Sparkles size={20} />}
            {isLoading ? '生成中...' : resultText ? '重新生成' : '开始生成'}
          </button>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      <div className="result-actions app-action-bar">
        <button className="secondary-button" disabled={!resultText} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制结果
        </button>
        <ExportMenu disabled={!resultText} onExport={handleExport} />
      </div>

      {resultText ? (
        <RefineActionBar
          actions={argumentRefineActionItems}
          activeAction={refiningAction}
          disabled={isBusy}
          onAction={handleRefine}
        />
      ) : null}

      {structuredResult ? (
        <ArgumentGeneratorCards onFavoriteStatus={setCopyStatus} result={structuredResult} />
      ) : resultText ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-purple">
              <Target size={19} />
            </span>
            AI 论点生成结果
          </div>
          {isTextFallback ? <p className="inline-success">{fallbackNotice}</p> : null}
          <div className="markdown-body">
            <ReactMarkdown>{resultText}</ReactMarkdown>
          </div>
        </article>
      ) : (
        <ArgumentGeneratorCards onFavoriteStatus={setCopyStatus} result={demoArgumentGeneratorStructuredResult} />
      )}

      {studentLearningMode && resultText ? <ThinkingPromptCard prompts={structuredResult?.thinkingPrompts} /> : null}
    </div>
  )
}

export default ArgumentGeneratorPage
