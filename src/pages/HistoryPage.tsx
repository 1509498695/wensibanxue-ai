import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ClipboardCopy,
  Eye,
  FileSearch,
  FolderOpen,
  Lightbulb,
  NotebookText,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import type { HistoryItem, HistoryItemType } from '../services/historyService'
import { clearHistory, deleteHistoryItem, getHistoryItems } from '../services/historyService'

type HistoryTone = 'blue' | 'purple' | 'teal' | 'orange'

type HistoryTypeMeta = {
  label: string
  tone: HistoryTone
  icon: LucideIcon
}

const filterOptions: Array<{ label: string; value: HistoryItemType | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '审题立意', value: 'topic' },
  { label: '论点生成', value: 'argument' },
  { label: '素材推荐', value: 'material' },
  { label: '作文诊断', value: 'diagnosis' },
]

const typeMeta: Record<HistoryItemType, HistoryTypeMeta> = {
  topic: { label: '审题立意', tone: 'blue', icon: FileSearch },
  argument: { label: '论点生成', tone: 'purple', icon: Lightbulb },
  material: { label: '素材推荐', tone: 'teal', icon: FolderOpen },
  diagnosis: { label: '作文诊断', tone: 'orange', icon: NotebookText },
}

function stripMarkdown(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function createSummary(item: HistoryItem) {
  const source = stripMarkdown(item.output) || item.input

  if (source.length <= 88) {
    return source
  }

  return `${source.slice(0, 88)}...`
}

function formatHistoryTime(createdAt: string) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  }

  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace('/', '-')
}

function HistoryPage() {
  const [records, setRecords] = useState<HistoryItem[]>(() => getHistoryItems())
  const [keyword, setKeyword] = useState('')
  const [activeFilter, setActiveFilter] = useState<HistoryItemType | 'all'>('all')

  const filteredRecords = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return records.filter((record) => {
      const matchesType = activeFilter === 'all' || record.type === activeFilter
      const searchable = `${record.title} ${record.input} ${record.output}`.toLowerCase()
      const matchesKeyword = !normalizedKeyword || searchable.includes(normalizedKeyword)

      return matchesType && matchesKeyword
    })
  }, [activeFilter, keyword, records])

  const handleCopy = async (record: HistoryItem) => {
    await navigator.clipboard.writeText(record.output)
  }

  const handleDelete = (id: string) => {
    setRecords(deleteHistoryItem(id))
  }

  const handleClearHistory = () => {
    clearHistory()
    setRecords([])
  }

  return (
    <div className="history-page">
      <header className="history-header">
        <div>
          <h1>历史记录</h1>
          <p>查看最近生成的审题、论点、素材和作文诊断结果。</p>
        </div>

        <button
          className="secondary-button history-clear-button"
          disabled={records.length === 0}
          onClick={handleClearHistory}
          type="button"
        >
          <Trash2 size={17} />
          清空全部
        </button>
      </header>

      <section className="history-toolbar glass-card">
        <label className="history-search">
          <Search size={19} />
          <input
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索题目、主题或记录内容"
            type="search"
            value={keyword}
          />
        </label>

        <div className="history-filter-row" aria-label="历史记录筛选">
          {filterOptions.map((filter) => (
            <button
              className={`chip${activeFilter === filter.value ? ' is-active' : ''}`}
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {filteredRecords.length > 0 ? (
        <section className="history-list" aria-label="历史记录列表">
          {filteredRecords.map((record) => {
            const meta = typeMeta[record.type]
            const Icon = meta.icon

            return (
              <article className="history-record-card glass-card" key={record.id}>
                <div className="history-record-main">
                  <span className={`history-record-icon is-${meta.tone}`} aria-hidden="true">
                    <Icon size={23} />
                  </span>
                  <div className="history-record-copy">
                    <h2>{record.title}</h2>
                    <p>{createSummary(record)}</p>
                  </div>
                </div>

                <div className="history-record-meta">
                  <span className="history-record-time">{formatHistoryTime(record.createdAt)}</span>
                  <span className={`history-feature-badge is-${meta.tone}`}>{meta.label}</span>
                  <div className="history-record-actions">
                    <button type="button">
                      <Eye size={16} />
                      查看
                    </button>
                    <button onClick={() => handleCopy(record)} type="button">
                      <ClipboardCopy size={16} />
                      复制
                    </button>
                    <button className="is-danger" onClick={() => handleDelete(record.id)} type="button">
                      <Trash2 size={16} />
                      删除
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <section className="history-empty-state glass-card">
          <div className="history-empty-icon" aria-hidden="true">
            <Sparkles size={42} />
          </div>
          <h2>{records.length === 0 ? '暂无历史记录，开始一次 AI 学习分析吧。' : '未找到匹配记录，换个关键词或筛选条件试试。'}</h2>
        </section>
      )}
    </div>
  )
}

export default HistoryPage
