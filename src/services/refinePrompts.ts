import type { ChatMessage } from '../types/llm'
import type {
  ArgumentGeneratorResult,
  EssayDiagnosisResult,
  MaterialRecommendResult,
  TopicAnalysisResult,
  WritingWorkflowResult,
} from '../types/results'
import { getStudentLearningMode } from './settingsService'
import {
  DIAGNOSIS_JSON_SCHEMA,
  DIAGNOSIS_SCORING_RULE,
  DIAGNOSIS_SCORING_STANDARD,
} from './essayDiagnosisStandard'

export const topicRefineActions = [
  { id: 'deepenIdeas', label: '立意更深刻', instruction: '提升立意的思想深度，让核心命题、推荐立意和写作角度更有辨析度。' },
  { id: 'lowerDifficulty', label: '降低难度', instruction: '降低理解和写作难度，让表达更稳妥、更适合基础较弱的学生。' },
  { id: 'addWarnings', label: '增加避坑提醒', instruction: '补充更具体的跑题风险、空泛风险和审题误区提醒。' },
  { id: 'generateAngles', label: '生成写作角度', instruction: '重点扩展写作角度，给出更多可展开、可论证的角度。' },
] as const

export const argumentRefineActions = [
  { id: 'deepenArguments', label: '深化论点', instruction: '深化中心论点和分论点，使观点更有思辨性和层次感。' },
  { id: 'replaceArguments', label: '换一组论点', instruction: '保留原题方向，重新生成一组不同但同样稳妥的中心论点和分论点。' },
  { id: 'generateOutline', label: '生成作文大纲', instruction: '把当前论点扩展成更清晰的大纲式论证结构，体现在分论点和素材方向中。' },
  { id: 'matchMaterials', label: '匹配更多素材', instruction: '重点补充与论点匹配的素材方向，并说明适用角度。' },
] as const

export const materialRefineActions = [
  { id: 'replaceMaterials', label: '换一组素材', instruction: '围绕同一主题更换一组新素材，避免与当前结果重复。' },
  { id: 'generateUsage', label: '生成使用示范', instruction: '重点优化 usageExample，给出更完整、更像作文段落的素材使用示范。' },
  { id: 'optimizeForExam', label: '按高考作文优化', instruction: '筛选更适合高考议论文的常见、可靠、可展开素材。' },
  { id: 'addQuotes', label: '增加名言警句', instruction: '重点补充更贴合主题、便于引用的名言警句。' },
] as const

export const diagnosisRefineActions = [
  { id: 'polishLanguage', label: '优化语言', instruction: '重点优化语言表达建议和优化示例，使表达更有文采但不过度华丽。' },
  { id: 'strengthenLogic', label: '增强论证', instruction: '重点补充论证逻辑、结构层次和观点展开方面的诊断与建议。' },
  { id: 'addMaterials', label: '补充素材', instruction: '重点补充素材运用方面的问题诊断和可替换素材方向。' },
  { id: 'generatePractice', label: '生成练习建议', instruction: '重点生成后续练习建议，并融入 suggestions 与 optimizedExample 中。' },
] as const

export const writingWorkflowRefineActions = [
  { id: 'optimizeTopic', label: '优化审题', instruction: '重点强化审题分析，优化关键词、核心命题和避坑提醒，让题意把握更准确。' },
  { id: 'deepenIdeas', label: '立意更深刻', instruction: '提升推荐立意的思想深度和辨析度，并同步调整中心论点，使立意与论点一致。' },
  { id: 'replaceIdeas', label: '换一组立意', instruction: '在不偏离原题的前提下，更换一组新的推荐立意，并同步调整论点结构。' },
  { id: 'strengthenArguments', label: '强化论点', instruction: '重点强化中心论点和分论点逻辑，让分论点之间更有递进、对照或因果层次。' },
  { id: 'addMaterials', label: '补充素材', instruction: '重点补充更适配论点和大纲的素材，并说明适用角度。' },
  { id: 'optimizeOutline', label: '优化大纲', instruction: '重点优化写作大纲，让开头、主体段和结尾更连贯、更有层次。' },
  { id: 'lowerDifficulty', label: '降低难度', instruction: '降低理解和写作难度，保留核心结构，但用更稳妥、更容易模仿的表达重写五步方案。' },
] as const

export type TopicRefineAction = (typeof topicRefineActions)[number]['id']
export type ArgumentRefineAction = (typeof argumentRefineActions)[number]['id']
export type MaterialRefineAction = (typeof materialRefineActions)[number]['id']
export type DiagnosisRefineAction = (typeof diagnosisRefineActions)[number]['id']
export type WritingWorkflowRefineAction = (typeof writingWorkflowRefineActions)[number]['id']

