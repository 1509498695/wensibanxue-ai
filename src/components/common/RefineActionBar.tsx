import type { LucideIcon } from 'lucide-react'

export type RefineActionItem<TAction extends string> = {
  id: TAction
  label: string
  Icon: LucideIcon
}

type RefineActionBarProps<TAction extends string> = {
  actions: Array<RefineActionItem<TAction>>
  activeAction: TAction | null
  disabled?: boolean
  onAction: (action: TAction) => void
}

function RefineActionBar<TAction extends string>({
  actions,
  activeAction,
  disabled = false,
  onAction,
}: RefineActionBarProps<TAction>) {
  return (
    <div className="refine-action-bar" aria-label="结果二次优化">
      <span className="refine-action-label">继续优化</span>
      <div className="refine-action-list">
        {actions.map(({ id, label, Icon }) => {
          const isLoading = activeAction === id

          return (
            <button
              className={`refine-pill-button${isLoading ? ' is-loading' : ''}`}
              disabled={disabled || Boolean(activeAction)}
              key={id}
              onClick={() => onAction(id)}
              type="button"
            >
              {isLoading ? <span className="loading-spinner" /> : <Icon size={15} />}
              {isLoading ? '优化中...' : label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RefineActionBar
