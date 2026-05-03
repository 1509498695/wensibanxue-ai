export type HistoryItemType = 'topic' | 'argument' | 'material' | 'diagnosis' | 'workflow'

export type HistoryItem = {
  id: string
  type: HistoryItemType
  mode?: 'demo' | 'api'
  title: string
  input: string
  output: string
  createdAt: string
}

type AddHistoryItemInput = Omit<HistoryItem, 'id' | 'createdAt'> & Partial<Pick<HistoryItem, 'id' | 'createdAt'>>

const HISTORY_STORAGE_KEY = 'wensibanxue-ai:history'
const MAX_HISTORY_ITEMS = 50

const legacyTypeMap: Record<string, HistoryItemType> = {
  审题立意: 'topic',
  论点生成: 'argument',
  素材推荐: 'material',
  作文诊断: 'diagnosis',
  五步写作: 'workflow',
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isHistoryItemType(type: unknown): type is HistoryItemType {
  return type === 'topic' || type === 'argument' || type === 'material' || type === 'diagnosis' || type === 'workflow'
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function normalizeMode(value: unknown): HistoryItem['mode'] {
  return value === 'demo' || value === 'api' ? value : undefined
}

function normalizeHistoryItem(value: unknown): HistoryItem | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const normalizedType = isHistoryItemType(record.type)
    ? record.type
    : legacyTypeMap[normalizeText(record.type)]

  if (!normalizedType) {
    return null
  }

  const title = normalizeText(record.title).trim()
  const output = normalizeText(record.output) || normalizeText(record.content)
  const input = normalizeText(record.input)
  const createdAt = normalizeText(record.createdAt)

  if (!title && !input && !output) {
    return null
  }

  return {
    id: normalizeText(record.id) || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: normalizedType,
    mode: normalizeMode(record.mode),
    title: title || input.slice(0, 24) || '未命名记录',
    input,
    output,
    createdAt: createdAt || new Date().toISOString(),
  }
}

function writeHistoryItems(items: HistoryItem[]) {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)))
  } catch {
    // localStorage quota or privacy mode failures should not break generation flows.
  }
}

export function getHistoryItems(): HistoryItem[] {
  if (!canUseLocalStorage()) {
    return []
  }

  try {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map(normalizeHistoryItem).filter((item): item is HistoryItem => Boolean(item))
  } catch {
    return []
  }
}

export function addHistoryItem(item: AddHistoryItemInput) {
  const nextItem: HistoryItem = {
    ...item,
    id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: item.title.trim() || '未命名记录',
    input: item.input,
    output: item.output,
    createdAt: item.createdAt || new Date().toISOString(),
  }
  const nextItems = [nextItem, ...getHistoryItems().filter((historyItem) => historyItem.id !== nextItem.id)].slice(
    0,
    MAX_HISTORY_ITEMS,
  )

  writeHistoryItems(nextItems)

  return nextItem
}

export function deleteHistoryItem(id: string) {
  const nextItems = getHistoryItems().filter((item) => item.id !== id)
  writeHistoryItems(nextItems)

  return nextItems
}

export function clearHistory() {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY)
  } catch {
    // Ignore localStorage failures so the UI can remain responsive.
  }
}

export function searchHistory(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return getHistoryItems()
  }

  return getHistoryItems().filter((item) => {
    const searchable = `${item.title} ${item.input} ${item.output}`.toLowerCase()

    return searchable.includes(normalizedKeyword)
  })
}

export function filterHistory(type: HistoryItemType | 'all') {
  if (type === 'all') {
    return getHistoryItems()
  }

  return getHistoryItems().filter((item) => item.type === type)
}
