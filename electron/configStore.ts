import Store from 'electron-store'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type MainProcessAppConfig = {
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

let store: Store<{ config?: MainProcessAppConfig }> | null = null
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const bundledDefaultConfigFileName = 'default-api-config.local.json'

function getStore() {
  store ??= new Store<{ config?: MainProcessAppConfig }>({
    name: 'wensibanxue-config',
  })

  return store
}

function hasConfigValue(config: MainProcessAppConfig | undefined): config is MainProcessAppConfig {
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

    return value !== ''
  })
}

function getBundledDefaultConfigPaths() {
  return [
    path.join(__dirname, '../build', bundledDefaultConfigFileName),
    path.join(process.resourcesPath || '', 'app', 'build', bundledDefaultConfigFileName),
  ]
}

function readBundledDefaultConfig(): MainProcessAppConfig | null {
  for (const configPath of getBundledDefaultConfigPaths()) {
    if (!configPath || !existsSync(configPath)) {
      continue
    }

    try {
      const parsedConfig = JSON.parse(readFileSync(configPath, 'utf8')) as MainProcessAppConfig

      return hasConfigValue(parsedConfig) ? parsedConfig : null
    } catch {
      return null
    }
  }

  return null
}

export function getConfig(): MainProcessAppConfig {
  const currentConfig = getStore().get('config')

  if (hasConfigValue(currentConfig)) {
    return currentConfig
  }

  const bundledDefaultConfig = readBundledDefaultConfig()

  if (bundledDefaultConfig) {
    setConfig(bundledDefaultConfig)
    return bundledDefaultConfig
  }

  return {}
}

export function setConfig(config: MainProcessAppConfig) {
  getStore().set('config', config)
}

export function clearConfig() {
  getStore().delete('config')
}
