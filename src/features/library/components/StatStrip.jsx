import { useMemo } from 'react'
import { usePromptStore } from '@/shared/stores/usePromptStore'

function Cell({ label, value, amber }) {
  return (
    <div className="stat-cell">
      <div className="stat-lbl">{label}</div>
      <div className={`stat-val${amber ? ' amber' : ''}`}>{value}</div>
    </div>
  )
}

export default function StatStrip() {
  const prompts   = usePromptStore((s) => s.prompts)
  const changelog = usePromptStore((s) => s.changelog)

  const avg = useMemo(() => {
    if (!prompts.length) return '—'
    const sum = prompts.reduce((acc, p) => acc + Number(p.rating), 0)
    return (sum / prompts.length).toFixed(1)
  }, [prompts])

  const typeCount = useMemo(() => {
    const set = new Set()
    prompts.forEach((p) => (p.project_types ?? []).forEach((t) => set.add(t)))
    return set.size
  }, [prompts])

  return (
    <div className="stat-strip">
      <Cell label="PROMPTS"     value={prompts.length}   />
      <Cell label="AVG RATING"  value={avg}  amber       />
      <Cell label="TYPES"       value={typeCount}        />
      <Cell label="LOG ENTRIES" value={changelog.length} />
    </div>
  )
}
