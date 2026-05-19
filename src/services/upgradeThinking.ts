import type { ChatMessage } from '../types/llm'
import { getStudentLearningMode } from './settingsService'

export type UpgradeThinkingQuestionId = 'prosCons' | 'criteria'

export type UpgradeThinkingQuestion = {
  id: UpgradeThinkingQuestionId
  label: string
  questionText: string
}

export type UpgradeThinkingResult = {
  answer: string
  viewpoints: string[]
}

export type UpgradeThinkingDraft = {
  key: string
  questionId: UpgradeThinkingQuestionId
  keyword: string
  fullQuestion: string
  answer: string
  viewpoints: string[]
  updatedAt: string
}

export const upgradeThinkingQuestions: UpgradeThinkingQuestion[] = [
  { id: 'prosCons', label: '利与弊？', questionText: '利与弊？' },
  { id: 'criteria', label: '不简单一分为二，给出具体的标准。', questionText: '不简单一分为二，给出具体的标准。' },
]

export const MAX_UPGRADE_THINKING_DRAFTS = 20

const upgradeThinkingSystemPrompt: ChatMessage = {
  role: 'system',
  content:
    '你是一名擅长高中议论文思辨训练的语文老师。你帮助学生围绕关键词做观点升格，强调多角度、标准意识和辩证分析，但不要直接代写整篇作文。',
}

function buildStudentLearningModeRule(isEnabled: boolean) {
  return isEnabled
    ? '学生学习模式已开启：回答要呈现思考路径和写作迁移，不直接替学生完成整篇作文。'
    : '学生学习模式已关闭：可以给出更充分的分析，但仍以写作指导为主。'
}

export function getUpgradeThinkingQuestion(questionId: UpgradeThinkingQuestionId) {
  return upgradeThinkingQuestions.find((question) => question.id === questionId) || upgradeThinkingQuestions[0]
}

export function isUpgradeThinkingQuestionId(value: unknown): value is UpgradeThinkingQuestionId {
  return value === 'prosCons' || value === 'criteria'
}

export function buildUpgradeThinkingFullQuestion(keyword: string, questionId: UpgradeThinkingQuestionId) {
  return `${keyword}${getUpgradeThinkingQuestion(questionId).questionText}`
}

export function buildUpgradeThinkingDraftKey(questionId: UpgradeThinkingQuestionId, fullQuestion: string) {
  return `${questionId}:${fullQuestion.trim()}`
}

