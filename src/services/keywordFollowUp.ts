import type { ChatMessage } from '../types/llm'
import { getStudentLearningMode } from './settingsService'

export type KeywordFollowUpQuestionId =
  | 'definition'
  | 'manifestation'
  | 'reason'
  | 'drawbackAndScope'
  | 'solution'
  | 'relationship'

export type KeywordFollowUpQuestion = {
  id: KeywordFollowUpQuestionId
  label: string
  hint?: string
  questionText: string
  requiresMultipleKeywords?: boolean
}

export const keywordFollowUpQuestions: KeywordFollowUpQuestion[] = [
  { id: 'definition', label: '是什么&本质是什么', questionText: '是什么&本质是什么。' },
  { id: 'manifestation', label: '具体体现是什么', questionText: '具体体现是什么？' },
  { id: 'reason', label: '为什么', questionText: '为什么。' },
  {
    id: 'drawbackAndScope',
    label: '弊端与不适用情况',
    questionText: '此关键词带来的弊端是什么？&不适用于什么情况。',
  },
  { id: 'solution', label: '怎么做', questionText: '怎么做。' },
  {
    id: 'relationship',
    label: '关系是什么',
    hint: '需2个及以上关键词',
    questionText: '关系是什么？',
    requiresMultipleKeywords: true,
  },
]

type KeywordFollowUpPromptInput = {
  originalInput: string
  currentText: string
  keyword: string
  keywords: string[]
  questionText: string
  fullQuestion: string
}

type DemoKeywordFollowUpInput = {
  keyword: string
  keywords: string[]
  questionId: KeywordFollowUpQuestionId
  fullQuestion: string
}

export type KeywordFollowUpResult = {
  answer: string
  summaries: string[]
}

export type KeywordFollowUpDraft = {
  key: string
  questionId: KeywordFollowUpQuestionId
  keyword: string
  keywords: string[]
  fullQuestion: string
  answer: string
  summaries: string[]
  updatedAt: string
}

export const MAX_KEYWORD_FOLLOW_UP_DRAFTS = 20

const followUpSystemPrompt: ChatMessage = {
  role: 'system',
  content:
    '你是一名经验丰富、严格但温和的高中语文议论文写作老师。你正在基于学生已有的审题或论点结果继续追问关键词，帮助学生把概念讲清楚、把论证想深入，但不要直接代写整篇作文。',
}

function buildStudentLearningModeRule(isEnabled: boolean) {
  return isEnabled
    ? '学生学习模式已开启：回答要强调思考路径和写作迁移，不直接替学生完成整篇作文。'
    : '学生学习模式已关闭：可以给出更充分的分析，但仍以写作指导为主。'
}

export function getKeywordFollowUpQuestion(questionId: KeywordFollowUpQuestionId) {
  return keywordFollowUpQuestions.find((question) => question.id === questionId) || keywordFollowUpQuestions[0]
}

export function parseFollowUpKeywords(value: string) {
  return Array.from(new Set(value.split(/[、,，\s；;]+/).map((keyword) => keyword.trim()).filter(Boolean)))
}

export function formatFollowUpKeywords(keywords: string[]) {
  return keywords.join('、')
}

export function buildKeywordFollowUpFullQuestion(args: {
  keywords: string[]
  questionId: KeywordFollowUpQuestionId
  questionText: string
}) {
  const keywordText = args.questionId === 'relationship' ? formatFollowUpKeywords(args.keywords) : args.keywords[0] || ''

  return `${keywordText}${args.questionText}`
}

export function buildKeywordFollowUpDraftKey(questionId: KeywordFollowUpQuestionId, fullQuestion: string) {
  return `${questionId}:${fullQuestion.trim()}`
}

function normalizeDraftSummaries(values: unknown) {
  return Array.isArray(values)
    ? values.map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean).slice(0, 5)
    : []
}

function normalizeDraft(value: unknown): KeywordFollowUpDraft | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const draft = value as Partial<KeywordFollowUpDraft>
  const questionId = draft.questionId
  const fullQuestion = typeof draft.fullQuestion === 'string' ? draft.fullQuestion.trim() : ''
  const answer = typeof draft.answer === 'string' ? draft.answer.trim() : ''

  if (!questionId || !fullQuestion || !answer) {
    return null
  }

  return {
    key: typeof draft.key === 'string' && draft.key ? draft.key : buildKeywordFollowUpDraftKey(questionId, fullQuestion),
    questionId,
    keyword: typeof draft.keyword === 'string' ? draft.keyword : '',
    keywords: Array.isArray(draft.keywords)
      ? draft.keywords.map((keyword) => (typeof keyword === 'string' ? keyword.trim() : '')).filter(Boolean)
      : parseFollowUpKeywords(typeof draft.keyword === 'string' ? draft.keyword : ''),
    fullQuestion,
    answer,
    summaries: normalizeDraftSummaries(draft.summaries),
    updatedAt: typeof draft.updatedAt === 'string' && draft.updatedAt ? draft.updatedAt : new Date().toISOString(),
  }
}

