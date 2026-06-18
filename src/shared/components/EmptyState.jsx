export default function EmptyState({ icon = 'ti-inbox', title, body, action }) {
  return (
    <div className="empty-state">
      <i className={`ti ${icon}`} aria-hidden="true"></i>
      <h3>{title}</h3>
      {body  && <p>{body}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}
