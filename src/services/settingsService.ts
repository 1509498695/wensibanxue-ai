import { CUSTOM_PROVIDER_KEY, getProviderPreset, providerPresets, type ProviderKey } from '../data/providerPresets'

export type AppSettings = {
  provider: ProviderKey
  apiBaseUrl: string
  apiKey: string
  apiKeysByProvider: Partial<Record<ProviderKey, string>>
  model: string
  customApiBaseUrl: string
  customModel: string
  temperature: string
  maxTokens: string
  defaultDifficulty: string
  saveHistory: boolean
  showHomeOnLaunch: boolean
  studentLearningMode: boolean
  demoMode: boolean
  autoRepairJson: boolean
}

type StoredAppSettings = Partial<AppSettings> & {
  modelName?: string
  studentMode?: boolean
}

export const SETTINGS_STORAGE_KEY = 'wensibanxue-ai:settings'

export const defaultAppSettings: AppSettings = {
  provider: 'openai',
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  apiKeysByProvider: {},
  model: 'gpt-4o-mini',
  customApiBaseUrl: '',
  customModel: '',
  temperature: '0.7',
  maxTokens: '2000',
  defaultDifficulty: '提升',
  saveHistory: true,
  showHomeOnLaunch: true,
  studentLearningMode: true,
  demoMode: true,
  autoRepairJson: true,
}

let cachedSettings = defaultAppSettings

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function getConfigApi() {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.electronAPI || window.wensibanxue
}

function isProviderKey(value: unknown): value is ProviderKey {
  return typeof value === 'string' && getProviderPreset(value).key === value
}

function normalizeBaseUrl(apiBaseUrl: string | undefined) {
  return (apiBaseUrl || '').trim().replace(/\/+$/, '')
}

function inferProvider(storedSettings: StoredAppSettings): ProviderKey {
  if (isProviderKey(storedSettings.provider)) {
    return storedSettings.provider
  }

  const normalizedStoredBaseUrl = normalizeBaseUrl(storedSettings.apiBaseUrl)
  const matchedPreset = providerPresets.find(
    (preset) => preset.key !== CUSTOM_PROVIDER_KEY && normalizeBaseUrl(preset.apiBaseUrl) === normalizedStoredBaseUrl,
  )

  return matchedPreset?.key || defaultAppSettings.provider
}

function normalizeSettings(storedSettings: StoredAppSettings): AppSettings {
  const provider = inferProvider(storedSettings)
  const providerPreset = getProviderPreset(provider)
  const model = storedSettings.model || storedSettings.modelName || providerPreset.modelExamples[0] || defaultAppSettings.model
  const apiBaseUrl = storedSettings.apiBaseUrl || providerPreset.apiBaseUrl || defaultAppSettings.apiBaseUrl
  const apiKeysByProvider: Partial<Record<ProviderKey, string>> = {
    ...(storedSettings.apiKeysByProvider || {}),
  }

  if (storedSettings.apiKey !== undefined && apiKeysByProvider[provider] === undefined) {
    apiKeysByProvider[provider] = storedSettings.apiKey
  }

  const apiKey = apiKeysByProvider[provider] ?? storedSettings.apiKey ?? defaultAppSettings.apiKey

  return {
    provider,
    apiBaseUrl,
    apiKey,
    apiKeysByProvider,
    model,
    customApiBaseUrl:
      storedSettings.customApiBaseUrl || (provider === CUSTOM_PROVIDER_KEY ? apiBaseUrl : defaultAppSettings.customApiBaseUrl),
    customModel: storedSettings.customModel || (provider === CUSTOM_PROVIDER_KEY ? model : defaultAppSettings.customModel),
    temperature: String(storedSettings.temperature || defaultAppSettings.temperature),
    maxTokens: String(storedSettings.maxTokens || defaultAppSettings.maxTokens),
    defaultDifficulty: storedSettings.defaultDifficulty || defaultAppSettings.defaultDifficulty,
    saveHistory: storedSettings.saveHistory ?? defaultAppSettings.saveHistory,
    showHomeOnLaunch: storedSettings.showHomeOnLaunch ?? defaultAppSettings.showHomeOnLaunch,
    studentLearningMode: storedSettings.studentLearningMode ?? storedSettings.studentMode ?? defaultAppSettings.studentLearningMode,
    demoMode: storedSettings.demoMode ?? defaultAppSettings.demoMode,
    autoRepairJson: storedSettings.autoRepairJson ?? defaultAppSettings.autoRepairJson,
  }
}

