import type {
  ArgumentGeneratorResult,
  EssayDiagnosisResult,
  MaterialRecommendResult,
  ResultTextItem,
  TopicAnalysisResult,
  WritingWorkflowResult,
} from '../types/results'
import {
  DEFAULT_NEXT_PRACTICE_SUGGESTIONS,
  DEFAULT_SELF_WRITING_REMINDER,
  DEFAULT_THINKING_PROMPTS,
} from './learningGuidance'
import { getStudentLearningMode } from '../services/settingsService'
import {
  ESSAY_DIMENSION_SCORE,
  ESSAY_TOTAL_SCORE,
  normalizeEssayDiagnosisScores,
} from './essayDiagnosisScoring'

export { ESSAY_DIMENSION_SCORE, ESSAY_TOTAL_SCORE } from './essayDiagnosisScoring'

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function textFromItem(item: ResultTextItem | undefined) {
  if (!item) {
    return ''
  }

  if (typeof item === 'string') {
    return item.trim()
  }

  const heading = item.title || item.name
  const body = item.text || item.content || item.description || item.example || item.reason
  const suffix = item.angle ? `适用角度：${item.angle}` : ''

  return [heading, body, suffix].filter(hasText).join('：')
}

function lineList(title: string, values: Array<ResultTextItem | undefined> | undefined) {
  const items = Array.isArray(values) ? values.map(textFromItem).filter(hasText) : []

  return [`## ${title}`, items.length > 0 ? items.map((item, index) => `${index + 1}. ${item}`).join('\n') : '暂无数据']
}

function tagList(title: string, values: string[] | undefined) {
  const items = Array.isArray(values) ? values.filter(hasText) : []

  return [`## ${title}`, items.length > 0 ? items.join('、') : '暂无数据']
}

function thinkingPromptSection(values: Array<ResultTextItem | undefined> | undefined) {
  const items = Array.isArray(values) ? values.map(textFromItem).filter(hasText) : []

  if (!getStudentLearningMode() && items.length === 0) {
    return []
  }

  return [
    '',
    '## 继续思考',
    (items.length > 0 ? items : DEFAULT_THINKING_PROMPTS).map((item, index) => `${index + 1}. ${item}`).join('\n'),
  ]
}

export function formatTopicAnalysisResult(result: TopicAnalysisResult) {
  return [
    ...tagList('关键词', result.keywords),
    '',
    '## 核心命题',
    result.coreTopic || '暂无数据',
    '',
    ...lineList('推荐立意', result.recommendedIdeas),
    '',
    ...lineList('写作角度', result.writingAngles),
    '',
    ...lineList('避坑提醒', result.warnings),
    ...thinkingPromptSection(result.thinkingPrompts),
  ].join('\n')
}

export function formatArgumentGeneratorResult(result: ArgumentGeneratorResult) {
  const subArguments = Array.isArray(result.subArguments)
    ? result.subArguments.map((item) => {
        if (typeof item === 'string') {
          return item
        }

        return [item.point, item.logic, item.material ? `素材方向：${item.material}` : ''].filter(hasText).join('；')
      })
    : []
  const materials = Array.isArray(result.materials)
    ? result.materials.map((item) => {
        if (typeof item === 'string') {
          return item
        }

        return [item.type, item.content || item.text, item.angle ? `适用角度：${item.angle}` : ''].filter(hasText).join('：')
      })
    : []

  return [
    ...tagList('关键词', result.analysis?.keywords),
    '',
    '## 题目分析',
    `核心话题：${result.analysis?.coreTopic || '暂无数据'}`,
    `写作重点：${result.analysis?.writingFocus || '暂无数据'}`,
    `提醒：${result.analysis?.warning || '暂无数据'}`,
    '',
    ...lineList('推荐立意', result.recommendedIdeas),
    '',
    ...lineList('避坑提醒', result.warnings),
    '',
    ...lineList('可选中心论点', result.centralArguments),
    '',
    '## 推荐中心论点',
    result.recommendedArgument || '暂无数据',
    '',
    '## 分论点结构',
    subArguments.length > 0 ? subArguments.map((item, index) => `${index + 1}. ${item}`).join('\n') : '暂无数据',
    '',
    '## 推荐素材方向',
    materials.length > 0 ? materials.map((item, index) => `${index + 1}. ${item}`).join('\n') : '暂无数据',
    ...thinkingPromptSection(result.thinkingPrompts),
  ].join('\n')
}

