import type { ArgumentGeneratorResult, TopicAnalysisResult } from '../types/results'

export const LAST_TOPIC_ANALYSIS_KEY = 'wensibanxue-ai:last-topic-analysis'
export const LAST_ARGUMENT_GENERATOR_KEY = 'wensibanxue-ai:last-argument-generator'

const LEGACY_TOPIC_ANALYSIS_KEY = 'wensibanxue-ai:topic-page-state'
const LEGACY_ARGUMENT_GENERATOR_KEY = 'wensibanxue-ai:argument-page-state'

export type LastTopicAnalysisState = {
  input?: string
  depth?: string
  resultText?: string
  structuredResult?: TopicAnalysisResult | null
  isTextFallback?: boolean
  lastGeneratedAt?: string
}

export type LastArgumentGeneratorState = {
  input?: string
  difficulty?: string
  resultText?: string
  structuredResult?: ArgumentGeneratorResult | null
  isTextFallback?: boolean
  lastGeneratedAt?: string
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
