import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  BarChart3,
  BookOpenCheck,
  ClipboardCopy,
  Download,
  FilePenLine,
  GraduationCap,
  Lightbulb,
  PenLine,
  Sparkles,
  Target,
} from 'lucide-react'
import StudyIllustration from '../components/common/StudyIllustration'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildArgumentGeneratorPrompt } from '../services/prompts'
import { addHistoryItem } from '../services/historyService'
import { DEMO_MODE_NOTICE, demoArgumentGeneratorResult } from '../services/demoContent'
import { buildResultExportText, createExportFileName, downloadTextFile } from '../utils/exportText'

const gradeOptions = ['高一', '高二', '高三']
const difficultyOptions = ['基础', '提升', '高分']
const keywords = ['青年', '时代', '主题', '关系', '使命', '担当']
const thesisOptions = [
  '青年与时代同频共振，方能书写无悔人生。',
  '青年以担当回应时代，时代因青年而向前。',
  '时代为青年提供舞台，青年为时代注入希望。',
]
const materialDirections = [
  ['时评热点', '航天追梦、科技创新、乡村振兴中的青年力量'],
  ['青年奋斗', '青年榜样事迹、志愿服务、创业创新故事'],
  ['家国责任', '抗疫逆行者、国防建设、文化传承与使命担当'],
]
const structurePoints = [
  '青年应把握时代机遇，勇于追梦，将个人理想融入时代洪流。',
  '青年要锤炼能力，担当责任，在时代需要的地方发光发热。',
  '青年与时代相互成就，共同前行，创造更加美好的未来。',
]
const defaultInput = '阅读下面材料，以“青年与时代”为主题写一篇议论文。'

function ArgumentGeneratorPage() {
  const [input, setInput] = useState(defaultInput)
  const [grade, setGrade] = useState('高二')
  const [difficulty, setDifficulty] = useState('提升')
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
      setResult(demoArgumentGeneratorResult)
      setCopyStatus(DEMO_MODE_NOTICE)
      setIsLoading(false)
      return
    }

    try {
      const content = await chatCompletion(buildArgumentGeneratorPrompt(trimmedInput, { grade, difficulty }))
      setResult(content)
      addHistoryItem({
        type: 'argument',
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
        createExportFileName('论点生成结果'),
        buildResultExportText({
          typeLabel: '议论文论点生成器',
          title: input.trim().replace(/\s+/g, ' ').slice(0, 24) || '论点生成结果',
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
    <div className="argument-page">
      <header className="argument-header">
        <div className="argument-header__copy">
          <span className="argument-header__icon" aria-hidden="true">
            <Lightbulb size={42} strokeWidth={2.1} />
          </span>
          <div>
            <h1>议论文论点生成器</h1>
            <p>多角度生成优质论点，帮助你构建清晰有力的论证框架。</p>
          </div>
        </div>
        <StudyIllustration className="argument-illustration" />
      </header>

      <section className="argument-input-card glass-card">
        <div className="card-title">
          <span className="small-title-icon">
            <PenLine size={19} />
          </span>
          作文题目 / 材料
        </div>
        <div className="argument-textarea-wrap">
          <textarea
            aria-label="作文题目或材料"
            className="argument-textarea"
            onChange={(event) => setInput(event.target.value)}
            value={input}
          />
          <span className="word-count">{input.length} / 500</span>
        </div>

        <div className="argument-controls">
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
              <Sparkles size={21} />
              难度：
            </span>
            <div className="chip-group" aria-label="难度选择">
              {difficultyOptions.map((option) => (
                <button
                  className={`chip${difficulty === option ? ' is-active' : ''}`}
                  key={option}
                  onClick={() => setDifficulty(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`gradient-button generate-button${isLoading ? ' button-loading' : ''}`}
            disabled={isLoading}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Sparkles size={20} />}
            {isLoading ? '生成中...' : result ? '重新生成' : '开始生成'}
          </button>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      <div className="result-actions">
        <button className="secondary-button" disabled={!result} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制结果
        </button>
        <button className="secondary-button" disabled={!result} onClick={handleExport} type="button">
          <Download size={18} />
          导出
        </button>
      </div>

      {result ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-purple">
              <Target size={19} />
            </span>
            AI 论点生成结果
          </div>
          <div className="markdown-body">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </article>
      ) : (
        <section className="argument-results-grid" aria-label="生成结果">
          <article className="analysis-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-blue">
                <FilePenLine size={19} />
              </span>
              题目分析
            </div>
            <div className="analysis-section">
              <h3>关键词</h3>
              <div className="keyword-list">
                {keywords.map((keyword) => (
                  <span className="tag" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="analysis-section">
              <h3>审题提醒</h3>
              <ul className="analysis-list">
                <li>
                  <span>核心话题：</span>青年与时代的关系与互动。
                </li>
                <li>
                  <span>写作重点：</span>青年如何在时代中成长，又如何担当时代使命，推动时代发展。
                </li>
                <li>
                  <span>限制条件：</span>议论文，需观点明确，论证充分。
                </li>
              </ul>
            </div>
          </article>

          <div className="middle-result-column">
            <article className="thesis-card glass-card">
              <div className="card-title">
                <span className="small-title-icon is-purple">
                  <Target size={19} />
                </span>
                中心论点（可选）
              </div>
              <div className="thesis-list">
                {thesisOptions.map((thesis, index) => (
                  <div className="thesis-item" key={thesis}>
                    <span>{index + 1}</span>
                    <p>{thesis}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="material-card glass-card">
              <div className="card-title">
                <span className="small-title-icon is-teal">
                  <BookOpenCheck size={19} />
                </span>
                推荐素材方向
              </div>
              <div className="material-list">
                {materialDirections.map(([label, text]) => (
                  <p key={label}>
                    <span>{label}：</span>
                    {text}
                  </p>
                ))}
              </div>
            </article>
          </div>

          <article className="structure-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-orange">
                <BarChart3 size={19} />
              </span>
              分论点结构（推荐）
            </div>
            <div className="recommended-thesis">
              <span>推荐中心论点</span>
              <strong>青年与时代同频共振，方能书写无悔人生。</strong>
            </div>
            <ol className="timeline-list">
              {structurePoints.map((point, index) => (
                <li key={point}>
                  <span>{index + 1}</span>
                  <p>{point}</p>
                </li>
              ))}
            </ol>
          </article>
        </section>
      )}
    </div>
  )
}

export default ArgumentGeneratorPage
