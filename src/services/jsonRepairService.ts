import { chatCompletionWithConfig, getLLMConfig } from './llmClient'
import { loadAppSettings } from './settingsService'
import { safeJsonParse } from '../utils/safeJsonParse'

const repairNotice = '模型返回格式已自动修复。'

export type JsonParseWithRepairResult<T> = {
  result: T | null
  repaired: boolean
  notice?: string
}

export function getJsonRepairNotice() {
  return repairNotice
}

export async function parseModelJsonWithRepair<T = unknown>(rawText: string): Promise<JsonParseWithRepairResult<T>> {
  const localParsed = safeJsonParse<T>(rawText)

  if (localParsed !== null) {
    return {
      result: localParsed,
      repaired: false,
    }
  }

  const settings = loadAppSettings()
  const config = getLLMConfig()

  if (!settings.autoRepairJson || settings.demoMode || !config.apiKey) {
    return {
      result: null,
      repaired: false,
    }
  }

  try {
    const repairedText = await chatCompletionWithConfig(
      [
        {
          role: 'system',
          content:
            '你是 JSON 格式修复工具。只返回合法 JSON，不要返回 Markdown、解释文字或代码块。不要改变字段含义，不要新增无依据内容。',
        },
        {
          role: 'user',
          content: `请将以下内容修复为合法 JSON，不要改变字段含义，不要添加解释。\n\n${rawText}`,
        },
      ],
      {
        ...config,
        temperature: 0,
      },
    )
    const repairedParsed = safeJsonParse<T>(repairedText)

    return {
      result: repairedParsed,
      repaired: repairedParsed !== null,
      notice: repairedParsed !== null ? repairNotice : undefined,
    }
  } catch {
    return {
      result: null,
      repaired: false,
    }
  }
}
