export {}

declare global {
  type RendererAppConfig = {
    provider?: string
    apiBaseUrl?: string
    apiKey?: string
    apiKeysByProvider?: Record<string, string>
    model?: string
    temperature?: string
    maxTokens?: string
    defaultDifficulty?: string
    saveHistory?: boolean
    showHomeOnLaunch?: boolean
    demoMode?: boolean
    studentLearningMode?: boolean
    studentMode?: boolean
    autoRepairJson?: boolean
    customApiBaseUrl?: string
    customModel?: string
  }

  type SaveFileFilter = {
    name: string
    extensions: string[]
  }

  type OpenEssayFileResult = {
    canceled: boolean
    error?: string
    fileName?: string
    filePath?: string
    text?: string
  }

  interface Window {
    electronAPI?: {
      getConfig: () => Promise<RendererAppConfig>
      setConfig: (config: RendererAppConfig) => Promise<{ ok: boolean }>
      clearConfig: () => Promise<{ ok: boolean }>
    }
    wensibanxue: {
      platform: string
      versions: {
        chrome: string
        electron: string
        node: string
      }
      saveFile?: (
        content: string,
        defaultFileName: string,
        filters: SaveFileFilter[],
      ) => Promise<{
        canceled: boolean
        filePath?: string
      }>
      openEssayFile?: () => Promise<OpenEssayFileResult>
      getConfig?: () => Promise<RendererAppConfig>
      setConfig?: (config: RendererAppConfig) => Promise<{ ok: boolean }>
      clearConfig?: () => Promise<{ ok: boolean }>
    }
  }
}