type RefineActionConfig = {
  id: string
  label: string
  instruction: string
}

type RefinePromptInput<TResult, TAction extends string> = {
  originalInput: string
  currentResult: TResult | null
  currentText: string
  action: TAction
}

const refineSystemPrompt: ChatMessage = {
  role: 'system',
  content:
    '你是一名经验丰富、严格但温和的高中语文老师，正在做连续辅导。你需要基于学生原始输入和当前结果进行二次优化，保持建议具体、可操作，不要直接代写整篇作文。',
}

const jsonOnlyRules = `输出要求：
1. 只返回一个 JSON 对象。
2. 不要返回 Markdown。
3. 不要返回解释性文字。
4. 不要使用 \`\`\`json 或 \`\`\` 代码块。
5. 字段名必须严格使用指定结构，不要新增顶层字段。
6. 所有数组为空时返回 []，未知文本返回空字符串，未知分数返回 null。`

function buildStudentLearningModeRules(isEnabled: boolean) {
  return isEnabled
    ? `学生学习模式：已开启。
1. 不直接生成完整作文。
2. 只提供思路、结构、片段优化和练习建议。
3. 鼓励学生自己完成表达。
4. 输出 JSON 中必须包含 thinkingPrompts，用于引导学生继续思考。`
    : `学生学习模式：已关闭。
1. 可以给出更充分的写作支持。
2. 仍不要默认生成整篇作文，除非用户明确要求。`
}

function appendSchemaFields(schema: string, fields: string[]) {
  if (fields.length === 0) {
    return schema
  }

  return schema.replace(/\n}$/, `${fields.join('')}\n}`)
}

const topicSchema = `{
  "keywords": ["关键词1", "关键词2"],
  "coreTopic": "材料或题目的核心命题",
  "recommendedIdeas": ["立意方向1", "立意方向2", "立意方向3"],
  "writingAngles": ["写作角度1", "写作角度2", "写作角度3"],
  "warnings": ["避坑提醒1", "避坑提醒2"]
}`

const argumentSchema = `{
  "analysis": {
    "keywords": ["关键词1", "关键词2"],
    "coreTopic": "核心话题",
    "writingFocus": "写作重点",
    "warning": "容易跑题的提醒"
  },
  "recommendedIdeas": ["立意方向1", "立意方向2", "立意方向3"],
  "warnings": ["避坑提醒1", "避坑提醒2"],
  "centralArguments": ["可选中心论点1", "可选中心论点2", "可选中心论点3"],
  "recommendedArgument": "最推荐的中心论点",
  "subArguments": [
    { "point": "分论点1", "logic": "与其他分论点的逻辑关系", "material": "适合搭配的素材方向" },
    { "point": "分论点2", "logic": "与其他分论点的逻辑关系", "material": "适合搭配的素材方向" },
    { "point": "分论点3", "logic": "与其他分论点的逻辑关系", "material": "适合搭配的素材方向" }
  ],
  "materials": [
    { "type": "素材类型", "content": "素材方向说明", "angle": "适用角度" }
  ]
}`

const materialSchema = `{
  "peopleExamples": [
    { "name": "人物名称", "description": "事例说明", "angle": "适用角度" }
  ],
  "hotTopics": [
    { "title": "时评热点名称", "description": "热点说明", "angle": "适用角度" }
  ],
  "quotes": [
    { "content": "名言原文", "description": "适用说明" }
  ],
  "usageExample": "一段素材使用示范"
}`

const diagnosisSchema = DIAGNOSIS_JSON_SCHEMA

const writingWorkflowSchema = `{
  "topicAnalysis": {
    "keywords": ["关键词1", "关键词2"],
    "coreTopic": "核心命题",
    "warnings": ["审题避坑提醒1", "审题避坑提醒2"]
  },
  "ideas": ["推荐立意1", "推荐立意2", "推荐立意3"],
  "argumentStructure": {
    "centralArgument": "中心论点",
    "subArguments": [
      { "point": "分论点1", "logic": "展开逻辑", "material": "适配素材方向" },
      { "point": "分论点2", "logic": "展开逻辑", "material": "适配素材方向" },
      { "point": "分论点3", "logic": "展开逻辑", "material": "适配素材方向" }
    ]
  },
  "materials": [
    { "title": "素材名称", "description": "素材说明", "angle": "适用角度" }
  ],
  "outline": {
    "title": "拟题建议",
    "opening": "开头思路",
    "bodyParagraphs": [
      { "title": "主体段1", "topicSentence": "段落中心句", "content": "展开思路", "material": "可用素材" },
      { "title": "主体段2", "topicSentence": "段落中心句", "content": "展开思路", "material": "可用素材" },
      { "title": "主体段3", "topicSentence": "段落中心句", "content": "展开思路", "material": "可用素材" }
    ],
    "ending": "结尾升华思路"
  },
  "thinkingQuestions": ["追问1", "追问2", "追问3"]
}`

