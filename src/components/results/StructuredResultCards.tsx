import type { CSSProperties, ReactNode } from 'react'
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  FilePenLine,
  Lightbulb,
  Layers3,
  MessageCircle,
  Newspaper,
  PenTool,
  Quote,
  Route,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  UserRoundCheck,
} from 'lucide-react'
import type {
  ArgumentGeneratorResult,
  EssayDiagnosisResult,
  MaterialRecommendResult,
  ResultTextItem,
  TopicAnalysisResult,
} from '../../types/results'
import FavoriteButton from '../common/FavoriteButton'
import { DEFAULT_NEXT_PRACTICE_SUGGESTIONS } from '../../utils/learningGuidance'
import { ESSAY_TOTAL_SCORE, textFromItem } from '../../utils/resultText'
import {
  ESSAY_DIMENSION_SCORE,
  normalizeEssayDiagnosisScores,
  scoreToPercent,
} from '../../utils/essayDiagnosisScoring'

type Tone = 'blue' | 'purple' | 'teal' | 'orange'
type FavoriteStatusHandler = (message: string) => void

const tones: Tone[] = ['blue', 'purple', 'teal', 'orange']
const dimensionIcons = [Target, Layers3, ShieldCheck, BookOpenCheck, MessageCircle]
type DimensionDisplayItem = {
  basis: string
  grade: string
  label: string
  value: number
  tone: Tone
  Icon: (typeof dimensionIcons)[number]
}

function asTextArray(values: ResultTextItem[] | undefined) {
  return Array.isArray(values) ? values.map(textFromItem).filter(Boolean) : []
}

function asStringArray(values: string[] | undefined) {
  return Array.isArray(values) ? values.filter((value) => value.trim()) : []
}

function EmptyState() {
  return <p className="structured-empty">暂无数据</p>
}

function Tags({ values }: { values: string[] | undefined }) {
  const items = asStringArray(values)

  if (items.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      {items.map((item) => (
        <span className="tag" key={item}>
          {item}
        </span>
      ))}
    </>
  )
}

function CardTitle({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <div className="card-title">
      {icon}
      {children}
    </div>
  )
}

