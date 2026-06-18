import { usePromptStore } from '@/shared/stores/usePromptStore'
import { useUIStore }     from '@/shared/stores/useUIStore'
import { useFilteredPrompts } from '../hooks/useFilteredPrompts'

export default function LibrarySidebar() {
  const totalCount  = usePromptStore((s) => s.prompts.length)
  const activeType  = useUIStore((s) => s.activeType)
  const activeKw    = useUIStore((s) => s.activeKw)
  const setType     = useUIStore((s) => s.setActiveType)
  const toggleKw    = useUIStore((s) => s.toggleKw)

  const { allTypes, allKeywords, typeCounts } = useFilteredPrompts()

  return (
    <aside className="lib-sidebar">
      <div className="sidebar-sec">Project Types</div>

      <div
        className={`type-row${!activeType ? ' active' : ''}`}
        onClick={() => setType(null)}
      >
        <span>All Prompts</span>
        <span className="type-count">{totalCount}</span>
      </div>

      {allTypes.map((t) => (
        <div
          key={t}
          className={`type-row${activeType === t ? ' active' : ''}`}
          onClick={() => setType(t)}
        >
          <span>{t}</span>
          <span className="type-count">{typeCounts[t] ?? 0}</span>
        </div>
      ))}

      {allKeywords.length > 0 && (
        <>
          <div className="sidebar-sec" style={{ marginTop: 20 }}>Keywords</div>
          <div className="kw-cloud">
            {allKeywords.map((k) => (
              <span
                key={k}
                className={`kw-chip${activeKw === k ? ' active' : ''}`}
                onClick={() => toggleKw(k)}
              >
                {k}
              </span>
            ))}
          </div>
        </>
      )}
    </aside>
  )
}
