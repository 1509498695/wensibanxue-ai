import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  BookOpenCheck,
  ClipboardCopy,
  FileText,
  Lightbulb,
  ListChecks,
  PenTool,
  Rocket,
  Sparkles,
} from 'lucide-react'
import RefineActionBar, { type RefineActionItem } from '../components/common/RefineActionBar'
import ExportMenu from '../components/common/ExportMenu'
import PageHero from '../components/common/PageHero'
import ThinkingPromptCard from '../components/common/ThinkingPromptCard'
import { EssayDiagnosisCards } from '../components/results/StructuredResultCards'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildEssayDiagnosisPrompt } from '../services/prompts'
import { buildDiagnosisRefinePrompt, type DiagnosisRefineAction } from '../services/refinePrompts'
import { addHistoryItem } from '../services/historyService'
import { parseModelJsonWithRepair } from '../services/jsonRepairService'
import {
  API_KEY_REQUIRED_NOTICE,
  DEMO_MODE_NOTICE,
  demoEssayDiagnosisStructuredResult,
  getDemoDiagnosisRefineResult,
} from '../services/demoContent'
import { getDemoMode, getStudentLearningMode } from '../services/settingsService'
import type { EssayDiagnosisResult } from '../types/results'
import { exportResultFile } from '../utils/exportFile'
import type { ResultExportFormat } from '../utils/exportFormatter'
import { formatEssayDiagnosisResult } from '../utils/resultText'

const defaultEssayContent = `成长是一场漫长的旅行。在这条路上，我们会遇到许多风景，也会遇到各种困难和挑战。
记得那次数学考试，我因为粗心大意而失利，心情非常低落。老师并没有批评我，而是耐心地帮我分析错题，告诉我学习要细心、要坚持。
从那以后，我学会了反思和总结，也更加努力。成长让我明白，只有经历挫折，才能变得更强大。
未来的路还很长，我会带着勇气和信心，继续前行，成为更好的自己。`

const fallbackNotice = '模型返回格式不完全规范，已使用文本模式展示。'
const diagnosisRefineActionItems: Array<RefineActionItem<DiagnosisRefineAction>> = [
  { id: 'polishLanguage', label: '优化语言', Icon: PenTool },
  { id: 'strengthenLogic', label: '增强论证', Icon: Sparkles },
  { id: 'addMaterials', label: '补充素材', Icon: BookOpenCheck },
  { id: 'generatePractice', label: '生成练习建议', Icon: ListChecks },
]

