import type { CSSProperties } from 'react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Download,
  FileText,
  Layers3,
  Lightbulb,
  MessageCircle,
  PenTool,
  Rocket,
  ShieldCheck,
  Star,
  Target,
} from 'lucide-react'
import StudyIllustration from '../components/common/StudyIllustration'
import { getLLMConfig, chatCompletion } from '../services/llmClient'
import { buildEssayDiagnosisPrompt } from '../services/prompts'
import { addHistoryItem } from '../services/historyService'
import { DEMO_MODE_NOTICE, demoEssayDiagnosisResult } from '../services/demoContent'
import { buildResultExportText, createExportFileName, downloadTextFile } from '../utils/exportText'

const defaultEssayContent = `成长是一场漫长的旅行。在这条路上，我们会遇到许多风景，也会遇到各种困难和挑战。
记得那次数学考试，我因为粗心大意而失利，心情非常低落。老师并没有批评我，而是耐心地帮我分析错题，告诉我学习要细心、要坚持。
从那以后，我学会了反思和总结，也更加努力。成长让我明白，只有经历挫折，才能变得更强大。
未来的路还很长，我会带着勇气和信心，继续前行，成为更好的自己。`

const dimensionScores = [
  { label: '审题立意', value: 80, icon: Target, tone: 'blue' },
  { label: '结构层次', value: 85, icon: Layers3, tone: 'purple' },
  { label: '论证逻辑', value: 78, icon: ShieldCheck, tone: 'teal' },
  { label: '素材运用', value: 76, icon: BookOpenCheck, tone: 'orange' },
  { label: '语言表达', value: 86, icon: MessageCircle, tone: 'blue' },
]

const issueItems = [
  ['论证不够深入', '文章整体较为平实，缺乏深入的分析与思考。'],
  ['素材运用单一', '事例较为单一，未能充分支撑中心论点。'],
  ['语言表达平淡', '语言表达较为平淡，缺乏文采和感染力。'],
]

const suggestionItems = [
  '深入挖掘材料，结合个人感悟，增强文章的思辨性。',
  '丰富素材，适当引用名人事例或名言，增强说服力。',
  '优化语言表达，运用修辞手法，提升文章的文采。',
  '注意段落之间的过渡，使文章结构更加紧凑。',
]

