import { ChevronDown } from 'lucide-react'

function TopBar() {
  return (
    <header className="top-bar">
      <div className="user-profile" aria-label="当前用户">
        <div className="avatar" aria-hidden="true">
          学
        </div>
        <span className="user-greeting">同学，你好！</span>
        <span className="grade-badge">高二</span>
        <ChevronDown size={18} strokeWidth={2.2} />
      </div>
    </header>
  )
}

export default TopBar
