import type { ChatMessage } from '../types/llm'
import { getStudentLearningMode } from './settingsService'
import {
  DIAGNOSIS_JSON_SCHEMA,
  DIAGNOSIS_SCORING_RULE,
  DIAGNOSIS_SCORING_STANDARD,
} from './essayDiagnosisStandard'

type TopicAnalysisOptions = {
  depth: string
}

type ArgumentGeneratorOptions = {
  difficulty: string
}

type MaterialRecommendOptions = {
  materialType: string
}

type WritingWorkflowOptions = {
  difficulty: string
}

const systemPrompt: ChatMessage = {
  role: 'system',
  content:
    '你是一名经验丰富、严格但温和的高中语文老师，擅长议论文写作指导。你不能直接代写整篇作文，而是帮助学生审题、构思、形成论证框架、积累可靠素材和改进表达。语言要清晰、具体，适合高中生理解。建议必须可操作，不要只说空话，不要编造过于冷门、难以核验或不可靠的素材。',
}

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

function thinkingPromptsSchema(isEnabled: boolean) {
  return isEnabled ? `,
  "thinkingPrompts": ["思考提示1", "思考提示2", "思考提示3"]` : ''
}

export function buildTopicAnalysisPrompt(input: string, options: TopicAnalysisOptions): ChatMessage[] {
  const studentLearningMode = getStudentLearningMode()

  return [
    systemPrompt,
    {
      role: 'user',
      content: `请对下面作文题目或材料做审题立意分析。

分析深度：${options.depth}

题目或材料：
${input}

你的身份：一名经验丰富的高中语文老师，擅长指导学生进行作文审题和立意。

${buildStudentLearningModeRules(studentLearningMode)}

输出要求：
1. 只返回一个 JSON 对象。
2. 不要返回 Markdown。
3. 不要返回解释性文字。
4. 不要使用 \`\`\`json 或 \`\`\` 代码块。
5. 字段名必须严格使用下面结构，不要新增顶层字段。
6. 所有数组为空时返回 []，未知文本返回空字符串。
7. recommendedIdeas 固定输出 3 条，warnings 输出 2-3 条。

JSON 结构：
{
  "keywords": ["关键词1", "关键词2"],
  "coreTopic": "材料或题目的核心命题",
  "recommendedIdeas": ["立意方向1", "立意方向2", "立意方向3"],
  "writingAngles": ["写作角度1", "写作角度2", "写作角度3"],
  "warnings": ["避坑提醒1", "避坑提醒2"]${thinkingPromptsSchema(studentLearningMode)}
}
`,
    },
  ]
}

export function buildArgumentGeneratorPrompt(input: string, options: ArgumentGeneratorOptions): ChatMessage[] {
  const studentLearningMode = getStudentLearningMode()

  return [
    systemPrompt,
    {
      role: 'user',
      content: `请围绕下面作文题目或材料，生成议论文论点与论证结构。

难度目标：${options.difficulty}

题目或材料：
${input}

你的身份：一名高中语文议论文写作辅导老师。

${buildStudentLearningModeRules(studentLearningMode)}

输出要求：
1. 只返回一个 JSON 对象。
2. 不要返回 Markdown。
3. 不要返回解释性文字。
4. 不要使用 \`\`\`json 或 \`\`\` 代码块。
5. 字段名必须严格使用下面结构，不要新增顶层字段。
6. 所有数组为空时返回 []，未知文本返回空字符串。
7. recommendedIdeas 固定输出 3 条，warnings 输出 2-3 条。

JSON 结构：
{
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
  ]${thinkingPromptsSchema(studentLearningMode)}
}
`,
    },
  ]
}

