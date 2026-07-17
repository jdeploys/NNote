import type { ReactNode } from 'react'

export function TroubleshootingDisclosure({
  title,
  steps,
  action,
}: {
  title: string
  steps: readonly ReactNode[] | null
  action?: ReactNode
}) {
  if (steps === null) return null

  return (
    <section className="troubleshooting" aria-label={title}>
      <strong>{title}</strong>
      <ol>
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      {action}
    </section>
  )
}
