import { useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  BookOpenCheck,
  ClipboardCopy,
  FolderOpen,
  Newspaper,
  PenTool,
  Quote,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Tags,
  UserRoundCheck,
} from 'lucide-react'
import RefineActionBar, { type RefineActionItem } from '../components/common/RefineActionBar'
import ExportMenu from '../components/common/ExportMenu'
import FavoriteButton from '../components/common/FavoriteButton'
import PageHero from '../components/common/PageHero'
import ThinkingPromptCard from '../components/common/ThinkingPromptCard'
import { MaterialRecommendCards } from '../components/results/StructuredResultCards'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildMaterialRecommendPrompt } from '../services/prompts'
import { buildMaterialRefinePrompt, type MaterialRefineAction } from '../services/refinePrompts'
import { addHistoryItem } from '../services/historyService'
import { parseModelJsonWithRepair } from '../services/jsonRepairService'
import {
  API_KEY_REQUIRED_NOTICE,
  DEMO_MODE_NOTICE,
  demoMaterialRecommendStructuredResult,
  getDemoMaterialRefineResult,
} from '../services/demoContent'
import { getDemoMode, getStudentLearningMode } from '../services/settingsService'
import type { MaterialRecommendResult } from '../types/results'
import { exportResultFile } from '../utils/exportFile'
import type { ResultExportFormat } from '../utils/exportFormatter'
import { formatMaterialRecommendResult } from '../utils/resultText'
import {
  defaultMaterialLibraryTopicId,
  getMaterialLibraryTopic,
  localMaterialItemToText,
  materialLibrary,
  searchMaterialLibrary,
  type LocalMaterialItem,
} from '../data/materialLibrary'
import { getFavorites, type FavoriteItem } from '../services/favoriteService'

const materialTypes = ['人物事例', '时评热点', '名言警句', '全部']
const fallbackNotice = '模型返回格式不完全规范，已使用文本模式展示。'
const materialRefineActionItems: Array<RefineActionItem<MaterialRefineAction>> = [
  { id: 'replaceMaterials', label: '换一组素材', Icon: RefreshCw },
  { id: 'generateUsage', label: '生成使用示范', Icon: PenTool },
  { id: 'optimizeForExam', label: '按高考作文优化', Icon: Sparkles },
  { id: 'addQuotes', label: '增加名言警句', Icon: Quote },
]

function filterLocalItems(items: LocalMaterialItem[], query: string) {
  const trimmedQuery = query.trim().toLowerCase()

  if (!trimmedQuery) {
    return items
  }

  return items.filter((item) =>
    [item.topicTitle, item.type, item.title, item.description, item.angle || ''].some((value) =>
      value.toLowerCase().includes(trimmedQuery),
    ),
  )
}

function favoriteToLocalItem(item: FavoriteItem): LocalMaterialItem {
  const type = item.type === 'quote' ? '名言警句' : '素材'

  return {
    id: item.id,
    topicId: item.source || 'favorites',
    topicTitle: item.source || '收藏夹',
    type: type === '素材' ? '时评热点' : '名言警句',
    title: item.title,
    description: item.content,
    angle: item.tags?.find((tag) => tag && tag !== item.source && tag !== type),
  }
}

function LocalMaterialGroup({
  items,
  onCopy,
  onFavoriteStatus,
  title,
  type,
}: {
  items: LocalMaterialItem[]
  onCopy: (item: LocalMaterialItem) => void
  onFavoriteStatus: (message: string) => void
  title: string
  type: LocalMaterialItem['type']
}) {
  if (items.length === 0) {
    return null
  }

  const Icon = type === '人物事例' ? UserRoundCheck : type === '时评热点' ? Newspaper : type === '名言警句' ? Quote : Tags

  return (
    <section className={`local-material-group is-${type === '人物事例' ? 'person' : type === '名言警句' ? 'quote' : 'default'}`}>
      <h3>
        <Icon size={18} />
        {title}
      </h3>
      <div className="local-material-grid">
        {items.map((item) => (
            <article className={`local-material-card is-${type === '名言警句' ? 'quote' : type === '人物事例' ? 'person' : 'default'}`} key={item.id}>
              <div className="local-material-card__meta">
                <span>{item.topicTitle}</span>
                <span>{item.type}</span>
              </div>
              <strong>{item.title}</strong>
              {type === '名言警句' ? <blockquote>{item.description}</blockquote> : <p>{item.description}</p>}
              {item.angle ? <small>适用角度：{item.angle}</small> : null}
              <div className="local-material-card__actions">
                <button className="secondary-button is-compact" onClick={() => onCopy(item)} type="button">
                  <ClipboardCopy size={15} />
                  复制
                </button>
                <FavoriteButton
                  favorite={{
                    type: item.type === '名言警句' ? 'quote' : 'material',
                    title: item.title,
                    content: item.description,
                    source: item.topicTitle,
                    tags: [item.topicTitle, item.type, item.angle || ''].filter(Boolean),
                  }}
                  onStatusChange={(message) => onFavoriteStatus(message)}
                />
              </div>
            </article>
          ))}
      </div>
    </section>
  )
}

