import {
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FilePenLine,
  GraduationCap,
  HeartHandshake,
  Layers3,
  ListChecks,
  Monitor,
  NotebookPen,
  PenTool,
  Server,
  Sparkles,
  Star,
} from 'lucide-react'
import PageHero from '../components/common/PageHero'

const productPositioning = ['面向高中学生和语文教师', '聚焦议论文写作', '强调辅助学习，而非直接代写']

const coreFeatures = [
  { label: '审题立意助手', icon: ClipboardCheck },
  { label: '议论文论点生成器', icon: FilePenLine },
  { label: '素材推荐器', icon: BookOpenCheck },
  { label: '作文诊断助手', icon: NotebookPen },
  { label: '议论文五步写作助手', icon: ListChecks },
  { label: '历史记录与收藏夹', icon: Star },
]

const techStack = [
  { label: 'Electron 桌面端', icon: Monitor },
  { label: 'React + TypeScript + Vite', icon: Layers3 },
  { label: 'OpenAI 兼容大模型接口', icon: Server },
  { label: 'JSON 结构化返回', icon: BrainCircuit },
  { label: '本地历史记录与收藏', icon: Database },
]

const educationValues = ['提升审题准确性', '训练论证逻辑', '丰富作文素材', '帮助学生发现问题', '引导学生自主完成作文']

const usageSteps = [
  '输入作文题目或作文内容',
  '选择功能',
  'AI 生成结构化分析',
  '学生根据建议修改和练习',
  '收藏与导出学习成果',
]

function AboutProjectPage() {
  return (
    <div className="about-project-page">
      <PageHero
        className="about-project-hero"
        icon={<GraduationCap size={34} strokeWidth={2.1} />}
        subtitle="面向高中语文学习场景，帮助学生提升审题、构思、论证和表达能力。"
        title="文思伴学 AI —— 高中语文智能写作助手"
        tone="blue"
        variant="about"
      />

      <section className="about-project-grid">
        <article className="about-project-card glass-card is-positioning">
          <div className="about-project-card-title">
            <span>
              <HeartHandshake size={22} />
            </span>
            <h2>产品定位</h2>
          </div>
          <ul className="about-project-list">
            {productPositioning.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="about-project-card glass-card is-features">
          <div className="about-project-card-title">
            <span>
              <Sparkles size={22} />
            </span>
            <h2>核心功能</h2>
          </div>
          <div className="about-project-feature-grid">
            {coreFeatures.map(({ icon: Icon, label }) => (
              <div className="about-project-feature-item" key={label}>
                <Icon size={21} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="about-project-card glass-card is-tech">
          <div className="about-project-card-title">
            <span>
              <Layers3 size={22} />
            </span>
            <h2>技术架构</h2>
          </div>
          <div className="about-project-tech-list">
            {techStack.map(({ icon: Icon, label }) => (
              <div key={label}>
                <Icon size={20} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="about-project-card glass-card is-value">
          <div className="about-project-card-title">
            <span>
              <BookOpenCheck size={22} />
            </span>
            <h2>教育价值</h2>
          </div>
          <ul className="about-project-list">
            {educationValues.map((item) => (
              <li key={item}>
                <PenTool size={18} />
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="about-project-flow glass-card">
        <div className="about-project-card-title">
          <span>
            <ListChecks size={22} />
          </span>
          <h2>使用流程</h2>
        </div>
        <div className="about-project-flow-list">
          {usageSteps.map((step, index) => (
            <div className="about-project-flow-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AboutProjectPage