export function createKeywordFollowUpDraft(input: {
  answer: string
  fullQuestion: string
  keyword: string
  keywords: string[]
  questionId: KeywordFollowUpQuestionId
  summaries: string[]
}): KeywordFollowUpDraft {
  return {
    key: buildKeywordFollowUpDraftKey(input.questionId, input.fullQuestion),
    questionId: input.questionId,
    keyword: input.keyword,
    keywords: input.keywords,
    fullQuestion: input.fullQuestion,
    answer: input.answer,
    summaries: input.summaries.slice(0, 5),
    updatedAt: new Date().toISOString(),
  }
}

export function upsertKeywordFollowUpDraft(drafts: KeywordFollowUpDraft[], draft: KeywordFollowUpDraft) {
  return [draft, ...drafts.filter((item) => item.key !== draft.key)].slice(0, MAX_KEYWORD_FOLLOW_UP_DRAFTS)
}

export function normalizeKeywordFollowUpDrafts(state: {
  followUpAnswer?: string
  followUpDrafts?: KeywordFollowUpDraft[]
  followUpFullQuestion?: string
  followUpKeyword?: string
  followUpQuestionId?: KeywordFollowUpQuestionId
  followUpSummaries?: string[]
  followUpSummary?: string
}) {
  if (Array.isArray(state.followUpDrafts)) {
    return state.followUpDrafts.map(normalizeDraft).filter((draft): draft is KeywordFollowUpDraft => Boolean(draft)).slice(0, MAX_KEYWORD_FOLLOW_UP_DRAFTS)
  }

  if (state.followUpQuestionId && state.followUpFullQuestion && state.followUpAnswer) {
    return [
      createKeywordFollowUpDraft({
        answer: state.followUpAnswer,
        fullQuestion: state.followUpFullQuestion,
        keyword: state.followUpKeyword || '',
        keywords: parseFollowUpKeywords(state.followUpKeyword || ''),
        questionId: state.followUpQuestionId,
        summaries: Array.isArray(state.followUpSummaries)
          ? state.followUpSummaries
          : state.followUpSummary
            ? [state.followUpSummary]
            : [],
      }),
    ]
  }

  return []
}

export function buildKeywordFollowUpPrompt(input: KeywordFollowUpPromptInput): ChatMessage[] {
  const studentLearningMode = getStudentLearningMode()
  const relationshipRule =
    input.keywords.length >= 2
      ? `多关键词关系分析要求：如果用户选择“关系是什么？”，请重点分析这些关键词之间的并列、递进、因果、条件、对立或互补关系，并说明这种关系如何服务议论文立意、中心论点和分论点展开。`
      : ''

  return [
    followUpSystemPrompt,
    {
      role: 'user',
      content: `请围绕关键词做一次议论文写作追问。

原始作文题目或材料：
${input.originalInput}

当前已生成结果：
${input.currentText}

用户输入的关键词：
${input.keyword}

解析出的关键词：
${input.keywords.join('、') || input.keyword}

用户选择的问题：
${input.questionText}

拼接后的完整追问：
${input.fullQuestion}

${buildStudentLearningModeRule(studentLearningMode)}
${relationshipRule ? `\n${relationshipRule}` : ''}

回答要求：
1. 使用 Markdown 文本回答，不要返回 JSON。
2. 第一行必须使用固定格式：观点汇总：观点1｜观点2｜观点3
3. 观点汇总最多 5 个观点，每个观点不超过 20 字。
4. 聚焦高中议论文写作，不要直接代写完整作文。
5. 结合当前题目或材料，回答要具体、可迁移。
6. 建议包含：概念解释、分析角度、写作应用提示。
7. 正文控制在 3 到 5 个要点内，语言适合高中生理解。`,
    },
  ]
}

