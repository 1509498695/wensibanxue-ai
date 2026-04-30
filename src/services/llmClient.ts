import type { ChatMessage, LLMConfig, LLMResponse } from '../types/llm'

const SETTINGS_STORAGE_KEY = 'wensibanxue-ai:settings'
const DEFAULT_CONFIG: LLMConfig = {
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
}

type StoredLLMSettings = Partial<{
  apiBaseUrl: string
  apiKey: string
  model: string
  modelName: string
  temperature: string | number
  maxTokens: string | number
}>

function normalizeBaseUrl(apiBaseUrl: string) {
  return apiBaseUrl.trim().replace(/\/+$/, '')
}

function toNumber(value: string | number | undefined, fallback: number) {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

function readStoredSettings(): StoredLLMSettings {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)

    if (!stored) {
      return {}
    }

    return JSON.parse(stored) as StoredLLMSettings
  } catch {
    return {}
  }
}

export function getLLMConfig(): LLMConfig {
  const storedSettings = readStoredSettings()

  return {
    apiBaseUrl: normalizeBaseUrl(storedSettings.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl),
    apiKey: (storedSettings.apiKey || DEFAULT_CONFIG.apiKey).trim(),
    model: (storedSettings.model || storedSettings.modelName || DEFAULT_CONFIG.model).trim(),
    temperature: toNumber(storedSettings.temperature, DEFAULT_CONFIG.temperature),
    maxTokens: toNumber(storedSettings.maxTokens, DEFAULT_CONFIG.maxTokens),
  }
}

async function parseLLMResponse(response: Response): Promise<LLMResponse> {
  try {
    return (await response.json()) as LLMResponse
  } catch {
    throw new Error('模型返回格式异常')
  }
}

export async function chatCompletionWithConfig(messages: ChatMessage[], config: LLMConfig): Promise<string> {
  const normalizedConfig: LLMConfig = {
    ...config,
    apiBaseUrl: normalizeBaseUrl(config.apiBaseUrl),
    apiKey: config.apiKey.trim(),
    model: config.model.trim(),
  }

  if (!normalizedConfig.apiKey) {
    throw new Error('请先在设置中配置 API Key')
  }

  let response: Response

  try {
    response = await fetch(`${normalizedConfig.apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${normalizedConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: normalizedConfig.model,
        messages,
        temperature: normalizedConfig.temperature,
        max_tokens: normalizedConfig.maxTokens,
      }),
    })
  } catch {
    throw new Error('接口请求失败，请检查网络或 API 配置')
  }

  const data = await parseLLMResponse(response)

  if (!response.ok) {
    throw new Error(data.error?.message || '接口请求失败，请检查网络或 API 配置')
  }

  const content = data.choices?.[0]?.message?.content

  if (typeof content !== 'string') {
    throw new Error('模型返回格式异常')
  }

  return content
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  return chatCompletionWithConfig(messages, getLLMConfig())
}
