import AppLayout from './components/layout/AppLayout'
import type { PageKey } from './components/layout/navItems'
import ArgumentGeneratorPage from './pages/ArgumentGeneratorPage'
import EssayDiagnosisPage from './pages/EssayDiagnosisPage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import MaterialRecommendPage from './pages/MaterialRecommendPage'
import SettingsPage from './pages/SettingsPage'
import TopicAnalysisPage from './pages/TopicAnalysisPage'
import { useState } from 'react'

const PAGE_META: Record<PageKey, { title: string; description: string }> = {
  dashboard: {
    title: '高中语文 AI 学习助手',
    description: '专注议论文写作，帮助你审题更精准，论点更深刻，素材更丰富，表达更出色。',
  },
  idea: {
    title: '审题立意助手',
    description: '输入作文题目或材料，快速提取关键词、核心话题、立意方向和避坑提醒。',
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
  const page = PAGE_META[activePage]

  return (
    <AppLayout activePage={activePage} onPageChange={setActivePage}>
      {activePage === 'dashboard' ? (
        <HomePage onNavigate={setActivePage} />
      ) : activePage === 'idea' ? (
        <TopicAnalysisPage />
      ) : activePage === 'argument' ? (
        <ArgumentGeneratorPage />
      ) : activePage === 'material' ? (
        <MaterialRecommendPage />
      ) : activePage === 'diagnosis' ? (
        <EssayDiagnosisPage />
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
    </AppLayout>
  )
}

export default App