export function TopicAnalysisCards({ onFavoriteStatus, result }: { result: TopicAnalysisResult; onFavoriteStatus?: FavoriteStatusHandler }) {
  const ideas = asTextArray(result.recommendedIdeas)
  const angles = asTextArray(result.writingAngles)
  const warnings = asTextArray(result.warnings)

  return (
    <section className="topic-results-grid" aria-label="审题分析结果">
      <article className="topic-keywords-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-blue"><SearchCheck size={19} /></span>}>
          关键词提取
        </CardTitle>
        <div className="topic-keyword-list">
          <Tags values={result.keywords} />
        </div>
      </article>

      <article className="topic-proposition-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-purple"><Target size={19} /></span>}>
          核心命题
        </CardTitle>
        <div className="proposition-list">
          {result.coreTopic ? (
            <div className="proposition-item">
              <span>1</span>
              <p>{result.coreTopic}</p>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </article>

      <article className="topic-direction-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-teal"><Route size={19} /></span>}>
          推荐立意方向
        </CardTitle>
        {ideas.length > 0 ? (
          <ol className="direction-list">
            {ideas.map((idea, index) => (
              <li key={`${idea}-${index}`}>
                <span>立意{index + 1}</span>
                <p>{idea}</p>
                <FavoriteButton
                  favorite={{
                    type: 'idea',
                    title: `推荐立意 ${index + 1}`,
                    content: idea,
                    source: '审题立意助手',
                    tags: result.keywords,
                  }}
                  onStatusChange={(message) => onFavoriteStatus?.(message)}
                />
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState />
        )}
        {angles.length > 0 ? (
          <div className="structured-section">
            <h3>写作角度</h3>
            <ul className="analysis-list">
              {angles.map((angle, index) => (
                <li key={`${angle}-${index}`}>{angle}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>

      <article className="topic-warning-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-orange"><AlertTriangle size={19} /></span>}>
          避坑提醒
        </CardTitle>
        {warnings.length > 0 ? (
          <ul className="pitfall-list">
            {warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>
                <Lightbulb size={16} />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </article>
    </section>
  )
}

export function ArgumentGeneratorCards({ onFavoriteStatus, result }: { result: ArgumentGeneratorResult; onFavoriteStatus?: FavoriteStatusHandler }) {
  const centralArguments = asTextArray(result.centralArguments)
  const ideas = asTextArray(result.recommendedIdeas)
  const warnings = asTextArray(result.warnings)
  const materials = Array.isArray(result.materials) ? result.materials : []
  const subArguments = Array.isArray(result.subArguments) ? result.subArguments : []

  return (
    <section className="argument-results-grid" aria-label="生成结果">
      <article className="analysis-card argument-analysis-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-blue"><FilePenLine size={19} /></span>}>
          题目分析
        </CardTitle>
        <div className="analysis-section">
          <h3>关键词</h3>
          <div className="keyword-list">
            <Tags values={result.analysis?.keywords} />
          </div>
        </div>
        <div className="analysis-section">
          <h3>审题提醒</h3>
          <ul className="analysis-list">
            <li>
              <span>核心话题：</span>
              {result.analysis?.coreTopic || '暂无数据'}
            </li>
            <li>
              <span>写作重点：</span>
              {result.analysis?.writingFocus || '暂无数据'}
            </li>
            <li>
              <span>提醒：</span>
              {result.analysis?.warning || '暂无数据'}
            </li>
          </ul>
        </div>
      </article>

      {ideas.length > 0 ? (
        <article className="topic-direction-card argument-direction-card glass-card">
          <CardTitle icon={<span className="small-title-icon is-teal"><Route size={19} /></span>}>
            推荐立意方向
          </CardTitle>
          <ol className="direction-list argument-horizontal-card-list argument-idea-card-list">
            {ideas.map((idea, index) => (
              <li className="argument-idea-item" key={`${idea}-${index}`}>
                <span>立意{index + 1}</span>
                <p>{idea}</p>
                <FavoriteButton
                  favorite={{
                    type: 'idea',
                    title: `推荐立意 ${index + 1}`,
                    content: idea,
                    source: '论点生成器',
                    tags: result.analysis?.keywords,
                  }}
                  onStatusChange={(message) => onFavoriteStatus?.(message)}
                />
              </li>
            ))}
          </ol>
        </article>
      ) : null}

      <article className="thesis-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-purple"><Target size={19} /></span>}>
          中心论点（可选）
        </CardTitle>
        {centralArguments.length > 0 ? (
          <div className="thesis-list">
            {centralArguments.map((argument, index) => (
              <div className="thesis-item" key={`${argument}-${index}`}>
                <span>{index + 1}</span>
                <p>{argument}</p>
                <FavoriteButton
                  favorite={{
                    type: 'argument',
                    title: `中心论点 ${index + 1}`,
                    content: argument,
                    source: '论点生成器',
                    tags: result.analysis?.keywords,
                  }}
                  onStatusChange={(message) => onFavoriteStatus?.(message)}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </article>

      <article className="structure-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-orange"><BarChart3 size={19} /></span>}>
          分论点结构（推荐）
        </CardTitle>
        {result.recommendedArgument ? (
          <div className="recommended-thesis argument-recommended-thesis">
            <span>推荐中心论点</span>
            <strong>{result.recommendedArgument}</strong>
            <FavoriteButton
              favorite={{
                type: 'argument',
                title: '推荐中心论点',
                content: result.recommendedArgument,
                source: '论点生成器',
                tags: result.analysis?.keywords,
              }}
              onStatusChange={(message) => onFavoriteStatus?.(message)}
            />
          </div>
        ) : null}
        {subArguments.length > 0 ? (
          <ol className="argument-subargument-card-list">
            {subArguments.map((item, index) => {
              const point = typeof item === 'string' ? item : item.point || '暂无数据'
              const detail = typeof item === 'string' ? '' : [item.logic, item.material].filter(Boolean).join('；')

              return (
                <li className="argument-subargument-card" key={`${point}-${index}`}>
                  <span className="argument-subargument-index">{index + 1}</span>
                  <div className="argument-subargument-body">
                    <p className="argument-subargument-point">{point}</p>
                    {detail ? <p className="argument-subargument-detail">{detail}</p> : null}
                  </div>
                  <FavoriteButton
                    favorite={{
                      type: 'argument',
                      title: `分论点 ${index + 1}`,
                      content: detail ? `${point}（${detail}）` : point,
                      source: '论点生成器',
                      tags: result.analysis?.keywords,
                    }}
                    onStatusChange={(message) => onFavoriteStatus?.(message)}
                  />
                </li>
              )
            })}
          </ol>
        ) : (
          <EmptyState />
        )}
      </article>

      <article className="material-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-teal"><BookOpenCheck size={19} /></span>}>
          推荐素材方向
        </CardTitle>
        {materials.length > 0 ? (
          <div className="material-list">
            {materials.map((item, index) => {
              const label = typeof item === 'string' ? `素材${index + 1}` : item.type || `素材${index + 1}`
              const text = typeof item === 'string' ? item : item.content || item.text || item.angle || '暂无数据'

              return (
                <p key={`${label}-${index}`}>
                  <span>{label}：</span>
                  {text}
                </p>
              )
            })}
          </div>
        ) : (
          <EmptyState />
        )}
      </article>

      {warnings.length > 0 ? (
        <article className="topic-warning-card argument-warning-card glass-card">
          <CardTitle icon={<span className="small-title-icon is-orange"><AlertTriangle size={19} /></span>}>
            避坑提醒
          </CardTitle>
          <ul className="pitfall-list argument-horizontal-card-list argument-warning-list">
            {warnings.map((warning, index) => (
              <li className="argument-warning-item" key={`${warning}-${index}`}>
                <Lightbulb size={16} />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  )
}

export function MaterialRecommendCards({ onFavoriteStatus, result }: { result: MaterialRecommendResult; onFavoriteStatus?: FavoriteStatusHandler }) {
  const peopleExamples = asTextArray(result.peopleExamples)
  const hotTopics = asTextArray(result.hotTopics)
  const quotes = asTextArray(result.quotes)

  return (
    <section className="material-results-grid" aria-label="素材推荐结果">
      <article className="material-person-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-blue"><UserRoundCheck size={19} /></span>}>
          人物事例
        </CardTitle>
        <div className="material-item-list">
          {peopleExamples.length > 0 ? (
            peopleExamples.map((item, index) => (
              <div className="material-item is-person" key={`${item}-${index}`}>
                <span>人物事例 {index + 1}</span>
                <p>{item}</p>
                <FavoriteButton
                  favorite={{
                    type: 'material',
                    title: `人物事例 ${index + 1}`,
                    content: item,
                    source: '素材推荐器',
                    tags: ['人物事例'],
                  }}
                  onStatusChange={(message) => onFavoriteStatus?.(message)}
                />
              </div>
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </article>

      <article className="material-news-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-teal"><Newspaper size={19} /></span>}>
          时评热点
        </CardTitle>
        <div className="material-item-list">
          {hotTopics.length > 0 ? (
            hotTopics.map((item, index) => (
              <div className="material-item is-news" key={`${item}-${index}`}>
                <span>时评热点 {index + 1}</span>
                <p>{item}</p>
                <FavoriteButton
                  favorite={{
                    type: 'material',
                    title: `时评热点 ${index + 1}`,
                    content: item,
                    source: '素材推荐器',
                    tags: ['时评热点'],
                  }}
                  onStatusChange={(message) => onFavoriteStatus?.(message)}
                />
              </div>
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </article>

      <article className="material-quote-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-purple"><Quote size={19} /></span>}>
          名言警句
        </CardTitle>
        {quotes.length > 0 ? (
          <ol className="quote-list">
            {quotes.map((quote, index) => (
              <li key={`${quote}-${index}`}>
                <span>{quote}</span>
                <FavoriteButton
                  favorite={{
                    type: 'quote',
                    title: `名言警句 ${index + 1}`,
                    content: quote,
                    source: '素材推荐器',
                    tags: ['名言警句'],
                  }}
                  onStatusChange={(message) => onFavoriteStatus?.(message)}
                />
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState />
        )}
      </article>

      <article className="material-demo-card glass-card">
        <div className="material-demo-copy">
          <CardTitle icon={<span className="small-title-icon is-orange"><Sparkles size={19} /></span>}>
            素材使用示范
          </CardTitle>
          <p>{result.usageExample || '暂无数据'}</p>
        </div>
        <div className="material-demo-aside" aria-hidden="true">
          <span className="library-card library-card--blue" />
          <span className="library-card library-card--teal" />
          <span className="library-card library-card--orange" />
        </div>
      </article>
    </section>
  )
}

export function EssayDiagnosisCards({ onFavoriteStatus, result }: { result: EssayDiagnosisResult; onFavoriteStatus?: FavoriteStatusHandler }) {
  const scoreSummary = normalizeEssayDiagnosisScores(result)
  const score = scoreSummary.totalScore
  const scorePercent = score === null ? 0 : scoreToPercent(score, ESSAY_TOTAL_SCORE)
  const starCount = score === null ? 0 : Math.round((score / ESSAY_TOTAL_SCORE) * 5)
  const problems = asTextArray(result.mainProblems)
  const suggestions = asTextArray(result.suggestions)
  const practiceSuggestions = asTextArray(result.nextPracticeSuggestions)
  const visiblePracticeSuggestions =
    practiceSuggestions.length > 0 ? practiceSuggestions : DEFAULT_NEXT_PRACTICE_SUGGESTIONS
  const dimensionMaxScore = scoreSummary.isStrictStandard ? ESSAY_DIMENSION_SCORE : ESSAY_TOTAL_SCORE
  const visibleDimensions: DimensionDisplayItem[] = scoreSummary.dimensions.map((item, index) => ({
      basis: item.basis,
      grade: item.grade,
      label: item.label,
      value: item.score,
      tone: tones[index % tones.length],
      Icon: dimensionIcons[index % dimensionIcons.length],
    }))

  return (
    <>
      <section className="diagnosis-results-grid" aria-label="作文诊断结果">
        <article className="score-overview-card glass-card">
          <CardTitle icon={<span className="small-title-icon is-blue"><BookOpenCheck size={19} /></span>}>
            综合得分
          </CardTitle>

          <div className="score-overview-body">
            <div className="score-summary">
              {score !== null ? (
                <>
                  <div
                    className="diagnosis-score-ring"
                    aria-label={`综合得分 ${score} 分，满分 ${ESSAY_TOTAL_SCORE} 分`}
                    style={{ '--score-percent': `${scorePercent}%` } as CSSProperties}
                  >
                    <span className="diagnosis-score-value">
                      <strong>{score}</strong>
                      <small>/{ESSAY_TOTAL_SCORE}</small>
                    </span>
                  </div>
                  <div className="star-rating" aria-label={`${starCount}星评级`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star className={index >= starCount ? 'is-muted' : undefined} fill="currentColor" key={index} size={18} />
                    ))}
                  </div>
                </>
              ) : null}
              {result.level ? <span className="score-level">{result.level}</span> : null}
              {result.percentile ? <p>{result.percentile}</p> : null}
              {score === null && !result.level && !result.percentile ? <EmptyState /> : null}
            </div>

            <div className="dimension-list">
              <h3>维度评分</h3>
              {visibleDimensions.length > 0 ? (
                visibleDimensions.map((item) => {
                  const Icon = item.Icon

                  return (
                    <div className="dimension-row" key={item.label}>
                      <span className={`dimension-icon is-${item.tone}`}>
                        <Icon size={15} />
                      </span>
                      <span className="dimension-label">{item.label}</span>
                      <span
                        className={`progress-bar dimension-progress is-${item.tone}`}
                        style={{ '--progress-value': `${scoreToPercent(item.value, dimensionMaxScore)}%` } as CSSProperties}
                      />
                      <strong>{scoreSummary.isStrictStandard ? `${item.value}/20` : item.value}</strong>
                      <span className="dimension-grade">{item.grade}</span>
                      {item.basis ? <p className="dimension-basis">{item.basis}</p> : null}
                    </div>
                  )
                })
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </article>

        <article className="issue-card glass-card">
          <CardTitle icon={<span className="small-title-icon is-red"><AlertTriangle size={19} /></span>}>
            主要问题
          </CardTitle>
          {problems.length > 0 ? (
            <ol className="issue-list">
              {problems.map((problem, index) => (
                <li key={`${problem}-${index}`}>
                  <span>{index + 1}</span>
                  <div>
                    <h3>{problem.split('：')[0] || `问题${index + 1}`}</h3>
                    <p>{problem}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState />
          )}
        </article>

        <article className="suggestion-card glass-card">
          <CardTitle icon={<span className="small-title-icon is-orange"><Lightbulb size={19} /></span>}>
            修改建议
          </CardTitle>
          {suggestions.length > 0 ? (
            <ul className="suggestion-list">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion}-${index}`}>
                  <CheckCircle2 size={18} />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState />
          )}
        </article>
      </section>

      <section className="optimized-example-card glass-card">
        <div className="optimized-example-copy">
          <CardTitle icon={<span className="small-title-icon is-blue"><PenTool size={19} /></span>}>
            优化示例（片段）
          </CardTitle>
          <p>{result.optimizedExample || '暂无数据'}</p>
          {result.optimizedExample ? (
            <FavoriteButton
              favorite={{
                type: 'paragraph',
                title: '优化示例片段',
                content: result.optimizedExample,
                source: '作文诊断助手',
                tags: ['优化示例'],
              }}
              onStatusChange={(message) => onFavoriteStatus?.(message)}
            />
          ) : null}
        </div>
      </section>

      <section className="practice-suggestion-card glass-card">
        <CardTitle icon={<span className="small-title-icon is-teal"><CheckCircle2 size={19} /></span>}>
          下一步练习建议
        </CardTitle>
        <ul className="suggestion-list">
          {visiblePracticeSuggestions.map((suggestion, index) => (
            <li key={`${suggestion}-${index}`}>
              <CheckCircle2 size={18} />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
