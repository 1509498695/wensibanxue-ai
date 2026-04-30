import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  BookOpenCheck,
  ClipboardCopy,
  Download,
  FolderOpen,
  GraduationCap,
  Newspaper,
  Quote,
  Sparkles,
  Star,
  UserRoundCheck,
} from 'lucide-react'
import StudyIllustration from '../components/common/StudyIllustration'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildMaterialRecommendPrompt } from '../services/prompts'
import { addHistoryItem } from '../services/historyService'
import { DEMO_MODE_NOTICE, demoMaterialRecommendResult } from '../services/demoContent'
import { buildResultExportText, createExportFileName, downloadTextFile } from '../utils/exportText'

const materialTypes = ['人物事例', '时评热点', '名言警句', '全部']
const gradeOptions = ['高一', '高二', '高三']
const personMaterials = [
  ['林则徐', '虎门销烟，体现家国责任与民族担当。'],
  ['钱学森', '归国报效祖国，体现科学家的家国情怀。'],
  ['黄文秀', '扎根基层扶贫，体现青年担当与奉献精神。'],
]
const newsMaterials = [
  ['航天青年团队', '在科技强国中贡献青春力量。'],
  ['乡村振兴青年干部', '在基层一线实现个人价值。'],
  ['志愿服务群体', '在社会需要中践行责任意识。'],
]
const quotes = ['苟利国家生死以，岂因祸福避趋之。', '天下兴亡，匹夫有责。', '青年者，国家之魂。']

function MaterialRecommendPage() {
  const [topic, setTopic] = useState('责任与担当')
  const [materialType, setMaterialType] = useState('全部')
  const [grade, setGrade] = useState('高二')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const handleGenerate = async () => {
    const trimmedTopic = topic.trim()

    if (!trimmedTopic) {
      setError('请输入素材主题')
      return
    }

    setIsLoading(true)
    setError('')
    setCopyStatus('')

    if (!getLLMConfig().apiKey) {
      setResult(demoMaterialRecommendResult)
      setCopyStatus(DEMO_MODE_NOTICE)
      setIsLoading(false)
      return
    }

    try {
      const content = await chatCompletion(buildMaterialRecommendPrompt(trimmedTopic, { grade, materialType }))
      setResult(content)
      addHistoryItem({
        type: 'material',
        title: trimmedTopic.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedTopic,
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
      setCopyStatus('已复制素材结果')
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
        createExportFileName('素材推荐结果'),
        buildResultExportText({
          typeLabel: '素材推荐器',
          title: topic.trim().replace(/\s+/g, ' ').slice(0, 24) || '素材推荐结果',
          input: topic.trim(),
          output: result,
        }),
      )
      setCopyStatus('已导出 txt 文件')
    } catch {
      setError('导出失败，请稍后重试')
    }
  }

  return (
    <div className="material-page">
      <header className="material-header">
        <div className="material-header__copy">
          <span className="material-header__icon" aria-hidden="true">
            <FolderOpen size={42} strokeWidth={2.1} />
          </span>
          <div>
            <h1>素材推荐器</h1>
            <p>根据写作主题智能匹配人物事例、时评热点与名言警句，让素材积累更高效。</p>
          </div>
        </div>
        <StudyIllustration className="material-illustration" />
      </header>

      <section className="material-input-card glass-card">
        <div className="card-title">
          <span className="small-title-icon is-teal">
            <BookOpenCheck size={19} />
          </span>
          素材主题
        </div>
        <div className="material-topic-row">
          <input
            aria-label="素材主题"
            className="material-topic-input"
            onChange={(event) => setTopic(event.target.value)}
            value={topic}
          />
          <button
            className={`gradient-button material-recommend-button${isLoading ? ' button-loading' : ''}`}
            disabled={isLoading}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Sparkles size={20} />}
            {isLoading ? '推荐中...' : result ? '重新推荐' : '推荐素材'}
          </button>
        </div>

        <div className="material-controls">
          <div className="control-group">
            <span className="control-label">
              <FolderOpen size={21} />
              素材类型：
            </span>
            <div className="chip-group" aria-label="素材类型选择">
              {materialTypes.map((type) => (
                <button
                  className={`chip${materialType === type ? ' is-active' : ''}`}
                  key={type}
                  onClick={() => setMaterialType(type)}
                  type="button"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

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
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      <div className="result-actions material-actions">
        <button className="secondary-button" disabled={!result} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制素材
        </button>
        <button className="secondary-button" type="button">
          <Star size={18} />
          收藏素材
        </button>
        <button className="secondary-button" disabled={!result} onClick={handleExport} type="button">
          <Download size={18} />
          导出结果
        </button>
      </div>

      {result ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-teal">
              <BookOpenCheck size={19} />
            </span>
            AI 素材推荐结果
          </div>
          <div className="markdown-body">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </article>
      ) : (
        <section className="material-results-grid" aria-label="素材推荐结果">
          <article className="material-person-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-blue">
                <UserRoundCheck size={19} />
              </span>
              人物事例
            </div>
            <div className="material-item-list">
              {personMaterials.map(([name, text]) => (
                <div className="material-item is-person" key={name}>
                  <span>{name}</span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="material-news-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-teal">
                <Newspaper size={19} />
              </span>
              时评热点
            </div>
            <div className="material-item-list">
              {newsMaterials.map(([name, text]) => (
                <div className="material-item is-news" key={name}>
                  <span>{name}</span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="material-quote-card glass-card">
            <div className="card-title">
              <span className="small-title-icon is-purple">
                <Quote size={19} />
              </span>
              名言警句
            </div>
            <ol className="quote-list">
              {quotes.map((quote) => (
                <li key={quote}>{quote}</li>
              ))}
            </ol>
          </article>

          <article className="material-demo-card glass-card">
            <div className="material-demo-copy">
              <div className="card-title">
                <span className="small-title-icon is-orange">
                  <Sparkles size={19} />
                </span>
                素材使用示范
              </div>
              <p>
                <mark>责任</mark>
                并不是停留在口号中的宏大词语，而是在关键时刻的主动选择。
                <mark>林则徐</mark>
                面对民族危机，挺身而出、虎门销烟，以实际行动诠释了“苟利国家生死以”的担当精神。
                对于<mark>新时代青年</mark>而言，责任同样意味着把个人理想融入国家发展，在时代需要的地方发光发热。
              </p>
            </div>
            <div className="material-demo-aside" aria-hidden="true">
              <span className="library-card library-card--blue" />
              <span className="library-card library-card--teal" />
              <span className="library-card library-card--orange" />
            </div>
          </article>
        </section>
      )}
    </div>
  )
}

export default MaterialRecommendPage
