function TopBar() {
  return (
    <header className="top-bar">
      <div className="user-profile" aria-label="当前用户">
        <div className="avatar" aria-hidden="true">
          学
        </div>
        <span className="user-greeting">同学，你好！</span>
      </div>
    </header>
  )
}

export default TopBar
