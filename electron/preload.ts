import { contextBridge, ipcRenderer } from 'electron'

type RendererConfig = {
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

const configApi = {
  getConfig: () => ipcRenderer.invoke('wensibanxue:get-config') as Promise<RendererConfig>,
  setConfig: (config: RendererConfig) => ipcRenderer.invoke('wensibanxue:set-config', config) as Promise<{ ok: boolean }>,
  clearConfig: () => ipcRenderer.invoke('wensibanxue:clear-config') as Promise<{ ok: boolean }>,
}

contextBridge.exposeInMainWorld('electronAPI', configApi)

contextBridge.exposeInMainWorld('wensibanxue', {
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node,
  },
  saveFile: (content: string, defaultFileName: string, filters: Electron.FileFilter[]) =>
    ipcRenderer.invoke('wensibanxue:save-file', { content, defaultFileName, filters }) as Promise<{
      canceled: boolean
      filePath?: string
    }>,
  ...configApi,
})
