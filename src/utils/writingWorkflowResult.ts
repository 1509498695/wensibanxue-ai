import type { ResultTextItem, WritingWorkflowResult } from '../types/results'
import { DEFAULT_SELF_WRITING_REMINDER } from './learningGuidance'
import { formatWritingWorkflowResult, textFromItem } from './resultText'
import { safeJsonParse } from './safeJsonParse'

type ParsedWorkflowResult = {
  result: WritingWorkflowResult
  text: string
  usedFallback: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }

  return []
}

function toStringArray(value: unknown) {
  return toArray(value).map((item) => textFromItem(item as ResultTextItem)).filter(Boolean)
}

function normalizeMaterial(item: unknown): ResultTextItem {
  if (!isRecord(item)) {
    return textFromItem(item as ResultTextItem)
  }

  return {
    title: firstString(item.title, item.name, item.type),
    description: firstString(item.description, item.content, item.text),
    angle: firstString(item.angle),
  }
}

function normalizeSubArgument(item: unknown) {
  if (!isRecord(item)) {
    return textFromItem(item as ResultTextItem)
  }

  return {
    point: firstString(item.point, item.title, item.topicSentence, item.content, item.text),
    logic: firstString(item.logic, item.reason, item.description),
    material: firstString(item.material, item.example),
  }
}

function normalizeParagraph(item: unknown) {
  if (!isRecord(item)) {
    return textFromItem(item as ResultTextItem)
  }

  return {
    title: firstString(item.title, item.name),
    topicSentence: firstString(item.topicSentence, item.point),
    content: firstString(item.content, item.description, item.text),
    material: firstString(item.material, item.example),
  }
}

export function normalizeWritingWorkflowResult(value: unknown): WritingWorkflowResult | null {
  if (!isRecord(value)) {
    return null
  }

  const topic = isRecord(value.topicAnalysis)
    ? value.topicAnalysis
    : isRecord(value.analysis)
      ? value.analysis
      : {}
  const argument = isRecord(value.argumentStructure)
    ? value.argumentStructure
    : isRecord(value.argument)
      ? value.argument
      : {}
  const outline = isRecord(value.outline) ? value.outline : {}

  const result: WritingWorkflowResult = {
    topicAnalysis: {
      keywords: toStringArray(topic.keywords),
      coreTopic: firstString(topic.coreTopic, topic.topic, topic.mainIdea, value.coreTopic),
      warnings: toStringArray(topic.warnings || topic.warning || value.warnings),
    },
    ideas: toStringArray(value.ideas || value.recommendedIdeas),
    argumentStructure: {
      centralArgument: firstString(argument.centralArgument, argument.recommendedArgument, value.centralArgument),
      subArguments: toArray(argument.subArguments || argument.points || value.subArguments).map(normalizeSubArgument),
    },
    materials: toArray(value.materials || value.materialRecommendations).map(normalizeMaterial),
    outline: {
      title: firstString(outline.title, outline.suggestedTitle),
      opening: firstString(outline.opening, outline.introduction),
      bodyParagraphs: toArray(outline.bodyParagraphs || outline.body || outline.paragraphs).map(normalizeParagraph),
      ending: firstString(outline.ending, outline.conclusion),
    },
    thinkingQuestions: toStringArray(value.thinkingQuestions || value.questions),
    selfWritingReminder: firstString(value.selfWritingReminder),
    thinkingPrompts: toStringArray(value.thinkingPrompts),
  }

  return hasWorkflowContent(result) ? result : null
}

function hasWorkflowContent(result: WritingWorkflowResult) {
  return Boolean(
    result.topicAnalysis?.coreTopic ||
      result.topicAnalysis?.keywords?.length ||
      result.ideas?.length ||
      result.argumentStructure?.centralArgument ||
      result.argumentStructure?.subArguments?.length ||
      result.materials?.length ||
      result.outline?.title ||
      result.outline?.opening ||
      result.outline?.bodyParagraphs?.length ||
      result.outline?.ending,
  )
}

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function looseJsonCandidates(value: string) {
  const stripped = stripCodeFence(value)
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  const candidates = [stripped]

  if (start >= 0 && end > start) {
    candidates.push(stripped.slice(start, end + 1))
  }

  return candidates.flatMap((candidate) => {
    const withoutTrailingComma = candidate.replace(/,\s*([}\]])/g, '$1')
    const balanced = balanceJsonLike(withoutTrailingComma)

    return [candidate, withoutTrailingComma, balanced]
  })
}