export function buildMaterialRecommendPrompt(input: string, options: MaterialRecommendOptions): ChatMessage[] {
  const studentLearningMode = getStudentLearningMode()

  return [
    systemPrompt,
    {
      role: 'user',
      content: `请根据下面写作主题推荐适合高中议论文使用的素材。

素材类型：${options.materialType}

写作主题：
${input}

你的身份：一名高中语文作文素材积累教练。

${buildStudentLearningModeRules(studentLearningMode)}

输出要求：
1. 只返回一个 JSON 对象。
2. 不要返回 Markdown。
3. 不要返回解释性文字。
4. 不要使用 \`\`\`json 或 \`\`\` 代码块。
5. 字段名必须严格使用下面结构，不要新增顶层字段。
6. 所有数组为空时返回 []，未知文本返回空字符串。

JSON 结构：
{
  "peopleExamples": [
    { "name": "人物名称", "description": "事例说明", "angle": "适用角度" }
  ],
  "hotTopics": [
    { "title": "时评热点名称", "description": "热点说明", "angle": "适用角度" }
  ],
  "quotes": [
    { "content": "名言原文", "description": "适用说明" }
  ],
  "usageExample": "一段素材使用示范"${thinkingPromptsSchema(studentLearningMode)}
}
`,
    },
  ]
}

export function buildEssayDiagnosisPrompt(input: { essay: string; topic: string }): ChatMessage[] {
  const studentLearningMode = getStudentLearningMode()

  return [
    systemPrompt,
    {
      role: 'user',
      content: `请严格按指定作文等级评分标准诊断下面这篇高中作文。

作文题目或材料：
${input.topic}

学生作文内容：
${input.essay}

你的身份：一名严格但温和的高中语文老师。

${buildStudentLearningModeRules(studentLearningMode)}
作文诊断特别要求：
1. 内容维度必须先判断学生作文是否符合题目或材料要求，再判定等级和分数。
2. dimensionScores 中“内容”的 basis 必须明确写出切题、基本切题或偏题依据。
3. optimizedExample 只能输出一小段片段优化，不要重写整篇作文；需要给出下一步练习建议。

${DIAGNOSIS_SCORING_STANDARD}

${DIAGNOSIS_SCORING_RULE}

输出要求：
1. 只返回一个 JSON 对象。
2. 不要返回 Markdown。
3. 不要返回解释性文字。
4. 不要使用 \`\`\`json 或 \`\`\` 代码块。
5. 字段名必须严格使用下面结构，不要新增顶层字段。
6. 所有数组为空时返回 []，未知文本返回空字符串，未知分数返回 null。

JSON 结构：
${DIAGNOSIS_JSON_SCHEMA.replace(/\n}$/, `${thinkingPromptsSchema(studentLearningMode)}\n}`)}
`,
    },
  ]
}

export function buildWritingWorkflowPrompt(input: string, options: WritingWorkflowOptions): ChatMessage[] {
  const studentLearningMode = getStudentLearningMode()

  return [
    systemPrompt,
    {
      role: 'user',
      content: `请围绕下面作文题目或材料，生成议论文五步写作思路搭建方案。

难度目标：${options.difficulty}

题目或材料：
${input}

你的身份：一名高中语文议论文写作辅导老师。

${buildStudentLearningModeRules(studentLearningMode)}

任务要求：
1. 串联审题、立意、论点、素材和大纲。
2. 不要直接生成完整作文。
3. 只生成写作思路、大纲和提示。
4. 内容要适合高中生理解和迁移。

输出要求：
1. 只返回一个 JSON 对象。
2. 不要返回 Markdown。
3. 不要返回解释性文字。
4. 不要使用 \`\`\`json 或 \`\`\` 代码块。
5. 字段名必须严格使用下面结构，不要新增顶层字段。
6. 所有数组为空时返回 []，未知文本返回空字符串。

长度控制：
1. 返回短而完整的 JSON，宁可简洁，不要生成超长内容。
2. keywords 4-6 个，warnings 2-3 条，ideas 固定 3 条。
3. subArguments 固定 3 条，每个字段不超过 42 个字。
4. materials 固定 3 条，description 不超过 60 个字。
5. bodyParagraphs 固定 3 段，content 不超过 80 个字。
6. thinkingQuestions 和 thinkingPrompts 各 3 条以内。

JSON 结构：
{
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
  "thinkingQuestions": ["追问1", "追问2", "追问3"]${
    studentLearningMode
      ? `,
  "selfWritingReminder": "AI 已帮你搭建思路，完整作文建议由你自己完成，这样才能真正提升写作能力。"`
      : ''
  }${thinkingPromptsSchema(studentLearningMode)}
}
`,
    },
  ]
}
