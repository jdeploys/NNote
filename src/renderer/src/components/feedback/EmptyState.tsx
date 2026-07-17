export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {description === undefined ? null : <p>{description}</p>}
    </div>
  )
}
