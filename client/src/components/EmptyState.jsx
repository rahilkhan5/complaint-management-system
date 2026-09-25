export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="empty">
      {Icon && (
        <span className="empty__icon" aria-hidden="true">
          <Icon size={22} strokeWidth={1.75} />
        </span>
      )}
      <h2 className="empty__title">{title}</h2>
      {children && <p className="empty__text">{children}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  )
}
