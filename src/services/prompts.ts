import type { ChatMessage } from '../types/llm'

type TopicAnalysisOptions = {
  grade: string
  depth: string
}

type ArgumentGeneratorOptions = {
  grade: string
  difficulty: string
}

type MaterialRecommendOptions = {
  grade: string
  materialType: string
}

type EssayDiagnosisOptions = {
  grade: string
}

const systemPrompt: ChatMessage = {
  role: 'system',
  content:
    '你是一名经验丰富、严格但温和的高中语文老师，擅长议论文写作指导。你不能直接代写整篇作文，而是帮助学生审题、构思、形成论证框架、积累可靠素材和改进表达。语言要清晰、具体，适合高中生理解。建议必须可操作，不要只说空话，不要编造过于冷门、难以核验或不可靠的素材。',
}

export function buildTopicAnalysisPrompt(input: string, options: TopicAnalysisOptions): ChatMessage[] {
  return [
    systemPrompt,
    {
      role: 'user',
      content: `请对下面作文题目或材料做审题立意分析。

学生年级：${options.grade}
分析深度：${options.depth}

题目或材料：
${input}

你的身份：一名经验丰富的高中语文老师，擅长指导学生进行作文审题和立意。

要求：
1. 不要直接写完整作文。
2. 先提取关键词。
3. 分析材料或题目的核心命题。
4. 给出 3 个适合高中生写作的立意方向。
5. 指出容易跑题或空泛的问题。
6. 给出适合的写作角度。
7. 语言要清晰、具体，适合高中生理解。

请用 Markdown 输出，严格包含以下二级标题：
## 关键词
## 核心命题
## 推荐立意
## 写作角度
## 避坑提醒
`,
    },
  ]
}

export function buildArgumentGeneratorPrompt(input: string, options: ArgumentGeneratorOptions): ChatMessage[] {
  return [
    systemPrompt,
    {
      role: 'user',
      content: `请围绕下面作文题目或材料，生成议论文论点与论证结构。

学生年级：${options.grade}
难度目标：${options.difficulty}

题目或材料：
${input}

你的身份：一名高中语文议论文写作辅导老师。

要求：
1. 不直接生成完整作文。
2. 先分析题目关键词。
3. 给出 3 个可选中心论点。
4. 推荐其中 1 个最稳妥、最有深度的中心论点。
5. 围绕推荐中心论点生成 3 个分论点。
6. 分论点之间要有逻辑递进关系。
7. 给出每个分论点适合搭配的素材方向。
8. 给出容易跑题的提醒。
9. 语言适合高中生。

请用 Markdown 输出，严格包含以下二级标题：
## 题目分析
## 可选中心论点
## 推荐中心论点
## 分论点结构
## 推荐素材方向
## 写作提醒
`,
    },
  ]
}

export function buildMaterialRecommendPrompt(input: string, options: MaterialRecommendOptions): ChatMessage[] {
  return [
    systemPrompt,
    {
      role: 'user',
      content: `请根据下面写作主题推荐适合高中议论文使用的素材。

学生年级：${options.grade}
素材类型：${options.materialType}

写作主题：
${input}

你的身份：一名高中语文作文素材积累教练。

要求：
1. 素材要适合高中作文。
2. 优先推荐常见、可靠、便于展开论证的素材。
3. 包含人物事例、时评热点、名言警句。
4. 每个素材要说明适用角度。
5. 给出一段素材使用示范。
6. 不要编造不存在的人物或事件。
7. 不要推荐过于冷门、学生难以掌握的素材。

请用 Markdown 输出，严格包含以下二级标题：
## 人物事例
## 时评热点
## 名言警句
## 适用角度
## 使用示范
`,
    },
  ]
}

export function buildEssayDiagnosisPrompt(input: string, options: EssayDiagnosisOptions): ChatMessage[] {
  return [
    systemPrompt,
    {
      role: 'user',
      content: `请诊断下面这篇高中作文。

学生年级：${options.grade}

作文内容：
${input}

你的身份：一名严格但温和的高中语文老师。

要求：
1. 不要完全代写作文。
2. 从审题立意、结构层次、论证逻辑、素材运用、语言表达五个维度评价。
3. 给出百分制总分。
4. 指出 3 个主要问题。
5. 给出具体修改建议。
6. 提供一小段优化示例。
7. 评价语言要鼓励学生，但问题要具体。
8. 不要只说空话。

请用 Markdown 输出，严格包含以下二级标题：
## 综合评分
## 维度评分
## 主要问题
## 修改建议
## 优化示例
## 下一步练习建议
`,
    },
  ]
}
