import Store from 'electron-store'

export type MainProcessAppConfig = {
  provider?: string
  apiBaseUrl?: string
  apiKey?: string
  apiKeysByProvider?: Record<string, string>
  model?: string
  temperature?: string
  maxTokens?: string
  demoMode?: boolean
  studentMode?: boolean
  autoRepairJson?: boolean
  customApiBaseUrl?: string
  customModel?: string
}

let store: Store<{ config?: MainProcessAppConfig }> | null = null

function getStore() {
  store ??= new Store<{ config?: MainProcessAppConfig }>({
    name: 'wensibanxue-config',
  })

  return store
}

export function getConfig(): MainProcessAppConfig {
  return getStore().get('config') || {}
}

export function setConfig(config: MainProcessAppConfig) {
  getStore().set('config', config)
}

export function clearConfig() {
  getStore().delete('config')
}
