export type ResultTextItem = string | {
  title?: string
  name?: string
  text?: string
  content?: string
  description?: string
  angle?: string
  example?: string
  reason?: string
}

export type TopicAnalysisResult = {
  keywords?: string[]
  coreTopic?: string
  recommendedIdeas?: ResultTextItem[]
  writingAngles?: ResultTextItem[]
  warnings?: ResultTextItem[]
  thinkingPrompts?: ResultTextItem[]
}

export type ArgumentGeneratorResult = {
  analysis?: {
    keywords?: string[]
    coreTopic?: string
    writingFocus?: string
    warning?: string
  }
  recommendedIdeas?: ResultTextItem[]
  warnings?: ResultTextItem[]
  centralArguments?: ResultTextItem[]
  recommendedArgument?: string
  subArguments?: Array<{
    point?: string
    material?: string
    logic?: string
  } | string>
  materials?: Array<{
    type?: string
    content?: string
    text?: string
    angle?: string
  } | string>
  thinkingPrompts?: ResultTextItem[]
}

export type MaterialRecommendResult = {
  peopleExamples?: ResultTextItem[]
  hotTopics?: ResultTextItem[]
  quotes?: ResultTextItem[]
  usageExample?: string
  thinkingPrompts?: ResultTextItem[]
}

export type EssayDiagnosisResult = {
  totalScore?: number | null
  level?: string
  percentile?: string
  dimensionScores?: Array<{
    basis?: string
    description?: string
    grade?: string
    label?: string
    name?: string
    reason?: string
    score?: number | null
    text?: string
    value?: number | null
  }>
  mainProblems?: ResultTextItem[]
  suggestions?: ResultTextItem[]
  optimizedExample?: string
  nextPracticeSuggestions?: ResultTextItem[]
  thinkingPrompts?: ResultTextItem[]
}

export type WritingWorkflowResult = {
  topicAnalysis?: {
    keywords?: string[]
    coreTopic?: string
    warnings?: ResultTextItem[]
  }
  ideas?: ResultTextItem[]
  argumentStructure?: {
    centralArgument?: string
    subArguments?: Array<{
      point?: string
      logic?: string
      material?: string
    } | string>
  }
  materials?: ResultTextItem[]
  outline?: {
    title?: string
    opening?: string
    bodyParagraphs?: Array<{
      title?: string
      topicSentence?: string
      content?: string
      material?: string
    } | string>
    ending?: string
  }
  thinkingQuestions?: ResultTextItem[]
  selfWritingReminder?: string
  thinkingPrompts?: ResultTextItem[]
}
