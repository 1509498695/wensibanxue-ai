import type { ArgumentGeneratorResult, TopicAnalysisResult, WritingWorkflowResult } from '../types/results'
import type { KeywordFollowUpDraft, KeywordFollowUpQuestionId } from '../services/keywordFollowUp'
import type { UpgradeThinkingDraft, UpgradeThinkingQuestionId } from '../services/upgradeThinking'

export const LAST_TOPIC_ANALYSIS_KEY = 'wensibanxue-ai:last-topic-analysis'
export const LAST_ARGUMENT_GENERATOR_KEY = 'wensibanxue-ai:last-argument-generator'
export const LAST_WRITING_WORKFLOW_KEY = 'wensibanxue-ai:last-writing-workflow'

const LEGACY_TOPIC_ANALYSIS_KEY = 'wensibanxue-ai:topic-page-state'
const LEGACY_ARGUMENT_GENERATOR_KEY = 'wensibanxue-ai:argument-page-state'
const LEGACY_WRITING_WORKFLOW_KEY = 'wensibanxue-ai:workflow-page-state'

export type LastTopicAnalysisState = {
  input?: string
  depth?: string
  resultText?: string
  structuredResult?: TopicAnalysisResult | null
  isTextFallback?: boolean
  lastGeneratedAt?: string
  followUpKeyword?: string
  followUpQuestionId?: KeywordFollowUpQuestionId | UpgradeThinkingQuestionId
  followUpFullQuestion?: string
  followUpAnswer?: string
  followUpSummary?: string
  followUpSummaries?: string[]
  followUpDrafts?: Array<KeywordFollowUpDraft | UpgradeThinkingDraft>
}

export type LastArgumentGeneratorState = {
  input?: string
  difficulty?: string
  resultText?: string
  structuredResult?: ArgumentGeneratorResult | null
  isTextFallback?: boolean
  lastGeneratedAt?: string
  followUpKeyword?: string
  followUpQuestionId?: KeywordFollowUpQuestionId
  followUpFullQuestion?: string
  followUpAnswer?: string
  followUpSummary?: string
  followUpSummaries?: string[]
  followUpDrafts?: KeywordFollowUpDraft[]
}

export type WritingWorkflowStepId = 'topic' | 'ideas' | 'argument' | 'materials' | 'outline'

export type LastWritingWorkflowState = {
  input?: string
  difficulty?: string
  resultText?: string
  structuredResult?: WritingWorkflowResult | null
  isTextFallback?: boolean
  expandedSteps?: WritingWorkflowStepId[]
}

const validWritingWorkflowSteps: WritingWorkflowStepId[] = ['topic', 'ideas', 'argument', 'materials', 'outline']

export function normalizeFollowUpSummaries(state: {
  followUpSummary?: string
  followUpSummaries?: string[]
}) {
  if (Array.isArray(state.followUpSummaries)) {
    return state.followUpSummaries.filter(Boolean).slice(0, 5)
  }

  return state.followUpSummary ? [state.followUpSummary].slice(0, 5) : []
}

export function normalizeWritingWorkflowSteps(value: unknown): WritingWorkflowStepId[] {
  if (!Array.isArray(value)) {
    return validWritingWorkflowSteps
  }

  const normalizedSteps = value.filter((step): step is WritingWorkflowStepId =>
    validWritingWorkflowSteps.includes(step as WritingWorkflowStepId),
  )

  return normalizedSteps.length > 0 ? normalizedSteps : validWritingWorkflowSteps
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readState<T>(key: string, legacyKey: string): T {
  if (!canUseLocalStorage()) {
    return {} as T
  }

  try {
    const stored = window.localStorage.getItem(key) || window.localStorage.getItem(legacyKey)

    return stored ? (JSON.parse(stored) as T) : ({} as T)
  } catch {
    return {} as T
  }
}

function writeState(key: string, value: unknown) {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage failures; the page can still work during the current visit.
  }
}

export function readLastTopicAnalysisState() {
  return readState<LastTopicAnalysisState>(LAST_TOPIC_ANALYSIS_KEY, LEGACY_TOPIC_ANALYSIS_KEY)
}

export function writeLastTopicAnalysisState(value: LastTopicAnalysisState) {
  writeState(LAST_TOPIC_ANALYSIS_KEY, value)
}

export function readLastArgumentGeneratorState() {
  return readState<LastArgumentGeneratorState>(LAST_ARGUMENT_GENERATOR_KEY, LEGACY_ARGUMENT_GENERATOR_KEY)
}

export function writeLastArgumentGeneratorState(value: LastArgumentGeneratorState) {
  writeState(LAST_ARGUMENT_GENERATOR_KEY, value)
}

export function syncWritingWorkflowInputToArgumentState(input: string) {
  const currentState = readLastArgumentGeneratorState()

  if (currentState.input === input) {
    return
  }

  writeLastArgumentGeneratorState({
    input,
    difficulty: currentState.difficulty,
    resultText: '',
    structuredResult: null,
    isTextFallback: false,
    lastGeneratedAt: '',
    followUpKeyword: '',
    followUpQuestionId: undefined,
    followUpFullQuestion: '',
    followUpAnswer: '',
    followUpSummaries: [],
    followUpDrafts: [],
  })
}

export function readLastWritingWorkflowState() {
  return readState<LastWritingWorkflowState>(LAST_WRITING_WORKFLOW_KEY, LEGACY_WRITING_WORKFLOW_KEY)
}

export function writeLastWritingWorkflowState(value: LastWritingWorkflowState) {
  writeState(LAST_WRITING_WORKFLOW_KEY, value)
}
