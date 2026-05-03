import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

type OnboardingModalProps = {
  onClose: () => void
  open: boolean
}

const onboardingSteps = [
  {
    icon: Sparkles,
    title: '欢迎使用文思伴学 AI',
    description: '这是一个面向高中语文学习的 AI 写作助手，帮助你审题、构思、积累素材和修改作文。',
  },
  {
    icon: BookOpen,
    title: '选择一个学习工具',
    description: '你可以从审题立意、论点生成、素材推荐、作文诊断或五步写作助手开始。',
  },
  {
    icon: CheckCircle2,
    title: '配置 API 或使用演示模式',
    description: '你可以在设置中配置大模型 API，也可以先使用演示模式体验完整功能。',
  },
]

function OnboardingModal({ onClose, open }: OnboardingModalProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = onboardingSteps[stepIndex]
  const StepIcon = step.icon
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === onboardingSteps.length - 1

  if (!open) {
    return null
  }

  const handleClose = () => {
    window.localStorage.setItem('hasSeenOnboarding', 'true')
    setStepIndex(0)
    onClose()
  }

  return (
    <div className="onboarding-backdrop" role="presentation">
      <section aria-labelledby="onboarding-title" aria-modal="true" className="onboarding-modal" role="dialog">
        <button aria-label="关闭新手引导" className="onboarding-close" onClick={handleClose} type="button">
          <X size={20} />
        </button>

        <div className="onboarding-illustration" aria-hidden="true">
          <div className="onboarding-assistant">
            <span>AI</span>
          </div>
          <div className="onboarding-book">
            <span />
            <span />
          </div>
        </div>

        <div className="onboarding-copy">
          <div className="onboarding-step-count">
            {onboardingSteps.map((item, index) => (
              <span className={index === stepIndex ? 'is-active' : ''} key={item.title} />
            ))}
          </div>

          <div className="onboarding-step">
            <span className="onboarding-step-icon">
              <StepIcon size={28} />
            </span>
            <p className="onboarding-eyebrow">新手引导 · {stepIndex + 1} / {onboardingSteps.length}</p>
            <h2 id="onboarding-title">{step.title}</h2>
            <p>{step.description}</p>
          </div>

          <div className="onboarding-actions">
            <button className="secondary-button" onClick={handleClose} type="button">
              跳过
            </button>
            <button className="secondary-button" disabled={isFirstStep} onClick={() => setStepIndex((current) => current - 1)} type="button">
              <ArrowLeft size={17} />
              上一步
            </button>
            {isLastStep ? (
              <button className="gradient-button" onClick={handleClose} type="button">
                开始使用
                <CheckCircle2 size={18} />
              </button>
            ) : (
              <button className="gradient-button" onClick={() => setStepIndex((current) => current + 1)} type="button">
                下一步
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default OnboardingModal
