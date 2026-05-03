import { useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  FilePenLine,
  FolderOpen,
  GraduationCap,
  Lightbulb,
  ListChecks,
  RefreshCw,
  Rocket,
  SearchCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import RefineActionBar, { type RefineActionItem } from '../components/common/RefineActionBar'
import ExportMenu from '../components/common/ExportMenu'
import FavoriteButton from '../components/common/FavoriteButton'
import PageHero from '../components/common/PageHero'
import ThinkingPromptCard from '../components/common/ThinkingPromptCard'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildWritingWorkflowPrompt } from '../services/prompts'
import { buildWritingWorkflowRefinePrompt, type WritingWorkflowRefineAction } from '../services/refinePrompts'
import { addHistoryItem } from '../services/historyService'
import { parseModelJsonWithRepair } from '../services/jsonRepairService'
import {
  API_KEY_REQUIRED_NOTICE,
  DEMO_MODE_NOTICE,
  demoWritingWorkflowStructuredResult,
  getDemoWritingWorkflowRefineResult,
} from '../services/demoContent'
import { getDemoMode, getStudentLearningMode } from '../services/settingsService'
import type { ResultTextItem, WritingWorkflowResult } from '../types/results'
import { exportResultFile } from '../utils/exportFile'
import type { ResultExportFormat } from '../utils/exportFormatter'
import { formatWritingWorkflowResult, textFromItem } from '../utils/resultText'
import { DEFAULT_SELF_WRITING_REMINDER } from '../utils/learningGuidance'
import { normalizeWritingWorkflowResult, parseWritingWorkflowResult } from '../utils/writingWorkflowResult'
import { supplementWorkflowMaterials } from '../data/materialLibrary'
import type { AddFavoriteInput } from '../services/favoriteService'

const defaultInput = '阅读下面材料，以“青年与时代”为主题写一篇议论文。'
const difficultyOptions = ['基础', '提升', '高分']
const fallbackNotice = '模型返回格式不完全规范，已整理为文本卡片展示。'
const initialExpandedSteps = ['topic', 'ideas', 'argument', 'materials', 'outline']
const workflowRefineActionItems: Array<RefineActionItem<WritingWorkflowRefineAction>> = [
  { id: 'optimizeOutline', label: '优化大纲', Icon: ListChecks },
  { id: 'replaceIdeas', label: '换一组立意', Icon: RefreshCw },
  { id: 'addMaterials', label: '补充素材', Icon: BookOpenCheck },
]

type WorkflowStepId = (typeof initialExpandedSteps)[number]
type WorkflowTone = 'blue' | 'purple' | 'teal' | 'orange' | 'indigo'

function asTextArray(values: ResultTextItem[] | undefined) {
  return Array.isArray(values) ? values.map(textFromItem).filter(Boolean) : []
}

function asStringArray(values: string[] | undefined) {
  return Array.isArray(values) ? values.filter((value) => value.trim()) : []
}

function EmptyState() {
  return <p className="workflow-empty">暂无数据</p>
}