function cleanViewpoint(value: string) {
  return value
    .replace(/^[\s#*_`>\-\d.、，:：]+/, '')
    .replace(/\s+/g, '')
    .trim()
    .slice(0, 20)
}

function normalizeViewpoints(values: string[]) {
  return Array.from(new Set(values.map(cleanViewpoint).filter(Boolean))).slice(0, 5)
}

function splitViewpointLine(value: string) {
  return normalizeViewpoints(value.split(/[｜|、，,；;]/))
}

function fallbackViewpoints(answer: string) {
  const listItems = answer
    .split(/\r?\n/)
    .filter((line) => /^\s*(?:[-*]|\d+[.、])\s+/.test(line))
    .map((line) => line.replace(/\*\*/g, '').replace(/^\s*(?:[-*]|\d+[.、])\s+/, ''))

  if (listItems.length > 0) {
    return normalizeViewpoints(listItems).slice(0, 3)
  }

  const compact = answer.replace(/[#*_`>\-\d.：:]/g, '').replace(/\s+/g, '')

  return normalizeViewpoints([compact.slice(0, 20), compact.slice(20, 40), compact.slice(40, 60)]).slice(0, 3)
}

function normalizeDraft(value: unknown): UpgradeThinkingDraft | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const draft = value as Partial<UpgradeThinkingDraft>
  const questionId = draft.questionId
  const fullQuestion = typeof draft.fullQuestion === 'string' ? draft.fullQuestion.trim() : ''
  const answer = typeof draft.answer === 'string' ? draft.answer.trim() : ''

  if (!isUpgradeThinkingQuestionId(questionId) || !fullQuestion || !answer) {
    return null
  }

  const viewpoints = Array.isArray(draft.viewpoints)
    ? draft.viewpoints.map((item) => (typeof item === 'string' ? item : '')).filter(Boolean)
    : []

  return {
    key: typeof draft.key === 'string' && draft.key ? draft.key : buildUpgradeThinkingDraftKey(questionId, fullQuestion),
    questionId,
    keyword: typeof draft.keyword === 'string' ? draft.keyword : '',
    fullQuestion,
    answer,
    viewpoints: normalizeViewpoints(viewpoints),
    updatedAt: typeof draft.updatedAt === 'string' && draft.updatedAt ? draft.updatedAt : new Date().toISOString(),
  }
}

export function normalizeUpgradeThinkingDrafts(state: {
  followUpAnswer?: string
  followUpDrafts?: unknown[]
  followUpFullQuestion?: string
  followUpKeyword?: string
  followUpQuestionId?: unknown
  followUpSummaries?: string[]
  followUpSummary?: string
}) {
  if (Array.isArray(state.followUpDrafts)) {
    return state.followUpDrafts.map(normalizeDraft).filter((draft): draft is UpgradeThinkingDraft => Boolean(draft)).slice(0, MAX_UPGRADE_THINKING_DRAFTS)
  }

  if (isUpgradeThinkingQuestionId(state.followUpQuestionId) && state.followUpFullQuestion && state.followUpAnswer) {
    return [
      createUpgradeThinkingDraft({
        answer: state.followUpAnswer,
        fullQuestion: state.followUpFullQuestion,
        keyword: state.followUpKeyword || '',
        questionId: state.followUpQuestionId,
        viewpoints: Array.isArray(state.followUpSummaries)
          ? state.followUpSummaries
          : state.followUpSummary
            ? [state.followUpSummary]
            : [],
      }),
    ]
  }

  return []
}

export function createUpgradeThinkingDraft(input: {
  answer: string
  fullQuestion: string
  keyword: string
  questionId: UpgradeThinkingQuestionId
  viewpoints: string[]
}): UpgradeThinkingDraft {
  return {
    key: buildUpgradeThinkingDraftKey(input.questionId, input.fullQuestion),
    questionId: input.questionId,
    keyword: input.keyword,
    fullQuestion: input.fullQuestion,
    answer: input.answer,
    viewpoints: normalizeViewpoints(input.viewpoints),
    updatedAt: new Date().toISOString(),
  }
}

export function upsertUpgradeThinkingDraft(drafts: UpgradeThinkingDraft[], draft: UpgradeThinkingDraft) {
  return [draft, ...drafts.filter((item) => item.key !== draft.key)].slice(0, MAX_UPGRADE_THINKING_DRAFTS)
}

export function parseUpgradeThinkingResponse(content: string): UpgradeThinkingResult {
  const normalizedContent = content.trim()
  const viewpointMatch = normalizedContent.match(/^推荐观点[：:]\s*(.+)$/m)
  const viewpoints = viewpointMatch ? splitViewpointLine(viewpointMatch[1]) : fallbackViewpoints(normalizedContent)
  const answer = viewpointMatch
    ? normalizedContent.replace(/^推荐观点[：:].*(\r?\n)?/m, '').trim()
    : normalizedContent

  return {
    answer,
    viewpoints,
  }
}

export function buildUpgradeThinkingPrompt(input: {
  argumentInput: string
  argumentText: string
  fullQuestion: string
  keyword: string
  questionText: string
}): ChatMessage[] {
  const studentLearningMode = getStudentLearningMode()

  return [
    upgradeThinkingSystemPrompt,
    {
      role: 'user',
      content: `请围绕关键词做一次议论文“升格思辨”训练。

论点生成页原始题目或材料：
${input.argumentInput || '暂无，请主要依据关键词进行思辨。'}

论点生成页当前结果：
${input.argumentText || '暂无，请主要依据关键词进行思辨。'}

关键词：
${input.keyword}

用户选择的问题：
${input.questionText}

完整思辨问题：
${input.fullQuestion}

${buildStudentLearningModeRule(studentLearningMode)}

回答要求：
1. 使用 Markdown 文本回答，不要返回 JSON。
2. 第一行必须使用固定格式：推荐观点：观点1｜观点2｜观点3
3. 推荐观点最多 5 条，每条不超过 20 字。
4. 回答要服务高中议论文写作，不能直接代写完整作文。
5. 如果问题是“利与弊”，请给出可辩证展开的利弊角度，并提醒如何避免只列优缺点。
6. 如果问题是“不简单一分为二”，请给出判断标准，帮助学生形成更细的分类和条件意识。
7. 正文控制在 3 到 5 个要点内，语言适合高中生理解。`,
    },
  ]
}

export function buildDemoUpgradeThinkingAnswer(input: {
  fullQuestion: string
  keyword: string
  questionId: UpgradeThinkingQuestionId
}): UpgradeThinkingResult {
  const keyword = input.keyword || '关键词'

  if (input.questionId === 'prosCons') {
    return {
      viewpoints: ['利在激发动能', '弊在走向偏执', '关键在守住边界'],
      answer: `## ${input.fullQuestion}

- **利的一面**：围绕“${keyword}”展开时，可以看到它对个人成长、行动动力或社会参与的积极价值。
- **弊的一面**：如果把“${keyword}”绝对化，文章容易忽略现实条件，甚至滑向空泛口号。
- **升格写法**：不要只写“有利也有弊”，而要说明利弊分别在什么条件下出现。
- **推荐观点**：真正成熟的立意，不是简单赞美或否定${keyword}，而是辨清它发挥价值的边界。`,
    }
  }

  return {
    viewpoints: ['先看具体情境', '再定判断标准', '避免机械二分'],
    answer: `## ${input.fullQuestion}

- **不要机械二分**：讨论“${keyword}”时，不能只写“好/坏”“对/错”，而要追问判断依据。
- **标准一：是否符合题意情境**。同一关键词在不同材料语境中，侧重点可能不同。
- **标准二：是否带来真实行动**。只停留在态度表态，往往不如能落到实践的观点有力量。
- **标准三：是否兼顾个体与社会**。高分立意通常能把个人选择和时代价值联系起来。`,
  }
}