export function formatMaterialRecommendResult(result: MaterialRecommendResult) {
  return [
    ...lineList('人物事例', result.peopleExamples),
    '',
    ...lineList('时评热点', result.hotTopics),
    '',
    ...lineList('名言警句', result.quotes),
    '',
    '## 使用示范',
    result.usageExample || '暂无数据',
    ...thinkingPromptSection(result.thinkingPrompts),
  ].join('\n')
}

export function formatEssayDiagnosisResult(result: EssayDiagnosisResult) {
  const scoreSummary = normalizeEssayDiagnosisScores(result)
  const totalScore = scoreSummary.totalScore
  const dimensionScores = scoreSummary.dimensions.map((item) => {
    const scoreText = scoreSummary.isStrictStandard
      ? `${item.score} / ${ESSAY_DIMENSION_SCORE}（${item.grade}）`
      : `${item.score}（${item.grade}）`
    const basis = item.basis ? ` - ${item.basis}` : ''

    return `${item.label}：${scoreText}${basis}`
  })
  const practiceItems = Array.isArray(result.nextPracticeSuggestions)
    ? result.nextPracticeSuggestions.map(textFromItem).filter(hasText)
    : []

  return [
    '## 综合评分',
    totalScore === null ? '暂无数据' : `${totalScore} / ${ESSAY_TOTAL_SCORE}`,
    result.level ? `等级：${result.level}` : '',
    result.percentile ? `百分位：${result.percentile}` : '',
    '',
    '## 维度评分',
    dimensionScores.length > 0 ? dimensionScores.join('\n') : '暂无数据',
    '',
    ...lineList('主要问题', result.mainProblems),
    '',
    ...lineList('修改建议', result.suggestions),
    '',
    '## 优化示例',
    result.optimizedExample || '暂无数据',
    '',
    '## 下一步练习建议',
    (practiceItems.length > 0 ? practiceItems : DEFAULT_NEXT_PRACTICE_SUGGESTIONS)
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n'),
    ...thinkingPromptSection(result.thinkingPrompts),
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
}

export function formatWritingWorkflowResult(result: WritingWorkflowResult) {
  const subArguments = Array.isArray(result.argumentStructure?.subArguments)
    ? result.argumentStructure.subArguments.map((item) => {
        if (typeof item === 'string') {
          return item
        }

        return [item.point, item.logic, item.material ? `素材方向：${item.material}` : ''].filter(hasText).join('；')
      })
    : []
  const bodyParagraphs = Array.isArray(result.outline?.bodyParagraphs)
    ? result.outline.bodyParagraphs.map((item) => {
        if (typeof item === 'string') {
          return item
        }

        return [item.title, item.topicSentence, item.content, item.material ? `素材：${item.material}` : '']
          .filter(hasText)
          .join('：')
      })
    : []

  return [
    ...tagList('Step 1 审题分析：关键词', result.topicAnalysis?.keywords),
    '',
    '## Step 1 审题分析：核心命题',
    result.topicAnalysis?.coreTopic || '暂无数据',
    '',
    ...lineList('Step 1 审题分析：避坑提醒', result.topicAnalysis?.warnings),
    '',
    ...lineList('Step 2 推荐立意', result.ideas),
    '',
    '## Step 3 论点结构',
    `中心论点：${result.argumentStructure?.centralArgument || '暂无数据'}`,
    subArguments.length > 0 ? subArguments.map((item, index) => `${index + 1}. ${item}`).join('\n') : '暂无数据',
    '',
    ...lineList('Step 4 素材匹配', result.materials),
    '',
    '## Step 5 写作大纲',
    `拟题建议：${result.outline?.title || '暂无数据'}`,
    `开头思路：${result.outline?.opening || '暂无数据'}`,
    bodyParagraphs.length > 0 ? bodyParagraphs.map((item, index) => `${index + 1}. ${item}`).join('\n') : '暂无数据',
    `结尾升华：${result.outline?.ending || '暂无数据'}`,
    '',
    ...lineList('思考追问', result.thinkingQuestions),
    getStudentLearningMode() || result.selfWritingReminder ? '' : '',
    getStudentLearningMode() || result.selfWritingReminder ? '## 自主写作提醒' : '',
    getStudentLearningMode() || result.selfWritingReminder ? result.selfWritingReminder || DEFAULT_SELF_WRITING_REMINDER : '',
    ...thinkingPromptSection(result.thinkingPrompts),
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n')
}
