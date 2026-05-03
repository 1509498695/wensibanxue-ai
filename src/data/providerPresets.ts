export type ProviderKey = 'openai' | 'deepseek' | 'qwen' | 'glm' | 'kimi' | 'custom'

export type ProviderPreset = {
  key: ProviderKey
  name: string
  apiBaseUrl: string
  modelExamples: string[]
  docsHint?: string
}

export const CUSTOM_PROVIDER_KEY: ProviderKey = 'custom'

export const providerPresets: ProviderPreset[] = [
  {
    key: 'openai',
    name: 'OpenAI',
    apiBaseUrl: 'https://api.openai.com/v1',
    modelExamples: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
    docsHint: '适用于 OpenAI 官方 Chat Completions 接口。',
  },
  {
    key: 'deepseek',
    name: 'DeepSeek',
    apiBaseUrl: 'https://api.deepseek.com',
    modelExamples: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'],
    docsHint:
      'DeepSeek 使用 OpenAI 兼容地址。deepseek-chat 与 deepseek-reasoner 将于 2026/07/24 弃用，推荐使用 deepseek-v4-flash / deepseek-v4-pro。',
  },
  {
    key: 'qwen',
    name: '通义千问',
    apiBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelExamples: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    docsHint: '适用于阿里云百炼 OpenAI 兼容模式。',
  },
  {
    key: 'glm',
    name: '智谱 GLM',
    apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    modelExamples: ['glm-4-flash', 'glm-4-plus', 'glm-4-air'],
    docsHint: '适用于智谱 AI OpenAI 兼容调用地址。',
  },
  {
    key: 'kimi',
    name: '月之暗面 Kimi',
    apiBaseUrl: 'https://api.moonshot.cn/v1',
    modelExamples: ['moonshot-v1-8k', 'moonshot-v1-32k', 'kimi-k2'],
    docsHint: '适用于 Moonshot OpenAI 兼容接口。',
  },
  {
    key: CUSTOM_PROVIDER_KEY,
    name: '自定义 OpenAI 兼容接口',
    apiBaseUrl: '',
    modelExamples: [],
    docsHint: '适用于任何支持 /chat/completions 的 OpenAI 兼容服务。',
  },
]

export function getProviderPreset(provider: string | undefined) {
  return providerPresets.find((preset) => preset.key === provider) || providerPresets[0]
}
