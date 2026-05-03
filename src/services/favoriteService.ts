export type FavoriteType = 'argument' | 'material' | 'quote' | 'paragraph' | 'idea'

export type FavoriteItem = {
  id: string
  type: FavoriteType
  title: string
  content: string
  source?: string
  tags?: string[]
  createdAt: string
}

export type AddFavoriteInput = Omit<FavoriteItem, 'id' | 'createdAt'> & Partial<Pick<FavoriteItem, 'id' | 'createdAt'>>

const FAVORITES_STORAGE_KEY = 'wensibanxue-ai:favorites'
const LEGACY_MATERIAL_FAVORITES_KEY = 'wensibanxue-ai:favorite-materials'

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeTags(value: unknown) {
  return Array.isArray(value) ? value.map(normalizeText).filter(Boolean) : []
}

function isFavoriteType(value: unknown): value is FavoriteType {
  return value === 'argument' || value === 'material' || value === 'quote' || value === 'paragraph' || value === 'idea'
}

function normalizeFavoriteItem(value: unknown): FavoriteItem | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const type = isFavoriteType(record.type) ? record.type : null
  const title = normalizeText(record.title)
  const content = normalizeText(record.content)

  if (!type || !title || !content) {
    return null
  }

  return {
    id: normalizeText(record.id) || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    title,
    content,
    source: normalizeText(record.source) || undefined,
    tags: normalizeTags(record.tags),
    createdAt: normalizeText(record.createdAt) || new Date().toISOString(),
  }
}

function readRawFavorites() {
  if (!canUseLocalStorage()) {
    return []
  }

  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed) ? parsed.map(normalizeFavoriteItem).filter((item): item is FavoriteItem => Boolean(item)) : []
  } catch {
    return []
  }
}

function writeFavorites(items: FavoriteItem[]) {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage quota or privacy mode failures should not break the UI.
  }
}

function normalizeComparable(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

export function getFavoriteKey(item: Pick<FavoriteItem, 'type' | 'title' | 'content'>) {
  return [item.type, normalizeComparable(item.title), normalizeComparable(item.content)].join('::')
}

function legacyMaterialToFavorite(value: unknown): FavoriteItem | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const typeLabel = normalizeText(record.type)
  const title = normalizeText(record.title)
  const description = normalizeText(record.description)

  if (!title || !description) {
    return null
  }

  const favoriteType: FavoriteType = typeLabel === '名言警句' ? 'quote' : 'material'
  const topicTitle = normalizeText(record.topicTitle)
  const angle = normalizeText(record.angle)

  return {
    id: normalizeText(record.id) || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: favoriteType,
    title,
    content: description,
    source: topicTitle || undefined,
    tags: [topicTitle, typeLabel, angle].filter(Boolean),
    createdAt: new Date().toISOString(),
  }
}

function migrateLegacyMaterialFavorites(items: FavoriteItem[]) {
  if (!canUseLocalStorage() || window.localStorage.getItem(`${FAVORITES_STORAGE_KEY}:legacy-materials-migrated`) === 'true') {
    return items
  }

  try {
    const stored = window.localStorage.getItem(LEGACY_MATERIAL_FAVORITES_KEY)

    if (!stored) {
      window.localStorage.setItem(`${FAVORITES_STORAGE_KEY}:legacy-materials-migrated`, 'true')
      return items
    }

    const parsed = JSON.parse(stored)
    const legacyItems = Array.isArray(parsed)
      ? parsed.map(legacyMaterialToFavorite).filter((item): item is FavoriteItem => Boolean(item))
      : []
    const existingKeys = new Set(items.map(getFavoriteKey))
    const migratedItems = legacyItems.filter((item) => !existingKeys.has(getFavoriteKey(item)))
    const nextItems = [...migratedItems, ...items]

    writeFavorites(nextItems)
    window.localStorage.setItem(`${FAVORITES_STORAGE_KEY}:legacy-materials-migrated`, 'true')

    return nextItems
  } catch {
    return items
  }
}

export function getFavorites(): FavoriteItem[] {
  return migrateLegacyMaterialFavorites(readRawFavorites())
}

export function findFavorite(input: Pick<FavoriteItem, 'type' | 'title' | 'content'>) {
  const key = getFavoriteKey(input)

  return getFavorites().find((item) => getFavoriteKey(item) === key) || null
}

export function addFavorite(input: AddFavoriteInput) {
  const normalizedInput = normalizeFavoriteItem({
    ...input,
    id: input.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: input.createdAt || new Date().toISOString(),
  })

  if (!normalizedInput) {
    throw new Error('收藏内容不完整')
  }

  const currentItems = getFavorites()
  const existingItem = currentItems.find((item) => getFavoriteKey(item) === getFavoriteKey(normalizedInput))

  if (existingItem) {
    return existingItem
  }

  writeFavorites([normalizedInput, ...currentItems])

  return normalizedInput
}

export function removeFavorite(id: string) {
  const nextItems = getFavorites().filter((item) => item.id !== id)
  writeFavorites(nextItems)

  return nextItems
}

export function clearFavorites() {
  writeFavorites([])
}

export function searchFavorites(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return getFavorites()
  }

  return getFavorites().filter((item) => {
    const searchable = [item.title, item.content, item.source || '', ...(item.tags || [])].join(' ').toLowerCase()

    return searchable.includes(normalizedKeyword)
  })
}

export function filterFavorites(type: FavoriteType | 'all') {
  if (type === 'all') {
    return getFavorites()
  }

  return getFavorites().filter((item) => item.type === type)
}