function EssayDiagnosisPage() {
  const [essayContent, setEssayContent] = useState(defaultEssayContent)
  const [grade] = useState('高二')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const handleGenerate = async () => {
    const trimmedEssay = essayContent.trim()

    if (!trimmedEssay) {
      setError('请输入作文内容')
      return
    }

    setIsLoading(true)
    setError('')
    setCopyStatus('')

    if (!getLLMConfig().apiKey) {
      setResult(demoEssayDiagnosisResult)
      setCopyStatus(DEMO_MODE_NOTICE)
      setIsLoading(false)
      return
    }

    try {
      const content = await chatCompletion(buildEssayDiagnosisPrompt(trimmedEssay, { grade }))
      setResult(content)
      addHistoryItem({
        type: 'diagnosis',
        title: trimmedEssay.replace(/\s+/g, ' ').slice(0, 24),
        input: trimmedEssay,
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
      setCopyStatus('已复制诊断报告')
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
        createExportFileName('作文诊断报告'),
        buildResultExportText({
          typeLabel: '作文诊断助手',
          title: essayContent.trim().replace(/\s+/g, ' ').slice(0, 24) || '作文诊断报告',
          input: essayContent.trim(),
          output: result,
        }),
      )
      setCopyStatus('已导出 txt 文件')
    } catch {
      setError('导出失败，请稍后重试')
    }
  }

  return (
    <div className="diagnosis-page">
      <header className="diagnosis-header">
        <div className="diagnosis-header__copy">
          <h1>作文诊断助手</h1>
          <p>智能分析作文的优缺点，提供针对性修改建议，助你写出更高水平的文章！</p>
        </div>

        <div className="diagnosis-header__actions">
          <span className="diagnosis-grade-label">年级：</span>
          <button className="grade-select-button" type="button">
            {grade}
            <ChevronDown size={18} />
          </button>
          <button
            className={`gradient-button diagnosis-start-button${isLoading ? ' button-loading' : ''}`}
            disabled={isLoading}
            onClick={handleGenerate}
            type="button"
          >
            {isLoading ? <span className="loading-spinner" /> : <Rocket size={20} />}
            {isLoading ? '诊断中...' : result ? '重新诊断' : '开始诊断'}
          </button>
        </div>
      </header>

      <section className="diagnosis-input-card glass-card">
        <div className="card-title">
          <span className="small-title-icon is-blue">
            <FileText size={19} />
          </span>
          作文内容
        </div>
        <textarea
          aria-label="作文内容"
          className="diagnosis-textarea"
          onChange={(event) => setEssayContent(event.target.value)}
          value={essayContent}
        />
        <div className="diagnosis-input-footer">
          <span>字数：{essayContent.length}/2000</span>
          <button onClick={() => setEssayContent('')} type="button">
            清空内容
          </button>
        </div>
        {error ? <p className="inline-error">{error}</p> : null}
        {copyStatus ? <p className="inline-success">{copyStatus}</p> : null}
      </section>

      {result ? (
        <article className="ai-result-card glass-card">
          <div className="card-title">
            <span className="small-title-icon is-orange">
              <Lightbulb size={19} />
            </span>
            AI 作文诊断报告
          </div>
          <div className="markdown-body">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </article>
      ) : (
        <>
          <section className="diagnosis-results-grid" aria-label="作文诊断结果">
            <article className="score-overview-card glass-card">
              <div className="card-title">
                <span className="small-title-icon is-blue">
                  <BookOpenCheck size={19} />
                </span>
                综合得分
              </div>

              <div className="score-overview-body">
                <div className="score-summary">
                  <div className="diagnosis-score-ring" aria-label="综合得分 82 分">
                    <strong>82</strong>
                    <small>/100</small>
                  </div>
                  <span className="score-level">良好</span>
                  <div className="star-rating" aria-label="四星评级">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        className={index === 4 ? 'is-muted' : undefined}
                        fill="currentColor"
                        key={index}
                        size={18}
                      />
                    ))}
                  </div>
                  <p>超过 78% 的同年级学生</p>
                </div>

                <div className="dimension-list">
                  <h3>维度评分</h3>
                  {dimensionScores.map((item) => {
                    const Icon = item.icon

                    return (
                      <div className="dimension-row" key={item.label}>
                        <span className={`dimension-icon is-${item.tone}`}>
                          <Icon size={15} />
                        </span>
                        <span className="dimension-label">{item.label}</span>
                        <span
                          className={`progress-bar dimension-progress is-${item.tone}`}
                          style={{ '--progress-value': `${item.value}%` } as CSSProperties}
                        />
                        <strong>{item.value}</strong>
                      </div>
                    )
                  })}
                </div>
              </div>
            </article>

            <article className="issue-card glass-card">
              <div className="card-title">
                <span className="small-title-icon is-red">
                  <AlertTriangle size={19} />
                </span>
                主要问题
              </div>
              <ol className="issue-list">
                {issueItems.map(([title, text], index) => (
                  <li key={title}>
                    <span>{index + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <article className="suggestion-card glass-card">
              <div className="card-title">
                <span className="small-title-icon is-orange">
                  <Lightbulb size={19} />
                </span>
                修改建议
              </div>
              <ul className="suggestion-list">
                {suggestionItems.map((suggestion) => (
                  <li key={suggestion}>
                    <CheckCircle2 size={18} />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="optimized-example-card glass-card">
            <div className="optimized-example-copy">
              <div className="card-title">
                <span className="small-title-icon is-blue">
                  <PenTool size={19} />
                </span>
                优化示例（片段）
              </div>
              <p>
                成长是一场漫长的旅行。在这条路上，我们既会遇见明媚的风景，也会遭遇刺骨的寒风。正是这些经历，塑造了更加坚韧的我们。
                那次数学考试的失利，像一记警钟，让我清醒地认识到：成功从来不是偶然，细心与坚持才是通往优秀的必经之路。老师的鼓励与指导，如同一束光，照亮了我前行的方向。于是，我开始反思、总结，不断改进学习方法。
                成长让我明白，挫折不是终点，而是蜕变的起点。未来的路还很长，我将以勇气为帆，以信心为桨，坚定地驶向更好的自己。
              </p>
            </div>
            <StudyIllustration className="diagnosis-illustration" />
          </section>
        </>
      )}

      <div className="diagnosis-actions">
        <button className="secondary-button" disabled={!result} onClick={handleCopy} type="button">
          <ClipboardCopy size={18} />
          复制报告
        </button>
        <button className="secondary-button" disabled={!result} onClick={handleExport} type="button">
          <Download size={18} />
          导出诊断
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  )
}

export default EssayDiagnosisPage
