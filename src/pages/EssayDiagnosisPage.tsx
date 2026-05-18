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
  Upload,
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
import { normalizeEssayDiagnosisResult } from '../utils/essayDiagnosisScoring'
import { formatEssayDiagnosisResult } from '../utils/resultText'

const defaultEssayTopic = '请以“成长”为话题，结合自己的经历或思考，写一篇文章。'
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

function buildDiagnosisInput(topic: string, essay: string) {
  return `作文题目或材料：\n${topic}\n\n学生作文内容：\n${essay}`
}

function EssayDiagnosisPage() {
  const [essayTopic, setEssayTopic] = useState(defaultEssayTopic)
  const [essayContent, setEssayContent] = useState(defaultEssayContent)
  const [resultText, setResultText] = useState('')
  const [structuredResult, setStructuredResult] = useState<EssayDiagnosisResult | null>(null)
  const [isTextFallback, setIsTextFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReadingFile, setIsReadingFile] = useState(false)
  const [refiningAction, setRefiningAction] = useState<DiagnosisRefineAction | null>(null)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const isBusy = isLoading || refiningAction !== null || isReadingFile
  const studentLearningMode = getStudentLearningMode()

  const resetDiagnosisResult = () => {
    setResultText('')
    setStructuredResult(null)
    setIsTextFallback(false)
  }

  const handleUploadEssayFile = async () => {
    if (!window.wensibanxue?.openEssayFile) {
      setError('请在桌面端使用本地文件上传功能。')
      setCopyStatus('')
      return
    }

    setIsReadingFile(true)
    setError('')
    setCopyStatus('')

    try {
      const result = await window.wensibanxue.openEssayFile()

      if (result.canceled) {
        return
      }

      if (result.error || !result.text) {
        setError(result.error || '文件内容为空，请选择包含作文内容的文件。')
        return
      }

      setEssayContent(result.text)
      resetDiagnosisResult()
      setCopyStatus(`已读取：${result.fileName || '作文文件'}`)
    } catch {
      setError('文件读取失败，请稍后重试。')
    } finally {
      setIsReadingFile(false)
    }
  }

  const handleGenerate = async () => {
    const trimmedTopic = essayTopic.trim()
    const trimmedEssay = essayContent.trim()
    const diagnosisInput = buildDiagnosisInput(trimmedTopic, trimmedEssay)
    const historyTitle = trimmedTopic.replace(/\s+/g, ' ').slice(0, 24)

    if (!trimmedTopic) {
      setError('请输入作文题目或材料')
      return
    }

    if (!trimmedEssay) {
      setError('请输入作文内容')
      return
    }

    setIsLoading(true)
    setError('')
    setCopyStatus('')
    setIsTextFallback(false)

    if (getDemoMode()) {
      const demoResult = normalizeEssayDiagnosisResult(demoEssayDiagnosisStructuredResult)
      const output = formatEssayDiagnosisResult(demoResult)

      setStructuredResult(demoResult)
      setResultText(output)
      addHistoryItem({
        type: 'diagnosis',
        mode: 'demo',
        title: historyTitle,
        input: diagnosisInput,
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
      const content = await chatCompletion(buildEssayDiagnosisPrompt({ essay: trimmedEssay, topic: trimmedTopic }))
      const parseResult = await parseModelJsonWithRepair<EssayDiagnosisResult>(content)
      const parsedResult = parseResult.result ? normalizeEssayDiagnosisResult(parseResult.result) : null
      const output = parsedResult ? formatEssayDiagnosisResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '' : fallbackNotice)
      addHistoryItem({
        type: 'diagnosis',
        mode: 'api',
        title: historyTitle,
        input: diagnosisInput,
        output,
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '生成失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefine = async (action: DiagnosisRefineAction) => {
    const trimmedTopic = essayTopic.trim()
    const trimmedEssay = essayContent.trim()
    const diagnosisInput = buildDiagnosisInput(trimmedTopic, trimmedEssay)
    const actionLabel = diagnosisRefineActionItems.find((item) => item.id === action)?.label || '二次优化'
    const historyTitle = trimmedTopic.replace(/\s+/g, ' ').slice(0, 18)

    if (!trimmedTopic) {
      setError('请输入作文题目或材料')
      return
    }

    if (!trimmedEssay) {
      setError('请输入作文内容')
      return
    }

    if (!resultText) {
      setError('请先生成结果后再优化')
      return
    }

    setRefiningAction(action)
    setError('')
    setCopyStatus('')

    if (getDemoMode()) {
      const demoResult = normalizeEssayDiagnosisResult(getDemoDiagnosisRefineResult(action))
      const output = formatEssayDiagnosisResult(demoResult)

      setStructuredResult(demoResult)
      setResultText(output)
      setIsTextFallback(false)
      addHistoryItem({
        type: 'diagnosis',
        mode: 'demo',
        title: `${historyTitle} · ${actionLabel}`,
        input: diagnosisInput,
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
          originalInput: diagnosisInput,
          currentResult: structuredResult,
          currentText: resultText,
          action,
        }),
      )
      const parseResult = await parseModelJsonWithRepair<EssayDiagnosisResult>(content)
      const parsedResult = parseResult.result ? normalizeEssayDiagnosisResult(parseResult.result) : null
      const output = parsedResult ? formatEssayDiagnosisResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '优化完成' : fallbackNotice)
      addHistoryItem({
        type: 'diagnosis',
        mode: 'api',
        title: `${historyTitle} · ${actionLabel}`,
        input: diagnosisInput,
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
      await navigator.clipboard.writeText(`${buildDiagnosisInput(essayTopic.trim(), essayContent.trim())}\n\n${resultText}`)
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
      const trimmedTopic = essayTopic.trim()
      const trimmedEssay = essayContent.trim()
      const result = await exportResultFile(format, '作文诊断报告', {
          typeLabel: '作文诊断助手',
          title: trimmedTopic.replace(/\s+/g, ' ').slice(0, 24) || '作文诊断报告',
          input: buildDiagnosisInput(trimmedTopic, trimmedEssay),
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
          作文题目 / 材料
        </div>
        <textarea
          aria-label="作文题目或材料"
          className="diagnosis-topic-textarea"
          onChange={(event) => setEssayTopic(event.target.value)}
          placeholder="请输入作文题目、材料或写作要求"
          value={essayTopic}
        />
        <div className="diagnosis-content-header">
          <div className="card-title diagnosis-content-title">
            <span className="small-title-icon is-orange">
              <PenTool size={19} />
            </span>
            作文内容
          </div>
          <button className="secondary-button diagnosis-upload-button" disabled={isBusy} onClick={handleUploadEssayFile} type="button">
            {isReadingFile ? <span className="loading-spinner" /> : <Upload size={18} />}
            {isReadingFile ? '读取中...' : '上传文件'}
          </button>
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
