import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  AlertTriangle,
  ClipboardCopy,
  Download,
  FileSearch,
  GraduationCap,
  Lightbulb,
  PenLine,
  Route,
  SearchCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import StudyIllustration from '../components/common/StudyIllustration'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildTopicAnalysisPrompt } from '../services/prompts'
import { addHistoryItem } from '../services/historyService'
import { DEMO_MODE_NOTICE, demoTopicAnalysisResult } from '../services/demoContent'
import { buildResultExportText, createExportFileName, downloadTextFile } from '../utils/exportText'

const gradeOptions = ['高一', '高二', '高三']
const depthOptions = ['基础', '深入', '高分']
const keywords = ['责任', '担当', '青年', '时代', '行动', '价值']
const propositions = [
  '责任不是抽象口号，而是在时代需要中主动选择与实际行动。',
  '青年成长离不开担当意识，担当也能成就更有价值的人生。',
]
const directions = [
  '以责任意识回应时代召唤',
  '在担当中实现个人成长',
  '把个人理想融入国家发展',
]
const warnings = [
  '不要只写空泛口号，要结合具体行动。',
  '不要把“责任”写成单纯的道德说教。',
  '不要脱离材料中的青年身份和时代背景。',
  '议论文要观点明确，论证要层层推进。',
]
const defaultInput = '阅读下面材料，根据要求写一篇不少于800字的议论文。材料主题为：责任与担当。'

function TopicAnalysisPage() {
  const [input, setInput] = useState(defaultInput)
  const [grade, setGrade] = useState('高二')
  const [depth, setDepth] = useState('深入')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const handleGenerate = async () => {
    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setError('请输入作文题目或材料')
      return
    }

    setIsLoading(true)
    setError('')
    setCopyStatus('')

    if (!getLLMConfig().apiKey) {
      setResult(demoTopicAnalysisResult)
      setCopyStatus(DEMO_MODE_NOTICE)
      setIsLoading(false)
      return
    }

    try {
      const content = await chatCompletion(buildTopicAnalysisPrompt(trimmedInput, { grade, depth }))
      setResult(content)
      addHistoryItem({
        type: 'topic',
        title: trimmedInput.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedInput,
        output: content,
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '生成失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) {
      return
    }

    try {
      await navigator.clipboard.writeText(result)
      setCopyStatus('已复制生成结果')
    } catch {
      setError('复制失败，请手动复制')
    }
  }

  const handleExport = () => {
    if (!result) {
      return
    }

    try {
      downloadTextFile(
        createExportFileName('审题立意分析'),
        buildResultExportText({
          typeLabel: '审题立意助手',
          title: input.trim().replace(/\s+/g, ' ').slice(0, 24) || '审题立意分析',
          input: input.trim(),
          output: result,
        }),
      )
      setCopyStatus('已导出 txt 文件')
    } catch {
      setError('导出失败，请稍后重试')
    }
  }

  return (
    <div className="topic-page">
      <header className="topic-header">
        <div className="topic-header__copy">
          <span className="topic-header__icon" aria-hidden="true">
            <FileSearch size={42} strokeWidth={2.1} />
          </span>
          <div>
            <h1>审题立意助手</h1>
            <p>精准分析作文题目，提炼核心概念，帮你找到更稳妥、更深刻的立意方向。</p>
          </div>
        </div>
        <StudyIllustration className="topic-illustration" />
      </header>

      <section className="topic-input-card glass-card">
        <div className="card-title">
          <span className="small-title-icon is-blue">
            <PenLine size={19} />
          </span>
          作文题目 / 材料
        </div>
        <div className="topic-textarea-wrap">
          <textarea
            aria-label="作文题目或材料"
            className="topic-textarea"
            onChange={(event) => setInput(event.target.value)}
            value={input}
          />
          <span className="word-count">{input.length} / 500</span>
        </div>

        <div className="topic-controls">
          <div className="control-group">
            <span className="control-label">
              <GraduationCap size={22} />
              年级：
            </span>
            <div className="chip-group" aria-label="年级选择">
              {gradeOptions.map((option) => (
                <button
                  className={`chip${grade === option ? ' is-active' : ''}`}
                  key={option}
                  onClick={() => setGrade(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">
              <SearchCheck size={21} />
              分析深度：
            </span>
            <div className="chip-group" aria-label="分析深度选择">
              {depthOptions.map((option) => (
                <button
                  className={`chip${depth === option ? ' is-active' : ''}`}
                  key={option}
                  onClick={() => setDepth(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`gradient-button topic-analyze-button${isLoading ? ' button-loading' : ''}`}
            disabled={isLoading}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Sparkles size={20} />}
            {isLoading ? '分析中...' : result ? '重新分析' : '开始分析'}
          </button>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      <div className="result-actions">
        <button className="secondary-button" disabled={!result} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制分析
        </button>
        <button className="secondary-button" disabled={!result} onClick={handleExport} type="button">
          <Download size={18} />
          导出结果
        </button>
      </div>

      {result ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-blue">
              <SearchCheck size={19} />
            </span>
            AI 审题分析
          </div>
          <div className="markdown-body">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </article>
      ) : (
        <section className="topic-results-grid" aria-label="审题分析结果">
          <article className="topic-keywords-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-blue">
                <SearchCheck size={19} />
              </span>
              关键词提取
            </div>
            <div className="topic-keyword-list">
              {keywords.map((keyword) => (
                <span className="tag" key={keyword}>
                  {keyword}
                </span>
              ))}
            </div>
          </article>

          <article className="topic-proposition-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-purple">
                <Target size={19} />
              </span>
              核心命题
            </div>
            <div className="proposition-list">
              {propositions.map((proposition, index) => (
                <div className="proposition-item" key={proposition}>
                  <span>{index + 1}</span>
                  <p>{proposition}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="topic-direction-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-teal">
                <Route size={19} />
              </span>
              推荐立意方向
            </div>
            <ol className="direction-list">
              {directions.map((direction, index) => (
                <li key={direction}>
                  <span>立意{index + 1}</span>
                  <p>{direction}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className="topic-warning-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-orange">
                <AlertTriangle size={19} />
              </span>
              避坑提醒
            </div>
            <ul className="pitfall-list">
              {warnings.map((warning) => (
                <li key={warning}>
                  <Lightbulb size={16} />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </div>
  )
}

export default TopicAnalysisPage
