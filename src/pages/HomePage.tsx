import { useMemo } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  ChevronRight,
  ClipboardCheck,
  FilePenLine,
  Heart,
  NotebookPen,
  RefreshCw,
  Rocket,
  Sparkles,
  Star,
  Target,
  WandSparkles,
  Zap,
} from 'lucide-react'
import PageHero from '../components/common/PageHero'
import type { PageKey } from '../components/layout/navItems'
import { demoRecentItems } from '../services/demoContent'
import { getHistoryItems } from '../services/historyService'
import type { HistoryItemType } from '../services/historyService'
import { getDemoMode } from '../services/settingsService'

type HomePageProps = {
  onNavigate: (page: PageKey) => void
  onOpenOnboarding: () => void
}

const abilities = [
  { label: '智能高效', icon: Zap },
  { label: '精准专业', icon: Target },
  { label: '陪伴成长', icon: Heart },
]

const features = [
  {
    key: 'argument',
    title: '议论文论点生成器',
    description: '多角度生成优质论点，帮助你构建清晰有力的论证框架。',
    icon: Sparkles,
    tone: 'purple',
  },
  {
    key: 'idea',
    title: '升格思辨',
    description: '基于关键词追问利弊与判断标准，帮助观点更有辨析度。',
    icon: ClipboardCheck,
    tone: 'blue',
  },
  {
    key: 'material',
    title: '素材推荐器',
    description: '海量名言事例、时评热点、经典人物，写作素材信手拈来。',
    icon: BookOpenCheck,
    tone: 'teal',
  },
  {
    key: 'diagnosis',
    title: '作文诊断助手',
    description: '智能批改与点评，指出问题，提供优化建议与升格方案。',
    icon: NotebookPen,
    tone: 'orange',
  },
] satisfies Array<{
  key: PageKey
  title: string
  description: string
  icon: typeof ClipboardCheck
  tone: 'blue' | 'purple' | 'teal' | 'orange'
}>

const quickSteps = [
  { label: '输入题目', caption: '粘贴或输入作文题目', icon: FilePenLine },
  { label: '选择功能', caption: '选择需要的 AI 助手功能', icon: Target },
  { label: '一键生成', caption: '获取结果与写作建议', icon: WandSparkles },
]

const historyTypeMeta: Record<HistoryItemType, { tag: string; tone: 'blue' | 'purple' | 'teal' | 'orange' }> = {
  topic: { tag: '升格思辨', tone: 'blue' },
  argument: { tag: '论点生成', tone: 'purple' },
  material: { tag: '素材推荐', tone: 'teal' },
  diagnosis: { tag: '作文诊断', tone: 'orange' },
  workflow: { tag: '五步写作', tone: 'blue' },
}

const adviceItems = [
  {
    title: '本周建议重点提升论证深度',
    caption: '尝试多角度分析问题，增强思辨性',
    icon: Target,
    tone: 'blue',
  },
  {
    title: '积累时事素材',
    caption: '关注热点事件，丰富作文内容',
    icon: BookOpenCheck,
    tone: 'purple',
  },
  {
    title: '多写多练，精益求精',
    caption: '保持每周至少2篇作文练习',
    icon: Rocket,
    tone: 'orange',
  },
]

function formatRecentTime(createdAt: string) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }

  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  }

  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace('/', '-')
}