function cleanSummaryItem(value: string) {
  return value
    .replace(/^[\s#*_`>\-\d.、，:：]+/, '')
    .replace(/\s+/g, '')
    .trim()
    .slice(0, 20)
}

function normalizeSummaries(values: string[]) {
  return Array.from(new Set(values.map(cleanSummaryItem).filter(Boolean))).slice(0, 5)
}

function splitSummaryLine(value: string) {
  return normalizeSummaries(value.split(/[｜|、，,；;]/))
}

function summarizeFallback(answer: string) {
  const listItems = answer
    .split(/\r?\n/)
    .filter((line) => /^\s*(?:[-*]|\d+[.、])\s+/.test(line))
    .map((line) => line.replace(/\*\*/g, '').replace(/^\s*(?:[-*]|\d+[.、])\s+/, ''))

  if (listItems.length > 0) {
    return normalizeSummaries(listItems).slice(0, 3)
  }

  const compact = answer.replace(/[#*_`>\-\d.：:]/g, '').replace(/\s+/g, '')

  return normalizeSummaries([compact.slice(0, 20), compact.slice(20, 40), compact.slice(40, 60)]).slice(0, 3)
}

export function parseKeywordFollowUpResponse(content: string): KeywordFollowUpResult {
  const normalizedContent = content.trim()
  const summaryMatch = normalizedContent.match(/^观点汇总[：:]\s*(.+)$/m)
  const summaries = summaryMatch ? splitSummaryLine(summaryMatch[1]) : summarizeFallback(normalizedContent)
  const answer = summaryMatch
    ? normalizedContent.replace(/^观点汇总[：:].*(\r?\n)?/m, '').trim()
    : normalizedContent

  return {
    answer,
    summaries,
  }
}

export function buildDemoKeywordFollowUpAnswer(input: DemoKeywordFollowUpInput): KeywordFollowUpResult {
  const keyword = input.keyword || '关键词'
  const keywordText = formatFollowUpKeywords(input.keywords) || keyword
  const sharedOpening = `围绕“${keyword}”追问，可以把文章从表层判断推进到更具体的论证层。`

  if (input.questionId === 'definition') {
    return {
      summaries: ['先界定概念', '再追问本质', '服务中心论点'],
      answer: `## ${input.fullQuestion}

${sharedOpening}

- **是什么**：${keyword}不是一个空泛标签，而是文章需要解释清楚的核心概念。
- **本质是什么**：它往往指向一种价值判断、行为选择或人与时代之间的关系。
- **写作应用**：开头或第一个主体段可以先界定${keyword}，再提出你的中心论点。`,
    }
  }

  if (input.questionId === 'manifestation') {
    return {
      summaries: ['落到具体表现', '分清个人社会', '便于素材承接'],
      answer: `## ${input.fullQuestion}

${sharedOpening}

- **在个人层面**：体现在选择、行动、坚持和自我要求中。
- **在社会层面**：体现在回应公共需要、承担责任、参与时代进程中。
- **写作应用**：主体段可以用“具体表现 + 典型素材 + 扣题分析”的结构展开。`,
    }
  }

  if (input.questionId === 'reason') {
    return {
      summaries: ['说明关键词价值', '连接材料现实', '拓展论证原因'],
      answer: `## ${input.fullQuestion}

${sharedOpening}

- **因为它能明确文章立意**：抓住${keyword}，就能避免观点散乱。
- **因为它能连接材料与现实**：关键词不是孤立概念，要放到具体情境里理解。
- **写作应用**：可以从个人成长、社会价值、时代需要三个角度解释原因。`,
    }
  }

  if (input.questionId === 'drawbackAndScope') {
    return {
      summaries: ['不宜空泛套用', '需辨清边界', '避免强行扣题'],
      answer: `## ${input.fullQuestion}

${sharedOpening}

- **可能弊端**：如果只把${keyword}当口号，文章容易空泛，缺少辨析。
- **不适用情况**：当材料重点不在选择、责任、成长或关系辨析时，强行套用${keyword}会偏题。
- **写作应用**：可以加入一两句限制条件，说明${keyword}不是无条件成立，而要落在具体情境中。`,
    }
  }

  if (input.questionId === 'relationship') {
    return {
      summaries: ['辨清逻辑关系', '形成论证层次', '服务分论点展开'],
      answer: `## ${input.fullQuestion}

围绕“${keywordText}”追问关系，关键是把多个概念放进同一个论证链条中理解。

- **关系判断**：这些关键词可以形成并列、递进、因果或互补关系，不能只孤立解释。
- **论证展开**：写作时可先界定各关键词，再说明它们如何共同支撑中心论点。
- **结构应用**：可以把不同关键词安排到不同分论点中，让文章层次更清楚。
- **避坑提醒**：不要把多个关键词简单堆在一起，要写清它们之间“为什么有关”。`,
    }
  }

  return {
    summaries: ['先界定再行动', '避免只喊口号', '回扣关键词'],
    answer: `## ${input.fullQuestion}

${sharedOpening}

- **先界定**：说明你理解的${keyword}是什么。
- **再分析**：结合材料解释它为什么重要、体现在哪里。
- **后落实**：写清青年或个体应该怎样行动，避免只喊口号。
- **写作应用**：每个主体段结尾都可以回扣${keyword}，让论证更集中。`,
  }
}
