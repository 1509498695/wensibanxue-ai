import { useMemo, useState } from 'react'
import { ClipboardCopy, Download, Search, Star, Trash2 } from 'lucide-react'
import {
  clearFavorites,
  getFavorites,
  removeFavorite,
  type FavoriteItem,
  type FavoriteType,
} from '../services/favoriteService'
import { createExportFileName, downloadTextFile } from '../utils/exportText'

const favoriteFilters: Array<{ label: string; value: FavoriteType | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '论点', value: 'argument' },
  { label: '素材', value: 'material' },
  { label: '名言', value: 'quote' },
  { label: '片段', value: 'paragraph' },
  { label: '立意', value: 'idea' },
]

const favoriteTypeLabels: Record<FavoriteType, string> = {
  argument: '论点',
  material: '素材',
  quote: '名言',
  paragraph: '片段',
  idea: '立意',
}

function formatFavoriteText(item: FavoriteItem) {
  return [
    `【${favoriteTypeLabels[item.type]}】${item.title}`,
    item.source ? `来源：${item.source}` : '',
    item.tags?.length ? `标签：${item.tags.join('、')}` : '',
    item.content,
  ]
    .filter(Boolean)
    .join('\n')
}

function formatFavoritesExport(items: FavoriteItem[]) {
  return [
    '议论文议写通收藏夹',
    `导出时间：${new Date().toLocaleString('zh-CN')}`,
    '',
    items.length > 0 ? items.map((item, index) => `${index + 1}. ${formatFavoriteText(item)}`).join('\n\n') : '暂无收藏内容',
  ].join('\n')
}

function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getFavorites())
  const [keyword, setKeyword] = useState('')
  const [activeType, setActiveType] = useState<FavoriteType | 'all'>('all')
  const [status, setStatus] = useState('')
  const visibleFavorites = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    const baseItems = activeType === 'all' ? favorites : favorites.filter((item) => item.type === activeType)

    if (!normalizedKeyword) {
      return baseItems
    }

    return baseItems.filter((item) =>
      [item.title, item.content, item.source || '', ...(item.tags || [])].some((value) =>
        value.toLowerCase().includes(normalizedKeyword),
      ),
    )
  }, [activeType, favorites, keyword])

  const refreshFavorites = () => setFavorites(getFavorites())

  const handleCopy = async (item: FavoriteItem) => {
    try {
      await navigator.clipboard.writeText(formatFavoriteText(item))
      setStatus('已复制收藏内容')
    } catch {
      setStatus('复制失败，请手动复制')
    }
  }

  const handleDelete = (id: string) => {
    removeFavorite(id)
    refreshFavorites()
    setStatus('已删除收藏')
  }

  const handleClear = () => {
    clearFavorites()
    refreshFavorites()
    setStatus('已清空收藏夹')
  }

  const handleExport = () => {
    downloadTextFile(createExportFileName('收藏夹'), formatFavoritesExport(favorites))
    setStatus('已导出收藏夹')
  }

  return (
    <div className="favorites-page">
      <header className="favorites-header glass-card">
        <div>
          <span className="favorites-eyebrow">学习积累</span>
          <h1>收藏夹</h1>
          <p>保存好论点、素材、名言和优化片段，复盘写作时可以随时取用。</p>
        </div>
        <span className="favorites-header-icon" aria-hidden="true">
          <Star size={38} />
        </span>
      </header>

      <section className="favorites-toolbar glass-card">
        <label className="favorites-search">
          <Search size={18} />
          <input
            aria-label="搜索收藏内容"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索标题、内容、来源或标签"
            value={keyword}
          />
        </label>
        <div className="chip-group" aria-label="收藏类型筛选">
          {favoriteFilters.map((filter) => (
            <button
              className={`chip${activeType === filter.value ? ' is-active' : ''}`}
              key={filter.value}
              onClick={() => setActiveType(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="favorites-toolbar-actions">
          <button className="secondary-button" disabled={favorites.length === 0} onClick={handleExport} type="button">
            <Download size={18} />
            导出全部
          </button>
          <button className="secondary-button danger-button" disabled={favorites.length === 0} onClick={handleClear} type="button">
            <Trash2 size={18} />
            清空
          </button>
        </div>
      </section>

      {status ? <p className="inline-success favorites-status">{status}</p> : null}

      {visibleFavorites.length > 0 ? (
        <section className="favorites-grid" aria-label="收藏内容列表">
          {visibleFavorites.map((item) => (
            <article className="favorite-card glass-card" key={item.id}>
              <div className="favorite-card__header">
                <span>{favoriteTypeLabels[item.type]}</span>
                <small>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</small>
              </div>
              <h2>{item.title}</h2>
              {item.source ? <p className="favorite-source">来源：{item.source}</p> : null}
              <p className="favorite-content">{item.content}</p>
              {item.tags?.length ? (
                <div className="favorite-tags">
                  {item.tags.map((tag) => (
                    <span key={`${item.id}-${tag}`}>{tag}</span>
                  ))}
                </div>
              ) : null}
              <div className="favorite-card__actions">
                <button className="secondary-button" onClick={() => handleCopy(item)} type="button">
                  <ClipboardCopy size={17} />
                  复制
                </button>
                <button className="secondary-button danger-button" onClick={() => handleDelete(item.id)} type="button">
                  <Trash2 size={17} />
                  删除
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="favorites-empty glass-card">
          <Star size={36} />
          <p>暂无收藏内容，遇到好的论点、素材或表达时可以点击星标收藏。</p>
        </section>
      )}
    </div>
  )
}

export default FavoritesPage
