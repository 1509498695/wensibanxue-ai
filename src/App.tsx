import AppLayout from './components/layout/AppLayout'
import OnboardingModal from './components/common/OnboardingModal'
import type { PageKey } from './components/layout/navItems'
import AboutProjectPage from './pages/AboutProjectPage'
import ArgumentGeneratorPage from './pages/ArgumentGeneratorPage'
import EssayDiagnosisPage from './pages/EssayDiagnosisPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import MaterialRecommendPage from './pages/MaterialRecommendPage'
import SettingsPage from './pages/SettingsPage'
import TopicAnalysisPage from './pages/TopicAnalysisPage'
import WritingWorkflowPage from './pages/WritingWorkflowPage'
import { useEffect, useState } from 'react'
import { hydrateAppSettings } from './services/settingsService'

const PAGE_META: Record<PageKey, { title: string; description: string }> = {
  dashboard: {
    title: '高中语文 AI 学习助手',
    description: '专注议论文写作，帮助你审题更精准，论点更深刻，素材更丰富，表达更出色。',
  },
  about: {
    title: '作品介绍',
    description: '面向比赛展示和答辩说明，集中介绍产品定位、核心功能、技术架构和教育价值。',
  },
  workflow: {
    title: '议论文五步写作助手',
    description: '从审题到大纲，一次完成议论文写作思路搭建。',
  },
  idea: {
    title: '升格思辨',
    description: '基于论点关键词继续追问，训练利弊辨析、判断标准和高阶思辨表达。',
  },
  argument: {
    title: '议论文论点生成器',
    description: '多角度生成优质论点，帮助你构建清晰、有力、有层次的论证框架。',
  },
  material: {
    title: '素材推荐器',
    description: '围绕主题推荐名人事例、时评热点、名言警句和可直接迁移的使用示范。',
  },
  diagnosis: {
    title: '作文诊断助手',
    description: '智能分析作文优缺点，提供维度评分、主要问题、修改建议和优化示例。',
  },
  favorites: {
    title: '收藏夹',
    description: '集中保存好论点、素材、名言和优化片段，方便复盘和积累。',
  },
  history: {
    title: '历史记录',
    description: '查看最近生成与诊断记录，便于复盘写作思路和持续积累素材。',
  },
  settings: {
    title: '设置',
    description: '后续可在这里配置 API Base URL、API Key、模型名称和应用偏好。',
  },
}

function App() {
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('hasSeenOnboarding') !== 'true'
  })
  const [, setSettingsVersion] = useState(0)
  const page = PAGE_META[activePage]

  useEffect(() => {
    void hydrateAppSettings().then(() => setSettingsVersion((current) => current + 1))
  }, [])

  return (
    <AppLayout activePage={activePage} onPageChange={setActivePage}>
      {activePage === 'dashboard' ? (
        <HomePage onNavigate={setActivePage} onOpenOnboarding={() => setShowOnboarding(true)} />
      ) : activePage === 'about' ? (
        <AboutProjectPage />
      ) : activePage === 'workflow' ? (
        <WritingWorkflowPage />
      ) : activePage === 'idea' ? (
        <TopicAnalysisPage />
      ) : activePage === 'argument' ? (
        <ArgumentGeneratorPage />
      ) : activePage === 'material' ? (
        <MaterialRecommendPage />
      ) : activePage === 'diagnosis' ? (
        <EssayDiagnosisPage />
      ) : activePage === 'favorites' ? (
        <FavoritesPage />
      ) : activePage === 'history' ? (
        <HistoryPage />
      ) : activePage === 'settings' ? (
        <SettingsPage />
      ) : (
        <section className="page-placeholder">
          <div className="page-placeholder__copy">
            <p className="eyebrow">文思伴学 AI</p>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
          </div>

          <div className="page-placeholder__panel glass-card">
            <div className="placeholder-icon" aria-hidden="true">
              AI
            </div>
            <h2>{page.title}</h2>
            <p>当前为页面占位区，主布局和导航切换已完成。下一步将补齐对应业务页面的静态 UI。</p>
          </div>
        </section>
      )}
      <OnboardingModal onClose={() => setShowOnboarding(false)} open={showOnboarding} />
    </AppLayout>
  )
}

export default App