function toMainProcessConfig(config: AppSettings): RendererAppConfig {
  return {
    provider: config.provider,
    apiBaseUrl: config.apiBaseUrl,
    apiKey: config.apiKey,
    apiKeysByProvider: config.apiKeysByProvider as Record<string, string>,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    defaultDifficulty: config.defaultDifficulty,
    saveHistory: config.saveHistory,
    showHomeOnLaunch: config.showHomeOnLaunch,
    demoMode: config.demoMode,
    studentLearningMode: config.studentLearningMode,
    studentMode: config.studentLearningMode,
    autoRepairJson: config.autoRepairJson,
    customApiBaseUrl: config.customApiBaseUrl,
    customModel: config.customModel,
  }
}

function readLegacyLocalSettings(): StoredAppSettings | null {
  if (!canUseLocalStorage()) {
    return null
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)

    return stored ? (JSON.parse(stored) as StoredAppSettings) : null
  } catch {
    return null
  }
}

function removeLegacyLocalSettings() {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY)
  } catch {
    // Ignore storage failures; config has already been kept in memory.
  }
}

function writeFallbackLocalSettings(config: AppSettings) {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    // Fallback only: used when the Electron main-process store is unavailable
    // (for example browser preview). Desktop builds should use electron-store.
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore localStorage quota or privacy-mode failures.
  }
}

function hasConfigValue(config: RendererAppConfig | null | undefined) {
  if (!config) {
    return false
  }

  return Object.values(config).some((value) => {
    if (value === undefined || value === null) {
      return false
    }

    if (typeof value === 'object') {
      return Object.keys(value).length > 0
    }

    return true
  })
}

export async function hydrateAppSettings(): Promise<AppSettings> {
  const configApi = getConfigApi()
  const legacySettings = readLegacyLocalSettings()

  try {
    if (configApi?.getConfig) {
      const mainConfig = await configApi.getConfig()

      if (hasConfigValue(mainConfig)) {
        cachedSettings = normalizeSettings(mainConfig as StoredAppSettings)
        removeLegacyLocalSettings()
        return cachedSettings
      }

      if (legacySettings) {
        cachedSettings = normalizeSettings(legacySettings)
        await configApi.setConfig?.(toMainProcessConfig(cachedSettings))
        removeLegacyLocalSettings()
        return cachedSettings
      }
    }
  } catch {
    // Fall through to the documented localStorage fallback below.
  }

  if (legacySettings) {
    cachedSettings = normalizeSettings(legacySettings)
  }

  return cachedSettings
}

export function loadAppSettings(): AppSettings {
  return cachedSettings
}

export async function saveAppSettings(config: AppSettings) {
  const apiKeysByProvider: Partial<Record<ProviderKey, string>> = {
    ...config.apiKeysByProvider,
    [config.provider]: config.apiKey,
  }

  const nextConfig: AppSettings = {
    provider: config.provider,
    apiBaseUrl: config.apiBaseUrl,
    apiKey: config.apiKey,
    apiKeysByProvider,
    model: config.model,
    customApiBaseUrl: config.provider === CUSTOM_PROVIDER_KEY ? config.apiBaseUrl : config.customApiBaseUrl,
    customModel: config.provider === CUSTOM_PROVIDER_KEY ? config.model : config.customModel,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    defaultDifficulty: config.defaultDifficulty,
    saveHistory: config.saveHistory,
    showHomeOnLaunch: config.showHomeOnLaunch,
    studentLearningMode: config.studentLearningMode,
    demoMode: config.demoMode,
    autoRepairJson: config.autoRepairJson,
  }

  cachedSettings = nextConfig

  try {
    const configApi = getConfigApi()

    if (configApi?.setConfig) {
      await configApi.setConfig(toMainProcessConfig(nextConfig))
      removeLegacyLocalSettings()
      return
    }
  } catch {
    // Fall back below only when the Electron store bridge is unavailable.
  }

  writeFallbackLocalSettings(nextConfig)
}

export async function clearAppSettings() {
  cachedSettings = defaultAppSettings

  try {
    const configApi = getConfigApi()

    if (configApi?.clearConfig) {
      await configApi.clearConfig()
    }
  } catch {
    // Ignore bridge failures and still clear local fallback data.
  }

  removeLegacyLocalSettings()
}

export function getStudentLearningMode() {
  return loadAppSettings().studentLearningMode !== false
}

export function getDemoMode() {
  return loadAppSettings().demoMode !== false
}

export function getAppModeLabel() {
  return getDemoMode() ? '演示模式' : '真实 API 模式'
}
