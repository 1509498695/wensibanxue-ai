import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  Database,
  Download,
  Eye,
  EyeOff,
  History,
  Home,
  KeyRound,
  PlugZap,
  RotateCcw,
  Save,
  Server,
  Settings,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import { clearHistory, getHistoryItems } from '../services/historyService'
import { chatCompletionWithConfig } from '../services/llmClient'
import type { ChatMessage, LLMConfig } from '../types/llm'
import { createExportFileName, downloadTextFile } from '../utils/exportText'

type SettingsConfig = {
  apiBaseUrl: string
  apiKey: string
  modelName: string
  temperature: string
  maxTokens: string
  defaultGrade: string
  defaultDifficulty: string
  saveHistory: boolean
  showHomeOnLaunch: boolean
}

const STORAGE_KEY = 'wensibanxue-ai:settings'
const gradeOptions = ['高一', '高二', '高三']
const difficultyOptions = ['基础', '提升', '高分']

const defaultSettings: SettingsConfig = {
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  modelName: 'gpt-4o-mini',
  temperature: '0.7',
  maxTokens: '2000',
  defaultGrade: '高二',
  defaultDifficulty: '提升',
  saveHistory: true,
  showHomeOnLaunch: true,
}

function loadSettings(): SettingsConfig {
  if (typeof window === 'undefined') {
    return defaultSettings
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return defaultSettings
    }

    return {
      ...defaultSettings,
      ...JSON.parse(stored),
    }
  } catch {
    return defaultSettings
  }
}

function SettingsPage() {
  const [config, setConfig] = useState<SettingsConfig>(() => loadSettings())
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const updateConfig = <K extends keyof SettingsConfig>(key: K, value: SettingsConfig[K]) => {
    setConfig((current) => ({
      ...current,
      [key]: value,
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

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setShowApiKey(false)
    showToast('配置已保存')
  }

  const handleTestConnection = async () => {
    const testMessages: ChatMessage[] = [
      { role: 'system', content: '你是一个连接测试助手。' },
      { role: 'user', content: '请回复：连接成功' },
    ]
    const testConfig: LLMConfig = {
      apiBaseUrl: config.apiBaseUrl,
      apiKey: config.apiKey,
      model: config.modelName || 'gpt-4o-mini',
      temperature: Number(config.temperature) || 0.7,
      maxTokens: Number(config.maxTokens) || 2000,
    }

    setIsTestingConnection(true)

    try {
      await chatCompletionWithConfig(testMessages, testConfig)
      showToast('连接成功')
    } catch (caughtError) {
      showToast(caughtError instanceof Error ? caughtError.message : '连接失败，请检查 API 配置')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleClear = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setConfig(defaultSettings)
    setShowApiKey(false)
    showToast('配置已清空')
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
      '# 文思伴学 AI 历史记录',
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
          </div>
          <p className="settings-api-hint">
            请填写 OpenAI 兼容接口配置，支持 DeepSeek、通义千问、OpenAI 等兼容 Chat Completions 的服务。
          </p>

          <div className="settings-form-grid">
            <label className="settings-field is-wide">
              <span>
                <Server size={16} />
                API Base URL
              </span>
              <input
                className="settings-input"
                onChange={(event) => updateConfig('apiBaseUrl', event.target.value)}
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
                  onChange={(event) => updateConfig('apiKey', event.target.value)}
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
              <input
                className="settings-input"
                onChange={(event) => updateConfig('modelName', event.target.value)}
                value={config.modelName}
              />
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
                <span>默认年级</span>
                <div className="chip-group">
                  {gradeOptions.map((grade) => (
                    <button
                      className={`chip${config.defaultGrade === grade ? ' is-active' : ''}`}
                      key={grade}
                      onClick={() => updateConfig('defaultGrade', grade)}
                      type="button"
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-row is-stacked">
                <span>默认难度</span>
                <div className="chip-group">
                  {difficultyOptions.map((difficulty) => (
                    <button
                      className={`chip${config.defaultDifficulty === difficulty ? ' is-active' : ''}`}
                      key={difficulty}
                      onClick={() => updateConfig('defaultDifficulty', difficulty)}
                      type="button"
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="preference-row">
                <span>
                  <History size={17} />
                  是否保存历史记录
                </span>
                <button
                  aria-checked={config.saveHistory}
                  className={`switch${config.saveHistory ? ' is-on' : ''}`}
                  onClick={() => updateConfig('saveHistory', !config.saveHistory)}
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
                  onClick={() => updateConfig('showHomeOnLaunch', !config.showHomeOnLaunch)}
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