function HomePage({ onNavigate, onOpenOnboarding }: HomePageProps) {
  const demoMode = getDemoMode()
  const recentItems = useMemo(() => {
    const historyItems = getHistoryItems().slice(0, 4)

    if (historyItems.length === 0) {
      return demoRecentItems
    }

    return historyItems.map((item) => ({
      title: item.title,
      time: formatRecentTime(item.createdAt),
      ...historyTypeMeta[item.type],
    }))
  }, [])

  return (
    <div className="home-page">
      <PageHero
        className="home-hero"
        icon={<Sparkles size={34} strokeWidth={2.1} />}
        illustrationSize="hero"
        subtitle="专注议论文写作，助你思辨更深入，论点更深刻，素材更丰富，作文更出色！"
        title={
          <>
            议论文议写通 <span className="hero-ai">AI</span> 写作助手
          </>
        }
        tone="blue"
        variant="home"
      >
        <span className={`mode-badge home-mode-badge ${demoMode ? 'is-demo' : 'is-api'}`}>
          {demoMode ? '演示模式' : '真实 API 模式'}
        </span>
        <div className="hero-abilities" aria-label="核心能力">
          {abilities.map(({ label, icon: Icon }) => (
            <span className="hero-ability" key={label}>
              <Icon size={22} strokeWidth={2.4} />
              {label}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="home-feature-grid" aria-label="核心功能">
        {features.map(({ key, title, description, icon: Icon, tone }) => (
          <button
            className={`home-feature-card is-${tone}`}
            key={key}
            onClick={() => onNavigate(key)}
            type="button"
          >
            <span className="home-feature-icon">
              <Icon size={31} strokeWidth={2.2} />
            </span>
            <span className="home-feature-title">{title}</span>
            <span className="home-feature-desc">{description}</span>
            <span className="home-feature-arrow" aria-hidden="true">
              <ArrowRight size={21} />
            </span>
          </button>
        ))}
      </section>

      <section className="workflow-promo-card glass-card">
        <div>
          <span className="workflow-promo-eyebrow">Agent 流程推荐</span>
          <h2>试试五步写作助手</h2>
          <p>把审题、立意、论点、素材和大纲连成一次完整写作辅导，更适合比赛展示和完整训练。</p>
        </div>
        <button className="gradient-button workflow-promo-button" onClick={() => onNavigate('workflow')} type="button">
          <Rocket size={20} />
          进入五步写作
          <ArrowRight size={18} />
        </button>
      </section>

      <section className="about-promo-card glass-card">
        <div>
          <span className="workflow-promo-eyebrow">比赛答辩入口</span>
          <h2>查看作品介绍</h2>
          <p>快速了解产品定位、核心功能、技术架构和教育价值，适合现场展示与答辩说明。</p>
        </div>
        <button className="secondary-button about-promo-button" onClick={() => onNavigate('about')} type="button">
          查看作品介绍
          <ArrowRight size={18} />
        </button>
      </section>

      <section className="home-bottom-grid">
        <div className="quick-start-card glass-card">
          <div className="section-title">
            <Rocket size={22} />
            快速开始
          </div>
          <div className="quick-steps">
            {quickSteps.map(({ label, caption, icon: Icon }, index) => (
              <div className="quick-step" key={label}>
                <span className="quick-step__number">{index + 1}</span>
                <span className="quick-step__icon">
                  <Icon size={34} strokeWidth={2.1} />
                </span>
                <strong>{label}</strong>
                <small>{caption}</small>
                {index < quickSteps.length - 1 ? (
                  <ArrowRight className="quick-step__arrow" size={26} strokeWidth={2.2} />
                ) : null}
              </div>
            ))}
          </div>
          <p className="handwriting-copy">让写作更简单，让表达更出色！</p>
          <button className="secondary-button onboarding-replay-button" onClick={onOpenOnboarding} type="button">
            <RefreshCw size={18} />
            重新查看新手引导
          </button>
        </div>

        <div className="recent-card glass-card">
          <div className="section-title section-title--split">
            <span>
              <FilePenLine size={21} />
              最近使用
            </span>
            <button type="button">查看全部</button>
          </div>
          <div className="recent-list">
            {recentItems.map((item) => (
              <div className="recent-item" key={item.title}>
                <span className="recent-doc-icon">
                  <FilePenLine size={21} />
                </span>
                <span className="recent-title">{item.title}</span>
                <span className={`mini-tag is-${item.tone}`}>{item.tag}</span>
                <time>{item.time}</time>
              </div>
            ))}
          </div>
        </div>

        <div className="advice-card glass-card">
          <div className="section-title">
            <Star size={22} />
            学习建议
          </div>
          <div className="advice-list">
            {adviceItems.map(({ title, caption, icon: Icon, tone }) => (
              <button className="advice-item" key={title} type="button">
                <span className={`advice-icon is-${tone}`}>
                  <Icon size={26} strokeWidth={2.2} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{caption}</small>
                </span>
                <ChevronRight size={19} />
              </button>
            ))}
          </div>
          <button className="refresh-advice" type="button">
            <RefreshCw size={17} />
            换一批建议
          </button>
        </div>
      </section>

      <p className="home-quote">文者，所以载道也；思者，所以明辨也。 ——《文心雕龙》</p>
    </div>
  )
}

export default HomePage