function EssayDiagnosisPage() {
  const [essayContent, setEssayContent] = useState(defaultEssayContent)
  const [resultText, setResultText] = useState('')
  const [structuredResult, setStructuredResult] = useState<EssayDiagnosisResult | null>(null)
  const [isTextFallback, setIsTextFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refiningAction, setRefiningAction] = useState<DiagnosisRefineAction | null>(null)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const isBusy = isLoading || refiningAction !== null
  const studentLearningMode = getStudentLearningMode()

  const handleGenerate = async () => {
    const trimmedEssay = essayContent.trim()

    if (!trimmedEssay) {
      setError('请输入作文内容')
      return
    }

    setIsLoading(true)
    setError('')
    setCopyStatus('')
    setIsTextFallback(false)

    if (getDemoMode()) {
      const output = formatEssayDiagnosisResult(demoEssayDiagnosisStructuredResult)

      setStructuredResult(demoEssayDiagnosisStructuredResult)
      setResultText(output)
      addHistoryItem({
        type: 'diagnosis',
        mode: 'demo',
        title: trimmedEssay.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedEssay,
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
      const content = await chatCompletion(buildEssayDiagnosisPrompt(trimmedEssay))
      const parseResult = await parseModelJsonWithRepair<EssayDiagnosisResult>(content)
      const parsedResult = parseResult.result
      const output = parsedResult ? formatEssayDiagnosisResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '' : fallbackNotice)
      addHistoryItem({
        type: 'diagnosis',
        mode: 'api',
        title: trimmedEssay.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedEssay,
        output,
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '生成失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefine = async (action: DiagnosisRefineAction) => {
    const trimmedEssay = essayContent.trim()
    const actionLabel = diagnosisRefineActionItems.find((item) => item.id === action)?.label || '二次优化'

    if (!trimmedEssay || !resultText) {
      setError('请先生成结果后再优化')
      return
    }

    setRefiningAction(action)
    setError('')
    setCopyStatus('')

    if (getDemoMode()) {
      const demoResult = getDemoDiagnosisRefineResult(action)
      const output = formatEssayDiagnosisResult(demoResult)

      setStructuredResult(demoResult)
      setResultText(output)
      setIsTextFallback(false)
      addHistoryItem({
        type: 'diagnosis',
        mode: 'demo',
        title: `${trimmedEssay.replace(/\s+/g, ' ').slice(0, 18)} · ${actionLabel}`,
        input: trimmedEssay,
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
        buildDiagnosisRefinePrompt({
          originalInput: trimmedEssay,
          currentResult: structuredResult,
          currentText: resultText,
          action,
        }),
      )
      const parseResult = await parseModelJsonWithRepair<EssayDiagnosisResult>(content)
      const parsedResult = parseResult.result
      const output = parsedResult ? formatEssayDiagnosisResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '优化完成' : fallbackNotice)
      addHistoryItem({
        type: 'diagnosis',
        mode: 'api',
        title: `${trimmedEssay.replace(/\s+/g, ' ').slice(0, 18)} · ${actionLabel}`,
        input: trimmedEssay,
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
      setCopyStatus('已复制诊断报告')
    } catch {
      setError('复制失败，请手动复制')
    }
  }

  const handleExport = async (format: ResultExportFormat) => {
    if (!resultText) {
      return
    }

    try {
      const result = await exportResultFile(format, '作文诊断报告', {
          typeLabel: '作文诊断助手',
          title: essayContent.trim().replace(/\s+/g, ' ').slice(0, 24) || '作文诊断报告',
          input: essayContent.trim(),
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
    <div className="diagnosis-page">
      <PageHero
        className="diagnosis-header"
        icon={<FileText size={34} strokeWidth={2.1} />}
        subtitle="智能分析作文的优缺点，提供针对性修改建议，助你写出更高水平的文章！"
        title="作文诊断助手"
        tone="orange"
        variant="diagnosis"
      />

      <section className="diagnosis-input-card glass-card app-card app-input-panel">
        <div className="card-title">
          <span className="small-title-icon is-blue">
            <FileText size={19} />
          </span>
          作文内容
        </div>
        <textarea
          aria-label="作文内容"
          className="diagnosis-textarea"
          onChange={(event) => setEssayContent(event.target.value)}
          value={essayContent}
        />
        <div className="diagnosis-input-footer">
          <span>字数：{essayContent.length}/2000</span>
          <button onClick={() => setEssayContent('')} type="button">
            清空内容
          </button>
        </div>
        <div className="app-action-bar diagnosis-start-actions">
          <button
            className={`gradient-button diagnosis-start-button${isLoading ? ' button-loading' : ''}`}
            disabled={isBusy}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Rocket size={20} />}
            {isLoading ? '诊断中...' : resultText ? '重新诊断' : '开始诊断'}
          </button>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      {resultText ? (
        <RefineActionBar
          actions={diagnosisRefineActionItems}
          activeAction={refiningAction}
          disabled={isBusy}
          onAction={handleRefine}
        />
      ) : null}

      {structuredResult ? (
        <EssayDiagnosisCards onFavoriteStatus={setCopyStatus} result={structuredResult} />
      ) : resultText ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-orange">
              <Lightbulb size={19} />
            </span>
            AI 作文诊断报告
          </div>
          {isTextFallback ? <p className="inline-success">{fallbackNotice}</p> : null}
          <div className="markdown-body">
            <ReactMarkdown>{resultText}</ReactMarkdown>
          </div>
        </article>
      ) : (
        <EssayDiagnosisCards onFavoriteStatus={setCopyStatus} result={demoEssayDiagnosisStructuredResult} />
      )}

      <div className="diagnosis-actions app-action-bar">
        <button className="secondary-button" disabled={!resultText} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制报告
        </button>
        <ExportMenu disabled={!resultText} label="导出诊断" onExport={handleExport} />
      </div>

      {studentLearningMode && resultText ? <ThinkingPromptCard prompts={structuredResult?.thinkingPrompts} /> : null}
    </div>
  )
}

export default EssayDiagnosisPage