function ListBlock({
  favoriteForItem,
  items,
  onFavoriteStatus,
  variant = 'plain',
}: {
  favoriteForItem?: (item: string, index: number) => AddFavoriteInput
  items: string[]
  onFavoriteStatus?: (message: string) => void
  variant?: 'plain' | 'cards'
}) {
  if (items.length === 0) {
    return <EmptyState />
  }

  return (
    <ul className={`workflow-list${variant === 'cards' ? ' is-card-list' : ''}`}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <span>{item}</span>
          {favoriteForItem ? (
            <FavoriteButton favorite={favoriteForItem(item, index)} onStatusChange={(message) => onFavoriteStatus?.(message)} />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function WorkflowStep({
  children,
  id,
  index,
  isExpanded,
  onToggle,
  title,
  tone,
}: {
  children: ReactNode
  id: WorkflowStepId
  index: number
  isExpanded: boolean
  onToggle: (id: WorkflowStepId) => void
  title: string
  tone: WorkflowTone
}) {
  return (
    <article className={`workflow-step is-${tone}`}>
      <div className="workflow-step-marker">
        <span>{index}</span>
      </div>
      <section className="workflow-step-card glass-card">
        <button className="workflow-step-header" onClick={() => onToggle(id)} type="button">
          <span>
            Step {index} {title}
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isExpanded ? <div className="workflow-step-body">{children}</div> : null}
      </section>
    </article>
  )
}

function WritingWorkflowCards({
  expandedSteps,
  onToggle,
  onFavoriteStatus,
  result,
  studentLearningMode,
}: {
  expandedSteps: WorkflowStepId[]
  onToggle: (id: WorkflowStepId) => void
  onFavoriteStatus?: (message: string) => void
  result: WritingWorkflowResult
  studentLearningMode: boolean
}) {
  const keywords = asStringArray(result.topicAnalysis?.keywords)
  const warnings = asTextArray(result.topicAnalysis?.warnings)
  const ideas = asTextArray(result.ideas)
  const materials = asTextArray(result.materials)
  const questions = asTextArray(result.thinkingQuestions)
  const subArguments = Array.isArray(result.argumentStructure?.subArguments)
    ? result.argumentStructure.subArguments.map((item) => {
        if (typeof item === 'string') {
          return item
        }

        return [item.point, item.logic, item.material ? `素材方向：${item.material}` : ''].filter(Boolean).join('；')
      })
    : []
  const bodyParagraphs = Array.isArray(result.outline?.bodyParagraphs)
    ? result.outline.bodyParagraphs.map((item) => {
        if (typeof item === 'string') {
          return item
        }

        return [item.title, item.topicSentence, item.content, item.material ? `素材：${item.material}` : '']
          .filter(Boolean)
          .join('：')
      })
    : []

  return (
    <section className="workflow-timeline" aria-label="五步写作结果">
      <WorkflowStep id="topic" index={1} isExpanded={expandedSteps.includes('topic')} onToggle={onToggle} title="审题分析" tone="blue">
        <div className="workflow-chip-list">
          {keywords.length > 0 ? keywords.map((keyword) => <span key={keyword}>{keyword}</span>) : <EmptyState />}
        </div>
        <div className="workflow-field">
          <strong>核心命题</strong>
          <p>{result.topicAnalysis?.coreTopic || '暂无数据'}</p>
        </div>
        <div className="workflow-field">
          <strong>避坑提醒</strong>
          <ListBlock items={warnings} />
        </div>
      </WorkflowStep>

      <WorkflowStep id="ideas" index={2} isExpanded={expandedSteps.includes('ideas')} onToggle={onToggle} title="推荐立意" tone="purple">
        <ListBlock
          favoriteForItem={(item, index) => ({
            type: 'idea',
            title: `五步写作立意 ${index + 1}`,
            content: item,
            source: '五步写作助手',
            tags: keywords,
          })}
          items={ideas}
          onFavoriteStatus={onFavoriteStatus}
          variant="cards"
        />
      </WorkflowStep>

      <WorkflowStep id="argument" index={3} isExpanded={expandedSteps.includes('argument')} onToggle={onToggle} title="论点结构" tone="teal">
        <div className="workflow-field is-highlight">
          <strong>中心论点</strong>
          <p>{result.argumentStructure?.centralArgument || '暂无数据'}</p>
        </div>
        <ListBlock items={subArguments} variant="cards" />
      </WorkflowStep>

      <WorkflowStep id="materials" index={4} isExpanded={expandedSteps.includes('materials')} onToggle={onToggle} title="素材匹配" tone="orange">
        <ListBlock
          favoriteForItem={(item, index) => ({
            type: 'material',
            title: `五步写作素材 ${index + 1}`,
            content: item,
            source: '五步写作助手',
            tags: keywords,
          })}
          items={materials}
          onFavoriteStatus={onFavoriteStatus}
          variant="cards"
        />
      </WorkflowStep>

      <WorkflowStep id="outline" index={5} isExpanded={expandedSteps.includes('outline')} onToggle={onToggle} title="写作大纲" tone="indigo">
        <div className="workflow-field is-highlight">
          <strong>拟题建议</strong>
          <p>{result.outline?.title || '暂无数据'}</p>
          {result.outline?.title ? (
            <FavoriteButton
              favorite={{
                type: 'paragraph',
                title: '五步写作大纲标题',
                content: result.outline.title,
                source: '五步写作助手',
                tags: keywords,
              }}
              onStatusChange={(message) => onFavoriteStatus?.(message)}
            />
          ) : null}
        </div>
        <div className="workflow-outline-grid">
          <div>
            <strong>开头思路</strong>
            <p>{result.outline?.opening || '暂无数据'}</p>
          </div>
          <div>
            <strong>主体段落</strong>
            <ListBlock items={bodyParagraphs} variant="cards" />
          </div>
          <div>
            <strong>结尾升华</strong>
            <p>{result.outline?.ending || '暂无数据'}</p>
          </div>
        </div>
        <div className="workflow-field">
          <strong>思考追问</strong>
          <ListBlock items={questions} />
        </div>
        {studentLearningMode ? (
          <div className="self-writing-reminder">
            <GraduationCap size={18} />
            <p>{result.selfWritingReminder || DEFAULT_SELF_WRITING_REMINDER}</p>
          </div>
        ) : null}
      </WorkflowStep>
    </section>
  )
}

function WritingWorkflowPage() {
  const [input, setInput] = useState(defaultInput)
  const [difficulty, setDifficulty] = useState('提升')
  const [resultText, setResultText] = useState('')
  const [structuredResult, setStructuredResult] = useState<WritingWorkflowResult | null>(null)
  const [isTextFallback, setIsTextFallback] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState<WorkflowStepId[]>(initialExpandedSteps)
  const [isLoading, setIsLoading] = useState(false)
  const [refiningAction, setRefiningAction] = useState<WritingWorkflowRefineAction | null>(null)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const isBusy = isLoading || refiningAction !== null
  const studentLearningMode = getStudentLearningMode()

  const handleToggleStep = (id: WorkflowStepId) => {
    setExpandedSteps((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

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
      const localResult = supplementWorkflowMaterials(demoWritingWorkflowStructuredResult, trimmedInput)
      const output = formatWritingWorkflowResult(localResult)

      setStructuredResult(localResult)
      setResultText(output)
      setExpandedSteps(initialExpandedSteps)
      addHistoryItem({
        type: 'workflow',
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
      const content = await chatCompletion(buildWritingWorkflowPrompt(trimmedInput, { difficulty }))
      const repairResult = await parseModelJsonWithRepair<unknown>(content)
      const normalizedRepairResult = repairResult.result ? normalizeWritingWorkflowResult(repairResult.result) : null
      const parsedResult = normalizedRepairResult
        ? {
            result: normalizedRepairResult,
            text: formatWritingWorkflowResult(normalizedRepairResult),
            usedFallback: false,
          }
        : parseWritingWorkflowResult(content)
      const localResult = supplementWorkflowMaterials(parsedResult.result, trimmedInput)
      const output = formatWritingWorkflowResult(localResult)

      setStructuredResult(localResult)
      setResultText(output)
      setIsTextFallback(parsedResult.usedFallback)
      setExpandedSteps(initialExpandedSteps)
      setCopyStatus(repairResult.repaired ? '模型返回格式已自动修复。' : parsedResult.usedFallback ? fallbackNotice : '')
      addHistoryItem({
        type: 'workflow',
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

  const handleRefine = async (action: WritingWorkflowRefineAction) => {
    const trimmedInput = input.trim()
    const actionLabel = workflowRefineActionItems.find((item) => item.id === action)?.label || '二次优化'

    if (!trimmedInput || !resultText) {
      setError('请先生成结果后再优化')
      return
    }

    setRefiningAction(action)
    setError('')
    setCopyStatus('')

    if (getDemoMode()) {
      const demoResult = getDemoWritingWorkflowRefineResult(action)
      const localResult = supplementWorkflowMaterials(demoResult, trimmedInput)
      const output = formatWritingWorkflowResult(localResult)

      setStructuredResult(localResult)
      setResultText(output)
      setIsTextFallback(false)
      setExpandedSteps(initialExpandedSteps)
      addHistoryItem({
        type: 'workflow',
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
        buildWritingWorkflowRefinePrompt({
          originalInput: trimmedInput,
          currentResult: structuredResult,
          currentText: resultText,
          action,
        }),
      )
      const repairResult = await parseModelJsonWithRepair<unknown>(content)
      const normalizedRepairResult = repairResult.result ? normalizeWritingWorkflowResult(repairResult.result) : null
      const parsedResult = normalizedRepairResult
        ? {
            result: normalizedRepairResult,
            text: formatWritingWorkflowResult(normalizedRepairResult),
            usedFallback: false,
          }
        : parseWritingWorkflowResult(content)
      const localResult = supplementWorkflowMaterials(parsedResult.result, trimmedInput)
      const output = formatWritingWorkflowResult(localResult)

      setStructuredResult(localResult)
      setResultText(output)
      setIsTextFallback(parsedResult.usedFallback)
      setExpandedSteps(initialExpandedSteps)
      setCopyStatus(repairResult.repaired ? '模型返回格式已自动修复。' : parsedResult.usedFallback ? fallbackNotice : '优化完成')
      addHistoryItem({
        type: 'workflow',
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
      setCopyStatus('已复制五步写作结果')
    } catch {
      setError('复制失败，请手动复制')
    }
  }

  const handleExport = async (format: ResultExportFormat) => {
    if (!resultText) {
      return
    }

    try {
      const result = await exportResultFile(format, '五步写作结果', {
          typeLabel: '议论文五步写作助手',
          title: input.trim().replace(/\s+/g, ' ').slice(0, 24) || '五步写作结果',
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
    <div className="workflow-page">
      <PageHero
        className="workflow-header"
        icon={<ListChecks size={34} strokeWidth={2.1} />}
        subtitle="从审题到大纲，一次完成议论文写作思路搭建。"
        title="议论文五步写作助手"
        tone="indigo"
        variant="workflow"
      />

      <section className="workflow-input-card glass-card app-card app-input-panel">
        <div className="card-title">
          <span className="small-title-icon is-blue">
            <FilePenLine size={19} />
          </span>
          作文题目 / 材料
        </div>
        <div className="workflow-textarea-wrap app-textarea-field">
          <textarea
            aria-label="作文题目或材料"
            className="workflow-textarea"
            onChange={(event) => setInput(event.target.value)}
            value={input}
          />
        </div>
        <div className="input-meta-row">
          <span>输入完整材料会让五步结果更稳定。</span>
          <span>{input.length} / 800</span>
        </div>

        <div className="workflow-controls">
          <div className="control-group">
            <span className="control-label">
              <Target size={21} />
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
            className={`gradient-button workflow-generate-button${isLoading ? ' button-loading' : ''}`}
            disabled={isBusy}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Rocket size={20} />}
            {isLoading ? '生成中...' : resultText ? '重新生成' : '开始五步生成'}
          </button>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      <div className="result-actions workflow-actions app-action-bar">
        <button className="secondary-button" disabled={!resultText} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制结果
        </button>
        <ExportMenu disabled={!resultText} onExport={handleExport} />
      </div>

      {resultText ? (
        <RefineActionBar
          actions={workflowRefineActionItems}
          activeAction={refiningAction}
          disabled={isBusy}
          onAction={handleRefine}
        />
      ) : null}

      {structuredResult ? (
        <>
          {isTextFallback ? <p className="inline-success workflow-format-notice">{fallbackNotice}</p> : null}
          <WritingWorkflowCards
            expandedSteps={expandedSteps}
            onToggle={handleToggleStep}
            onFavoriteStatus={setCopyStatus}
            result={structuredResult}
            studentLearningMode={studentLearningMode}
          />
        </>
      ) : resultText ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-blue">
              <SearchCheck size={19} />
            </span>
            AI 五步写作结果
          </div>
          {isTextFallback ? <p className="inline-success">{fallbackNotice}</p> : null}
          <div className="markdown-body">
            <ReactMarkdown>{resultText}</ReactMarkdown>
          </div>
        </article>
      ) : (
        <section className="workflow-empty-card glass-card">
          <span className="workflow-empty-icon">
            <Sparkles size={34} />
          </span>
          <div>
            <h2>输入题目后，一次生成完整写作路径。</h2>
            <p>系统会依次完成审题分析、推荐立意、论点结构、素材匹配和写作大纲。</p>
          </div>
          <div className="workflow-preview-steps" aria-hidden="true">
            <span><SearchCheck size={16} />审题</span>
            <span><Lightbulb size={16} />立意</span>
            <span><Target size={16} />论点</span>
            <span><FolderOpen size={16} />素材</span>
            <span><ListChecks size={16} />大纲</span>
          </div>
        </section>
      )}

      {studentLearningMode && resultText ? <ThinkingPromptCard prompts={structuredResult?.thinkingPrompts} variant="blue" /> : null}
    </div>
  )
}

export default WritingWorkflowPage
