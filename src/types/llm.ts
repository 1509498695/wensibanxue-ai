export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type LLMConfig = {
  apiBaseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

export type LLMResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}