function MaterialRecommendPage() {
  const [topic, setTopic] = useState('责任与担当')
  const [materialType, setMaterialType] = useState('全部')
  const [libraryTopicId, setLibraryTopicId] = useState(defaultMaterialLibraryTopicId)
  const [librarySearch, setLibrarySearch] = useState('')
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getFavorites())
  const [showFavorites, setShowFavorites] = useState(false)
  const [resultText, setResultText] = useState('')
  const [structuredResult, setStructuredResult] = useState<MaterialRecommendResult | null>(null)
  const [isTextFallback, setIsTextFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refiningAction, setRefiningAction] = useState<MaterialRefineAction | null>(null)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const isBusy = isLoading || refiningAction !== null
  const studentLearningMode = getStudentLearningMode()
  const libraryRef = useRef<HTMLElement | null>(null)
  const selectedLibraryTopic = getMaterialLibraryTopic(libraryTopicId)
  const libraryItems = useMemo(() => searchMaterialLibrary(selectedLibraryTopic, librarySearch), [librarySearch, selectedLibraryTopic])
  const favoriteMaterialItems = useMemo(
    () => favorites.filter((item) => item.type === 'material' || item.type === 'quote').map(favoriteToLocalItem),
    [favorites],
  )
  const visibleLibraryItems = showFavorites ? filterLocalItems(favoriteMaterialItems, librarySearch) : libraryItems

  const handleCopyLocalMaterial = async (item: LocalMaterialItem) => {
    try {
      await navigator.clipboard.writeText(localMaterialItemToText(item))
      setCopyStatus('已复制本地素材')
      setError('')
    } catch {
      setError('复制失败，请手动复制')
    }
  }

  const handleShowFavorites = () => {
    setFavorites(getFavorites())
    setShowFavorites(true)
    libraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleGenerate = async () => {
    const trimmedTopic = topic.trim()

    if (!trimmedTopic) {
      setError('请输入素材主题')
      return
    }

    setIsLoading(true)
    setError('')
    setCopyStatus('')
    setIsTextFallback(false)

    if (getDemoMode()) {
      const output = formatMaterialRecommendResult(demoMaterialRecommendStructuredResult)

      setStructuredResult(demoMaterialRecommendStructuredResult)
      setResultText(output)
      addHistoryItem({
        type: 'material',
        mode: 'demo',
        title: trimmedTopic.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedTopic,
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
      const content = await chatCompletion(buildMaterialRecommendPrompt(trimmedTopic, { materialType }))
      const parseResult = await parseModelJsonWithRepair<MaterialRecommendResult>(content)
      const parsedResult = parseResult.result
      const output = parsedResult ? formatMaterialRecommendResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '' : fallbackNotice)
      addHistoryItem({
        type: 'material',
        mode: 'api',
        title: trimmedTopic.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedTopic,
        output,
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '生成失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefine = async (action: MaterialRefineAction) => {
    const trimmedTopic = topic.trim()
    const actionLabel = materialRefineActionItems.find((item) => item.id === action)?.label || '二次优化'

    if (!trimmedTopic || !resultText) {
      setError('请先生成结果后再优化')
      return
    }

    setRefiningAction(action)
    setError('')
    setCopyStatus('')

    if (getDemoMode()) {
      const demoResult = getDemoMaterialRefineResult(action)
      const output = formatMaterialRecommendResult(demoResult)

      setStructuredResult(demoResult)
      setResultText(output)
      setIsTextFallback(false)
      addHistoryItem({
        type: 'material',
        mode: 'demo',
        title: `${trimmedTopic.replace(/\s+/g, ' ').slice(0, 18)} · ${actionLabel}`,
        input: trimmedTopic,
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
        buildMaterialRefinePrompt({
          originalInput: trimmedTopic,
          currentResult: structuredResult,
          currentText: resultText,
          action,
        }),
      )
      const parseResult = await parseModelJsonWithRepair<MaterialRecommendResult>(content)
      const parsedResult = parseResult.result
      const output = parsedResult ? formatMaterialRecommendResult(parsedResult) : content

      setStructuredResult(parsedResult)
      setResultText(output)
      setIsTextFallback(!parsedResult)
      setCopyStatus(parseResult.repaired ? '模型返回格式已自动修复。' : parsedResult ? '优化完成' : fallbackNotice)
      addHistoryItem({
        type: 'material',
        mode: 'api',
        title: `${trimmedTopic.replace(/\s+/g, ' ').slice(0, 18)} · ${actionLabel}`,
        input: trimmedTopic,
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
      setCopyStatus('已复制素材结果')
    } catch {
      setError('复制失败，请手动复制')
    }
  }

  const handleExport = async (format: ResultExportFormat) => {
    if (!resultText) {
      return
    }

    try {
      const result = await exportResultFile(format, '素材推荐结果', {
          typeLabel: '素材推荐器',
          title: topic.trim().replace(/\s+/g, ' ').slice(0, 24) || '素材推荐结果',
          input: topic.trim(),
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
    <div className="material-page">
      <PageHero
        className="material-header"
        icon={<FolderOpen size={34} strokeWidth={2.1} />}
        subtitle="根据写作主题智能匹配人物事例、时评热点与名言警句，让素材积累更高效。"
        title="素材推荐器"
        tone="teal"
        variant="material"
      />

      <section className="material-input-card glass-card app-card app-input-panel">
        <div className="card-title">
          <span className="small-title-icon is-teal">
            <BookOpenCheck size={19} />
          </span>
          素材主题
        </div>
        <div className="material-topic-row">
          <input
            aria-label="素材主题"
            className="material-topic-input"
            onChange={(event) => setTopic(event.target.value)}
            value={topic}
          />
          <button
            className={`gradient-button material-recommend-button${isLoading ? ' button-loading' : ''}`}
            disabled={isBusy}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Sparkles size={20} />}
            {isLoading ? '推荐中...' : resultText ? '重新推荐' : '推荐素材'}
          </button>
        </div>

        <div className="material-controls">
          <div className="control-group">
            <span className="control-label">
              <FolderOpen size={21} />
              素材类型：
            </span>
            <div className="chip-group" aria-label="素材类型选择">
              {materialTypes.map((type) => (
                <button
                  className={`chip${materialType === type ? ' is-active' : ''}`}
                  key={type}
                  onClick={() => setMaterialType(type)}
                  type="button"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      <section className="local-material-library glass-card" ref={libraryRef}>
        <div className="local-material-library__header">
          <div>
            <div className="card-title">
              <span className="small-title-icon is-purple">
                <BookOpenCheck size={19} />
              </span>
              本地素材库
            </div>
            <p>无需 API，也可以按主题查找、收藏和复制常用作文素材。</p>
          </div>
          <button className={`secondary-button${showFavorites ? ' is-active' : ''}`} onClick={() => setShowFavorites((value) => !value)} type="button">
            <Star fill={showFavorites ? 'currentColor' : 'none'} size={18} />
            收藏夹 {favorites.length}
          </button>
        </div>

        <div className="local-material-toolbar">
          <div className="chip-group" aria-label="本地素材主题选择">
            {materialLibrary.map((item) => (
              <button
                className={`chip${libraryTopicId === item.id && !showFavorites ? ' is-active' : ''}`}
                key={item.id}
                onClick={() => {
                  setLibraryTopicId(item.id)
                  setShowFavorites(false)
                }}
                type="button"
              >
                {item.title}
              </button>
            ))}
          </div>
          <label className="local-material-search">
            <Search size={17} />
            <input
              aria-label="搜索本地素材"
              onChange={(event) => setLibrarySearch(event.target.value)}
              placeholder="搜索关键词、人物、角度"
              value={librarySearch}
            />
          </label>
        </div>

        <div className="local-material-library__summary">
          <span>{showFavorites ? '我的收藏' : selectedLibraryTopic.title}</span>
          <p>{showFavorites ? '这里会保留你收藏过的单条素材。' : selectedLibraryTopic.description}</p>
        </div>

        {visibleLibraryItems.length > 0 ? (
          <div className="local-material-sections">
            {(['人物事例', '时评热点', '名言警句', '适用角度', '使用示范'] as const).map((type) => (
                <LocalMaterialGroup
                items={visibleLibraryItems.filter((item) => item.type === type)}
                key={type}
                onCopy={handleCopyLocalMaterial}
                onFavoriteStatus={(message) => {
                  setCopyStatus(message)
                  setFavorites(getFavorites())
                }}
                title={type}
                type={type}
              />
            ))}
          </div>
        ) : (
          <p className="structured-empty">{showFavorites ? '暂无收藏素材' : '没有找到匹配素材'}</p>
        )}
      </section>

      <div className="result-actions material-actions app-action-bar">
        <button className="secondary-button" disabled={!resultText} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制素材
        </button>
        <button className="secondary-button" onClick={handleShowFavorites} type="button">
          <Star size={18} />
          收藏素材
        </button>
        <ExportMenu disabled={!resultText} label="导出结果" onExport={handleExport} />
      </div>

      {resultText ? (
        <RefineActionBar
          actions={materialRefineActionItems}
          activeAction={refiningAction}
          disabled={isBusy}
          onAction={handleRefine}
        />
      ) : null}

      {structuredResult ? (
        <MaterialRecommendCards
          onFavoriteStatus={(message) => {
            setCopyStatus(message)
            setFavorites(getFavorites())
          }}
          result={structuredResult}
        />
      ) : resultText ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-teal">
              <BookOpenCheck size={19} />
            </span>
            AI 素材推荐结果
          </div>
          {isTextFallback ? <p className="inline-success">{fallbackNotice}</p> : null}
          <div className="markdown-body">
            <ReactMarkdown>{resultText}</ReactMarkdown>
          </div>
        </article>
      ) : null}

      {studentLearningMode && resultText ? <ThinkingPromptCard prompts={structuredResult?.thinkingPrompts} /> : null}
    </div>
  )
}

export default MaterialRecommendPage