function balanceJsonLike(value: string) {
  const stack: string[] = []
  let inString = false
  let escaped = false

  for (const char of value) {
    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\' && inString) {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) {
      continue
    }

    if (char === '{') stack.push('}')
    if (char === '[') stack.push(']')
    if ((char === '}' || char === ']') && stack[stack.length - 1] === char) stack.pop()
  }

  return `${value}${stack.reverse().join('')}`
}

function parseLooseJson(value: string) {
  for (const candidate of looseJsonCandidates(value)) {
    const parsed = safeJsonParse(candidate)

    if (parsed) {
      return parsed
    }
  }

  return null
}

function decodeJsonString(value: string) {
  try {
    return JSON.parse(`"${value.replace(/"/g, '\\"')}"`) as string
  } catch {
    return value.replace(/\\"/g, '"').trim()
  }
}

function findStringField(source: string, field: string) {
  const match = new RegExp(`"${field}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)`, 'i').exec(source)

  return match ? decodeJsonString(match[1]) : ''
}

function findStringArray(source: string, field: string, limit = 5) {
  const startMatch = new RegExp(`"${field}"\\s*:\\s*\\[`, 'i').exec(source)

  if (!startMatch) {
    return []
  }

  const slice = source.slice(startMatch.index, startMatch.index + 1400)
  const values = Array.from(slice.matchAll(/"([^"]{2,220})"/g))
    .map((match) => decodeJsonString(match[1]))
    .filter((item) => item !== field)

  return Array.from(new Set(values)).slice(0, limit)
}

function findObjectFieldStrings(source: string, field: string, keys: string[], limit = 4) {
  const startMatch = new RegExp(`"${field}"\\s*:\\s*\\[`, 'i').exec(source)

  if (!startMatch) {
    return []
  }

  const slice = source.slice(startMatch.index, startMatch.index + 2600)
  const matches = Array.from(slice.matchAll(/"([^"]+)"\s*:\s*"([^"]{2,260})/g))
  const grouped: Array<Record<string, string>> = []
  let current: Record<string, string> = {}

  for (const match of matches) {
    const key = match[1]

    if (!keys.includes(key)) {
      continue
    }

    if (key === keys[0] && Object.keys(current).length > 0) {
      grouped.push(current)
      current = {}
    }

    current[key] = decodeJsonString(match[2])
  }

  if (Object.keys(current).length > 0) grouped.push(current)

  return grouped.slice(0, limit)
}

function fallbackResultFromText(source: string): WritingWorkflowResult {
  const clipped = source.replace(/\s+/g, ' ').slice(0, 420)
  const subArguments = findObjectFieldStrings(source, 'subArguments', ['point', 'logic', 'material'], 4).map((item) => ({
    point: item.point,
    logic: item.logic,
    material: item.material,
  }))
  const bodyParagraphs = findObjectFieldStrings(source, 'bodyParagraphs', ['title', 'topicSentence', 'content', 'material'], 4).map(
    (item) => ({
      title: item.title,
      topicSentence: item.topicSentence,
      content: item.content,
      material: item.material,
    }),
  )
  const materials = findObjectFieldStrings(source, 'materials', ['title', 'description', 'angle'], 5).map((item) => ({
    title: item.title,
    description: item.description,
    angle: item.angle,
  }))

  return {
    topicAnalysis: {
      keywords: findStringArray(source, 'keywords', 8),
      coreTopic: findStringField(source, 'coreTopic') || clipped,
      warnings: findStringArray(source, 'warnings', 4),
    },
    ideas: findStringArray(source, 'ideas', 4),
    argumentStructure: {
      centralArgument: findStringField(source, 'centralArgument'),
      subArguments,
    },
    materials,
    outline: {
      title: findStringField(source, 'title'),
      opening: findStringField(source, 'opening'),
      bodyParagraphs,
      ending: findStringField(source, 'ending'),
    },
    thinkingQuestions: findStringArray(source, 'thinkingQuestions', 4),
    selfWritingReminder: findStringField(source, 'selfWritingReminder') || DEFAULT_SELF_WRITING_REMINDER,
    thinkingPrompts: findStringArray(source, 'thinkingPrompts', 4),
  }
}

export function parseWritingWorkflowResult(content: string): ParsedWorkflowResult {
  const parsed = safeJsonParse(content) || parseLooseJson(content)
  const normalized = normalizeWritingWorkflowResult(parsed)

  if (normalized) {
    return {
      result: normalized,
      text: formatWritingWorkflowResult(normalized),
      usedFallback: false,
    }
  }

  const fallback = fallbackResultFromText(content)

  return {
    result: fallback,
    text: formatWritingWorkflowResult(fallback),
    usedFallback: true,
  }
}