function serializeCurrentResult(value: unknown, fallbackText: string) {
  if (!value) {
    return fallbackText || '暂无当前结果'
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return fallbackText || '暂无当前结果'
  }
}

function getAction(actions: readonly RefineActionConfig[], actionId: string) {
  return actions.find((action) => action.id === actionId) || {
    id: actionId,
    label: actionId,
    instruction: '基于用户选择继续优化当前结果。',
  }
}

function buildRefineMessages(args: {
  originalInput: string
  currentResult: unknown
  currentText: string
  action: RefineActionConfig
  schema: string
  extraRule?: string
  selfWritingReminder?: boolean
}): ChatMessage[] {
  const studentLearningMode = getStudentLearningMode()
  const schema = appendSchemaFields(args.schema, [
    studentLearningMode && args.selfWritingReminder
      ? `,
  "selfWritingReminder": "AI 已帮你搭建思路，完整作文建议由你自己完成，这样才能真正提升写作能力。"`
      : '',
    studentLearningMode ? `,
  "thinkingPrompts": ["思考提示1", "思考提示2", "思考提示3"]` : '',
  ].filter(Boolean))

  return [
    refineSystemPrompt,
    {
      role: 'user',
      content: `请基于当前结果继续优化。

原始输入：
${args.originalInput}

当前结果：
${serializeCurrentResult(args.currentResult, args.currentText)}

用户选择的优化动作：${args.action.label}
动作要求：${args.action.instruction}

${buildStudentLearningModeRules(studentLearningMode)}

${args.extraRule ? `${args.extraRule}\n\n` : ''}${jsonOnlyRules}

JSON 结构：
${schema}
`,
    },
  ]
}

export function buildTopicRefinePrompt(input: RefinePromptInput<TopicAnalysisResult, TopicRefineAction>): ChatMessage[] {
  return buildRefineMessages({
    originalInput: input.originalInput,
    currentResult: input.currentResult,
    currentText: input.currentText,
    action: getAction(topicRefineActions, input.action),
    schema: topicSchema,
  })
}

export function buildArgumentRefinePrompt(
  input: RefinePromptInput<ArgumentGeneratorResult, ArgumentRefineAction>,
): ChatMessage[] {
  return buildRefineMessages({
    originalInput: input.originalInput,
    currentResult: input.currentResult,
    currentText: input.currentText,
    action: getAction(argumentRefineActions, input.action),
    schema: argumentSchema,
    extraRule: '论点生成结果需要保留或更新 recommendedIdeas 和 warnings：recommendedIdeas 固定 3 条，warnings 输出 2-3 条。',
  })
}

export function buildMaterialRefinePrompt(
  input: RefinePromptInput<MaterialRecommendResult, MaterialRefineAction>,
): ChatMessage[] {
  return buildRefineMessages({
    originalInput: input.originalInput,
    currentResult: input.currentResult,
    currentText: input.currentText,
    action: getAction(materialRefineActions, input.action),
    schema: materialSchema,
  })
}

export function buildDiagnosisRefinePrompt(
  input: RefinePromptInput<EssayDiagnosisResult, DiagnosisRefineAction>,
): ChatMessage[] {
  return buildRefineMessages({
    originalInput: input.originalInput,
    currentResult: input.currentResult,
    currentText: input.currentText,
    action: getAction(diagnosisRefineActions, input.action),
    schema: diagnosisSchema,
    extraRule: `${DIAGNOSIS_SCORING_STANDARD}\n\n${DIAGNOSIS_SCORING_RULE}`,
  })
}

export function buildWritingWorkflowRefinePrompt(
  input: RefinePromptInput<WritingWorkflowResult, WritingWorkflowRefineAction>,
): ChatMessage[] {
  return buildRefineMessages({
    originalInput: input.originalInput,
    currentResult: input.currentResult,
    currentText: input.currentText,
    action: getAction(writingWorkflowRefineActions, input.action),
    schema: writingWorkflowSchema,
    selfWritingReminder: true,
    extraRule:
      '继续保持“不直接生成完整作文”的边界，只优化审题、立意、论点、素材、大纲和追问提示。返回短而完整的 JSON：ideas、subArguments、materials、bodyParagraphs 各 3 条以内，单条内容控制在 80 个字以内。',
  })
}
