import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  ClipboardCopy,
  Database,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  History,
  Home,
  KeyRound,
  PlugZap,
  RotateCcw,
  Save,
  Server,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { CUSTOM_PROVIDER_KEY, getProviderPreset, providerPresets, type ProviderKey } from '../data/providerPresets'
import { clearHistory, getHistoryItems } from '../services/historyService'
import { chatCompletionWithConfig } from '../services/llmClient'
import {
  clearAppSettings,
  defaultAppSettings,
  hydrateAppSettings,
  loadAppSettings,
  saveAppSettings,
  type AppSettings,
} from '../services/settingsService'
import type { ChatMessage, LLMConfig } from '../types/llm'
import { createExportFileName, downloadTextFile } from '../utils/exportText'

const difficultyOptions = ['基础', '提升', '高分']

function createDefaultApiConfigJson(config: AppSettings) {
  const apiKeysByProvider = {
    ...config.apiKeysByProvider,
    [config.provider]: config.apiKey,
  }

  return JSON.stringify(
    {
      provider: config.provider,
      apiBaseUrl: config.apiBaseUrl,
      apiKey: config.apiKey,
      apiKeysByProvider,
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
    },
    null,
    2,
  )
}

function SettingsPage() {
  const [config, setConfig] = useState<AppSettings>(() => loadAppSettings())
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimerRef = useRef<number | null>(null)
  const activeProvider = getProviderPreset(config.provider)
  const isCustomProvider = config.provider === CUSTOM_PROVIDER_KEY
  const modeLabel = config.demoMode ? '演示模式' : '真实 API 模式'

  useEffect(() => {
    void hydrateAppSettings().then((settings) => setConfig(settings))

    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const updateConfig = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleProviderChange = (provider: ProviderKey) => {
    setConfig((current) => {
      const apiKeysByProvider = {
        ...current.apiKeysByProvider,
        [current.provider]: current.apiKey,
      }
      const currentCustomValues =
        current.provider === CUSTOM_PROVIDER_KEY
          ? {
              customApiBaseUrl: current.apiBaseUrl,
              customModel: current.model,
            }
          : {
              customApiBaseUrl: current.customApiBaseUrl,
              customModel: current.customModel,
            }
      const providerPreset = getProviderPreset(provider)

      if (provider === CUSTOM_PROVIDER_KEY) {
        return {
          ...current,
          ...currentCustomValues,
          apiKeysByProvider,
          provider,
          apiBaseUrl: currentCustomValues.customApiBaseUrl,
          apiKey: apiKeysByProvider[provider] || '',
          model: currentCustomValues.customModel,
        }
      }

      return {
        ...current,
        ...currentCustomValues,
        apiKeysByProvider,
        provider,
        apiBaseUrl: providerPreset.apiBaseUrl,
        apiKey: apiKeysByProvider[provider] || '',
        model: providerPreset.modelExamples[0] || current.model,
      }
    })
  }

  const handleApiKeyChange = (apiKey: string) => {
    setConfig((current) => ({
      ...current,
      apiKey,
    }))
  }

  const handleApiBaseUrlChange = (apiBaseUrl: string) => {
    setConfig((current) => ({
      ...current,
      apiBaseUrl,
      customApiBaseUrl: current.provider === CUSTOM_PROVIDER_KEY ? apiBaseUrl : current.customApiBaseUrl,
    }))
  }

  const handleModelChange = (model: string) => {
    setConfig((current) => ({
      ...current,
      model,
      customModel: current.provider === CUSTOM_PROVIDER_KEY ? model : current.customModel,
    }))
  }

  const showToast = (message: string) => {
    setToast(message)

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast('')
    }, 1800)
  }

  const updateAndSaveConfig = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setConfig((current) => {
      const nextConfig = {
        ...current,
        [key]: value,
      }

      void saveAppSettings(nextConfig).catch(() => showToast('配置保存失败，请稍后重试'))

      return nextConfig
    })
  }

  const handleSave = async () => {
    await saveAppSettings(config)
    setShowApiKey(false)
    showToast('配置已保存')
  }

  const handleTestConnection = async () => {
    const testMessages: ChatMessage[] = [
      { role: 'system', content: '你是一个连接测试助手。' },
      { role: 'user', content: '请回复：连接成功' },
    ]
    const testConfig: LLMConfig = {
      apiBaseUrl: config.apiBaseUrl.trim().replace(/\/+$/, ''),
      apiKey: config.apiKey,
      model: config.model || 'gpt-4o-mini',
      temperature: Number(config.temperature) || 0.7,
      maxTokens: Number(config.maxTokens) || 2000,
    }

    setIsTestingConnection(true)

    try {
      await chatCompletionWithConfig(testMessages, testConfig)
      showToast(`连接成功：${activeProvider.name} / ${testConfig.model}`)
    } catch (caughtError) {
      showToast(caughtError instanceof Error ? caughtError.message : '连接失败，请检查 API 配置')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleClear = async () => {
    await clearAppSettings()
    setConfig(defaultAppSettings)
    setShowApiKey(false)
    showToast('配置已清空')
  }

  const handleCopyDefaultConfig = async () => {
    try {
      await navigator.clipboard.writeText(createDefaultApiConfigJson(config))
      showToast('已复制默认配置 JSON')
    } catch {
      showToast('复制失败，请检查剪贴板权限')
    }
  }

  const handleClearHistory = () => {
    clearHistory()
    showToast('历史记录已清空')
  }

  const handleExportHistory = () => {
    const historyItems = getHistoryItems()

    if (historyItems.length === 0) {
      showToast('暂无历史记录可导出')
      return
    }

    const exportContent = [
      '# 议论文议写通历史记录',
      '',
      `导出时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`,
      '',
      JSON.stringify(historyItems, null, 2),
    ].join('\n')

    downloadTextFile(createExportFileName('历史记录'), exportContent)
    showToast('历史记录已导出')
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <h1>设置</h1>
          <p>配置大模型接口、应用偏好和本地数据。</p>
        </div>
      </header>

      <section className="settings-grid">
        <article className="settings-card settings-api-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-blue">
              <Server size={19} />
            </span>
            API 配置
            <span className={`mode-badge ${config.demoMode ? 'is-demo' : 'is-api'}`}>{modeLabel}</span>
          </div>
          <p className="settings-api-hint">
            本应用支持 OpenAI 兼容 Chat Completions 接口。请确认你的服务商支持 /chat/completions 格式。
          </p>
          <p className="settings-api-hint">
            “保存配置”只保存到当前电脑；如需发给其他用户直接使用，请复制当前配置 JSON，保存为 build/default-api-config.local.json 后重新打包。
          </p>

          <div className="settings-form-grid">
            <label className="settings-field is-wide">
              <span>
                <Server size={16} />
                服务商
              </span>
              <select
                className="settings-input"
                onChange={(event) => handleProviderChange(event.target.value as ProviderKey)}
                value={config.provider}
              >
                {providerPresets.map((provider) => (
                  <option key={provider.key} value={provider.key}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="settings-field is-wide">
              <span>
                <Server size={16} />
                API Base URL
              </span>
              <input
                className="settings-input"
                onChange={(event) => handleApiBaseUrlChange(event.target.value)}
                readOnly={!isCustomProvider}
                value={config.apiBaseUrl}
              />
            </label>

            <label className="settings-field is-wide">
              <span>
                <KeyRound size={16} />
                API Key
              </span>
              <div className="password-field">
                <input
                  className="settings-input"
                  onChange={(event) => handleApiKeyChange(event.target.value)}
                  placeholder="请输入 API Key"
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey}
                />
                <button
                  aria-label={showApiKey ? '隐藏 API Key' : '显示 API Key'}
                  onClick={() => setShowApiKey((current) => !current)}
                  type="button"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="settings-field">
              <span>
                <Bot size={16} />
                模型名称
              </span>
              {isCustomProvider ? (
                <input className="settings-input" onChange={(event) => handleModelChange(event.target.value)} value={config.model} />
              ) : (
                <select className="settings-input" onChange={(event) => handleModelChange(event.target.value)} value={config.model}>
                  {activeProvider.modelExamples.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="settings-field">
              <span>
                <SlidersHorizontal size={16} />
                Temperature
              </span>
              <input
                className="settings-input"
                max="2"
                min="0"
                onChange={(event) => updateConfig('temperature', event.target.value)}
                step="0.1"
                type="number"
                value={config.temperature}
              />
            </label>

            <label className="settings-field">
              <span>
                <Settings size={16} />
                Max Tokens
              </span>
              <input
                className="settings-input"
                min="1"
                onChange={(event) => updateConfig('maxTokens', event.target.value)}
                step="100"
                type="number"
                value={config.maxTokens}
              />
            </label>
          </div>

          {activeProvider.docsHint ? <p className="settings-provider-hint">{activeProvider.docsHint}</p> : null}

          <div className="settings-actions">
            <button className="gradient-button" onClick={handleSave} type="button">
              <Save size={18} />
              保存配置
            </button>
            <button
              className={`secondary-button${isTestingConnection ? ' button-loading' : ''}`}
              disabled={isTestingConnection}
              onClick={handleTestConnection}
              type="button"
            >
              {isTestingConnection ? <span className="loading-spinner" /> : <PlugZap size={18} />}
              {isTestingConnection ? '测试中...' : '测试连接'}
            </button>
            <button className="settings-danger-button" onClick={handleClear} type="button">
              <RotateCcw size={18} />
              清空配置
            </button>
            <button className="secondary-button" onClick={handleCopyDefaultConfig} type="button">
              <ClipboardCopy size={18} />
              复制配置 JSON
            </button>
          </div>
        </article>

        <div className="settings-side-column">
          <article className="settings-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-purple">
                <SlidersHorizontal size={19} />
              </span>
              应用偏好
            </div>

            <div className="preference-block">
              <div className="preference-row is-stacked">
                <span>默认难度</span>
                <div className="chip-group">
                  {difficultyOptions.map((difficulty) => (
                    <button
                      className={`chip${config.defaultDifficulty === difficulty ? ' is-active' : ''}`}
                      key={difficulty}
                      onClick={() => updateAndSaveConfig('defaultDifficulty', difficulty)}
                      type="button"
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-row">
                <span>
                  <Sparkles size={17} />
                  演示模式
                </span>
                <button
                  aria-checked={config.demoMode}
                  className={`switch${config.demoMode ? ' is-on' : ''}`}
                  onClick={() => updateAndSaveConfig('demoMode', !config.demoMode)}
                  role="switch"
                  type="button"
                >
                  <span />
                </button>
              </div>

              <p className="settings-preference-hint">
                演示模式适合比赛展示或无网络环境，关闭后将使用真实大模型 API。
              </p>

              <div className="preference-row">
                <span>
                  <Settings size={17} />
                  自动修复模型返回格式
                </span>
                <button
                  aria-checked={config.autoRepairJson}
                  className={`switch${config.autoRepairJson ? ' is-on' : ''}`}
                  onClick={() => updateAndSaveConfig('autoRepairJson', !config.autoRepairJson)}
                  role="switch"
                  type="button"
                >
                  <span />
                </button>
              </div>

              <p className="settings-preference-hint">
                真实 API 模式下，如模型返回的 JSON 不规范，会额外尝试修复一次。
              </p>

              <div className="preference-row">
                <span>
                  <GraduationCap size={17} />
                  学生学习模式
                </span>
                <button
                  aria-checked={config.studentLearningMode}
                  className={`switch${config.studentLearningMode ? ' is-on' : ''}`}
                  onClick={() => updateAndSaveConfig('studentLearningMode', !config.studentLearningMode)}
                  role="switch"
                  type="button"
                >
                  <span />
                </button>
              </div>

              <div className="preference-row">
                <span>
                  <History size={17} />
                  是否保存历史记录
                </span>
                <button
                  aria-checked={config.saveHistory}
                  className={`switch${config.saveHistory ? ' is-on' : ''}`}
                  onClick={() => updateAndSaveConfig('saveHistory', !config.saveHistory)}
                  role="switch"
                  type="button"
                >
                  <span />
                </button>
              </div>

              <div className="preference-row">
                <span>
                  <Home size={17} />
                  启动时显示首页
                </span>
                <button
                  aria-checked={config.showHomeOnLaunch}
                  className={`switch${config.showHomeOnLaunch ? ' is-on' : ''}`}
                  onClick={() => updateAndSaveConfig('showHomeOnLaunch', !config.showHomeOnLaunch)}
                  role="switch"
                  type="button"
                >
                  <span />
                </button>
              </div>
            </div>
          </article>

          <article className="settings-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-teal">
                <Database size={19} />
              </span>
              数据管理
            </div>

            <div className="data-actions">
              <button className="secondary-button" onClick={handleClearHistory} type="button">
                <Trash2 size={18} />
                清空历史记录
              </button>
              <button className="secondary-button" onClick={handleExportHistory} type="button">
                <Download size={18} />
                导出历史记录
              </button>
            </div>
          </article>
        </div>
      </section>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}

export default SettingsPage
